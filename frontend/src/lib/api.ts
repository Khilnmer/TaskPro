import {
  AuthResponse,
  ProjectResponse,
  TaskAssigneeResponse,
  TaskCommentDto,
  TaskResponse,
  UserResponse
} from "@/types/domain";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:7198/api";

async function http<T>(path: string, options: RequestInit = {}, token?: string): Promise<T> {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(options.headers as Record<string, string> | undefined)
  };

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const response = await fetch(`${API_URL}${path}`, {
    ...options,
    headers,
    cache: "no-store"
  });

  if (!response.ok) {
    const errorBody = await response.text();

    // Try to extract a friendly message from JSON responses.
    try {
      const asJson = JSON.parse(errorBody) as { message?: string; title?: string };
      const message = asJson.message ?? asJson.title;
      if (message) {
        throw new Error(message);
      }
    } catch {
      // ignore JSON parse errors
    }

    throw new Error(errorBody || "Request failed");
  }

  if (response.status === 204) {
    return undefined as T;
  }

  const contentLength = response.headers.get("content-length");
  if (contentLength === "0") {
    return undefined as T;
  }

  const contentType = response.headers.get("content-type") ?? "";
  if (!contentType.includes("application/json")) {
    const text = await response.text();
    return (text as unknown) as T;
  }

  const text = await response.text();
  if (!text) {
    return undefined as T;
  }
  return JSON.parse(text) as T;
}

export const api = {
  auth: {
    login(email: string, password: string): Promise<AuthResponse> {
      return http<AuthResponse>("/auth/login", {
        method: "POST",
        body: JSON.stringify({ email, password })
      });
    },
    register(email: string, displayName: string, password: string): Promise<AuthResponse> {
      return http<AuthResponse>("/auth/register", {
        method: "POST",
        body: JSON.stringify({ email, displayName, password })
      });
    }
  },

  me(token: string): Promise<UserResponse> {
    return http<UserResponse>("/me", {}, token);
  },

  users: {
    list(token: string, skip = 0, take = 50): Promise<UserResponse[]> {
      return http<UserResponse[]>(`/users?skip=${skip}&take=${take}`, {}, token);
    },
    create(token: string, email: string, displayName: string): Promise<UserResponse> {
      return http<UserResponse>("/users", { method: "POST", body: JSON.stringify({ email, displayName }) }, token);
    },
    update(token: string, userId: string, email: string, displayName: string): Promise<UserResponse> {
      return http<UserResponse>(`/users/${userId}`, { method: "PUT", body: JSON.stringify({ email, displayName }) }, token);
    },
    delete(token: string, userId: string): Promise<void> {
      return http<void>(`/users/${userId}`, { method: "DELETE" }, token);
    }
    ,
    count(token: string): Promise<{ count: number } | { Count: number }> {
      return http<{ count: number } | { Count: number }>(`/users/count`, {}, token);
    }
  },

  projects: {
    list(token: string, skip = 0, take = 50): Promise<ProjectResponse[]> {
      return http<ProjectResponse[]>(`/projects?skip=${skip}&take=${take}`, {}, token);
    },
    create(token: string, name: string, description: string | null, ownerUserId: string): Promise<ProjectResponse> {
      return http<ProjectResponse>(
        "/projects",
        { method: "POST", body: JSON.stringify({ name, description, ownerUserId }) },
        token
      );
    },
    update(token: string, projectId: string, name: string, description: string | null): Promise<ProjectResponse> {
      return http<ProjectResponse>(
        `/projects/${projectId}`,
        { method: "PUT", body: JSON.stringify({ name, description }) },
        token
      );
    },
    delete(token: string, projectId: string): Promise<void> {
      return http<void>(`/projects/${projectId}`, { method: "DELETE" }, token);
    }
  },

  tasks: {
    listByProject(token: string, projectId: string, skip = 0, take = 50): Promise<TaskResponse[]> {
      return http<TaskResponse[]>(`/tasks/by-project/${projectId}?skip=${skip}&take=${take}`, {}, token);
    },
    get(token: string, taskId: string): Promise<TaskResponse> {
      return http<TaskResponse>(`/tasks/${taskId}`, {}, token);
    },
    create(
      token: string,
      payload: {
        projectId: string;
        title: string;
        description?: string | null;
        priority: number;
        status: number;
        dueDate?: string | null;
      }
    ): Promise<TaskResponse> {
      return http<TaskResponse>("/tasks", { method: "POST", body: JSON.stringify(payload) }, token);
    },
    update(
      token: string,
      taskId: string,
      payload: {
        title: string;
        description?: string | null;
        priority: number;
        status: number;
        dueDate?: string | null;
      }
    ): Promise<TaskResponse> {
      return http<TaskResponse>(`/tasks/${taskId}`, { method: "PUT", body: JSON.stringify(payload) }, token);
    },
    updateStatus(token: string, taskId: string, status: number): Promise<TaskResponse> {
      return http<TaskResponse>(`/tasks/${taskId}/status`, { method: "PUT", body: JSON.stringify({ status }) }, token);
    },
    delete(token: string, taskId: string): Promise<void> {
      return http<void>(`/tasks/${taskId}`, { method: "DELETE" }, token);
    }
  },

  comments: {
    listByTask(token: string, taskId: string, skip = 0, take = 50): Promise<TaskCommentDto[]> {
      return http<TaskCommentDto[]>(`/comments/by-task/${taskId}?skip=${skip}&take=${take}`, {}, token);
    },
    add(token: string, payload: { taskId: string; authorUserId: string; content: string }): Promise<void> {
      return http<void>("/comments", { method: "POST", body: JSON.stringify(payload) }, token);
    }
  },

  assignees: {
    list(token: string, taskId: string): Promise<TaskAssigneeResponse> {
      return http<TaskAssigneeResponse>(`/tasks/${taskId}/assignees`, {}, token);
    },
    add(token: string, taskId: string, userId: string): Promise<TaskAssigneeResponse> {
      return http<TaskAssigneeResponse>(`/tasks/${taskId}/assignees/${userId}`, { method: "POST" }, token);
    },
    remove(token: string, taskId: string, userId: string): Promise<TaskAssigneeResponse> {
      return http<TaskAssigneeResponse>(`/tasks/${taskId}/assignees/${userId}`, { method: "DELETE" }, token);
    }
  },
};
