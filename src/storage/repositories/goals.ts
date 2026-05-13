import { getDb } from "../db.ts";
import type { Goal, Objective, GoalStatus } from "../../types.ts";
import { randomUUID } from "crypto";

export function createObjective(input: { title: string; description?: string; deadline?: string }): Objective {
  const id = randomUUID();
  getDb().run(
    "INSERT INTO objectives (id, title, description, deadline) VALUES (?, ?, ?, ?)",
    [id, input.title, input.description ?? null, input.deadline ?? null]
  );
  return getObjectiveById(id)!;
}

export function getObjectiveById(id: string): Objective | null {
  return getDb().query<Objective, [string]>("SELECT * FROM objectives WHERE id = ?").get(id) ?? null;
}

export function listObjectives(status?: GoalStatus): Objective[] {
  if (status) return getDb().query<Objective, [string]>("SELECT * FROM objectives WHERE status = ?").all(status);
  return getDb().query<Objective, []>("SELECT * FROM objectives ORDER BY created_at DESC").all();
}

export function createGoal(input: {
  title: string;
  objective_id?: string;
  description?: string;
  deadline?: string;
}): Goal {
  const id = randomUUID();
  getDb().run(
    "INSERT INTO goals (id, objective_id, title, description, deadline) VALUES (?, ?, ?, ?, ?)",
    [id, input.objective_id ?? null, input.title, input.description ?? null, input.deadline ?? null]
  );
  return getGoalById(id)!;
}

export function getGoalById(id: string): Goal | null {
  return getDb().query<Goal, [string]>("SELECT * FROM goals WHERE id = ?").get(id) ?? null;
}

export function listGoals(status?: GoalStatus): Goal[] {
  if (status) return getDb().query<Goal, [string]>("SELECT * FROM goals WHERE status = ?").all(status);
  return getDb().query<Goal, []>("SELECT * FROM goals ORDER BY created_at DESC").all();
}

export function updateGoalProgress(id: string, progress: number): void {
  const clamped = Math.max(0, Math.min(100, progress));
  getDb().run("UPDATE goals SET progress = ? WHERE id = ?", [clamped, id]);
  if (clamped === 100) {
    getDb().run("UPDATE goals SET status = 'completed' WHERE id = ?", [id]);
  }
}
