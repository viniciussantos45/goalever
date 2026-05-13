import { invokeGraph } from "../agents/graph.ts";
import { syncTodoist } from "../integrations/todoist/sync.ts";
import { COMMANDS, DIRECT_ROUTES } from "./registry.ts";
import type { SessionContext, UIMessage } from "../agents/orchestrator.ts";

export const HELP_TEXT = [
  "goalever — your personal goal & life assistant",
  "",
  ...COMMANDS.map((c) => `  ${c.usage.padEnd(28)} ${c.description}`),
  "",
  "Or just type naturally — the AI will understand!",
].join("\n");

export async function handleCommand(input: string, _context: SessionContext): Promise<UIMessage> {
  const trimmed = input.trim();

  if (trimmed === "/help") {
    return { agentName: "schedule", content: HELP_TEXT };
  }

  if (trimmed === "/sync") {
    const result = await syncTodoist();
    return {
      agentName: "schedule",
      content: `Sync complete: pulled ${result.pulled} tasks, pushed ${result.pushed} tasks.${result.errors.length > 0 ? `\nErrors: ${result.errors.join(", ")}` : ""}`,
    };
  }

  if (trimmed.startsWith("/import ")) {
    const filePath = trimmed.slice(8).trim().replace(/^~/, process.env["HOME"] ?? "~");
    let content: string;
    try {
      content = await Bun.file(filePath).text();
    } catch {
      return { agentName: "goalCoach", content: `Could not read file: ${filePath}\nMake sure the path is correct and the file exists.` };
    }
    const prompt = `Import the following Markdown notes as goals and objectives into goalever.
Read all the content carefully, identify each goal or objective, and create them using the appropriate tools.
Group related goals under objectives when the structure is clear.
Extract deadlines if mentioned (use YYYY-MM-DD format).
Today is ${new Date().toISOString().slice(0, 10)}.

File contents:
${content}`;
    return invokeGraph(prompt);
  }

  // Expand slash-command shortcuts to natural language, then route through the graph
  const naturalInput = DIRECT_ROUTES[trimmed] ?? trimmed;
  return invokeGraph(naturalInput);
}
