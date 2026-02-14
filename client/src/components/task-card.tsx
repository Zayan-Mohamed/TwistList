"use client";

import { Task, TaskStatus } from "@/types";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/components/ui/card";
import { motion } from "framer-motion";
import { Calendar, User, Tag, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { useUpdateTask } from "@/lib/hooks";

interface TaskCardProps {
  task: Task;
}

const statusColors: Record<TaskStatus, string> = {
  [TaskStatus.PENDING]: "bg-yellow-500/10 text-yellow-600 border-yellow-500/20",
  [TaskStatus.IN_PROGRESS]: "bg-blue-500/10 text-blue-600 border-blue-500/20",
  [TaskStatus.COMPLETED]: "bg-green-500/10 text-green-600 border-green-500/20",
};

const priorityColors: Record<string, string> = {
  LOW: "text-gray-500",
  MEDIUM: "text-orange-500",
  HIGH: "text-red-500",
};

export function TaskCard({ task }: TaskCardProps) {
  const updateTask = useUpdateTask();

  const handleStatusChange = (newStatus: TaskStatus) => {
    updateTask.mutate({ id: task.id, updates: { status: newStatus } });
  };

  return (
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
          "cursor-pointer",
        )}
      >
        {/* Glassmorphism overlay */}
        <div className="absolute inset-0 bg-linear-to-br from-white/5 to-transparent pointer-events-none" />

        <CardHeader className="pb-3">
          <div className="flex items-start justify-between gap-2">
            <h3 className="font-semibold text-base line-clamp-2 flex-1">
              {task.title}
            </h3>
            {task.priority && (
              <AlertCircle
                className={cn(
                  "w-4 h-4 shrink-0",
                  priorityColors[task.priority] || "text-gray-500",
                )}
              />
            )}
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

        <CardFooter className="pt-0 pb-4">
          <div className="flex gap-1.5 w-full">
            {Object.values(TaskStatus).map((status) => (
              <button
                key={status}
                onClick={() => handleStatusChange(status)}
                disabled={task.status === status}
                className={cn(
                  "flex-1 text-xs py-1.5 rounded-md font-medium transition-all",
                  "border hover:shadow-sm",
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
  );
}
