import { writeFileSync, mkdirSync } from "fs";
import { join } from "path";
import { getConfig } from "../../config.ts";
import { listTasks } from "../repositories/tasks.ts";
import { listHabits, getStreak } from "../repositories/habits.ts";
import { getJournalEntry } from "../repositories/journal.ts";
import { listGoals, listObjectives } from "../repositories/goals.ts";

function vaultPath(...parts: string[]): string {
  const config = getConfig();
  const base = config.obsidianVaultPath
    ? config.obsidianVaultPath.replace("~", process.env.HOME ?? "~")
    : join(process.cwd(), "data");
  return join(base, ...parts);
}

function ensureDir(path: string): void {
  mkdirSync(path, { recursive: true });
}

function write(path: string, content: string): void {
  ensureDir(join(path, ".."));
  writeFileSync(path, content, "utf-8");
}

export function exportDailyTasks(date: string): void {
  const tasks = listTasks({ due_date: date });
  const lines = [
    `---`,
    `date: ${date}`,
    `type: daily-tasks`,
    `---`,
    ``,
    `# Tasks for ${date}`,
    ``,
  ];

  for (const t of tasks) {
    const check = t.status === "done" ? "x" : " ";
    const priority = t.priority === "high" ? " 🔴" : t.priority === "medium" ? " 🟡" : " 🟢";
    lines.push(`- [${check}] ${t.title}${priority}`);
  }

  write(vaultPath("Tasks", `${date}.md`), lines.join("\n"));
}

export function exportGoals(): void {
  const objectives = listObjectives();
  const goals = listGoals();
  const lines = [`# Objectives & Goals`, ``];

  for (const obj of objectives) {
    lines.push(`## ${obj.title}`, `> Status: ${obj.status} | Deadline: ${obj.deadline ?? "—"}`, ``);
    const related = goals.filter((g) => g.objective_id === obj.id);
    for (const g of related) {
      lines.push(`### ${g.title}`);
      lines.push(`- Progress: ${g.progress}%`);
      lines.push(`- Deadline: ${g.deadline ?? "—"}`);
      lines.push(`- Status: ${g.status}`, ``);
    }
  }

  const orphan = goals.filter((g) => !g.objective_id);
  if (orphan.length > 0) {
    lines.push(`## Standalone Goals`, ``);
    for (const g of orphan) {
      lines.push(`### ${g.title}`, `- Progress: ${g.progress}%`, ``);
    }
  }

  write(vaultPath("Goals", "goals.md"), lines.join("\n"));
}

export function exportHabits(): void {
  const habits = listHabits();
  const lines = [`# Habits`, ``];

  for (const h of habits) {
    const streak = getStreak(h.id);
    lines.push(`## ${h.title}`);
    lines.push(`- Trigger: ${h.trigger ?? "—"}`);
    lines.push(`- Frequency: ${h.frequency}`);
    lines.push(`- Current streak: ${streak.currentStreak} days`);
    lines.push(`- Longest streak: ${streak.longestStreak} days`);
    lines.push(`- Total logs: ${streak.totalLogs}`, ``);
  }

  write(vaultPath("Habits", "habits.md"), lines.join("\n"));
}

export function exportJournalEntry(date: string): void {
  const entry = getJournalEntry(date);
  if (!entry) return;

  const lines = [
    `---`,
    `date: ${date}`,
    `mood: ${entry.mood ?? "—"}`,
    `type: journal`,
    `---`,
    ``,
    `# Journal — ${date}`,
    ``,
    entry.content ?? "",
  ];

  write(vaultPath("Journal", `${date}.md`), lines.join("\n"));
}
