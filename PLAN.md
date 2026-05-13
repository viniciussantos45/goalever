Here is the English translation of the text you provided:

# Functional and Human Requirements

The tool will work as the user’s **“second brain”**, extending their memory and planning beyond the biological brain. This means it should maintain a complete model of the user, including profile, routine, preferences, family, work, hobbies, and so on, and use this knowledge to **offer human support**. Instead of being rigid or authoritarian, it will act as a digital secretary/mentor that helps without imposing obligations. To achieve this:

- **User modeling:** The tool should securely and locally store data about the user, such as wake-up time, work, family and social activities. This “personal model” allows it to understand the daily context and adapt recommendations.
- **Specialized agents:** It is useful to think of internal modules, or “agents”, such as a **Schedule Secretary** that organizes appointments and deadlines, a **Goal Coach** that tracks objectives and suggests adjustments, and an **Emotional Mentor** that detects lack of motivation and provides support. Each agent has different roles, but they exchange information.
- **Autonomy and support:** In line with _Self-Determination Theory_, the system should foster the user’s autonomy and competence. This means using choice-based language, such as “you can choose…” or “what do you prefer today?”, and offering options instead of imposing decisions. The user should feel self-fulfilled and in control of their goals.
- **Empathy and motivation:** The assistant should use friendly language, positive reinforcement, and recognition of achievements whenever a task is completed, in order to build trust and engagement. For example, commands like `/unmotivated` should generate understanding responses, perhaps asking what is causing frustration and offering adjustment tips or personalized motivational messages. This is equivalent to _motivational interviewing_ techniques, asking about feelings and reframing difficult goals into smaller steps, such as: “I understand that you are not feeling excited. Shall we break this task into smaller pieces?”
- **Privacy and locality:** Since it will run locally, the user retains full control over their data. Nothing is sent to external servers. This offline design reinforces trust and avoids biases from external systems. In addition, keeping the tool simple, as a CLI/text interface, helps maintain focus without overloading cognition.
- **Markdown sync:** All data will be saved in Markdown files organized by category, such as “Goals.md”, “Daily_Tasks.md”, and “Journal.md”. Markdown is a universal and future-proof format, compatible with apps such as Obsidian. This way, the user can access and edit notes at any time. It is enough to sync a single folder, via Dropbox, Obsidian Sync, and so on, to have cross-platform access.

In short, the assistant should act as an **intelligent digital friend/secretary**: organized, empathetic, non-imposing, but capable of guiding the user toward achieving their goals using proven psychological strategies.

## Models and Studies on Goals and Behavior

To guide its features, the tool will be based on proven psychological methodologies for defining and achieving goals:

- **Goal-Setting Theory, Locke & Latham:** _Specific_ and _challenging_ goals lead to much higher performance than vague goals such as “do your best”. Studies show that **clear and difficult goals** generate greater effort and better results. Example: “By 06/30, write two technical posts in English” works better than “improve English”.
- **Implementation Intentions, Gollwitzer:** It is essential to plan **when, where, and how** to act. Specifying triggers, in an if-then format, makes behavior almost automatic. For example, instead of saying “I will study English”, formulating “when I finish breakfast at the office, I will study English for 15 minutes” greatly increases adherence. Gollwitzer calls this _“delegating control to the environment”_: by clearly associating context and action, initiation becomes quick and requires little conscious effort.
- **Habit Formation:** To reinforce daily behaviors, repetition in the same context is key. Research by Lally et al. (2009) showed that repeating an action daily in the same setting, for example **“after lunch”**, creates a strong mental association, making the action automatic after around 66 days on average. Therefore, the assistant should help the user choose consistent triggers and remind them gently through notifications or CLI alerts. Example: defining “study English _every day at 8 a.m. after breakfast_”. With this, even if some days are missed, the tendency to resume the habit remains high.
- **Self-Determination Theory, SDT:** Human motivation arises from the needs for **autonomy, competence, and relatedness**. The system should therefore offer **real choices** to the user, promoting autonomy, and provide constructive feedback that highlights learning, promoting competence. Example: asking “Would you rather practice reading or writing in English today?” instead of deciding for them. Celebrating small successes, such as completed tasks, gives a sense of competence. Even if the user works alone, the tool provides _non-controlling_ support, similar to what a mentor does, to strengthen self-determination.
- **Gamification and Feedback:** Incorporating playful elements or visual feedback helps maintain engagement. The assistant can reward _streaks_, meaning consecutive days of completing a habit, display progress bars, virtual badges, and positive reminders. According to sources on AI habit tools, these tactics increase **self-awareness** and **consistency**. For example, a weekly summary may highlight: “You completed 5 out of 7 English study sessions this week — great job!”
- **Periodic Review:** Scheduling regular review moments, such as weekly or monthly, improves self-regulation. During these reviews, the system can ask: “What did you make progress on? What is still pending? What should be adjusted?” This practice is inspired by agile methods of planning and continuous reflection. This self-reflection guides the redefinition of goals and metrics to maintain consistent progress.

