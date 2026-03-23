export type UserResponse = {
  id: string;
  email: string;
  displayName: string;
};

export type ProjectResponse = {
  id: string;
  name: string;
  description?: string | null;
  ownerUserId: string;
};

export type TaskResponse = {
  id: string;
  projectId: string;
  title: string;
  description?: string | null;
  priority: number;
  status: number;
  dueDate?: string | null;
  createdAt: string;
};

export type AuthResponse = {
  userId: string;
  email: string;
  displayName: string;
  accessToken: string;
};

export type TaskCommentDto = {
  id: string;
  taskId: string;
  authorUserId: string;
  content: string;
  createdAt: string;
};

export type TaskAssigneeResponse = {
  taskId: string;
  userIds: string[];
};
