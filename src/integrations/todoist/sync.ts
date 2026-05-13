import { TodoistClient } from "./client.ts";
import { todoistTaskToLocal, localTaskToTodoist } from "./mapper.ts";
import { listTasks, upsertTaskByTodoistId, updateTaskTodoistId, completeTask } from "../../storage/repositories/tasks.ts";
import { getDb } from "../../storage/db.ts";
import { getConfig } from "../../config.ts";

export interface SyncResult {
  pulled: number;
  pushed: number;
  errors: string[];
}

function getClient(): TodoistClient | null {
  const { todoistApiKey } = getConfig();
  if (!todoistApiKey) return null;
  return new TodoistClient(todoistApiKey);
}

export async function syncTodoist(): Promise<SyncResult> {
  const client = getClient();
  if (!client) return { pulled: 0, pushed: 0, errors: ["Todoist API key not configured"] };

  const result: SyncResult = { pulled: 0, pushed: 0, errors: [] };

  try {
    // Pull: Todoist → local DB
    const remoteTasks = await client.getTasks();
    for (const rt of remoteTasks) {
      try {
        upsertTaskByTodoistId(rt.id, todoistTaskToLocal(rt));
        result.pulled++;
      } catch (e) {
        result.errors.push(`Pull failed for ${rt.id}: ${String(e)}`);
      }
    }

    // Mark remotely-closed tasks as done locally
    const remoteClosedIds = new Set(remoteTasks.filter((t) => t.is_completed).map((t) => t.id));
    const localWithTodoist = listTasks().filter((t) => t.todoist_id && remoteClosedIds.has(t.todoist_id));
    for (const lt of localWithTodoist) {
      if (lt.status !== "done") completeTask(lt.id);
    }

    // Push: local tasks without todoist_id → Todoist
    const unsynced = listTasks({ status: "pending" }).filter((t) => !t.todoist_id);
    for (const lt of unsynced) {
      try {
        const created = await client.createTask(localTaskToTodoist(lt));
        updateTaskTodoistId(lt.id, created.id);
        result.pushed++;
      } catch (e) {
        result.errors.push(`Push failed for ${lt.id}: ${String(e)}`);
      }
    }
  } catch (e) {
    result.errors.push(`Sync failed: ${String(e)}`);
  }

  getDb().run(
    "INSERT OR REPLACE INTO sync_state (key, value) VALUES ('last_synced', datetime('now'))"
  );

  return result;
}

export async function pushTask(localId: string): Promise<void> {
  const client = getClient();
  if (!client) return;

  const tasks = listTasks();
  const task = tasks.find((t) => t.id === localId);
  if (!task || task.todoist_id) return;

  const created = await client.createTask(localTaskToTodoist(task));
  updateTaskTodoistId(localId, created.id);
}

export async function closeRemoteTask(todoistId: string): Promise<void> {
  const client = getClient();
  if (!client) return;
  await client.closeTask(todoistId);
}
