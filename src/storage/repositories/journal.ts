import { getDb } from "../db.ts";
import type { JournalEntry, Mood } from "../../types.ts";
import { randomUUID } from "crypto";

export function createJournalEntry(input: { date: string; content?: string; mood?: Mood }): JournalEntry {
  const id = randomUUID();
  getDb().run(
    "INSERT INTO journal_entries (id, date, content, mood) VALUES (?, ?, ?, ?)",
    [id, input.date, input.content ?? null, input.mood ?? null]
  );
  return getDb().query<JournalEntry, [string]>("SELECT * FROM journal_entries WHERE id = ?").get(id)!;
}

export function getJournalEntry(date: string): JournalEntry | null {
  return getDb()
    .query<JournalEntry, [string]>("SELECT * FROM journal_entries WHERE date = ? ORDER BY created_at DESC LIMIT 1")
    .get(date) ?? null;
}

export function listJournalEntries(limit = 7): JournalEntry[] {
  return getDb()
    .query<JournalEntry, [number]>("SELECT * FROM journal_entries ORDER BY date DESC LIMIT ?")
    .all(limit);
}

export function updateJournalEntry(id: string, updates: { content?: string; mood?: Mood }): void {
  if (updates.content !== undefined) {
    getDb().run("UPDATE journal_entries SET content = ? WHERE id = ?", [updates.content, id]);
  }
  if (updates.mood !== undefined) {
    getDb().run("UPDATE journal_entries SET mood = ? WHERE id = ?", [updates.mood, id]);
  }
}
