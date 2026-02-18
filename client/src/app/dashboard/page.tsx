"use client";

import { DashboardLayout } from "@/components/dashboard/dashboard-layout";
import { useTasks, useReorderTasks, useUser } from "@/lib/hooks";
import { TaskCard } from "@/components/task-card";
import { Skeleton } from "@/components/ui/skeleton";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { NotebookText, Search, Users } from "lucide-react";
import Link from "next/link";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  rectSortingStrategy,
} from "@dnd-kit/sortable";
import { Input } from "@/components/ui/input";
import { CreateTaskDialog } from "@/components/create-task-dialog";

export default function DashboardPage() {
  const [mounted, setMounted] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string | "ALL">("ALL");

  const { data: user } = useUser();
  const hasTeam = user?.teamId !== null && user?.teamId !== undefined;

  useEffect(() => {
    // Defer state update to next tick to avoid synchronous setState warning
    const timer = setTimeout(() => setMounted(true), 0);
    return () => clearTimeout(timer);
  }, []);

  const { data: tasks, isLoading, isError } = useTasks();
  const reorderMutation = useReorderTasks();

  const filteredTasks = tasks?.filter((t) => {
    const matchesSearch =
      t.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.description?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus =
      statusFilter === "ALL" ? true : t.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (searchTerm || statusFilter !== "ALL") return;

    if (active.id !== over?.id && tasks) {
      const oldIndex = tasks.findIndex((t) => t.id === active.id);
      const newIndex = tasks.findIndex((t) => t.id === over?.id);

      const newTasks = arrayMove(tasks, oldIndex, newIndex);

      const updates = newTasks.map((t, index) => ({
        id: t.id,
        position: index,
      }));

      reorderMutation.mutate(updates);
    }
  };

  const isDragEnabled = !searchTerm && statusFilter === "ALL";

  if (!mounted) {
    return (
      <DashboardLayout>
        <div className="container mx-auto">
          <div className="mb-8">
            <div className="h-10 w-64 mb-2 animate-pulse rounded-md bg-primary/10" />
            <div className="h-6 w-96 animate-pulse rounded-md bg-primary/10" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 auto-rows-auto">
            {[...Array(8)].map((_, i) => (
              <div
                key={i}
                className="h-64 rounded-xl animate-pulse bg-primary/10"
              />
            ))}
          </div>
        </div>
      </DashboardLayout>
    );
  }

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="container mx-auto">
          <div className="mb-8">
            <Skeleton className="h-10 w-64 mb-2" />
            <Skeleton className="h-6 w-96" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 auto-rows-auto">
            {[...Array(8)].map((_, i) => (
              <Skeleton key={i} className="h-64 rounded-xl" />
            ))}
          </div>
        </div>
      </DashboardLayout>
    );
  }

  if (isError) {
    return (
      <DashboardLayout>
        <div className="min-h-[80vh] flex flex-col items-center justify-center">
          <div className="text-center p-8 bg-white/50 dark:bg-black/50 backdrop-blur-md rounded-2xl shadow-xl border border-red-200 dark:border-red-900/50">
            <div className="inline-flex items-center justify-center h-16 w-16 rounded-full bg-red-100 text-red-600 mb-6 animate-pulse">
              <span className="text-3xl">⚠️</span>
            </div>
            <h2 className="text-2xl font-bold text-red-600 mb-2">
              Failed to load tasks
            </h2>
            <p className="text-muted-foreground mb-6">
              Please try refreshing the page or check your connection.
            </p>
            <button
              onClick={() => window.location.reload()}
              className="px-6 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
            >
              Refresh
            </button>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="container mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <h1 className="text-4xl font-bold bg-linear-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2">
              TwistList Dashboard
            </h1>
            <p className="text-muted-foreground text-lg">
              Manage your tasks with style and efficiency
            </p>
          </motion.div>

          <CreateTaskDialog />
        </div>

        {/* Stats Cards */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8"
        >
          <div className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm border border-gray-100 dark:border-gray-800 rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow">
            <div className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2 uppercase tracking-wide">
              Total Tasks
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-4xl font-bold text-gray-900 dark:text-gray-100">
                {tasks?.length || 0}
              </span>
              <span className="text-sm text-green-500 font-medium">
                +2 this week
              </span>
            </div>
          </div>
          <div className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm border border-gray-100 dark:border-gray-800 rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow">
            <div className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2 uppercase tracking-wide">
              In Progress
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-4xl font-bold text-blue-600">
                {tasks?.filter((t) => t.status === "IN_PROGRESS").length || 0}
              </span>
              <span className="text-sm text-blue-500 font-medium">Active</span>
            </div>
          </div>
          <div className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm border border-gray-100 dark:border-gray-800 rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow">
            <div className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2 uppercase tracking-wide">
              Completed
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-4xl font-bold text-green-600">
                {tasks?.filter((t) => t.status === "COMPLETED").length || 0}
              </span>
              <span className="text-sm text-green-500 font-medium">
                Finished
              </span>
            </div>
          </div>
        </motion.div>

        {/* Search and Filters */}
        <div className="flex flex-col md:flex-row gap-4 mb-8 bg-white/50 dark:bg-black/50 p-4 rounded-xl backdrop-blur-sm border border-gray-100 dark:border-gray-800">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search tasks..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9 bg-white dark:bg-black/50"
            />
          </div>
          <select
            className="px-4 py-2 rounded-lg border bg-white dark:bg-black/50 text-sm focus:ring-2 focus:ring-primary/20 outline-hidden"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="ALL">All Status</option>
            <option value="PENDING">Pending</option>
            <option value="IN_PROGRESS">In Progress</option>
            <option value="COMPLETED">Completed</option>
          </select>
        </div>

        {/* Bento Grid / Masonry Layout */}
        {filteredTasks && filteredTasks.length > 0 ? (
          isDragEnabled ? (
            <DndContext
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragEnd={handleDragEnd}
            >
              <SortableContext
                items={filteredTasks.map((t) => t.id)}
                strategy={rectSortingStrategy}
              >
                <div
                  className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 auto-rows-auto"
                  style={{
                    gridAutoFlow: "dense",
                  }}
                >
                  {filteredTasks.map((task) => (
                    <TaskCard key={task.id} task={task} />
                  ))}
                </div>
              </SortableContext>
            </DndContext>
          ) : (
            <div
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 auto-rows-auto"
              style={{
                gridAutoFlow: "dense",
              }}
            >
              {filteredTasks.map((task) => (
                <TaskCard key={task.id} task={task} />
              ))}
            </div>
          )
        ) : (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
            className="flex items-center justify-center py-20 bg-white/30 dark:bg-black/30 rounded-3xl border border-dashed border-gray-300 dark:border-gray-700"
          >
            <div className="text-center max-w-md p-6">
              {!hasTeam ? (
                <>
                  <div className="mb-6 relative inline-block">
                    <div className="text-8xl mb-2 animate-bounce">
                      <Users className="w-20 h-20 text-blue-500"></Users>
                    </div>
                    <div className="absolute inset-0 blur-3xl opacity-30 bg-linear-to-r from-blue-400 to-purple-400 rounded-full"></div>
                  </div>
                  <h3 className="text-3xl font-bold mb-2 bg-linear-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                    Join a Team First
                  </h3>
                  <p className="text-muted-foreground text-lg mb-8">
                    You need to be part of a team to create and manage tasks.
                    Join an existing team or create your own to get started!
                  </p>
                  <div className="flex flex-col sm:flex-row gap-4 justify-center">
                    <Link href="/teams">
                      <button className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:opacity-90 transition-opacity font-medium flex items-center gap-2">
                        <Users className="w-4 h-4" />
                        Go to Teams
                      </button>
                    </Link>
                  </div>
                </>
              ) : (
                <>
                  <div className="mb-6 relative inline-block">
                    <div className="text-8xl mb-2 animate-bounce">
                      <NotebookText className="w-20 h-20"></NotebookText>
                    </div>
                    <div className="absolute inset-0 blur-3xl opacity-30 bg-linear-to-r from-blue-400 to-purple-400 rounded-full"></div>
                  </div>
                  <h3 className="text-3xl font-bold mb-2 bg-linear-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                    No tasks yet
                  </h3>
                  <p className="text-muted-foreground text-lg mb-8">
                    Start organizing your work by creating your first task.
                    Track progress, set priorities, and get things done!
                  </p>
                  <div className="flex flex-col sm:flex-row gap-4 justify-center">
                    <CreateTaskDialog />
                  </div>
                </>
              )}
            </div>
          </motion.div>
        )}
      </div>
    </DashboardLayout>
  );
}
