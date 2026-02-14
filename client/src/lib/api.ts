import axios from "axios";
import {
  Task,
  AuthResponse,
  LoginCredentials,
  RegisterCredentials,
  User,
} from "@/types";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";

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
      // Clear auth cookie and redirect to login
      if (typeof window !== "undefined") {
        document.cookie = "auth_token=; path=/; max-age=0; SameSite=Lax";
        window.location.href = "/login";
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
  updateProfile: async (updates: Partial<User> & { password?: string }): Promise<{ user: User }> => {
    const { data } = await apiClient.patch<User>("/users/profile", updates);
    return { user: data };
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
};

// Helper to store token
export const setAuthToken = (token: string) => {
  if (typeof window !== "undefined") {
    localStorage.setItem("authToken", token);
  }
};

// Helper to get token
export const getAuthToken = (): string | null => {
  if (typeof window !== "undefined") {
    return localStorage.getItem("authToken");
  }
  return null;
};

// Helper to remove token
export const removeAuthToken = () => {
  if (typeof window !== "undefined") {
    localStorage.removeItem("authToken");
  }
};
