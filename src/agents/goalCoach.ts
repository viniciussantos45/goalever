import { tool } from "@langchain/core/tools";
import { z } from "zod";
import { listGoals, listObjectives, createGoal, createObjective, updateGoalProgress } from "../storage/repositories/goals.ts";
import { listTasks, createTask } from "../storage/repositories/tasks.ts";
import { exportDailyTasks } from "../storage/markdown/exporter.ts";

const listObjectivesTool = tool(
  () => JSON.stringify(listObjectives()),
  {
    name: "listObjectives",
    description: "List long-term objectives. Objectives are high-level visions (e.g. 'Become a Senior Developer'). Each objective can have multiple goals under it.",
    schema: z.object({}),
  }
);

const listGoalsTool = tool(
  ({ status }) => JSON.stringify(listGoals(status as "active" | "completed" | "paused" | undefined)),
  {
    name: "listGoals",
    description: "List medium-term goals (key results). Goals live under an objective and are more specific and time-bound (e.g. 'Get hired at a company paying 12k/month by Dec 2025').",
    schema: z.object({ status: z.enum(["active", "completed", "paused"]).optional() }),
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

const createTaskTool = tool(
  ({ title, due_date, priority, goal_id }) => {
    const task = createTask({
      title,
      due_date,
      priority: priority as "low" | "medium" | "high" | undefined,
      goal_id,
    });
    exportDailyTasks(due_date ?? new Date().toISOString().slice(0, 10));
    return JSON.stringify(task);
  },
  {
    name: "createTask",
    description: "Create an actionable task linked to a goal",
    schema: z.object({
      title: z.string().describe("Task title in English"),
      due_date: z.string().optional().describe("Due date in YYYY-MM-DD format"),
      priority: z.enum(["low", "medium", "high"]).optional(),
      goal_id: z.string().optional().describe("ID of the goal this task belongs to"),
    }),
  }
);

export const GOAL_COACH_PROMPT = `You are the Goal Coach for goalever — an expert in OKR methodology and goal achievement.
You help users define clear objectives, track key results, and reflect on progress.
Use the Goal-Setting Theory (specific + challenging goals) and Self-Determination Theory (autonomy-supportive language).
Today is ${new Date().toISOString().slice(0, 10)}. Be inspiring but realistic.
Hierarchy: Objective (long-term vision) → Goal (medium-term key result) → Task (concrete daily action).
When asked to list or work with goals, call listObjectives to see long-term objectives AND listGoals to see medium-term goals. When generating tasks, link each task to its goal_id or objective context.
IMPORTANT: Always respond in English and always save goal and objective titles/descriptions in English, regardless of the language the user writes in.`;

export const goalCoachTools = [listObjectivesTool, listGoalsTool, createGoalTool, createObjectiveTool, updateProgressTool, weeklyReviewTool, createTaskTool];
