import { CallbackHandler } from "@langfuse/langchain";

// Langfuse v5 reads LANGFUSE_PUBLIC_KEY, LANGFUSE_SECRET_KEY, LANGFUSE_HOST from env automatically
let _handler: CallbackHandler | null = null;

export function getLangfuseHandler(): CallbackHandler | null {
  if (!process.env.LANGFUSE_SECRET_KEY) return null;
  if (!_handler) {
    _handler = new CallbackHandler();
  }
  return _handler;
}
