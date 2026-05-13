import { tool } from "@langchain/core/tools";
import { z } from "zod";
import { listTasks } from "../storage/repositories/tasks.ts";
import { createJournalEntry, getJournalEntry } from "../storage/repositories/journal.ts";
import { exportJournalEntry } from "../storage/markdown/exporter.ts";
import type { Mood } from "../types.ts";

const adjustTodayTool = tool(
  () => {
    const today = new Date().toISOString().slice(0, 10);
    const tasks = listTasks({ status: "pending", due_date: today });
    const simplified = tasks.map((t) => ({ id: t.id, title: t.title, priority: t.priority }));
    return JSON.stringify({ todayTasks: simplified, suggestion: "Consider focusing on 1-3 high-impact tasks only" });
  },
  {
    name: "adjustTodayPlan",
    description: "Retrieve today's tasks to suggest a lighter, achievable plan",
    schema: z.object({}),
  }
);

const logMoodTool = tool(
  ({ date, content, mood }) => {
    const today = date ?? new Date().toISOString().slice(0, 10);
    const entry = createJournalEntry({ date: today, content, mood: mood as Mood | undefined });
    exportJournalEntry(today);
    return JSON.stringify(entry);
  },
  {
    name: "logMoodEntry",
    description: "Log mood and journal entry for today",
    schema: z.object({
      date: z.string().optional(),
      content: z.string().optional(),
      mood: z.enum(["happy", "neutral", "frustrated", "tired"]).optional(),
    }),
  }
);

const getJournalTool = tool(
  ({ date }) => {
    const entry = getJournalEntry(date ?? new Date().toISOString().slice(0, 10));
    return entry ? JSON.stringify(entry) : "No journal entry found for this date";
  },
  {
    name: "getJournalEntry",
    description: "Retrieve a journal entry for a given date",
    schema: z.object({ date: z.string().optional() }),
  }
);

export const EMOTIONAL_MENTOR_PROMPT = `You are the Emotional Mentor for goalever — a compassionate, non-judgmental coach.
You use motivational interviewing techniques: ask open questions, reflect feelings, reframe challenges.
Never shame, never pressure. Offer choices ("you could..."), validate effort, celebrate small wins.
If the user is discouraged, first acknowledge their feelings, then gently explore what's underlying.
Today is ${new Date().toISOString().slice(0, 10)}.
IMPORTANT: Always respond in English and always save journal entries in English, regardless of the language the user writes in.`;

export const emotionalMentorTools = [adjustTodayTool, logMoodTool, getJournalTool];
