import React from "react";

interface ProgressBarProps {
  value: number;
  width?: number;
  label?: string;
}

export function ProgressBar({ value, width = 20, label }: ProgressBarProps) {
  const clamped = Math.max(0, Math.min(100, value));
  const filled = Math.round((clamped / 100) * width);
  const empty = width - filled;
  const bar = `[${"#".repeat(filled)}${".".repeat(empty)}] ${clamped}%`;
  const color = clamped >= 100 ? "#a6e3a1" : clamped >= 50 ? "#fab387" : "#f38ba8";

  return (
    <text fg={color}>
      {label ? `${label}: ${bar}` : bar}
    </text>
  );
}
