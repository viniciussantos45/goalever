import { getDb } from "../db.ts";
import type { ToolCallRecord } from "../../tracing/handler.ts";

export interface TraceRecord {
  id: string;
  agentName: string;
  userInput: string;
  llmResponse?: string;
  toolCalls: ToolCallRecord[];
  tokensInput: number;
  tokensOutput: number;
  latencyMs: number;
  error?: string;
}

export function insertTrace(t: TraceRecord): void {
  getDb().run(
    `INSERT INTO agent_traces
       (id, agent_name, user_input, llm_response, tool_calls,
        tokens_input, tokens_output, latency_ms, error)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      t.id, t.agentName, t.userInput, t.llmResponse ?? null,
      JSON.stringify(t.toolCalls), t.tokensInput, t.tokensOutput,
      t.latencyMs, t.error ?? null,
    ]
  );
}

export function getRecentTraces(limit = 20) {
  return getDb()
    .query<{
      id: string;
      agent_name: string;
      user_input: string;
      llm_response: string;
      tool_calls: string;
      tokens_input: number;
      tokens_output: number;
      latency_ms: number;
      error: string | null;
      created_at: string;
    }, [number]>(
      `SELECT * FROM agent_traces ORDER BY created_at DESC LIMIT ?`
    )
    .all(limit);
}
