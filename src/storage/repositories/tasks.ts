import { getDb } from "../db.ts";
import type { Task, TaskStatus, TaskPriority } from "../../types.ts";
import { randomUUID } from "crypto";

export function createTask(input: {
  title: string;
  goal_id?: string;
  description?: string;
  due_date?: string;
  priority?: TaskPriority;
}): Task {
  const db = getDb();
  const id = randomUUID();
  db.run(
    `INSERT INTO tasks (id, goal_id, title, description, due_date, priority)
     VALUES (?, ?, ?, ?, ?, ?)`,
    [id, input.goal_id ?? null, input.title, input.description ?? null, input.due_date ?? null, input.priority ?? "medium"]
  );
  return getTaskById(id)!;
}

export function getTaskById(id: string): Task | null {
  return getDb().query<Task, [string]>("SELECT * FROM tasks WHERE id = ?").get(id) ?? null;
}

export function listTasks(filter?: { status?: TaskStatus; due_date?: string; goal_id?: string }): Task[] {
  let sql = "SELECT * FROM tasks WHERE 1=1";
  const params: string[] = [];
  if (filter?.status) { sql += " AND status = ?"; params.push(filter.status); }
  if (filter?.due_date) { sql += " AND due_date = ?"; params.push(filter.due_date); }
  if (filter?.goal_id) { sql += " AND goal_id = ?"; params.push(filter.goal_id); }
  sql += " ORDER BY priority DESC, created_at ASC";
  return getDb().query<Task, string[]>(sql).all(...params);
}

export function completeTask(id: string): void {
  getDb().run(
    "UPDATE tasks SET status = 'done', completed_at = datetime('now') WHERE id = ?",
    [id]
  );
}

export function updateTaskTodoistId(id: string, todoistId: string): void {
  getDb().run(
    "UPDATE tasks SET todoist_id = ?, todoist_synced_at = datetime('now') WHERE id = ?",
    [todoistId, id]
  );
}

export function upsertTaskByTodoistId(todoistId: string, data: Partial<Task>): void {
  const existing = getDb()
    .query<Task, [string]>("SELECT * FROM tasks WHERE todoist_id = ?")
    .get(todoistId);

  if (existing) {
    getDb().run(
      "UPDATE tasks SET title = ?, status = ?, todoist_synced_at = datetime('now') WHERE todoist_id = ?",
      [data.title ?? existing.title, data.status ?? existing.status, todoistId]
    );
  } else {
    const id = randomUUID();
    getDb().run(
      `INSERT INTO tasks (id, title, status, todoist_id, todoist_synced_at, due_date, priority)
       VALUES (?, ?, ?, ?, datetime('now'), ?, ?)`,
      [id, data.title ?? "", data.status ?? "pending", todoistId, data.due_date ?? null, data.priority ?? "medium"]
    );
  }
}
