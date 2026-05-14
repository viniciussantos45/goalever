import { NodeSDK } from "@opentelemetry/sdk-node";
import { LangfuseSpanProcessor } from "@langfuse/otel";
import { CallbackHandler } from "@langfuse/langchain";

let _sdk: NodeSDK | null = null;
let _handler: CallbackHandler | null = null;

export function initTracing(): void {
  if (!process.env.LANGFUSE_SECRET_KEY) return;
  if (_sdk) return;
  _sdk = new NodeSDK({ spanProcessors: [new LangfuseSpanProcessor()] });
  _sdk.start();
}

export function getLangfuseHandler(): CallbackHandler | null {
  if (!process.env.LANGFUSE_SECRET_KEY) return null;
  if (!_handler) {
    _handler = new CallbackHandler();
  }
  return _handler;
}
