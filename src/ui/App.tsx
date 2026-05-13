import React, { useState, useEffect, useCallback } from "react";
import { Header } from "./components/Header.tsx";
import { Sidebar } from "./components/Sidebar.tsx";
import { InputBar } from "./components/InputBar.tsx";
import { MessageFeed } from "./components/MessageFeed.tsx";
import { TodayScreen } from "./screens/TodayScreen.tsx";
import { GoalsScreen } from "./screens/GoalsScreen.tsx";
import { HabitsScreen } from "./screens/HabitsScreen.tsx";
import { ReviewScreen } from "./screens/ReviewScreen.tsx";
import { handleCommand } from "../commands/index.ts";
import { listTasks } from "../storage/repositories/tasks.ts";
import { listGoals, listObjectives } from "../storage/repositories/goals.ts";
import { listHabits, getStreak } from "../storage/repositories/habits.ts";
import { syncTodoist } from "../integrations/todoist/sync.ts";
import type { Screen } from "./components/Header.tsx";
import type { Message } from "./components/MessageFeed.tsx";
import type { Goal, Habit, Task, Objective } from "../types.ts";
import type { StreakData } from "../storage/repositories/habits.ts";
import { randomUUID } from "crypto";

function timestamp(): string {
  return new Date().toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" });
}

export function App() {
  const [screen, setScreen] = useState<Screen>("today");
  const [messages, setMessages] = useState<Message[]>([]);
  const [thinking, setThinking] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [goals, setGoals] = useState<Goal[]>([]);
  const [objectives, setObjectives] = useState<Objective[]>([]);
  const [habits, setHabits] = useState<Habit[]>([]);
  const [streaks, setStreaks] = useState<Record<string, StreakData>>({});

  const refreshData = useCallback(() => {
    const today = new Date().toISOString().slice(0, 10);
    setTasks(listTasks({ due_date: today }));
    setGoals(listGoals("active"));
    setObjectives(listObjectives("active"));
    const h = listHabits();
    setHabits(h);
    setStreaks(Object.fromEntries(h.map((hb) => [hb.id, getStreak(hb.id)])));
  }, []);

  useEffect(() => {
    refreshData();
    setSyncing(true);
    syncTodoist()
      .then(() => refreshData())
      .finally(() => setSyncing(false));
  }, [refreshData]);

  const onSubmit = useCallback(
    async (input: string) => {
      const userMsg: Message = {
        id: randomUUID(),
        role: "user",
        content: input,
        timestamp: timestamp(),
      };
      setMessages((prev) => [...prev, userMsg]);
      setThinking(true);

      try {
        const result = await handleCommand(input, {
          currentScreen: screen,
          recentMessages: messages.slice(-6).map((m) => ({ role: m.role, content: m.content })),
          profile: null,
        });

        const assistantMsg: Message = {
          id: randomUUID(),
          role: "assistant",
          agentName: result.agentName,
          content: result.content,
          timestamp: timestamp(),
        };
        setMessages((prev) => [...prev, assistantMsg]);
        refreshData();
      } catch (e) {
        setMessages((prev) => [
          ...prev,
          {
            id: randomUUID(),
            role: "assistant",
            agentName: "schedule",
            content: `Error: ${String(e)}`,
            timestamp: timestamp(),
          },
        ]);
      } finally {
        setThinking(false);
      }
    },
    [screen, messages, refreshData]
  );

  const terminalHeight = process.stdout.rows ?? 24;
  const mainHeight = terminalHeight - 6;
  const habitStreakMap = Object.fromEntries(
    Object.entries(streaks).map(([k, v]) => [k, v.currentStreak])
  );

  const renderScreen = () => {
    switch (screen) {
      case "today":
        return <TodayScreen tasks={tasks} />;
      case "goals":
        return <GoalsScreen objectives={objectives} goals={goals} />;
      case "habits":
        return <HabitsScreen habits={habits} streaks={streaks} />;
      case "review":
        return <ReviewScreen messages={messages} height={mainHeight} />;
    }
  };

  return (
    <box flexDirection="column" width="100%" height={terminalHeight}>
      <Header activeScreen={screen} onTabChange={setScreen} syncing={syncing} />

      <box flexDirection="row" flexGrow={1} height={mainHeight}>
        <Sidebar goals={goals} habits={habits} habitStreaks={habitStreakMap} />

        <box flexDirection="column" flexGrow={1}>
          {renderScreen()}
          {screen !== "review" && (
            <MessageFeed messages={messages} height={Math.floor(mainHeight / 2)} />
          )}
        </box>
      </box>

      <InputBar onSubmit={onSubmit} disabled={thinking} />
    </box>
  );
}
