import React from "react";
import type { Goal, Habit } from "../../types.ts";

interface SidebarProps {
  goals: Goal[];
  habits: Habit[];
  habitStreaks: Record<string, number>;
}

export function Sidebar({ goals, habits, habitStreaks }: SidebarProps) {
  return (
    <box
      width={22}
      height="100%"
      flexDirection="column"
      backgroundColor="#181825"
      border={true}
      borderStyle="single"
      borderColor="#313244"
    >
      <text fg="#89b4fa"><b>Goals</b></text>
      {goals.slice(0, 5).map((g) => (
        <text key={g.id} fg="#cdd6f4">
          {`o ${g.title.slice(0, 16)}`}
        </text>
      ))}
      {goals.length === 0 && <text fg="#45475a">  none yet</text>}

      <text> </text>
      <text fg="#89b4fa"><b>Habits</b></text>
      {habits.slice(0, 5).map((h) => {
        const streak = habitStreaks[h.id] ?? 0;
        const icon = streak > 0 ? "+" : "o";
        return (
          <text key={h.id} fg={streak > 0 ? "#a6e3a1" : "#6c7086"}>
            {`${icon} ${h.title.slice(0, 16)}`}
          </text>
        );
      })}
      {habits.length === 0 && <text fg="#45475a">  none yet</text>}
    </box>
  );
}
