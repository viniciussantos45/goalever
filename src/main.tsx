import { createCliRenderer } from "@opentui/core";
import { createRoot } from "@opentui/react";
import { App } from "./ui/App.tsx";
import { initDb } from "./storage/db.ts";
import { getConfig } from "./config.ts";

async function main() {
  await initDb();
  const config = getConfig();

  if (!config.llmProvider) {
    console.error("No LLM provider configured. Edit ~/.goalever/config.json");
    process.exit(1);
  }

  const renderer = await createCliRenderer();
  createRoot(renderer).render(<App />);
}

main().catch((e) => {
  console.error("Fatal error:", e);
  process.exit(1);
});
