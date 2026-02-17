import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { tasksApi, projectsApi, teamsApi, authApi } from "./api";
import { Task, Project, Team } from "@/types";
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

export const projectKeys = {
  all: ["projects"] as const,
  lists: () => [...projectKeys.all, "list"] as const,
};

export const teamKeys = {
  all: ["teams"] as const,
  lists: () => [...teamKeys.all, "list"] as const,
};

// Custom Hooks for Tasks
export const useTasks = (filters?: { projectId?: number; status?: string }) => {
  return useQuery({
    queryKey: taskKeys.list(filters || {}),
    queryFn: () => tasksApi.getTasks(filters),
    // enabled: isAuthenticated(), // Removed check because httpOnly cookie is not accessible
    retry: 1,
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
        await queryClient.cancelQueries({ queryKey: taskKeys.all });

        // Snapshot previous value
        const previousTasks = queryClient.getQueryData(taskKeys.list({}));
        const previousTask = queryClient.getQueryData(taskKeys.detail(id));

        // Optimistically update list
        queryClient.setQueriesData(
          { queryKey: taskKeys.lists() },
          (old: unknown) => {
            if (!old || !Array.isArray(old)) return old;
            return old.map((task: Task) =>
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
            queryClient.setQueriesData({ queryKey: taskKeys.lists() }, context.previousTasks);
        }
        if (context?.previousTask) {
          queryClient.setQueryData(taskKeys.detail(id), context.previousTask);
        }
      },
      onSettled: () => {
        // Refetch after mutation
        queryClient.invalidateQueries({ queryKey: taskKeys.lists() });
        queryClient.invalidateQueries({ queryKey: taskKeys.details() });
      },
  });
};

export const useReorderTasks = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (positions: { id: number; position: number }[]) =>
      tasksApi.reorderTasks(positions),
    onMutate: async (newOrder) => {
      // Cancel queries
      await queryClient.cancelQueries({ queryKey: taskKeys.lists() });
      
      // Snapshot
      const previousTasks = queryClient.getQueryData(taskKeys.list({}));

      // Optimistically update
      queryClient.setQueriesData({ queryKey: taskKeys.lists() }, (old: unknown) => {
        if (!old || !Array.isArray(old)) return old;
        
        const tasks = [...old];
        // Create a map for faster lookup
        const orderMap = new Map(newOrder.map(o => [o.id, o.position]));
        
        return tasks.map((t: Task) => {
            if (orderMap.has(t.id)) {
                return { ...t, position: orderMap.get(t.id)! };
            }
            return t;
        }).sort((a, b) => (a.position || 0) - (b.position || 0));
      });

      return { previousTasks };
    },
    onError: (_err, _newOrder, context) => {
      if (context?.previousTasks) {
        queryClient.setQueriesData({ queryKey: taskKeys.lists() }, context.previousTasks);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: taskKeys.lists() });
    },
  });
};

// Custom Hooks for Projects
export const useProjects = () => {
  return useQuery({
    queryKey: projectKeys.lists(),
    queryFn: () => projectsApi.getProjects(),
    retry: 1,
  });
};

export const useCreateProject = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (newProject: Partial<Project> & { teamId?: number }) =>
      projectsApi.createProject(newProject),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: projectKeys.lists() });
    },
  });
};

export const useDeleteProject = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => projectsApi.deleteProject(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: projectKeys.lists() });
    },
  });
};

// Custom Hooks for Teams
export const useTeams = () => {
  return useQuery({
    queryKey: teamKeys.lists(),
    queryFn: () => teamsApi.getTeams(),
    retry: 1,
  });
};

export const useUser = () => {
  return useQuery({
    queryKey: ["user"],
    queryFn: async () => {
       const { user } = await authApi.getCurrentUser();
       return user;
    },
    retry: 1,
  });
};


export const useCreateTeam = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (newTeam: Partial<Team>) => teamsApi.createTeam(newTeam),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: teamKeys.lists() });
    },
  });
};

export const useAddTeamMember = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ teamId, username }: { teamId: number; username: string }) =>
      teamsApi.addMember(teamId, username),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: teamKeys.lists() });
    },
  });
};

export const useLeaveTeam = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => teamsApi.leaveTeam(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: teamKeys.lists() });
    },
  });
};

export const useDeleteTeam = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => teamsApi.deleteTeam(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: teamKeys.lists() });
    },
  });
};

export const useRequestJoinTeam = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (teamId: number) => teamsApi.requestJoin(teamId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: teamKeys.lists() });
    },
  });
};

export const useAcceptJoinRequest = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ teamId, requestId }: { teamId: number; requestId: number }) =>
      teamsApi.acceptRequest(teamId, requestId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: teamKeys.lists() });
    },
  });
};

export const useRejectJoinRequest = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ teamId, requestId }: { teamId: number; requestId: number }) =>
      teamsApi.rejectRequest(teamId, requestId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: teamKeys.lists() });
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
