import React from "react";
import type { Task } from "../../types.ts";
import { ProgressBar } from "../components/ProgressBar.tsx";

interface TodayScreenProps {
  tasks: Task[];
}

const PRIORITY_ICON: Record<string, string> = {
  high: "!",
  medium: "-",
  low: ".",
};

export function TodayScreen({ tasks }: TodayScreenProps) {
  const done = tasks.filter((t) => t.status === "done").length;
  const total = tasks.length;
  const progress = total > 0 ? Math.round((done / total) * 100) : 0;
  const dateLabel = new Date().toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" });

  return (
    <box flexDirection="column" width="100%" height="100%">
      <text fg="#cba6f7"><b>{`Today — ${dateLabel}`}</b></text>
      <text> </text>
      <ProgressBar value={progress} label={`${done}/${total} tasks`} />
      <text> </text>

      {tasks.length === 0 && (
        <text fg="#45475a">No tasks for today. Type /task new to add one!</text>
      )}

      {tasks.map((t) => {
        const check = t.status === "done" ? "x" : " ";
        const icon = PRIORITY_ICON[t.priority] ?? " ";
        const color = t.status === "done" ? "#45475a" : "#cdd6f4";
        return (
          <text key={t.id} fg={color}>
            {`[${icon}][${check}] ${t.title}`}
          </text>
        );
      })}
    </box>
  );
}
