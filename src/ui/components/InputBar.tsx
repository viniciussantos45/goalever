import React, { useState } from "react";
import type { InputProps } from "@opentui/react";

interface InputBarProps {
  onSubmit: (value: string) => void;
  disabled?: boolean;
}

// Typed to OpenTUI's InputProps.onSubmit which is (value: string) => void
const createSubmitHandler = (onSubmit: (value: string) => void, getDisabled: () => boolean) =>
  ((v: string) => {
    if (v.trim() && !getDisabled()) onSubmit(v.trim());
  }) as InputProps["onSubmit"];

export function InputBar({ onSubmit, disabled }: InputBarProps) {
  const [value, setValue] = useState("");

  const handleSubmit = createSubmitHandler(
    (v) => { onSubmit(v); setValue(""); },
    () => !!disabled
  );

  return (
    <box
      width="100%"
      height={3}
      flexDirection="row"
      alignItems="center"
      backgroundColor="#181825"
      border={true}
      borderStyle="single"
      borderColor="#313244"
    >
      <text fg="#89b4fa">{disabled ? "  thinking... " : "  > "}</text>
      <input
        value={value}
        focused={!disabled}
        onChange={(v) => setValue(v)}
        onSubmit={handleSubmit}
        textColor="#cdd6f4"
        placeholder={disabled ? "" : "Type a command or message... (/help)"}
        flexGrow={1}
      />
    </box>
  );
}
