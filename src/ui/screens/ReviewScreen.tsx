import React from "react";
import type { Message } from "../components/MessageFeed.tsx";
import { MessageFeed } from "../components/MessageFeed.tsx";

interface ReviewScreenProps {
  messages: Message[];
  height: number;
}

export function ReviewScreen({ messages, height }: ReviewScreenProps) {
  return (
    <box flexDirection="column" width="100%" height="100%">
      <text fg="#cba6f7"><b>Weekly Review</b></text>
      <text fg="#6c7086">Type /review to start your weekly reflection</text>
      <text> </text>
      <MessageFeed messages={messages} height={height - 4} />
    </box>
  );
}
