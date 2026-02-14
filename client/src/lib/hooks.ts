import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { tasksApi } from "./api";
import { Task } from "@/types";
import { isAuthenticated } from "./auth";

// Query Keys Factory Pattern
export const taskKeys = {
  all: ["tasks"] as const,
  lists: () => [...taskKeys.all, "list"] as const,
  list: (filters: Record<string, unknown>) =>
    [...taskKeys.lists(), { filters }] as const,
  details: () => [...taskKeys.all, "detail"] as const,
  detail: (id: number) => [...taskKeys.details(), id] as const,
};

// Custom Hooks for Tasks
export const useTasks = (filters?: { projectId?: number; status?: string }) => {
  return useQuery({
    queryKey: taskKeys.list(filters || {}),
    queryFn: () => tasksApi.getTasks(filters),
    enabled: isAuthenticated(), // Only fetch if user is authenticated
  });
};

export const useTask = (id: number) => {
  return useQuery({
    queryKey: taskKeys.detail(id),
    queryFn: () => tasksApi.getTask(id),
    enabled: !!id,
  });
};

export const useCreateTask = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (newTask: Partial<Task>) => tasksApi.createTask(newTask),
    onSuccess: () => {
      // Invalidate and refetch tasks list
      queryClient.invalidateQueries({ queryKey: taskKeys.lists() });
    },
  });
};

export const useUpdateTask = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, updates }: { id: number; updates: Partial<Task> }) =>
      tasksApi.updateTask(id, updates),
    // Optimistic update
    onMutate: async ({ id, updates }) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: taskKeys.lists() });
      await queryClient.cancelQueries({ queryKey: taskKeys.detail(id) });

      // Snapshot previous value
      const previousTasks = queryClient.getQueryData(taskKeys.lists());
      const previousTask = queryClient.getQueryData(taskKeys.detail(id));

      // Optimistically update list
      queryClient.setQueriesData(
        { queryKey: taskKeys.lists() },
        (old: unknown) => {
          if (!old) return old;
          return (old as Task[]).map((task: Task) =>
            task.id === id ? { ...task, ...updates } : task,
          );
        },
      );

      // Optimistically update detail
      queryClient.setQueryData(taskKeys.detail(id), (old: unknown) => {
        if (!old) return old;
        return { ...(old as Task), ...updates };
      });

      return { previousTasks, previousTask };
    },
    onError: (_err, { id }, context) => {
      // Rollback on error
      if (context?.previousTasks) {
        queryClient.setQueriesData(
          { queryKey: taskKeys.lists() },
          context.previousTasks,
        );
      }
      if (context?.previousTask) {
        queryClient.setQueryData(taskKeys.detail(id), context.previousTask);
      }
    },
    onSettled: () => {
      // Refetch after mutation
      queryClient.invalidateQueries({ queryKey: taskKeys.lists() });
    },
  });
};

export const useDeleteTask = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => tasksApi.deleteTask(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: taskKeys.lists() });
    },
  });
};
