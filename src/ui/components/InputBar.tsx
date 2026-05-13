import React, { useState, useEffect, useCallback } from "react";
import { useKeyboard } from "@opentui/react";
import type { InputProps, SelectProps } from "@opentui/react";
import { COMMANDS } from "../../commands/registry.ts";
import type { KeyEvent } from "@opentui/core";

interface InputBarProps {
  onSubmit: (value: string) => void;
  disabled?: boolean;
  onHeightChange?: (h: number) => void;
}

const MAX_HISTORY = 100;
const MAX_DROPDOWN_HEIGHT = 6;

export function InputBar({ onSubmit, disabled, onHeightChange }: InputBarProps) {
  const [value, setValue] = useState("");
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [dropdownFocused, setDropdownFocused] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [history, setHistory] = useState<string[]>([]);
  const [historyPos, setHistoryPos] = useState(-1);
  const [liveInput, setLiveInput] = useState("");

  const filtered = value.startsWith("/")
    ? COMMANDS.filter((c) => c.command.startsWith(value))
    : [];

  const shouldShowDropdown = dropdownOpen && filtered.length > 0 && !disabled;
  const dropdownHeight = shouldShowDropdown ? Math.min(filtered.length + 2, MAX_DROPDOWN_HEIGHT) : 0;
  const totalHeight = 3 + dropdownHeight;

  const hintCommand = filtered[selectedIndex] ?? filtered[0];
  const placeholder = shouldShowDropdown && hintCommand
    ? hintCommand.usage
    : "Type a command or message... (/help)";

  const selectOptions = filtered.map((c) => ({ name: c.command, description: c.description }));

  useEffect(() => {
    onHeightChange?.(totalHeight);
  }, [totalHeight, onHeightChange]);

  const navigateHistory = useCallback((dir: "up" | "down") => {
    if (dir === "up") {
      if (history.length === 0) return;
      if (historyPos === -1) {
        setLiveInput(value);
        const next = history.length - 1;
        setHistoryPos(next);
        setValue(history[next] ?? "");
      } else if (historyPos > 0) {
        const next = historyPos - 1;
        setHistoryPos(next);
        setValue(history[next] ?? "");
      }
    } else {
      if (historyPos === -1) return;
      if (historyPos < history.length - 1) {
        const next = historyPos + 1;
        setHistoryPos(next);
        setValue(history[next] ?? "");
      } else {
        setHistoryPos(-1);
        setValue(liveInput);
      }
    }
  }, [history, historyPos, value, liveInput]);

  useKeyboard((e: KeyEvent) => {
    if (disabled) return;

    if (e.name === "escape" && dropdownOpen) {
      e.preventDefault();
      setDropdownFocused(false);
      setDropdownOpen(false);
      return;
    }

    if (e.name === "tab" && dropdownOpen && !dropdownFocused && filtered.length > 0) {
      e.preventDefault();
      const top = filtered[0];
      if (top) {
        setValue(top.command + " ");
        setDropdownOpen(false);
        setSelectedIndex(0);
      }
      return;
    }

    if (e.name === "down" && dropdownOpen && !dropdownFocused) {
      e.preventDefault();
      setDropdownFocused(true);
      return;
    }

    if (!dropdownOpen) {
      if (e.name === "up") {
        e.preventDefault();
        navigateHistory("up");
        return;
      }
      if (e.name === "down" && historyPos > -1) {
        e.preventDefault();
        navigateHistory("down");
        return;
      }
    }
  });

  function handleChange(v: string) {
    setValue(v);
    setHistoryPos(-1);
    setLiveInput("");
    setDropdownOpen(v.startsWith("/"));
    setSelectedIndex(0);
    setDropdownFocused(false);
  }

  function handleDropdownSelect(index: number) {
    const chosen = filtered[index];
    if (!chosen) return;
    setValue(chosen.command + " ");
    setDropdownOpen(false);
    setDropdownFocused(false);
    setSelectedIndex(0);
  }

  const handleSubmit = ((v: string) => {
    if (!v.trim() || disabled) return;
    onSubmit(v.trim());
    setValue("");
    setDropdownOpen(false);
    setDropdownFocused(false);
    setSelectedIndex(0);
    setHistory((prev) => {
      const deduped = prev[prev.length - 1] === v.trim() ? prev : [...prev, v.trim()];
      return deduped.slice(-MAX_HISTORY);
    });
    setHistoryPos(-1);
    setLiveInput("");
  }) as InputProps["onSubmit"];

  return (
    <box flexDirection="column" width="100%" height={totalHeight} backgroundColor="#181825">
      {shouldShowDropdown && (
        <box
          height={dropdownHeight}
          width="100%"
          border={true}
          borderStyle="single"
          borderColor="#45475a"
          backgroundColor="#181825"
        >
          <select
            options={selectOptions}
            focused={dropdownFocused}
            selectedIndex={selectedIndex}
            onChange={(i) => setSelectedIndex(i)}
            onSelect={handleDropdownSelect as SelectProps["onSelect"]}
            height={dropdownHeight}
            width="100%"
            showDescription={true}
            backgroundColor="#181825"
            textColor="#cdd6f4"
            focusedBackgroundColor="#313244"
            focusedTextColor="#cdd6f4"
            selectedBackgroundColor="#313244"
            selectedTextColor="#89b4fa"
            descriptionColor="#6c7086"
            selectedDescriptionColor="#6c7086"
          />
        </box>
      )}

      <box
        height={3}
        width="100%"
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
          focused={!disabled && !dropdownFocused}
          onInput={handleChange}
          onSubmit={handleSubmit}
          textColor="#cdd6f4"
          placeholder={disabled ? "" : placeholder}
          placeholderColor="#45475a"
          flexGrow={1}
        />
      </box>
    </box>
  );
}
