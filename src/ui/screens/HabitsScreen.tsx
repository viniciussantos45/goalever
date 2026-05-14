import React from "react";
import type { Habit } from "../../types.ts";
import type { StreakData } from "../../storage/repositories/habits.ts";

interface HabitsScreenProps {
  habits: Habit[];
  streaks: Record<string, StreakData>;
}

export function HabitsScreen({ habits, streaks }: HabitsScreenProps) {
  return (
    <box
      flexDirection="column"
      width="100%"
      height="100%"
      border={true}
      borderStyle="single"
      borderColor="#313244"
      backgroundColor="#181825"
    >
      <text fg="#cba6f7"><b>  Habits & Streaks</b></text>
      <text> </text>

      <scrollbox width="100%" flexGrow={1}>
        {habits.length === 0 && (
          <text fg="#45475a">  No habits yet. Type /habit new to create one!</text>
        )}

        {habits.map((h) => {
          const s = streaks[h.id] ?? { currentStreak: 0, longestStreak: 0, totalLogs: 0 };
          const fire = s.currentStreak >= 7 ? " [HOT]" : s.currentStreak >= 3 ? " [streak]" : "";
          return (
            <box key={h.id} flexDirection="column">
              <text fg="#fab387"><b>{`  * ${h.title}${fire}`}</b></text>
              {h.trigger && <text fg="#6c7086">{`    Trigger: ${h.trigger}`}</text>}
              <text fg="#a6e3a1">{`    Current streak: ${s.currentStreak} days`}</text>
              <text fg="#6c7086">{`    Best: ${s.longestStreak} days  |  Total: ${s.totalLogs} logs`}</text>
              <text> </text>
            </box>
          );
        })}
      </scrollbox>
    </box>
  );
}
