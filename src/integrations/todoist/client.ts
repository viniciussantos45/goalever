const BASE = "https://api.todoist.com/rest/v2";

export interface TodoistTask {
  id: string;
  content: string;
  description: string;
  project_id: string;
  section_id: string | null;
  parent_id: string | null;
  order: number;
  priority: 1 | 2 | 3 | 4;
  due: { date: string; string: string; is_recurring: boolean } | null;
  is_completed: boolean;
  created_at: string;
  url: string;
}

export interface CreateTaskPayload {
  content: string;
  description?: string;
  project_id?: string;
  due_string?: string;
  priority?: 1 | 2 | 3 | 4;
}

export interface TodoistProject {
  id: string;
  name: string;
  color: string;
  parent_id: string | null;
  order: number;
  is_favorite: boolean;
}

export class TodoistClient {
  constructor(private token: string) {}

  private async request<T>(path: string, options: RequestInit = {}): Promise<T> {
    const res = await fetch(`${BASE}${path}`, {
      ...options,
      headers: {
        Authorization: `Bearer ${this.token}`,
        "Content-Type": "application/json",
        ...options.headers,
      },
    });

    if (!res.ok) {
      const body = await res.text().catch(() => "");
      throw new Error(`Todoist API error ${res.status}: ${body}`);
    }

    if (res.status === 204) return undefined as T;
    return res.json() as Promise<T>;
  }

  async getTasks(projectId?: string): Promise<TodoistTask[]> {
    const qs = projectId ? `?project_id=${projectId}` : "";
    return this.request<TodoistTask[]>(`/tasks${qs}`);
  }

  async createTask(payload: CreateTaskPayload): Promise<TodoistTask> {
    return this.request<TodoistTask>("/tasks", {
      method: "POST",
      body: JSON.stringify(payload),
    });
  }

  async closeTask(id: string): Promise<void> {
    return this.request<void>(`/tasks/${id}/close`, { method: "POST" });
  }

  async getProjects(): Promise<TodoistProject[]> {
    return this.request<TodoistProject[]>("/projects");
  }

  async createProject(name: string): Promise<TodoistProject> {
    return this.request<TodoistProject>("/projects", {
      method: "POST",
      body: JSON.stringify({ name }),
    });
  }
}
