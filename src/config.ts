import { ChatAnthropic } from "@langchain/anthropic";
import type { BaseChatModel } from "@langchain/core/language_models/chat_models";
import { ChatOllama } from "@langchain/ollama";
import { ChatOpenAI } from "@langchain/openai";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "fs";
import { join } from "path";

export type LLMProvider = "anthropic" | "openai" | "ollama";

export interface GoaleverConfig {
  llmProvider: LLMProvider;
  llmModel: string;
  anthropicApiKey?: string;
  openaiApiKey?: string;
  ollamaBaseUrl?: string;
  todoistApiKey?: string;
  obsidianVaultPath?: string;
  dataPath: string;
}

const CONFIG_DIR = join(process.cwd(), ".goalever");
const CONFIG_PATH = join(CONFIG_DIR, "config.json");

const DEFAULTS: Record<LLMProvider, string> = {
  anthropic: "claude-haiku-4-5-20251001",
  openai: "gpt-4o-mini",
  ollama: "llama3",
};

let _config: GoaleverConfig | null = null;

export function getConfig(): GoaleverConfig {
  if (_config) return _config;

  if (!existsSync(CONFIG_PATH)) {
    mkdirSync(CONFIG_DIR, { recursive: true });
    const defaults: GoaleverConfig = {
      llmProvider: "anthropic",
      llmModel: DEFAULTS.anthropic,
      dataPath: join(CONFIG_DIR, "data"),
    };
    writeFileSync(CONFIG_PATH, JSON.stringify(defaults, null, 2));
    _config = defaults;
    return _config;
  }

  _config = JSON.parse(readFileSync(CONFIG_PATH, "utf-8")) as GoaleverConfig;
  return _config;
}

export function saveConfig(updates: Partial<GoaleverConfig>): void {
  const current = getConfig();
  _config = { ...current, ...updates };
  mkdirSync(CONFIG_DIR, { recursive: true });
  writeFileSync(CONFIG_PATH, JSON.stringify(_config, null, 2));
}

export function getLLM(): BaseChatModel {
  const config = getConfig();
  switch (config.llmProvider) {
    case "anthropic":
      return new ChatAnthropic({
        model: config.llmModel,
        apiKey: config.anthropicApiKey ?? process.env["ANTHROPIC_API_KEY"],
      });
    case "openai":
      return new ChatOpenAI({
        model: config.llmModel,
        apiKey: config.openaiApiKey ?? process.env["OPENAI_API_KEY"],
      });
    case "ollama":
      return new ChatOllama({
        model: config.llmModel,
        baseUrl: config.ollamaBaseUrl ?? "http://localhost:11434",
      });
  }
}
