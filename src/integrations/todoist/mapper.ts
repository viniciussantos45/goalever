import type { TodoistTask, CreateTaskPayload } from "./client.ts";
import type { Task, TaskPriority, TaskStatus } from "../../types.ts";

const PRIORITY_MAP: Record<number, TaskPriority> = {
  4: "high",
  3: "high",
  2: "medium",
  1: "low",
};

const LOCAL_TO_TODOIST_PRIORITY: Record<TaskPriority, 1 | 2 | 3 | 4> = {
  high: 4,
  medium: 2,
  low: 1,
};

export function todoistTaskToLocal(t: TodoistTask): Partial<Task> & { todoist_id: string } {
  return {
    todoist_id: t.id,
    title: t.content,
    description: t.description || null,
    due_date: t.due?.date ?? null,
    priority: PRIORITY_MAP[t.priority] ?? "medium",
    status: (t.is_completed ? "done" : "pending") as TaskStatus,
  };
}

export function localTaskToTodoist(t: Task): CreateTaskPayload {
  return {
    content: t.title,
    description: t.description ?? undefined,
    due_string: t.due_date ?? undefined,
    priority: LOCAL_TO_TODOIST_PRIORITY[t.priority],
  };
}
