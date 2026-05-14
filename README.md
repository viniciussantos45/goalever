# goalever

> *Your goals deserve more than a to-do list.*

goalever is a local-first, AI-powered productivity companion that lives in your terminal. It knows your routines, tracks your habits, coaches your goals, and checks in on how you're feeling — all without sending a single byte to the cloud.

Think of it as the intersection between a personal coach, a digital secretary, and a second brain: one that speaks your language, remembers your context, and nudges you forward without ever being pushy.

---

## The Idea

Most productivity apps treat you like a task queue. You add items, you check them off, and you repeat. But humans don't work that way.

goalever is built on a different premise: **achieving goals is a human problem, not an organizational one.** Behind every missed deadline is a lack of motivation, a poor habit, or an unclear priority — not a missing reminder.

That's why goalever combines proven behavioral psychology frameworks — Goal-Setting Theory, Implementation Intentions, Habit Formation, and Self-Determination Theory — with a multi-agent AI architecture. Each agent has a distinct role, a distinct personality, and a distinct purpose. Together, they form a system that doesn't just track what you need to do, but *helps you actually do it*.

---

## How It Works

goalever is built around a **supervisor-router + specialized agent** architecture powered by [LangGraph](https://langchain-ai.github.io/langgraphjs/).

```
User input
    │
    ▼
┌─────────────┐
│  Supervisor │  ← classifies intent via structured LLM output
└──────┬──────┘
       │
       ▼ routes to one of:
┌──────────────────────────────────────────────────────────┐
│  Schedule       Goal Coach    Habit Tracker              │
│  Secretary                                               │
│                 Emotional     Profile                    │
│                 Mentor        Agent                      │
└──────────────────────────────────────────────────────────┘
       │
       ▼
  SQLite (local) + Markdown export
```

### The Agents

| Agent | Role |
|---|---|
| **Schedule Secretary** | Manages tasks, daily/weekly planning, and deadlines |
| **Goal Coach** | Tracks OKRs, objectives, key results, and long-term goals |
| **Habit Tracker** | Logs habits, maintains streaks, and triggers contextual reminders |
| **Emotional Mentor** | Detects low motivation, supports journaling, and adapts the plan when you're struggling |
| **Profile Agent** | Learns your schedule, preferences, and context to personalize everything |

Every user message is first classified by the **supervisor node**, which picks the right agent using structured LLM output. If the LLM call fails, a keyword-based fallback ensures the app never crashes on routing.

Each agent runs as a [ReAct](https://python.langchain.com/docs/modules/agents/agent_types/react/) sub-agent with dedicated tools (database reads/writes, Markdown exports, profile lookups) and a personality-defining system prompt. The full conversation history is passed to each agent so context is never lost across turns.

### Storage

All data is stored **locally**:

- **SQLite** (via `bun:sqlite`) — the source of truth for tasks, goals, habits, journal entries, and agent traces
- **Markdown files** — auto-exported for portability; sync with Obsidian, iCloud, or Dropbox and your data travels with you

```
~/.goalever/
  config.json        ← LLM provider & API keys
data/
  goalever.db        ← SQLite database
  markdown/
    Tasks/           ← daily task exports
    Goals/           ← goal & objective exports
    Journal/         ← mood & journal entries
    Habits/          ← habit logs
```

### UI

The terminal interface is built with [OpenTUI](https://github.com/nicholasgasior/opentui) and React, rendered directly in your terminal — no browser needed.

Screens:
- **Today** — tasks, quick-add, daily focus
- **Goals** — objectives and key results with progress bars
- **Habits** — streaks, triggers, and logging
- **Review** — weekly guided reflection

All screens are reachable via slash commands or natural language.

### Tracing

Every agent invocation is traced via [Langfuse](https://langfuse.com/) (optional) and a local `agent_traces` SQLite table. Run `/traces` to inspect recent agent calls, token usage, and latency — all from the terminal.

---

## Getting Started

### Prerequisites

- [Bun](https://bun.sh) v1.0+
- An LLM provider API key (Anthropic, OpenAI, or a local Ollama instance)

### Install

```bash
git clone https://github.com/your-username/goalever
cd goalever
bun install
```

### Configure

```bash
cp .env.example .env
# add your ANTHROPIC_API_KEY (or OPENAI_API_KEY)
```

Edit `~/.goalever/config.json` (created on first run) to set your preferred LLM provider:

```json
{
  "llmProvider": "anthropic",
  "model": "claude-sonnet-4-6"
}
```

### Run

```bash
bun run start
```

On first launch, goalever will walk you through profile setup — your name, wake time, work hours. This context shapes every recommendation the agents make.

---

## Commands

| Command | Category | What it does |
|---|---|---|
| `/today` | Planning | Show today's tasks |
| `/tomorrow` | Planning | Show tomorrow's plan |
| `/week` | Planning | Weekly task overview |
| `/task new [title]` | Planning | Create a new task |
| `/goals` | Goals | List active goals |
| `/goal add` | Goals | Create a new goal |
| `/review` | Goals | Start your weekly review |
| `/progress` | Goals | Overall progress summary |
| `/habit new` | Habits | Register a new habit with a trigger |
| `/habit log [id]` | Habits | Log a habit completion |
| `/streaks` | Habits | Show all habit streaks |
| `/unmotivated` | Mood | Low-motivation support mode |
| `/discouraged` | Mood | Support when things feel hard |
| `/journal` | Mood | Write today's journal entry |
| `/profile` | Utility | View your profile |
| `/profile setup` | Utility | Update your profile |
| `/import [path]` | Goals | Import goals from a Markdown file |
| `/sync` | Utility | Sync tasks with Todoist |
| `/traces` | Utility | Inspect recent agent traces |
| `/help` | Utility | Show all commands |

You can also speak naturally — the supervisor routes plain conversation to the right agent automatically.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Runtime | [Bun](https://bun.sh) |
| AI Framework | [LangChain](https://js.langchain.com) + [LangGraph](https://langchain-ai.github.io/langgraphjs/) |
| LLM Providers | Anthropic Claude, OpenAI, Ollama (local) |
| Terminal UI | [OpenTUI](https://github.com/nicholasgasior/opentui) + React 19 |
| Database | SQLite via `bun:sqlite` |
| Tracing | Langfuse + OpenTelemetry |
| Schema validation | Zod |
| Integrations | Todoist |

---

## Vision & Growth Roadmap

goalever is an early-stage project. The foundation is deliberately simple — local, private, text-first — because clarity of thought comes before complexity of features.

Here's where it's going:

### Near-term

- **Voice input** — speak your goals instead of typing them
- **Morning briefing** — a curated daily summary generated on startup: tasks, habit reminders, one motivational nudge
- **Smarter habit triggers** — detect patterns from completion history and suggest better triggers automatically
- **Goal decomposition** — break a vague goal into concrete key results via a coached dialogue
- **Cross-device sync** — end-to-end encrypted sync of the SQLite database via a self-hosted server or S3-compatible bucket

### Medium-term

- **Calendar integration** — read Google Calendar / iCal events so the Schedule Agent can plan around your real day
- **Weekly email digest** — an optional weekly summary sent to your inbox
- **Obsidian plugin** — render goalever data as native Obsidian pages with backlinks
- **Persona customization** — choose the personality of your mentor: stoic, warm, direct, playful
- **Multi-user households** — share goals and habits with a partner or accountability buddy

### Long-term

- **Offline-first mobile app** — a native companion for iOS/Android that syncs with the CLI
- **Learning loop** — the agents evolve their suggestions based on what's actually worked for you in the past
- **Domain agents** — specialized agents for fitness, finance, learning, and relationships, each with their own tools and mental models
- **Open agent marketplace** — define your own agents with a simple YAML spec and share them with the community

---

## Philosophy

goalever is built on a few strong opinions:

**Local first.** Your goals are personal. They shouldn't live on someone else's server. Everything runs on your machine, in plain files you can open, edit, and move at any time.

**Empathy over automation.** The best productivity tool isn't the one with the most reminders — it's the one that understands when you're overwhelmed and helps you simplify, not pile on more.

**Science, not gimmicks.** Every feature traces back to behavioral psychology research. Habit formation, implementation intentions, autonomy support — these aren't buzzwords, they're mechanisms that actually work.

**Markdown as the universal language.** Whether you're using Obsidian, Bear, iA Writer, or a plain text editor, your data is readable. No proprietary formats. No lock-in. Ever.

---

## Contributing

goalever is in active development. If you have ideas, bug reports, or want to build a new agent, open an issue or a pull request.

---

## License

MIT
