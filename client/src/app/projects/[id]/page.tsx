"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useParams } from "next/navigation";
import { tasksApi, projectsApi } from "@/lib/api";
import { CreateTaskDialog } from "@/components/create-task-dialog";
import { TaskCard } from "@/components/task-card";
import { EditTaskDialog } from "@/components/edit-task-dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { Calendar, AlertCircle, LayoutGrid, GanttChartIcon, ListIcon, Trash2 } from "lucide-react";
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors, DragEndEvent } from "@dnd-kit/core";
import { SortableContext, sortableKeyboardCoordinates, rectSortingStrategy } from "@dnd-kit/sortable";
import { Task } from "@/types";
import { Button } from "@/components/ui/button";
import { useDeleteTask } from "@/lib/hooks";
import { toast } from "sonner";

import { DashboardLayout } from "@/components/dashboard/dashboard-layout";
import { ProjectGantt } from "@/components/project-gantt";

export default function ProjectDetailsPage() {
  const params = useParams();
  const id = Number(params.id);
  const [view, setView] = useState<"board" | "gantt" | "list">("board");
  const deleteTask = useDeleteTask();

  const { data: project, isLoading: isLoadingProject } = useQuery({
    queryKey: ["projects", id],
    queryFn: () => projectsApi.getProject(id),
    enabled: !!id,
  });

  const { data: tasks, isLoading: isLoadingTasks } = useQuery({
    queryKey: ["tasks", { projectId: id }],
    queryFn: () => tasksApi.getTasks({ projectId: id }),
    enabled: !!id,
  });

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    console.log("Drag end", event);
  };
  
  const handleDeleteTask = (taskId: number) => {
    if (confirm("Are you sure you want to delete this task?")) {
      deleteTask.mutate(taskId, {
        onSuccess: () => toast.success("Task deleted successfully"),
        onError: () => toast.error("Failed to delete task"),
      });
    }
  };

  if (isLoadingProject || isLoadingTasks) {
    return (
      <DashboardLayout>
        <div className="container mx-auto p-6 space-y-6">
          <Skeleton className="h-32 w-full rounded-xl" />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <Skeleton className="h-40 rounded-xl" />
            <Skeleton className="h-40 rounded-xl" />
            <Skeleton className="h-40 rounded-xl" />
          </div>
        </div>
      </DashboardLayout>
    );
  }

  if (!project) {
    return (
      <DashboardLayout>
        <div className="container mx-auto p-6 text-center">
          <h1 className="text-2xl font-bold">Project not found</h1>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="container mx-auto p-6 space-y-8">
        {/* Project Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">{project.name}</h1>
            {project.description && (
              <p className="text-muted-foreground mt-2 max-w-2xl">
                {project.description}
              </p>
            )}
            <div className="flex items-center gap-4 mt-4 text-sm text-muted-foreground">
               {project.startDate && (
                  <div className="flex items-center gap-1.5">
                      <Calendar className="h-4 w-4" />
                      <span>Start: {new Date(project.startDate).toLocaleDateString()}</span>
                  </div>
               )}
               {project.endDate && (
                  <div className="flex items-center gap-1.5">
                      <Calendar className="h-4 w-4" />
                      <span>End: {new Date(project.endDate).toLocaleDateString()}</span>
                  </div>
               )}
            </div>
          </div>
          <CreateTaskDialog defaultProjectId={project.id} />
        </div>

        {/* View Switcher */}
        <div className="flex items-center gap-2 border-b pb-4">
          <Button
            variant={view === "board" ? "default" : "ghost"}
            size="sm"
            onClick={() => setView("board")}
            className="gap-2"
          >
            <LayoutGrid className="h-4 w-4" />
            Board
          </Button>
          <Button
            variant={view === "list" ? "default" : "ghost"}
            size="sm"
            onClick={() => setView("list")}
            className="gap-2"
          >
            <ListIcon className="h-4 w-4" />
            List
          </Button>
          <Button
            variant={view === "gantt" ? "default" : "ghost"}
            size="sm"
            onClick={() => setView("gantt")}
            className="gap-2"
          >
            <GanttChartIcon className="h-4 w-4" />
            Gantt
          </Button>
        </div>

        {/* Tasks List */}
        <div className="space-y-4">
          {tasks && tasks.length > 0 ? (
             view === "gantt" ? (
                <ProjectGantt tasks={tasks} />
             ) : view === "list" ? (
               <div className="space-y-2">
                 {tasks.map((task) => (
                   <div key={task.id} className="flex items-center justify-between p-4 border rounded-lg bg-card hover:bg-accent/50 transition-colors">
                     <div className="flex items-center gap-4 flex-1">
                       <div className={`w-3 h-3 rounded-full shrink-0 ${
                         task.priority === 'HIGH' ? 'bg-red-500' : 
                         task.priority === 'MEDIUM' ? 'bg-orange-500' : 
                         task.priority === 'LOW' ? 'bg-blue-500' : 'bg-green-500'
                       }`} />
                       <div className="flex flex-col">
                           <span className="font-medium">{task.title}</span>
                           <span className="text-xs text-muted-foreground line-clamp-1">{task.description}</span>
                       </div>
                     </div>
                     
                     <div className="flex items-center gap-6 text-sm text-muted-foreground">
                       <span className="capitalize px-2.5 py-0.5 rounded-full bg-secondary text-secondary-foreground text-xs font-medium min-w-[80px] text-center">
                         {task.status?.replace('_', ' ').toLowerCase()}
                       </span>
                       
                       <div className="flex items-center gap-2 min-w-[100px]">
                           {task.dueDate && (
                             <>
                                <Calendar className="h-3.5 w-3.5" />
                                <span>{new Date(task.dueDate).toLocaleDateString()}</span>
                             </>
                           )}
                       </div>

                       <div className="flex items-center gap-1">
                          <EditTaskDialog task={task} />
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="h-8 w-8 text-muted-foreground hover:text-red-500 hover:bg-red-500/10"
                            onClick={() => handleDeleteTask(task.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                       </div>
                     </div>
                   </div>
                 ))}
               </div>
             ) : (
              <>
              <h2 className="text-xl font-semibold flex items-center gap-2 mb-4">
                  <AlertCircle className="h-5 w-5" />
                  Project Tasks
              </h2>
              <DndContext
                sensors={sensors}
                collisionDetection={closestCenter}
                onDragEnd={handleDragEnd}
              >
                <SortableContext
                  items={tasks.map((t) => t.id)}
                  strategy={rectSortingStrategy}
                >
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {tasks.map((task) => (
                      <TaskCard key={task.id} task={task} />
                    ))}
                  </div>
                </SortableContext>
              </DndContext>
              </>
             )
          ) : (
              <div className="text-center p-12 border-2 border-dashed rounded-xl bg-gray-50/50 dark:bg-gray-900/50">
                  <p className="text-muted-foreground">No tasks in this project yet.</p>
                  <div className="mt-4">
                      <CreateTaskDialog defaultProjectId={project.id} />
                  </div>
              </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
