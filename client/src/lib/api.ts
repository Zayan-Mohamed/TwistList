import axios from "axios";
import {
  Task,
  Project,
  Team,
  AuthResponse,
  LoginCredentials,
  RegisterCredentials,
  User,
} from "@/types";

// IMPORTANT: Always use /api for Vercel proxy
// This ensures cookies work properly in production
const API_BASE_URL = "/api";

// Create Axios instance with default config
export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true, // Enable cookies to be sent with requests
});

// Response interceptor: Handle 401 errors
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Redirect to login on unauthorized
      if (typeof window !== "undefined") {
        if (!window.location.pathname.startsWith("/login")) {
          window.location.href = "/login?error=unauthorized";
        }
      }
    }
    return Promise.reject(error);
  },
);

// Auth API
export const authApi = {
  login: async (credentials: LoginCredentials): Promise<AuthResponse> => {
    const { data } = await apiClient.post<AuthResponse>(
      "/auth/signin",
      credentials,
    );
    return data;
  },
  register: async (credentials: RegisterCredentials): Promise<AuthResponse> => {
    const { data } = await apiClient.post<AuthResponse>(
      "/auth/signup",
      credentials,
    );
    return data;
  },
  getCurrentUser: async (): Promise<{ user: User }> => {
    const { data } = await apiClient.get<User>("/users/profile");
    return { user: data };
  },
  updateProfile: async (
    updates: Partial<User> & { password?: string },
  ): Promise<{ user: User }> => {
    const { data } = await apiClient.patch<User>("/users/profile", updates);
    return { user: data };
  },
  logout: async (): Promise<void> => {
    await apiClient.post("/auth/logout");
  },
  searchUsers: async (query: string): Promise<User[]> => {
    const { data } = await apiClient.get<User[]>("/users/search", {
      params: { q: query },
    });
    return data;
  },
};

// Tasks API
export const tasksApi = {
  getTasks: async (filters?: {
    projectId?: number;
    status?: string;
  }): Promise<Task[]> => {
    const { data } = await apiClient.get<Task[]>("/tasks", { params: filters });
    return data;
  },
  getTask: async (id: number): Promise<Task> => {
    const { data } = await apiClient.get<Task>(`/tasks/${id}`);
    return data;
  },
  createTask: async (task: Partial<Task>): Promise<Task> => {
    const { data } = await apiClient.post<Task>("/tasks", task);
    return data;
  },
  updateTask: async (id: number, updates: Partial<Task>): Promise<Task> => {
    const { data } = await apiClient.patch<Task>(`/tasks/${id}`, updates);
    return data;
  },
  deleteTask: async (id: number): Promise<void> => {
    await apiClient.delete(`/tasks/${id}`);
  },
  reorderTasks: async (
    positions: { id: number; position: number }[],
  ): Promise<void> => {
    await apiClient.patch("/tasks/reorder", { positions });
  },
};

// Projects API
export const projectsApi = {
  getProjects: async (): Promise<Project[]> => {
    const { data } = await apiClient.get<Project[]>("/projects");
    return data;
  },
  getProject: async (id: number): Promise<Project> => {
    const { data } = await apiClient.get<Project>(`/projects/${id}`);
    return data;
  },
  createProject: async (
    project: Partial<Project> & { teamId?: number },
  ): Promise<Project> => {
    const { data } = await apiClient.post<Project>("/projects", project);
    return data;
  },
  deleteProject: async (id: number): Promise<void> => {
    await apiClient.delete(`/projects/${id}`);
  },
};

// Teams API
export const teamsApi = {
  getTeams: async (): Promise<Team[]> => {
    const { data } = await apiClient.get<Team[]>("/teams");
    return data;
  },
  createTeam: async (team: Partial<Team>): Promise<Team> => {
    const { data } = await apiClient.post<Team>("/teams", team);
    return data;
  },
  addMember: async (teamId: number, usernameOrEmail: string): Promise<void> => {
    await apiClient.post(`/teams/${teamId}/members`, { usernameOrEmail });
  },
  leaveTeam: async (): Promise<void> => {
    await apiClient.post(`/teams/leave`);
  },
  deleteTeam: async (id: number): Promise<void> => {
    await apiClient.delete(`/teams/${id}`);
  },
  requestJoin: async (teamId: number): Promise<void> => {
    await apiClient.post(`/teams/${teamId}/join`);
  },
  acceptRequest: async (teamId: number, requestId: number): Promise<void> => {
    await apiClient.post(`/teams/${teamId}/requests/${requestId}/accept`);
  },
  rejectRequest: async (teamId: number, requestId: number): Promise<void> => {
    await apiClient.post(`/teams/${teamId}/requests/${requestId}/reject`);
  },
};
