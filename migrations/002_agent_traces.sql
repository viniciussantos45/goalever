CREATE TABLE IF NOT EXISTS agent_traces (
  id            TEXT PRIMARY KEY,
  agent_name    TEXT NOT NULL,
  user_input    TEXT NOT NULL,
  llm_response  TEXT,
  tool_calls    TEXT,
  tokens_input  INTEGER DEFAULT 0,
  tokens_output INTEGER DEFAULT 0,
  latency_ms    INTEGER NOT NULL,
  error         TEXT,
  created_at    TEXT DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_traces_created ON agent_traces(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_traces_agent   ON agent_traces(agent_name);
