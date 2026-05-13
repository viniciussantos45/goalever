import { tool } from "@langchain/core/tools";
import { z } from "zod";
import { listTasks, createTask, completeTask } from "../storage/repositories/tasks.ts";
import { listGoals, listObjectives } from "../storage/repositories/goals.ts";
import { syncTodoist } from "../integrations/todoist/sync.ts";
import { exportDailyTasks } from "../storage/markdown/exporter.ts";

const listTasksTool = tool(
  ({ status, date }) => {
    const tasks = listTasks({ status: status as "pending" | "done" | undefined, due_date: date });
    return JSON.stringify(tasks);
  },
  {
    name: "listTasks",
    description: "List tasks, optionally filtered by status or due date (YYYY-MM-DD)",
    schema: z.object({
      status: z.enum(["pending", "done", "cancelled"]).optional(),
      date: z.string().optional(),
    }),
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
    description: "Create a new task, optionally linked to a goal",
    schema: z.object({
      title: z.string().describe("Task title in English"),
      due_date: z.string().optional().describe("Due date in YYYY-MM-DD format"),
      priority: z.enum(["low", "medium", "high"]).optional(),
      goal_id: z.string().optional().describe("ID of the goal this task belongs to"),
    }),
  }
);

const listObjectivesTool = tool(
  () => JSON.stringify(listObjectives()),
  {
    name: "listObjectives",
    description: "List long-term objectives (high-level visions, e.g. 'Become a Senior Developer')",
    schema: z.object({}),
  }
);

const listGoalsTool = tool(
  () => JSON.stringify(listGoals()),
  {
    name: "listGoals",
    description: "List medium-term goals / key results (more specific targets under an objective, e.g. 'Get hired at 12k/month')",
    schema: z.object({}),
  }
);

const completeTaskTool = tool(
  ({ id }) => {
    completeTask(id);
    return `Task ${id} marked as done`;
  },
  {
    name: "completeTask",
    description: "Mark a task as completed",
    schema: z.object({ id: z.string().describe("Task ID") }),
  }
);

const syncTodoistTool = tool(
  async () => {
    const result = await syncTodoist();
    return `Synced: pulled ${result.pulled}, pushed ${result.pushed}. Errors: ${result.errors.length}`;
  },
  {
    name: "syncTodoist",
    description: "Sync tasks with Todoist (bidirectional)",
    schema: z.object({}),
  }
);

export const SCHEDULE_PROMPT = `You are the Schedule Agent for goalever — a friendly productivity assistant.
You help users manage their daily tasks, plan their week, and stay on top of deadlines.
Today's date is ${new Date().toISOString().slice(0, 10)}.
Hierarchy: Objective (long-term vision) → Goal (medium-term key result) → Task (concrete daily action).
When asked to create tasks from goals, call listObjectives and listGoals to see what exists, then create tasks linked via goal_id.
Be concise, warm, and actionable. Format task lists clearly.
IMPORTANT: Always respond in English and always save task titles and descriptions in English, regardless of the language the user writes in.`;

export const scheduleTools = [listTasksTool, listObjectivesTool, listGoalsTool, createTaskTool, completeTaskTool, syncTodoistTool];
