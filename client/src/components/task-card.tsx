"use client";

import { Task, TaskStatus } from "@/types";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/components/ui/card";
import { motion } from "framer-motion";
import { Calendar, User, Tag, AlertCircle, Trash2 } from "lucide-react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { cn } from "@/lib/utils";
import { EditTaskDialog } from "@/components/edit-task-dialog";
import { useUpdateTask, useDeleteTask } from "@/lib/hooks";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

interface TaskCardProps {
  task: Task;
}
// ... existing colors ...
const priorityColors: Record<string, string> = {
  LOW: "text-gray-500",
  MEDIUM: "text-orange-500",
  HIGH: "text-red-500",
};

const statusColors: Record<string, string> = {
  PENDING: "bg-yellow-500/10 text-yellow-600 border-yellow-500/20",
  IN_PROGRESS: "bg-blue-500/10 text-blue-600 border-blue-500/20",
  COMPLETED: "bg-green-500/10 text-green-600 border-green-500/20",
};

export function TaskCard({ task }: TaskCardProps) {
  const updateTask = useUpdateTask();
  const deleteTask = useDeleteTask();

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: task.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const handleStatusChange = (newStatus: TaskStatus, e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent drag start
    updateTask.mutate({ id: task.id, updates: { status: newStatus } });
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm("Are you sure you want to delete this task?")) {
      deleteTask.mutate(task.id, {
        onSuccess: () => toast.success("Task deleted successfully"),
        onError: () => toast.error("Failed to delete task"),
      });
    }
  };

  return (
    <div ref={setNodeRef} style={style} {...attributes} {...listeners}>
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.9 }}
      whileHover={{ y: -4 }}
      transition={{ duration: 0.2 }}
      className="group"
    >
      <Card
        className={cn(
          "relative overflow-hidden border transition-all duration-300",
          "bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm",
          "hover:shadow-lg hover:border-primary/40",
          "cursor-grab active:cursor-grabbing",
        )}
      >
        {/* Glassmorphism overlay */}
        <div className="absolute inset-0 bg-linear-to-br from-white/5 to-transparent pointer-events-none" />

        <CardHeader className="pb-3 relative">
          <div className="flex items-start justify-between gap-2 pr-6">
            <h3 className="font-semibold text-base line-clamp-2 flex-1">
              {task.title}
            </h3>
            {task.priority && (
              <AlertCircle
                className={cn(
                  "w-4 h-4 shrink-0 mt-1",
                  priorityColors[task.priority] || "text-gray-500",
                )}
              />
            )}
          </div>
          <div 
            className="absolute top-3 right-3 flex items-center gap-1"
            onPointerDown={(e) => e.stopPropagation()}
            onClick={(e) => e.stopPropagation()}
          >
            <EditTaskDialog task={task} />
            <Button 
                variant="ghost" 
                size="icon" 
                className="h-6 w-6 text-muted-foreground hover:text-red-500 hover:bg-red-500/10"
                onClick={handleDelete}
            >
                <Trash2 className="h-3 w-3" />
            </Button>
          </div>
        </CardHeader>

        <CardContent className="space-y-3">
          {/* Description */}
          {task.description && (
            <p className="text-sm text-muted-foreground line-clamp-2">
              {task.description}
            </p>
          )}

          {/* Status Badge */}
          <div className="flex flex-wrap gap-2">
            <span
              className={cn(
                "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border",
                statusColors[task.status || TaskStatus.PENDING],
              )}
            >
              {task.status || TaskStatus.PENDING}
            </span>
            {task.tags && (
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-500/10 text-purple-600 border border-purple-500/20">
                <Tag className="w-3 h-3" />
                {task.tags}
              </span>
            )}
          </div>

          {/* Metadata */}
          <div className="flex flex-col gap-1.5 text-xs text-muted-foreground">
            {task.dueDate && (
              <div className="flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5" />
                <span>Due: {new Date(task.dueDate).toLocaleDateString()}</span>
              </div>
            )}
            {task.assignee && (
              <div className="flex items-center gap-1.5">
                <User className="w-3.5 h-3.5" />
                <span>{task.assignee.username}</span>
              </div>
            )}
          </div>
        </CardContent>

        <CardFooter className="pt-0 pb-4 relative z-10">
          <div className="flex gap-1.5 w-full" onPointerDown={(e) => e.stopPropagation()}>
            {Object.values(TaskStatus).map((status) => (
              <button
                key={status}
                onClick={(e) => handleStatusChange(status, e)}
                disabled={task.status === status}
                type="button"
                className={cn(
                  "flex-1 text-xs py-1.5 rounded-md font-medium transition-all",
                  "border hover:shadow-sm cursor-pointer z-20 relative",
                  task.status === status
                    ? statusColors[status]
                    : "bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 border-transparent",
                )}
              >
                {status === TaskStatus.PENDING && "Pending"}
                {status === TaskStatus.IN_PROGRESS && "In Progress"}
                {status === TaskStatus.COMPLETED && "Done"}
              </button>
            ))}
          </div>
        </CardFooter>

        {/* Hover effect */}
        <div className="absolute inset-0 border-2 border-primary/0 group-hover:border-primary/20 rounded-xl transition-colors pointer-events-none" />
      </Card>
    </motion.div>
    </div>
  );
}
