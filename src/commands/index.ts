import { routeInput } from "../agents/orchestrator.ts";
import { runScheduleAgent } from "../agents/schedule.ts";
import { runGoalCoachAgent } from "../agents/goalCoach.ts";
import { runHabitTrackerAgent } from "../agents/habitTracker.ts";
import { runEmotionalMentorAgent } from "../agents/emotionalMentor.ts";
import { syncTodoist } from "../integrations/todoist/sync.ts";
import { COMMANDS, DIRECT_ROUTES } from "./registry.ts";
import type { SessionContext, UIMessage } from "../agents/orchestrator.ts";

export const HELP_TEXT = [
  "goalever — your personal goal & life assistant",
  "",
  ...COMMANDS.map((c) => `  ${c.usage.padEnd(24)} ${c.description}`),
  "",
  "Or just type naturally — the AI will understand!",
].join("\n");

export async function handleCommand(input: string, context: SessionContext): Promise<UIMessage> {
  const trimmed = input.trim();

  if (trimmed === "/help") {
    return { agentName: "schedule", content: HELP_TEXT };
  }

  if (trimmed === "/sync") {
    const result = await syncTodoist();
    return {
      agentName: "schedule",
      content: `Sync complete: pulled ${result.pulled} tasks, pushed ${result.pushed} tasks.${result.errors.length > 0 ? `\nErrors: ${result.errors.join(", ")}` : ""}`,
    };
  }

  const naturalInput = DIRECT_ROUTES[trimmed] ?? trimmed;
  const route = await routeInput(naturalInput, context);

  switch (route.agent) {
    case "schedule":
      return runScheduleAgent(naturalInput, route.extractedEntities);
    case "goalCoach":
      return runGoalCoachAgent(naturalInput);
    case "habitTracker":
      return runHabitTrackerAgent(naturalInput);
    case "emotionalMentor":
      return runEmotionalMentorAgent(naturalInput);
  }
}
