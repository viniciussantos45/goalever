import { getDb } from "../db.ts";
import type { Habit, HabitLog } from "../../types.ts";
import { randomUUID } from "crypto";

export function createHabit(input: { title: string; trigger?: string; frequency?: string; goal_id?: string }): Habit {
  const id = randomUUID();
  getDb().run(
    "INSERT INTO habits (id, title, trigger, frequency, goal_id) VALUES (?, ?, ?, ?, ?)",
    [id, input.title, input.trigger ?? null, input.frequency ?? "daily", input.goal_id ?? null]
  );
  return getHabitById(id)!;
}

export function getHabitById(id: string): Habit | null {
  return getDb().query<Habit, [string]>("SELECT * FROM habits WHERE id = ?").get(id) ?? null;
}

export function listHabits(): Habit[] {
  return getDb().query<Habit, []>("SELECT * FROM habits ORDER BY created_at ASC").all();
}

export function logHabit(habitId: string, note?: string): HabitLog {
  const id = randomUUID();
  getDb().run("INSERT INTO habit_logs (id, habit_id, note) VALUES (?, ?, ?)", [id, habitId, note ?? null]);
  return getDb().query<HabitLog, [string]>("SELECT * FROM habit_logs WHERE id = ?").get(id)!;
}

export interface StreakData {
  habitId: string;
  currentStreak: number;
  longestStreak: number;
  totalLogs: number;
  lastLoggedAt: string | null;
}

export function getStreak(habitId: string): StreakData {
  const logs = getDb()
    .query<{ logged_at: string }, [string]>(
      "SELECT logged_at FROM habit_logs WHERE habit_id = ? ORDER BY logged_at DESC"
    )
    .all(habitId);

  if (logs.length === 0) {
    return { habitId, currentStreak: 0, longestStreak: 0, totalLogs: 0, lastLoggedAt: null };
  }

  const dates = logs.map((l) => l.logged_at.split("T")[0] ?? l.logged_at.slice(0, 10));
  const unique = [...new Set(dates)].sort((a, b) => b.localeCompare(a));

  let current = 1;
  let longest = 1;
  let streak = 1;
  for (let i = 1; i < unique.length; i++) {
    const prev = new Date(unique[i - 1]!);
    const curr = new Date(unique[i]!);
    const diff = (prev.getTime() - curr.getTime()) / 86400000;
    if (diff === 1) {
      streak++;
      if (streak > longest) longest = streak;
    } else {
      streak = 1;
    }
  }

  const today = new Date().toISOString().slice(0, 10);
  const yesterday = new Date(Date.now() - 86400000).toISOString().slice(0, 10);
  if (unique[0] !== today && unique[0] !== yesterday) current = 0;
  else current = streak;

  return {
    habitId,
    currentStreak: current,
    longestStreak: longest,
    totalLogs: logs.length,
    lastLoggedAt: logs[0]?.logged_at ?? null,
  };
}
