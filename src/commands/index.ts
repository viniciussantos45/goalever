import { routeInput } from "../agents/orchestrator.ts";
import { runScheduleAgent } from "../agents/schedule.ts";
import { runGoalCoachAgent } from "../agents/goalCoach.ts";
import { runHabitTrackerAgent } from "../agents/habitTracker.ts";
import { runEmotionalMentorAgent } from "../agents/emotionalMentor.ts";
import { syncTodoist } from "../integrations/todoist/sync.ts";
import type { SessionContext, UIMessage } from "../agents/orchestrator.ts";

export const HELP_TEXT = `
goalever — your personal goal & life assistant

Commands:
  /today              Today's tasks
  /tomorrow           Tomorrow's plan
  /week               Weekly overview
  /task new [title]   Create a task
  /goals              List active goals
  /goal add           Create a new goal
  /review             Start weekly review
  /progress           Show progress summary
  /habit new          Register a habit
  /habit log [id]     Log habit completion
  /streaks            Show habit streaks
  /unmotivated        Low-motivation support
  /journal            Daily journal entry
  /profile            View/edit your profile
  /sync               Manual Todoist sync
  /help               Show this help

Or just type naturally — the AI will understand!
`.trim();

const DIRECT_ROUTES: Record<string, string> = {
  "/today": "Show me my tasks for today",
  "/tomorrow": "Show me tasks due tomorrow",
  "/week": "Give me a weekly overview of my tasks",
  "/goals": "List all my active goals",
  "/review": "Start my weekly review",
  "/progress": "Show my overall progress summary",
  "/streaks": "Show all my habit streaks",
  "/unmotivated": "I am feeling unmotivated and need support",
  "/discouraged": "I am feeling discouraged and need help",
  "/journal": "I want to write a journal entry for today",
};

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
