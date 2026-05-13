import { tool } from "@langchain/core/tools";
import { z } from "zod";
import { listHabits, createHabit, logHabit, getStreak } from "../storage/repositories/habits.ts";
import { exportHabits } from "../storage/markdown/exporter.ts";

const listHabitsTool = tool(
  () => JSON.stringify(listHabits()),
  {
    name: "listHabits",
    description: "List all registered habits",
    schema: z.object({}),
  }
);

const createHabitTool = tool(
  ({ title, trigger, frequency }) => {
    const habit = createHabit({ title, trigger, frequency });
    exportHabits();
    return JSON.stringify(habit);
  },
  {
    name: "createHabit",
    description: "Register a new habit with an optional trigger (e.g. 'after breakfast', '08:00')",
    schema: z.object({
      title: z.string(),
      trigger: z.string().optional(),
      frequency: z.enum(["daily", "weekly"]).optional(),
    }),
  }
);

const logHabitTool = tool(
  ({ habit_id, note }) => {
    const log = logHabit(habit_id, note);
    exportHabits();
    return JSON.stringify(log);
  },
  {
    name: "logHabit",
    description: "Record that a habit was completed today",
    schema: z.object({
      habit_id: z.string(),
      note: z.string().optional(),
    }),
  }
);

const streakTool = tool(
  () => {
    const habits = listHabits();
    const streaks = habits.map((h) => ({ habit: h.title, ...getStreak(h.id) }));
    return JSON.stringify(streaks);
  },
  {
    name: "getStreakData",
    description: "Get current streak and stats for all habits",
    schema: z.object({}),
  }
);

export const HABIT_TRACKER_PROMPT = `You are the Habit Tracker for goalever — a coach specialized in habit formation.
You use Implementation Intentions (when/where/how triggers) and habit repetition science (Lally et al.).
Today is ${new Date().toISOString().slice(0, 10)}.
Celebrate streaks, encourage consistency, and never shame missed days.
IMPORTANT: Always respond in English and always save habit titles and triggers in English, regardless of the language the user writes in.`;

export const habitTrackerTools = [listHabitsTool, createHabitTool, logHabitTool, streakTool];
