"use client";

import { Task, TaskStatus } from "@/types";
import { Gantt, Task as GanttTask, ViewMode } from "gantt-task-react";
import "gantt-task-react/dist/index.css";
import { useMemo, useState } from "react";
import { useTheme } from "next-themes";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface ProjectGanttProps {
  tasks: Task[];
}

export function ProjectGantt({ tasks }: ProjectGanttProps) {
  const { theme } = useTheme();
  const [viewMode, setViewMode] = useState<ViewMode>(ViewMode.Day);

  const ganttTasks: GanttTask[] = useMemo(() => {
    return tasks.map((task) => {
      // Determine start and end dates
      // Default to today if not set
      const startDate = task.startDate ? new Date(task.startDate) : new Date();
      // Default to start date + 1 day if not set, or today + 1 day
      const endDate = task.dueDate 
        ? new Date(task.dueDate) 
        : new Date(startDate.getTime() + 24 * 60 * 60 * 1000);

      // Ensure end date is after start date
      if (endDate <= startDate) {
        endDate.setDate(startDate.getDate() + 1);
      }

      return {
        start: startDate,
        end: endDate,
        name: task.title,
        id: task.id.toString(),
        type: "task",
        progress: task.status === TaskStatus.COMPLETED ? 100 : task.status === TaskStatus.IN_PROGRESS ? 50 : 0,
        isDisabled: false,
        styles: {
          progressColor: task.status === TaskStatus.COMPLETED ? "#10b981" : "#3b82f6",
          progressSelectedColor: task.status === TaskStatus.COMPLETED ? "#059669" : "#2563eb",
        },
      };
    });
  }, [tasks]);

  if (tasks.length === 0) {
      return (
          <div className="text-center p-12 border-2 border-dashed rounded-xl bg-gray-50/50 dark:bg-gray-900/50">
            <p className="text-muted-foreground">No tasks available for Gantt chart.</p>
          </div>
      );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Select
            value={viewMode}
            onValueChange={(value) => setViewMode(value as ViewMode)}
        >
            <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Select View" />
            </SelectTrigger>
            <SelectContent>
                <SelectItem value={ViewMode.Day}>Day</SelectItem>
                <SelectItem value={ViewMode.Week}>Week</SelectItem>
                <SelectItem value={ViewMode.Month}>Month</SelectItem>
            </SelectContent>
        </Select>
      </div>
      <div className="rounded-xl border bg-white dark:bg-gray-950 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
            <div className="min-w-[800px]">
                <Gantt
                tasks={ganttTasks}
                viewMode={viewMode}
                locale="en"
                barFill={60}
                barCornerRadius={4}
                barProgressColor="#3b82f6"
                barProgressSelectedColor="#2563eb"
                barBackgroundColor={theme === 'dark' ? '#1f2937' : '#e5e7eb'}
                barBackgroundSelectedColor={theme === 'dark' ? '#374151' : '#d1d5db'}
                columnWidth={viewMode === ViewMode.Month ? 300 : 60}
                listCellWidth="155px"
                ganttHeight={500}
                />
            </div>
        </div>
      </div>
    </div>
  );
}
