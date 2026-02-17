"use client";

import { DashboardLayout } from "@/components/dashboard/dashboard-layout";
import { useTasks, useUpdateTask } from "@/lib/hooks";
import { Task, TaskStatus } from "@/types";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  LayoutGrid,
  List as ListIcon,
  Calendar as CalendarIcon,
  Plus,
  Search,
  Filter,
} from "lucide-react";
import { CreateTaskDialog } from "@/components/create-task-dialog";
import { TaskCard } from "@/components/task-card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  DndContext,
  DragOverlay,
  closestCorners,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragStartEvent,
  DragOverEvent,
  DragEndEvent,
  defaultDropAnimationSideEffects,
  DropAnimation,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { motion, AnimatePresence } from "framer-motion";

type ViewType = "list" | "board" | "timeline";

export default function TasksPage() {
  const [view, setView] = useState<ViewType>("list");
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string | "ALL">("ALL");
  const [activeId, setActiveId] = useState<number | null>(null);

  const { data: tasks, isLoading } = useTasks();
  const updateTask = useUpdateTask();

  const filteredTasks = tasks?.filter((t) => {
    const matchesSearch =
      t.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.description?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus =
      statusFilter === "ALL" ? true : t.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  // DnD Sensors
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

  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event;
    setActiveId(active.id as number);
  };

  const handleDragOver = (event: DragOverEvent) => {
    const { active, over } = event;
    if (!over) return;

    const activeId = active.id;
    const overId = over.id;

    if (activeId === overId) return;

    // Check if dragging over a column
    const isActiveTask = active.data.current?.type === "Task";
    const isOverColumn = over.data.current?.type === "Column";

    if (isActiveTask && isOverColumn) {
        // Find task
        const task = tasks?.find((t) => t.id === activeId);
        if (task && task.status !== overId) {
             updateTask.mutate({
                id: task.id,
                updates: { status: overId as TaskStatus },
             });
        }
    }
  };

  const handleDragEnd = (event: DragEndEvent) => {
    setActiveId(null);
    const { active, over } = event;
    if (!over) return;

    const activeId = active.id as number;
    const overId = over.id;
    if (Object.values(TaskStatus).includes(overId as TaskStatus)) {
         const task = tasks?.find((t) => t.id === activeId);
         if (task && task.status !== overId) {
             updateTask.mutate({
                id: task.id,
                updates: { status: overId as TaskStatus },
             });
         }
         return;
    }
  };


  const dropAnimation: DropAnimation = {
    sideEffects: defaultDropAnimationSideEffects({
      styles: {
        active: {
          opacity: "0.5",
        },
      },
    }),
  };

  return (
    <DashboardLayout>
      <div className="container mx-auto h-full flex flex-col">
        {/* Header */}
        <div className="flex flex-col gap-6 mb-8">
          <div className="flex items-center justify-between">
            <h1 className="text-3xl font-bold">My Tasks</h1>
            <CreateTaskDialog />
          </div>

          <div className="flex flex-col md:flex-row gap-4 items-center justify-between bg-white/50 dark:bg-black/50 p-2 rounded-xl border border-gray-100 dark:border-gray-800 backdrop-blur-sm">
            {/* View Switcher */}
            <div className="flex bg-gray-100 dark:bg-gray-800 p-1 rounded-lg">
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
                variant={view === "board" ? "default" : "ghost"}
                size="sm"
                onClick={() => setView("board")}
                className="gap-2"
              >
                <LayoutGrid className="h-4 w-4" />
                Board
              </Button>
              <Button
                variant={view === "timeline" ? "default" : "ghost"}
                size="sm"
                onClick={() => setView("timeline")}
                className="gap-2"
              >
                <CalendarIcon className="h-4 w-4" />
                Timeline
              </Button>
            </div>

            {/* Filters */}
            <div className="flex flex-1 w-full md:w-auto gap-2 items-center">
              <div className="relative flex-1 md:max-w-xs">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
                <Input
                  placeholder="Search tasks..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9 bg-transparent border-none shadow-none focus-visible:ring-0"
                />
              </div>
              <div className="h-6 w-px bg-gray-200 dark:bg-gray-700 mx-2" />
              <Select
                value={statusFilter}
                onValueChange={setStatusFilter}
              >
                <SelectTrigger className="w-[140px] border-none shadow-none bg-transparent focus:ring-0">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Filter className="h-4 w-4" />
                    <SelectValue placeholder="Status" />
                  </div>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">All Status</SelectItem>
                  <SelectItem value="PENDING">Pending</SelectItem>
                  <SelectItem value="IN_PROGRESS">In Progress</SelectItem>
                  <SelectItem value="COMPLETED">Completed</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 min-h-0">
          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-96 rounded-xl" />
              ))}
            </div>
          ) : (
            <DndContext
              sensors={sensors}
              collisionDetection={closestCorners}
              onDragStart={handleDragStart}
              onDragOver={handleDragOver}
              onDragEnd={handleDragEnd}
            >
              <AnimatePresence mode="wait">
                {view === "list" && (
                  <ListView key="list" tasks={filteredTasks || []} />
                )}
                {view === "board" && (
                  <BoardView key="board" tasks={filteredTasks || []} />
                )}
                {view === "timeline" && (
                  <TimelineView key="timeline" tasks={filteredTasks || []} />
                )}
              </AnimatePresence>

              <DragOverlay dropAnimation={dropAnimation}>
                {activeId ? (
                   <div className="opacity-80 rotate-2 scale-105 cursor-grabbing">
                        <TaskCard task={tasks?.find((t) => t.id === activeId)!} />
                   </div>
                ) : null}
              </DragOverlay>
            </DndContext>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}

