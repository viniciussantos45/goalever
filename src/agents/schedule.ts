import { tool } from "@langchain/core/tools";
import { z } from "zod";
import { createReactAgent } from "@langchain/langgraph/prebuilt";
import { getLLM } from "../config.ts";
import { listTasks, createTask, completeTask } from "../storage/repositories/tasks.ts";
import { syncTodoist } from "../integrations/todoist/sync.ts";
import { exportDailyTasks } from "../storage/markdown/exporter.ts";
import type { UIMessage } from "./orchestrator.ts";

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
  ({ title, due_date, priority }) => {
    const task = createTask({ title, due_date, priority: priority as "low" | "medium" | "high" | undefined });
    exportDailyTasks(due_date ?? new Date().toISOString().slice(0, 10));
    return JSON.stringify(task);
  },
  {
    name: "createTask",
    description: "Create a new task",
    schema: z.object({
      title: z.string().describe("Task title"),
      due_date: z.string().optional().describe("Due date in YYYY-MM-DD format"),
      priority: z.enum(["low", "medium", "high"]).optional(),
    }),
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

const SYSTEM_PROMPT = `You are the Schedule Agent for goalever — a friendly productivity assistant.
You help users manage their daily tasks, plan their week, and stay on top of deadlines.
Today's date is ${new Date().toISOString().slice(0, 10)}.
Be concise, warm, and actionable. Format task lists clearly.`;

export async function runScheduleAgent(input: string, entities: Record<string, unknown>): Promise<UIMessage> {
  const agent = createReactAgent({
    llm: getLLM(),
    tools: [listTasksTool, createTaskTool, completeTaskTool, syncTodoistTool],
    messageModifier: SYSTEM_PROMPT,
  });

  const result = await agent.invoke({
    messages: [{ role: "user", content: input }],
  });

  const lastMessage = result.messages.at(-1);
  const content = typeof lastMessage?.content === "string" ? lastMessage.content : JSON.stringify(lastMessage?.content);

  return { agentName: "schedule", content };
}
