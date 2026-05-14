export type CommandCategory = "planning" | "goals" | "habits" | "mood" | "utility";

export interface CommandDef {
  command: string;
  description: string;
  usage: string;
  category: CommandCategory;
  naturalRoute?: string;
}

export const COMMANDS: CommandDef[] = [
  { command: "/today",       description: "Show today's tasks",          usage: "/today",             category: "planning", naturalRoute: "Show me my tasks for today" },
  { command: "/tomorrow",    description: "Show tomorrow's plan",         usage: "/tomorrow",          category: "planning", naturalRoute: "Show me tasks due tomorrow" },
  { command: "/week",        description: "Weekly task overview",         usage: "/week",              category: "planning", naturalRoute: "Give me a weekly overview of my tasks" },
  { command: "/task new",    description: "Create a new task",            usage: "/task new [title]",  category: "planning" },
  { command: "/goals",       description: "List active goals",            usage: "/goals",             category: "goals",    naturalRoute: "List all my active goals" },
  { command: "/goal add",    description: "Create a new goal",            usage: "/goal add",          category: "goals" },
  { command: "/review",      description: "Start weekly review",          usage: "/review",            category: "goals",    naturalRoute: "Start my weekly review" },
  { command: "/progress",    description: "Show progress summary",        usage: "/progress",          category: "goals",    naturalRoute: "Show my overall progress summary" },
  { command: "/habit new",   description: "Register a new habit",         usage: "/habit new",         category: "habits" },
  { command: "/habit log",   description: "Log habit completion",         usage: "/habit log [id]",    category: "habits" },
  { command: "/streaks",     description: "Show habit streaks",           usage: "/streaks",           category: "habits",   naturalRoute: "Show all my habit streaks" },
  { command: "/unmotivated", description: "Low-motivation support",       usage: "/unmotivated",       category: "mood",     naturalRoute: "I am feeling unmotivated and need support" },
  { command: "/discouraged", description: "Support when discouraged",     usage: "/discouraged",       category: "mood",     naturalRoute: "I am feeling discouraged and need help" },
  { command: "/journal",     description: "Write today's journal entry",  usage: "/journal",           category: "mood",     naturalRoute: "I want to write a journal entry for today" },
  { command: "/profile",       description: "View your profile",                usage: "/profile",             category: "utility" },
  { command: "/profile setup", description: "Set up or update your profile",     usage: "/profile setup",       category: "utility" },
  { command: "/import",        description: "Import goals from a Markdown file",  usage: "/import [path]",       category: "goals" },
  { command: "/sync",          description: "Manually sync with Todoist",         usage: "/sync",                category: "utility" },
  { command: "/traces",        description: "Show recent agent execution traces",  usage: "/traces",              category: "utility" },
  { command: "/help",          description: "Show all commands",                  usage: "/help",                category: "utility" },
];

export const DIRECT_ROUTES: Record<string, string> = Object.fromEntries(
  COMMANDS.filter((c) => c.naturalRoute != null).map((c) => [c.command, c.naturalRoute!])
);
