import { BaseCallbackHandler } from "@langchain/core/callbacks/base";
import type { Serialized } from "@langchain/core/load/serializable";
import type { LLMResult } from "@langchain/core/outputs";

export interface ToolCallRecord {
  name: string;
  input: string;
  output: string;
  latency_ms: number;
}

export class LocalTraceCollector extends BaseCallbackHandler {
  name = "LocalTraceCollector";
  toolCalls: ToolCallRecord[] = [];
  tokensInput = 0;
  tokensOutput = 0;
  private _toolStart = new Map<string, number>();

  override async handleToolStart(_tool: Serialized, input: string, runId: string) {
    this._toolStart.set(runId, Date.now());
    this.toolCalls.push({ name: _tool.id?.at(-1) ?? "unknown", input, output: "", latency_ms: 0 });
  }

  override async handleToolEnd(output: string, runId: string) {
    const start = this._toolStart.get(runId);
    const last = this.toolCalls.at(-1);
    if (last) {
      last.output = output;
      last.latency_ms = start ? Date.now() - start : 0;
    }
    this._toolStart.delete(runId);
  }

  override async handleLLMEnd(output: LLMResult) {
    const usage = output.llmOutput?.tokenUsage;
    if (usage) {
      this.tokensInput  += usage.promptTokens     ?? 0;
      this.tokensOutput += usage.completionTokens ?? 0;
    }
  }
}
