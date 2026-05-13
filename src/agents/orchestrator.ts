import type { Profile } from "../types.ts";

export type AgentName = "schedule" | "goalCoach" | "habitTracker" | "emotionalMentor" | "profile";

export interface SessionContext {
  currentScreen: string;
  profile: Profile | null;
}

export interface UIMessage {
  agentName: AgentName;
  content: string;
  actions?: Array<{ label: string; command: string }>;
  data?: unknown;
}
