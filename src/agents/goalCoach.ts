import { tool } from "@langchain/core/tools";
import { z } from "zod";
import { createReactAgent } from "@langchain/langgraph/prebuilt";
import { getLLM } from "../config.ts";
import { listGoals, listObjectives, createGoal, createObjective, updateGoalProgress } from "../storage/repositories/goals.ts";
import { listTasks } from "../storage/repositories/tasks.ts";
import type { UIMessage } from "./orchestrator.ts";

const listGoalsTool = tool(
  ({ status }) => JSON.stringify(listGoals(status as "active" | "completed" | "paused" | undefined)),
  {
    name: "listGoals",
    description: "List medium-term goals",
    schema: z.object({ status: z.enum(["active", "completed", "paused"]).optional() }),
  }
);

const listObjectivesTool = tool(
  () => JSON.stringify(listObjectives()),
  {
    name: "listObjectives",
    description: "List long-term objectives (OKR style)",
    schema: z.object({}),
  }
);

const createGoalTool = tool(
  ({ title, description, deadline, objective_id }) => {
    const goal = createGoal({ title, description, deadline, objective_id });
    return JSON.stringify(goal);
  },
  {
    name: "createGoal",
    description: "Create a new medium-term goal",
    schema: z.object({
      title: z.string(),
      description: z.string().optional(),
      deadline: z.string().optional().describe("YYYY-MM-DD"),
      objective_id: z.string().optional(),
    }),
  }
);

const createObjectiveTool = tool(
  ({ title, description, deadline }) => {
    const obj = createObjective({ title, description, deadline });
    return JSON.stringify(obj);
  },
  {
    name: "createObjective",
    description: "Create a new long-term objective",
    schema: z.object({
      title: z.string(),
      description: z.string().optional(),
      deadline: z.string().optional().describe("YYYY-MM-DD"),
    }),
  }
);

const updateProgressTool = tool(
  ({ goal_id, progress }) => {
    updateGoalProgress(goal_id, progress);
    return `Goal ${goal_id} progress updated to ${progress}%`;
  },
  {
    name: "updateGoalProgress",
    description: "Update progress percentage (0-100) for a goal",
    schema: z.object({ goal_id: z.string(), progress: z.number().min(0).max(100) }),
  }
);

const weeklyReviewTool = tool(
  () => {
    const goals = listGoals("active");
    const tasks = listTasks({ status: "done" });
    const weekAgo = new Date(Date.now() - 7 * 86400000).toISOString().slice(0, 10);
    const completedThisWeek = tasks.filter((t) => (t.completed_at ?? "") >= weekAgo);
    return JSON.stringify({ goals, completedThisWeek, weekAgo });
  },
  {
    name: "generateWeeklyReview",
    description: "Generate data for the weekly review: active goals and tasks completed this week",
    schema: z.object({}),
  }
);

const SYSTEM_PROMPT = `You are the Goal Coach for goalever — an expert in OKR methodology and goal achievement.
You help users define clear objectives, track key results, and reflect on progress.
Use the Goal-Setting Theory (specific + challenging goals) and Self-Determination Theory (autonomy-supportive language).
Today is ${new Date().toISOString().slice(0, 10)}. Be inspiring but realistic.`;

export async function runGoalCoachAgent(input: string): Promise<UIMessage> {
  const agent = createReactAgent({
    llm: getLLM(),
    tools: [listGoalsTool, listObjectivesTool, createGoalTool, createObjectiveTool, updateProgressTool, weeklyReviewTool],
    messageModifier: SYSTEM_PROMPT,
  });

  const result = await agent.invoke({ messages: [{ role: "user", content: input }] });
  const lastMessage = result.messages.at(-1);
  const content = typeof lastMessage?.content === "string" ? lastMessage.content : JSON.stringify(lastMessage?.content);

  return { agentName: "goalCoach", content };
}
