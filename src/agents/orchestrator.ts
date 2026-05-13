import { z } from "zod";
import { getLLM } from "../config.ts";
import { HumanMessage, SystemMessage } from "@langchain/core/messages";
import type { Profile } from "../types.ts";

export type AgentName = "schedule" | "goalCoach" | "habitTracker" | "emotionalMentor";

export interface SessionContext {
  currentScreen: string;
  recentMessages: Array<{ role: "user" | "assistant"; content: string }>;
  profile: Profile | null;
  pendingAgent?: string | null;
}

export interface UIMessage {
  agentName: AgentName;
  content: string;
  pendingAgent?: string | null;
  actions?: Array<{ label: string; command: string }>;
  data?: unknown;
}

const RouteSchema = z.object({
  agent: z.enum(["schedule", "goalCoach", "habitTracker", "emotionalMentor"]),
  intent: z.string(),
  extractedEntities: z.record(z.string(), z.unknown()),
});

type RouteResult = z.infer<typeof RouteSchema>;

const SYSTEM_PROMPT = `You are the router for goalever, a personal goal and productivity CLI assistant.
Given user input, decide which specialized agent should handle it and extract relevant entities.

Agents:
- schedule: tasks, to-dos, daily/weekly planning, task completion, deadlines
- goalCoach: objectives, goals, OKRs, progress reviews, key results, achievements
- habitTracker: habits, streaks, daily routines, habit triggers, habit logs
- emotionalMentor: motivation, mood, feeling discouraged, journaling, emotional support

Always return valid JSON matching the schema.`;

export async function routeInput(input: string, context: SessionContext): Promise<RouteResult> {
  const llm = getLLM().withStructuredOutput(RouteSchema);

  const messages = [
    new SystemMessage(SYSTEM_PROMPT),
    new HumanMessage(input),
  ];

  return llm.invoke(messages);
}
