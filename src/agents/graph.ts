import { Annotation, MessagesAnnotation, StateGraph, START, END, MemorySaver } from "@langchain/langgraph";
import { HumanMessage, SystemMessage } from "@langchain/core/messages";
import { createReactAgent } from "@langchain/langgraph/prebuilt";
import { z } from "zod";
import { getLLM } from "../config.ts";
import type { AgentName, UIMessage } from "./orchestrator.ts";
import { scheduleTools, SCHEDULE_PROMPT } from "./schedule.ts";
import { goalCoachTools, GOAL_COACH_PROMPT } from "./goalCoach.ts";
import { habitTrackerTools, HABIT_TRACKER_PROMPT } from "./habitTracker.ts";
import { emotionalMentorTools, EMOTIONAL_MENTOR_PROMPT } from "./emotionalMentor.ts";
import { profileTools, PROFILE_PROMPT } from "./profileAgent.ts";

// State: message history + which agent last responded
const GoaleverState = Annotation.Root({
  ...MessagesAnnotation.spec,
  agentName: Annotation<AgentName>({
    reducer: (_, b) => b,
    default: () => "schedule" as AgentName,
  }),
});

// Routing schema
const RouteSchema = z.object({
  agent: z.enum(["schedule", "goalCoach", "habitTracker", "emotionalMentor", "profile"]),
});

const SUPERVISOR_PROMPT = `You are the router for goalever — a personal goal and productivity assistant.
Classify the user message into exactly one agent. Return ONLY valid JSON matching {"agent": "<name>"}.

Agents:
- schedule: tasks, to-dos, daily/weekly planning, deadlines, task completion
- goalCoach: goals, objectives, OKRs, progress reviews, key results, importing goals
- habitTracker: habits, streaks, daily routines, habit logs, triggers
- emotionalMentor: motivation, mood, feeling discouraged, journaling, emotional support
- profile: viewing or setting up user profile (name, wake time, work hours)

If the previous assistant turn was asking for profile info (name, times), route to "profile".`;

function keywordFallback(text: string): AgentName {
  const t = text.toLowerCase();
  if (/habit|streak|routine|log habit/.test(t)) return "habitTracker";
  if (/goal|objective|okr|progress|review|import/.test(t)) return "goalCoach";
  if (/feel|unmotivated|discouraged|journal|mood/.test(t)) return "emotionalMentor";
  if (/profile|my name|wake|sleep|work hour/.test(t)) return "profile";
  return "schedule";
}

// Supervisor node — classifies the last user message and picks the next agent
async function supervisorNode(state: typeof GoaleverState.State) {
  // Only send the last human message for classification (more reliable than full history)
  const lastHuman = [...state.messages].reverse().find((m) => m._getType?.() === "human");
  const lastUserText = typeof lastHuman?.content === "string" ? lastHuman.content : "";

  // Include the last assistant turn for context (profile multi-turn detection)
  const lastAssistant = [...state.messages].reverse().find((m) => m._getType?.() === "ai");
  const contextNote = lastAssistant
    ? `\n\nPrevious assistant message: "${String(lastAssistant.content).slice(0, 200)}"`
    : "";

  try {
    const route = await getLLM()
      .withStructuredOutput(RouteSchema)
      .invoke([new SystemMessage(SUPERVISOR_PROMPT + contextNote), new HumanMessage(lastUserText)]);
    return { agentName: route.agent as AgentName };
  } catch {
    return { agentName: keywordFallback(lastUserText) };
  }
}

// Node factory — each sub-agent runs with the full conversation history
function makeAgentNode(tools: Parameters<typeof createReactAgent>[0]["tools"], systemPrompt: string) {
  return async (state: typeof GoaleverState.State) => {
    const agent = createReactAgent({ llm: getLLM(), tools, messageModifier: systemPrompt });
    const result = await agent.invoke({ messages: state.messages });
    // Only append the new messages the sub-agent added
    return { messages: result.messages.slice(state.messages.length) };
  };
}

// In-session memory: conversation history persists across messages within one session
const checkpointer = new MemorySaver();
export const THREAD_ID = "goalever-main";

export const goaleverGraph = new StateGraph(GoaleverState)
  .addNode("supervisor",      supervisorNode)
  .addNode("schedule",        makeAgentNode(scheduleTools,        SCHEDULE_PROMPT))
  .addNode("goalCoach",       makeAgentNode(goalCoachTools,       GOAL_COACH_PROMPT))
  .addNode("habitTracker",    makeAgentNode(habitTrackerTools,    HABIT_TRACKER_PROMPT))
  .addNode("emotionalMentor", makeAgentNode(emotionalMentorTools, EMOTIONAL_MENTOR_PROMPT))
  .addNode("profile",         makeAgentNode(profileTools,         PROFILE_PROMPT))
  .addEdge(START, "supervisor")
  .addConditionalEdges("supervisor", (s) => s.agentName, {
    schedule:        "schedule",
    goalCoach:       "goalCoach",
    habitTracker:    "habitTracker",
    emotionalMentor: "emotionalMentor",
    profile:         "profile",
  })
  .addEdge("schedule",        END)
  .addEdge("goalCoach",       END)
  .addEdge("habitTracker",    END)
  .addEdge("emotionalMentor", END)
  .addEdge("profile",         END)
  .compile({ checkpointer });

export async function invokeGraph(input: string): Promise<UIMessage> {
  const result = await goaleverGraph.invoke(
    { messages: [new HumanMessage(input)] },
    { configurable: { thread_id: THREAD_ID } }
  );

  const lastMsg = result.messages.at(-1);
  const content =
    typeof lastMsg?.content === "string"
      ? lastMsg.content
      : JSON.stringify(lastMsg?.content);

  return { agentName: result.agentName, content };
}
