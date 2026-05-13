import React from "react";
import type { AgentName } from "../../agents/orchestrator.ts";

export interface Message {
  id: string;
  role: "user" | "assistant";
  agentName?: AgentName;
  content: string;
  timestamp: string;
}

const AGENT_COLORS: Record<AgentName, string> = {
  schedule: "#89b4fa",
  goalCoach: "#a6e3a1",
  habitTracker: "#fab387",
  emotionalMentor: "#f5c2e7",
};

const AGENT_LABELS: Record<AgentName, string> = {
  schedule: "Schedule",
  goalCoach: "Goal Coach",
  habitTracker: "Habit Tracker",
  emotionalMentor: "Mentor",
};

interface MessageFeedProps {
  messages: Message[];
  height: number;
}

export function MessageFeed({ messages, height }: MessageFeedProps) {
  return (
    <scrollbox
      width="100%"
      height={height}
      flexDirection="column"
      backgroundColor="#1e1e2e"
    >
      {messages.map((msg) => (
        <box key={msg.id} flexDirection="column">
          {msg.role === "user" ? (
            <>
              <text fg="#6c7086">{`  you  ${msg.timestamp}`}</text>
              <text fg="#cdd6f4">{`  > ${msg.content}`}</text>
            </>
          ) : (
            <>
              <text fg={AGENT_COLORS[msg.agentName ?? "schedule"]}>
                {`  ${AGENT_LABELS[msg.agentName ?? "schedule"]}  ${msg.timestamp}`}
              </text>
              <text fg="#cdd6f4" wrapMode="word">{`  ${msg.content}`}</text>
            </>
          )}
          <text> </text>
        </box>
      ))}
    </scrollbox>
  );
}
