import { getDb } from "../db.ts";
import type { Profile } from "../../types.ts";

export function getProfile(): Profile | null {
  const row = getDb().query<Profile, []>("SELECT * FROM profiles WHERE id = 1").get();
  if (!row) return null;
  return {
    ...row,
    preferences: row.preferences ? JSON.parse(row.preferences as unknown as string) : null,
  };
}

export function saveProfile(data: Partial<Omit<Profile, "id" | "updated_at">>): Profile {
  const current = getProfile();
  const merged = {
    name: data.name ?? current?.name ?? null,
    wake_time: data.wake_time ?? current?.wake_time ?? null,
    sleep_time: data.sleep_time ?? current?.sleep_time ?? null,
    work_start: data.work_start ?? current?.work_start ?? null,
    work_end: data.work_end ?? current?.work_end ?? null,
    preferences: data.preferences !== undefined ? data.preferences : current?.preferences ?? null,
  };
  getDb().run(
    `INSERT INTO profiles (id, name, wake_time, sleep_time, work_start, work_end, preferences)
     VALUES (1, ?, ?, ?, ?, ?, ?)
     ON CONFLICT(id) DO UPDATE SET
       name = excluded.name,
       wake_time = excluded.wake_time,
       sleep_time = excluded.sleep_time,
       work_start = excluded.work_start,
       work_end = excluded.work_end,
       preferences = excluded.preferences,
       updated_at = datetime('now')`,
    [
      merged.name,
      merged.wake_time,
      merged.sleep_time,
      merged.work_start,
      merged.work_end,
      merged.preferences ? JSON.stringify(merged.preferences) : null,
    ]
  );
  return getProfile()!;
}
