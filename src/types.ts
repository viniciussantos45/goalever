export type TaskStatus = "pending" | "done" | "cancelled";
export type TaskPriority = "low" | "medium" | "high";
export type GoalStatus = "active" | "completed" | "paused";
export type Mood = "happy" | "neutral" | "frustrated" | "tired";

export interface Profile {
  id: number;
  name: string | null;
  wake_time: string | null;
  sleep_time: string | null;
  work_start: string | null;
  work_end: string | null;
  preferences: Record<string, unknown> | null;
  updated_at: string;
}

export interface Objective {
  id: string;
  title: string;
  description: string | null;
  deadline: string | null;
  status: GoalStatus;
  created_at: string;
}

export interface Goal {
  id: string;
  objective_id: string | null;
  title: string;
  description: string | null;
  deadline: string | null;
  progress: number;
  status: GoalStatus;
  created_at: string;
}

export interface Task {
  id: string;
  goal_id: string | null;
  title: string;
  description: string | null;
  due_date: string | null;
  priority: TaskPriority;
  status: TaskStatus;
  todoist_id: string | null;
  todoist_synced_at: string | null;
  created_at: string;
  completed_at: string | null;
}

export interface Habit {
  id: string;
  title: string;
  trigger: string | null;
  frequency: string;
  goal_id: string | null;
  created_at: string;
}

export interface HabitLog {
  id: string;
  habit_id: string;
  logged_at: string;
  note: string | null;
}

export interface JournalEntry {
  id: string;
  date: string;
  content: string | null;
  mood: Mood | null;
  created_at: string;
}