function ListView({ tasks }: { tasks: Task[] }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className="space-y-4 max-w-4xl mx-auto"
    >
      {tasks.length === 0 ? (
        <EmptyState />
      ) : (
        tasks.map((task) => (
            // Reusing TaskCard but simplified layout could be better
            <div key={task.id} className="flex items-center gap-4 p-4 bg-white/50 dark:bg-black/50 backdrop-blur-sm border border-gray-100 dark:border-gray-800 rounded-xl hover:shadow-md transition-all">
                <div className={`w-3 h-3 rounded-full shrink-0 ${
                    task.status === "COMPLETED" ? "bg-green-500" : 
                    task.status === "IN_PROGRESS" ? "bg-blue-500" : "bg-yellow-500"
                }`} />
                <div className="flex-1 min-w-0">
                    <h3 className="font-medium truncate">{task.title}</h3>
                    <p className="text-sm text-muted-foreground truncate">{task.description || "No description"}</p>
                </div>
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <span>{task.dueDate ? new Date(task.dueDate).toLocaleDateString() : "-"}</span>
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium border ${
                         task.priority === "HIGH" ? "bg-red-50 text-red-600 border-red-100" :
                         task.priority === "MEDIUM" ? "bg-orange-50 text-orange-600 border-orange-100" :
                         "bg-gray-50 text-gray-600 border-gray-100"
                    }`}>
                        {task.priority || "NORMAL"}
                    </span>
                </div>
            </div>
        ))
      )}
    </motion.div>
  );
}

function BoardView({ tasks }: { tasks: Task[] }) {
  const columns = [
    { id: TaskStatus.PENDING, title: "To Do", color: "bg-yellow-500" },
    { id: TaskStatus.IN_PROGRESS, title: "In Progress", color: "bg-blue-500" },
    { id: TaskStatus.COMPLETED, title: "Done", color: "bg-green-500" },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.98 }}
      className="flex h-full gap-6 overflow-x-auto pb-4"
    >
      {columns.map((col) => (
        <BoardColumn key={col.id} column={col} tasks={tasks.filter(t => t.status === col.id)} />
      ))}
    </motion.div>
  );
}

function BoardColumn({ column, tasks }: { column: any, tasks: Task[] }) {
    const { setNodeRef } = useSortable({
        id: column.id,
        data: {
            type: "Column",
            column,
        },
    });

    return (
        <div ref={setNodeRef} className="flex-1 min-w-[300px] flex flex-col bg-gray-50/50 dark:bg-gray-900/50 rounded-2xl border border-gray-200 dark:border-gray-800 h-full">
            <div className="p-4 flex items-center justify-between sticky top-0 bg-inherit backdrop-blur-xl rounded-t-2xl z-10">
                <div className="flex items-center gap-2">
                    <div className={`w-3 h-3 rounded-full ${column.color}`} />
                    <h3 className="font-semibold text-sm uppercase tracking-wide">{column.title}</h3>
                    <span className="bg-gray-200 dark:bg-gray-800 px-2 py-0.5 rounded-full text-xs font-medium">
                        {tasks.length}
                    </span>
                </div>
                <Button variant="ghost" size="icon" className="h-6 w-6">
                    <Plus className="h-4 w-4" />
                </Button>
            </div>
            
            <div className="p-3 flex-1 overflow-y-auto space-y-3">
                <SortableContext items={tasks.map(t => t.id)} strategy={verticalListSortingStrategy}>
                    {tasks.map(task => (
                        <TaskCard key={task.id} task={task} />
                    ))}
                </SortableContext>
                {tasks.length === 0 && (
                    <div className="h-24 border-2 border-dashed border-gray-200 dark:border-gray-800 rounded-xl flex items-center justify-center text-muted-foreground text-sm">
                        Drop items here
                    </div>
                )}
            </div>
        </div>
    );
}

function TimelineView({ tasks }: { tasks: Task[] }) {
    // Group tasks by due date
    const grouped = tasks.reduce((acc, task) => {
        const date = task.dueDate ? new Date(task.dueDate).toDateString() : "No Date";
        if (!acc[date]) {
            acc[date] = [];
        }
        acc[date].push(task);
        return acc;
    }, {} as Record<string, Task[]>);

    const sortedDates = Object.keys(grouped).sort((a, b) => {
        if (a === "No Date") return 1;
        if (b === "No Date") return -1;
        return new Date(a).getTime() - new Date(b).getTime();
    });

    return (
        <div className="relative border-l border-gray-200 dark:border-gray-800 ml-4 md:ml-8 space-y-8 pb-12">
            {sortedDates.length === 0 ? (
                <EmptyState />
            ) : (
                sortedDates.map((date) => (
                    <div key={date} className="relative pl-8">
                        {/* Timeline Dot */}
                        <div className="absolute -left-1.5 top-1 h-3 w-3 rounded-full border border-white bg-blue-500 ring-4 ring-white dark:border-gray-900 dark:bg-blue-400 dark:ring-gray-900" />
                        
                        {/* Date Header */}
                        <div className="mb-4 flex items-center gap-2">
                             <h3 className="text-lg font-semibold leading-none">
                                {date === "No Date" ? "Unscheduled" : new Date(date).toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' })}
                             </h3>
                             {date !== "No Date" && (
                                <span className="text-xs text-muted-foreground uppercase tracking-wider font-medium">
                                    {new Date(date).getFullYear()}
                                </span>
                             )}
                        </div>

                        {/* Tasks Group */}
                        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                            {grouped[date].map((task) => (
                                <TaskCard key={task.id} task={task} />
                            ))}
                        </div>
                    </div>
                ))
            )}
        </div>
    );
}

function EmptyState() {
    return (
        <div className="text-center py-20">
            <h3 className="text-lg font-medium text-muted-foreground">No tasks found</h3>
            <p className="text-sm text-gray-500">Create a new task to get started</p>
        </div>
    );
}
