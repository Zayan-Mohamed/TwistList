"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useCreateTask, useProjects, useUser } from "@/lib/hooks";
import { toast } from "sonner";
import { Plus, AlertCircle } from "lucide-react";
import { TaskStatus } from "@/types";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

const formSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().optional(),
  status: z.nativeEnum(TaskStatus),
  priority: z.string().optional(),
  tags: z.string().optional(),
  dueDate: z.string().optional(),
  points: z.union([z.number(), z.string(), z.nan()]).optional(),
  projectId: z.number().min(1, "Project is required"),
});

type FormValues = z.infer<typeof formSchema>;

interface CreateTaskDialogProps {
  defaultProjectId?: number;
}

export function CreateTaskDialog({ defaultProjectId }: CreateTaskDialogProps) {
  const [open, setOpen] = useState(false);
  const createTask = useCreateTask();
  const { data: projects, isLoading: isLoadingProjects } = useProjects();
  const { data: user, isLoading: isLoadingUser } = useUser();

  const hasTeam = user?.teamId !== null && user?.teamId !== undefined;
  const isDisabled = !hasTeam || isLoadingUser;

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      description: "",
      status: TaskStatus.PENDING,
      priority: "MEDIUM",
      tags: "",
      points: 0,
      projectId: defaultProjectId || 0,
    },
  });

  const {
    setValue,
    getValues,
    handleSubmit,
    register,
    formState,
    reset,
    watch,
  } = form;

  useEffect(() => {
    if (open) {
      if (defaultProjectId) {
        setValue("projectId", defaultProjectId);
      } else if (
        (!getValues("projectId") || getValues("projectId") === 0) &&
        projects &&
        projects.length > 0
      ) {
        setValue("projectId", projects[0].id);
      }
    }
  }, [open, projects, setValue, getValues, defaultProjectId]);

  const onSubmit = (values: z.infer<typeof formSchema>) => {
    console.log("Form Values:", values); // DEBUG

    // Transform values before sending
    const payload = {
      ...values,
      // Convert empty strings to undefined to avoid validation errors
      description: values.description || undefined,
      tags: values.tags || undefined,
      priority: values.priority || undefined,
      dueDate: values.dueDate
        ? new Date(values.dueDate).toISOString()
        : undefined,
      points: values.points
        ? isNaN(Number(values.points))
          ? undefined
          : Number(values.points)
        : undefined,
    };

    console.log("Payload:", payload); // DEBUG

    createTask.mutate(payload, {
      onSuccess: () => {
        toast.success("Task created successfully");
        setOpen(false);
        reset();
      },
      onError: (error: unknown) => {
        console.error("Mutation Error:", error);
        const err = error as { response?: { data?: { message?: string } } };
        if (err.response?.data?.message) {
          console.error("Server Response Data:", err.response.data);
          toast.error(`Error: ${err.response.data.message}`);
        } else {
          toast.error("Failed to create task");
        }
      },
    });
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(openState) => {
        if (openState && !hasTeam) {
          toast.error("Please join or create a team first to create tasks");
          return;
        }
        setOpen(openState);
      }}
    >
      <DialogTrigger asChild>
        <Button
          disabled={isDisabled}
          className="gap-2 bg-linear-to-r from-blue-600 to-purple-600 text-white hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed"
          title={!hasTeam ? "Join or create a team first" : ""}
        >
          <Plus className="h-4 w-4" />
          New Task
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Create Task</DialogTitle>
          <DialogDescription>
            Add a new task to your list. Click save when you're done.
          </DialogDescription>
        </DialogHeader>
        {!hasTeam && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Team Required</AlertTitle>
            <AlertDescription>
              You must join or create a team before creating tasks. Visit the
              Teams page to get started.
            </AlertDescription>
          </Alert>
        )}
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="title">Title</Label>
            <Input id="title" placeholder="Task title" {...register("title")} />
            {formState.errors.title && (
              <p className="text-sm text-red-500">
                {formState.errors.title.message}
              </p>
            )}
          </div>
          <div className="grid gap-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              placeholder="Task description"
              {...register("description")}
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="project">Project</Label>
            <Select
              onValueChange={(value) => setValue("projectId", parseInt(value))}
              value={watch("projectId")?.toString()}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select project" />
              </SelectTrigger>
              <SelectContent>
                {projects?.map((project) => (
                  <SelectItem key={project.id} value={project.id.toString()}>
                    {project.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {formState.errors.projectId && (
              <p className="text-sm text-red-500">
                {formState.errors.projectId.message}
              </p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label htmlFor="status">Status</Label>
              <Select
                onValueChange={(value) =>
                  setValue("status", value as TaskStatus)
                }
                defaultValue={getValues("status")}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={TaskStatus.PENDING}>Pending</SelectItem>
                  <SelectItem value={TaskStatus.IN_PROGRESS}>
                    In Progress
                  </SelectItem>
                  <SelectItem value={TaskStatus.COMPLETED}>
                    Completed
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="priority">Priority</Label>
              <Select
                onValueChange={(value) => setValue("priority", value)}
                defaultValue={getValues("priority")}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select priority" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="LOW">Low</SelectItem>
                  <SelectItem value="MEDIUM">Medium</SelectItem>
                  <SelectItem value="HIGH">High</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label htmlFor="dueDate">Due Date</Label>
              <Input id="dueDate" type="date" {...register("dueDate")} />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="points">Points</Label>
              <Input
                id="points"
                type="number"
                {...register("points", { valueAsNumber: true })}
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="submit" disabled={createTask.isPending}>
              {createTask.isPending ? "Creating..." : "Create Task"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