In short, the tool’s design combines goal theory, environmental planning, and human motivation. Each feature, from the daily routine to goal choices, supports scientific principles: clear goals, contextual planning, habit through repetition, and positive reinforcement.

## CLI Architecture and Markdown Format

The interface will be a **command-line interface, CLI**, because it is simple, lightweight, and scriptable. The user interacts by typing short commands, such as `/objectives`, `/today`, and `/review`. All goals, tasks, and notes will be stored in `.md` files organized hierarchically in folders. For example:

- `Objectives/`: each long-term goal as a file such as `Goal-AdvancedEnglish.md`, containing description, deadline, and measurable key results.
- `Goals/`: medium-term goals, quarterly or monthly, in separate files linked to higher-level objectives.
- `Tasks/`: daily or weekly tasks, with each day having a `.md` file, like a “Daily Note”. Each task appears as a Markdown checklist item, `- [ ]`, so it can be marked as completed.
- `Habits/`: a general file, or one file per habit, recording progress, such as checklist tables for each day the habit was practiced.
- `Journal/`: daily or weekly reflection notes, where the user writes brief comments and the system records feelings or insights.
- `Config/`: a `profile.md` file with personal information, such as preferences, schedules, hobbies, and occupation, for personalization.

This structure keeps the user in control: they can always open these `.md` files in Obsidian or another editor. As observed in personal experiences, “nothing is more cross-platform and future-proof than Markdown”. It is enough to sync a shared folder, via Dropbox, iCloud, Obsidian Sync, and so on, to have automatic access.

In practice, the CLI has commands such as:

- **Goal commands:** `/goals` lists active goals and deadlines; `/goal add` creates a new goal; `/goal edit [ID]` changes a goal.
- **Task commands:** `/today` shows tasks scheduled for today; `/tomorrow` and `/week` show the respective tasks; `/task new` adds a task linked to a goal; marking it as “done” when completed updates the `.md` file.
- **Habit commands:** `/habit new [description] @ [trigger]` creates a habit, such as “meditate @ after breakfast”. The system records it and checks consistency.
- **Review command:** `/review` starts a questionnaire, such as “What did you accomplish? Where are you stuck?”, and generates a weekly or monthly summary by combining data from the `.md` files.
- **Profile commands:** `/profile` displays personal data; `/profile edit` allows updating routine and preferences, such as “I prefer studying in the morning” or “free day: Saturday”. This helps the assistant suggest suitable times.
- **Motivation:** `/unmotivated` or `/discouraged` triggers an extra support module: the system asks what is wrong and then suggests reframing, such as breaking down the task, remembering the purpose behind the goal, or even offering brief breathing exercises and encouraging phrases.
- **Reports:** `/progress` shows indicators, such as how many tasks were completed, simple habit charts, and so on; `/statistics` can display weekly averages or ongoing streaks.

Internally, each command activates one or more responsible agents. For example, the `/today` command activates the Schedule agent, which checks the user’s profile for commitments and returns the task list for that day. All outputs are generated in readable text and also written to the appropriate Markdown files.

In summary, the CLI enables quick and text-based interaction with the assistant. The Markdown format makes it easy to save a history of decisions and notes, integrating everything into a single **personal knowledge vault** in Obsidian. As one Obsidian user says, using Markdown makes notes “portable across different apps and for long-term storage”, which is a fundamental point here.

## Tracking, Review, and Personalization Features

To effectively manage goals and routine, the tool will include key features:

