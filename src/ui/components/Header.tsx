import React from "react";

export type Screen = "today" | "goals" | "habits" | "review";

interface HeaderProps {
  activeScreen: Screen;
  onTabChange: (screen: Screen) => void;
  syncing?: boolean;
}

const TABS: Array<{ key: Screen; label: string }> = [
  { key: "today", label: "Today" },
  { key: "goals", label: "Goals" },
  { key: "habits", label: "Habits" },
  { key: "review", label: "Review" },
];

export function Header({ activeScreen, onTabChange, syncing }: HeaderProps) {
  return (
    <box
      width="100%"
      height={3}
      flexDirection="row"
      alignItems="center"
      backgroundColor="#1e1e2e"
      border={true}
      borderStyle="single"
      borderColor="#313244"
    >
      <text fg="#cba6f7"><b>goalever</b></text>
      <text fg="#45475a">  |  </text>
      {TABS.map((tab) => (
        <box
          key={tab.key}
          onMouseDown={() => onTabChange(tab.key)}
        >
          <text fg={activeScreen === tab.key ? "#a6e3a1" : "#6c7086"}>
            {activeScreen === tab.key ? `[${tab.label}]  ` : ` ${tab.label}   `}
          </text>
        </box>
      ))}
      {syncing && <text fg="#f9e2af">  syncing...</text>}
    </box>
  );
}
