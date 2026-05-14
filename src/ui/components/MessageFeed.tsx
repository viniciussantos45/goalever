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
  profile: "#cba6f7",
};

const AGENT_LABELS: Record<AgentName, string> = {
  schedule: "Schedule",
  goalCoach: "Goal Coach",
  habitTracker: "Habit Tracker",
  emotionalMentor: "Mentor",
  profile: "Profile",
};

interface MessageFeedProps {
  messages: Message[];
  height: number;
  thinking?: boolean;
}

export function MessageFeed({ messages, height, thinking }: MessageFeedProps) {
  return (
    <box flexDirection="column" width="100%" height={height} backgroundColor="#1e1e2e">
      <box height={1} width="100%" backgroundColor="#313244" flexDirection="row">
        <text fg="#89b4fa">  Chat</text>
        {thinking && <text fg="#f9e2af">   thinking...</text>}
      </box>

      <scrollbox
        width="100%"
        height={height - 1}
        backgroundColor="#1e1e2e"
        stickyScroll={true}
        stickyStart="bottom"
        verticalScrollbarOptions={{
          trackOptions: {
            backgroundColor: "#1e1e2e",
            foregroundColor: "#313244",
          },
        }}
      >
        {messages.length === 0 && (
          <text fg="#45475a">  Type a message to start...</text>
        )}
        {messages.map((msg) => {
          if (msg.role === "user") {
            return (
              <box key={msg.id} flexDirection="column" backgroundColor="#313244">
                <text fg="#6c7086">{`  you  ${msg.timestamp}`}</text>
                <text fg="#cdd6f4">{`  > ${msg.content}`}</text>
                <text> </text>
              </box>
            );
          }
          const color = AGENT_COLORS[msg.agentName ?? "schedule"];
          const label = AGENT_LABELS[msg.agentName ?? "schedule"];
          return (
            <box key={msg.id} flexDirection="column" backgroundColor="#181825">
              <text fg={color}>{`  ${label}  ${msg.timestamp}`}</text>
              <text fg="#cdd6f4" wrapMode="word">{`  ${msg.content}`}</text>
              <text> </text>
            </box>
          );
        })}
      </scrollbox>
    </box>
  );
}
