import { tool } from "@langchain/core/tools";
import { z } from "zod";
import { createReactAgent } from "@langchain/langgraph/prebuilt";
import { HumanMessage, AIMessage } from "@langchain/core/messages";
import { getLLM } from "../config.ts";
import { getProfile, saveProfile } from "../storage/repositories/profile.ts";
import type { UIMessage } from "./orchestrator.ts";

const getProfileTool = tool(
  () => JSON.stringify(getProfile() ?? { message: "No profile set yet" }),
  {
    name: "getProfile",
    description: "Retrieve the current user profile",
    schema: z.object({}),
  }
);

const saveProfileTool = tool(
  (data) => {
    saveProfile(data);
    return "Profile saved successfully.";
  },
  {
    name: "saveProfile",
    description: "Save or update the user profile",
    schema: z.object({
      name: z.string().optional().describe("User's name"),
      wake_time: z.string().optional().describe("Wake-up time, e.g. '07:00'"),
      sleep_time: z.string().optional().describe("Sleep time, e.g. '23:00'"),
      work_start: z.string().optional().describe("Work start time, e.g. '09:00'"),
      work_end: z.string().optional().describe("Work end time, e.g. '18:00'"),
    }),
  }
);

const SYSTEM_PROMPT = `You are a friendly onboarding assistant for goalever.
Your job is to learn about the user and build their profile.

When the user asks to set up their profile, first retrieve the current profile, then ask them (in a single message) for:
- Their name
- Wake-up time and sleep time
- Work start and end hours

When the user provides this information (in any format — natural language, numbers, etc.), extract it and save it using the saveProfile tool.
After saving, confirm what was saved in a friendly summary.

If the user asks to view their profile, show it formatted clearly.
Today is ${new Date().toISOString().slice(0, 10)}.`;

export async function runProfileAgent(
  input: string,
  history: Array<{ role: "user" | "assistant"; content: string }> = []
): Promise<UIMessage> {
  const agent = createReactAgent({
    llm: getLLM(),
    tools: [getProfileTool, saveProfileTool],
    messageModifier: SYSTEM_PROMPT,
  });

  const historyMessages = history.map((m) =>
    m.role === "user" ? new HumanMessage(m.content) : new AIMessage(m.content)
  );

  const result = await agent.invoke({
    messages: [...historyMessages, { role: "user", content: input }],
  });

  const lastMessage = result.messages.at(-1);
  const content =
    typeof lastMessage?.content === "string"
      ? lastMessage.content
      : JSON.stringify(lastMessage?.content);

  const calledSave = result.messages.some(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (m: any) => typeof m._getType === "function" && m._getType() === "tool" && m.name === "saveProfile"
  );

  return {
    agentName: "schedule",
    content,
    pendingAgent: calledSave ? null : "profile",
  };
}