- **Goal and OKR Management:** Enables the definition of qualitative _Objectives_ and measurable _Key Results_, in the OKR style. The user defines broad objectives, such as “Speak English fluently”, and key results, such as “Complete 4 mock interviews in English this quarter”. The system automatically tracks the status of these results as related tasks are completed.
- **Task Planning:** Connects each daily task to a goal or project. Allows prioritizing and redistributing tasks. Based on the profile’s schedule, it can suggest free time slots. As indicated in studies on personal assistants, organizing schedules and sending prior reminders “saves time and reduces the user’s cognitive load”. For example, if the user’s calendar showed a meeting at 10 a.m., the assistant would avoid scheduling a high-focus task at that time.
- **Habit Tracking:** Automatically records when the user completes daily habits, such as “reading for 20 minutes”. It uses _contextual notifications_: if the habit is “exercise after work”, the system sends an alert as soon as it detects the end of the workday, based, for example, on the provided schedule. This implements implementation intentions using environmental cues. If a session is missed, the system reminds the user again at the next trigger, supporting consistency without excessive punishment. Lally found that missing a single day rarely harms the habit if consistency is maintained over the long term.
- **Feedback and Metrics:** Collects task and habit completion data. Presents simple insights, for example identifying patterns such as “You tend to miss the gym on Mondays”, and highlights problematic triggers. According to sources on AI habit tools, this provides _self-knowledge_ about how behaviors are triggered. It also shows statistics, such as goal completion percentages and habit streak graphs, to reinforce concrete progress.
- **Weekly/Monthly Review:** Each week, the system starts a guided review, for example with the `/review` command, listing successes and difficulties and proposing adjustments. This review routine reflects agile practices and helps reconfigure goals as needed. For example, if a goal turned out to be unrealistic, the assistant asks whether it makes sense to extend the deadline or split it into smaller sub-goals.
- **Dynamic Personalization:** Analyzes the user’s previous choices to adapt suggestions. If the user consistently delays morning tasks, the assistant starts scheduling them later. It “learns” preferences without biases, simply by observing behavior patterns. As recommended by specialists, personal assistants use usage history and context to provide relevant recommendations.
- **Custom reminders:** Sends context-based alerts: it notifies before important events, helping prevent procrastination, and reminds the user of inconvenient tasks to avoid missed opportunities, such as “Time to take your medicine!” or “It is time to study English.”
- **App integrations:** Optional basic support for exporting/importing data from task tools such as Todoist. For example, when generating the day’s task list, the user can send it to their Todoist account through a formatted `.md` file, keeping everything synchronized.
- **Light gamification:** Emulates game elements, such as progress bars and unlockable achievements when goals are reached, to increase engagement. This can be something visual in the terminal, such as emojis, or simple metrics, such as leveling up “goal points”.
- **Integrated motivational content:** Includes inspirational quotes, reminders of the goal’s purpose, or suggestions for self-care activities. For example, if it detects frequent tiredness on Fridays, it may suggest: “It seems you usually feel exhausted this Friday. How about planning a short rest this afternoon?”

Across all these features, the assistant acts as an attentive secretary: relieving the user from controlling details and keeping them focused on what matters. At the same time, it respects individual rhythms and provides feedback that reinforces self-efficacy. With each completed task, it increases the sense of competence. According to the literature, this combination of self-monitoring and contextual support facilitates persistence in personal goals.

## Interactions and Special Commands

To make interaction natural and fast, the CLI will offer simple commands, which may start with “/”, for the main actions. For example:

- `/objectives` – Displays current long-term goals and progress on Key Results.
- `/goals short` or `/goals monthly` – Lists medium-term goals defined for the month. Allows creating a new goal or marking a goal as completed.
- `/tasks today` – Shows tasks scheduled for the day, grouped by project/goal.
- `/add task` – Starts a dialogue to create a new task linked to a goal. It asks for description, deadline, and priority.
- `/habit new` – Opens the registration flow for a new habit with a defined trigger, such as a time or event.
- `/journal` – Opens the daily journal file and asks for a summary of what was done or learned. It may suggest guided questions, such as “What were your wins today?”
- `/review` – Starts the weekly review: automatically asks the user about the positive and negative points of the week and records these answers in a review file. Then, it updates goals if necessary.
- `/profile` – Shows stored personal information, such as preferred morning/afternoon work period, hobbies, close family members, and so on, and allows editing it.
- `/help` – Provides general tips or explanations about available commands. It can also show motivational tips, such as “Starting is the hardest part: focus on the first step!”
- `/progress` or `/status` – Generates a summary, in text or table format, of overall progress: how many tasks were completed during the week, percentages of goals achieved, maintained habits.
- **Mood command:** `/unmotivated`, or `/discouraged` – Automatically detects that the user has low motivation. The system then asks “What is going on today?” or suggests quick motivational exercises. Based on the answers, such as “I am tired”, it adapts the plan, perhaps making today’s tasks easier, reorganizing the schedule, or suggesting a break.
- **Other context commands:** There may be commands such as `/priority` to reorder tasks, `/remind` to schedule an immediate reminder, and `/explore` to analyze performance data, such as “Tell me about the last 7 days.”

All interactions are designed to be **conversational and humanized**. Instead of rigid responses, the assistant can use interjections and natural language. For example: “Great job!” when a goal is completed, or “No problem, let’s adjust this together” if the user gives feedback about a difficulty. This style of dialogue makes the behavior closer to that of a real mentor, using the strengths of the human brain in processing empathetic conversations.

In short, the command structure allows the user to **delegate mental tasks** to the assistant. As suggested by the extended mind theory, we use the tool to “free up” mental load while the user focuses on creative action. All the described features — goals, tasks, habits, motivation — work together to guide the user toward short-, medium-, and long-term goals with solid scientific foundations.

**References:** Strategies such as clear goal definition, trigger-based planning, habit repetition in the same context, and autonomy support were fundamental to this proposal, as they are proven in behavioral psychology studies. In addition, ideas from personal assistants inspire practical features, such as schedule management and reminders, preference analysis for recommendations, and the use of Markdown because of its portability. All these elements together form a coherent plan for a model “harness”: an intelligent, private, and personalized CLI designed to serve as your life and productivity assistant.
