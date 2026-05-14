import type { KeyEvent } from "@opentui/core";
import { useKeyboard } from "@opentui/react";
import { randomUUID } from "crypto";
import { useCallback, useEffect, useState } from "react";
import { handleCommand } from "../commands/index.ts";
import { syncTodoist } from "../integrations/todoist/sync.ts";
import { listGoals, listObjectives } from "../storage/repositories/goals.ts";
import type { StreakData } from "../storage/repositories/habits.ts";
import { getStreak, listHabits } from "../storage/repositories/habits.ts";
import { getProfile } from "../storage/repositories/profile.ts";
import { listTasks } from "../storage/repositories/tasks.ts";
import type { Goal, Habit, Objective, Task } from "../types.ts";
import type { Screen } from "./components/Header.tsx";
import { Header } from "./components/Header.tsx";
import { InputBar } from "./components/InputBar.tsx";
import type { Message } from "./components/MessageFeed.tsx";
import { MessageFeed } from "./components/MessageFeed.tsx";
import { Sidebar } from "./components/Sidebar.tsx";
import { GoalsScreen } from "./screens/GoalsScreen.tsx";
import { HabitsScreen } from "./screens/HabitsScreen.tsx";
import { ReviewScreen } from "./screens/ReviewScreen.tsx";
import { TodayScreen } from "./screens/TodayScreen.tsx";

function timestamp(): string {
  return new Date().toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
  });
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
  const [inputBarHeight, setInputBarHeight] = useState(3);

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
          profile: getProfile(),
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
    [screen, refreshData],
  );

  const terminalHeight = process.stdout.rows ?? 24;
  const mainHeight = terminalHeight - 3 - inputBarHeight;
  const chatHeight = Math.max(8, Math.floor(mainHeight * 0.35));
  const screenHeight = mainHeight - chatHeight;
  const habitStreakMap = Object.fromEntries(
    Object.entries(streaks).map(([k, v]) => [k, v.currentStreak]),
  );

  useKeyboard((e: KeyEvent) => {
    if (thinking || !e.ctrl) return;
    const screenMap: Record<string, Screen> = {
      t: "today",
      g: "goals",
      h: "habits",
      r: "review",
    };
    const next = screenMap[e.name];
    if (next) setScreen(next);
  });

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

      <box flexDirection="row" height={screen === "review" ? mainHeight : screenHeight}>
        <Sidebar goals={goals} habits={habits} habitStreaks={habitStreakMap} />

        <box flexGrow={1} height="100%">
          {renderScreen()}
        </box>
      </box>

      {screen !== "review" && (
        <MessageFeed
          messages={messages}
          height={chatHeight}
          thinking={thinking}
        />
      )}

      <InputBar
        onSubmit={onSubmit}
        disabled={thinking}
        onHeightChange={setInputBarHeight}
      />
    </box>
  );
}
