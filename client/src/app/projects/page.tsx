"use client";

import { useProjects, useDeleteProject } from "@/lib/hooks";
import { CreateProjectDialog } from "@/components/create-project-dialog";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Briefcase, Calendar, Trash2 } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";
import { DashboardLayout } from "@/components/dashboard/dashboard-layout";

export default function ProjectsPage() {
  const { data: projects, isLoading } = useProjects();
  const deleteProject = useDeleteProject();

  const handleDelete = (e: React.MouseEvent, id: number) => {
    e.preventDefault();
    e.stopPropagation();
    if (confirm("Are you sure you want to delete this project?")) {
      deleteProject.mutate(id, {
        onSuccess: () => toast.success("Project deleted successfully"),
        onError: () => toast.error("Failed to delete project"),
      });
    }
  };

  return (
    <DashboardLayout>
      <div className="container mx-auto p-6 space-y-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Projects</h1>
            <p className="text-muted-foreground mt-2">
              Create and manage your projects.
            </p>
          </div>
          <CreateProjectDialog />
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-48 rounded-xl" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {projects && projects.length > 0 ? (
              projects.map((project) => (
                <div key={project.id} className="group relative">
                <Link href={`/projects/${project.id}`} className="block h-full">
                  <Card className="hover:shadow-lg transition-all cursor-pointer h-full border-l-4 border-l-blue-500 hover:border-l-blue-600 dark:hover:border-l-blue-400">
                    <CardHeader>
                      <div className="flex items-start justify-between">
                          <CardTitle className="flex items-center gap-2 text-xl">
                          <Briefcase className="h-5 w-5 text-blue-500" />
                          {project.name}
                          </CardTitle>
                      </div>
                      {project.description && (
                        <CardDescription className="line-clamp-2 mt-2">
                          {project.description}
                        </CardDescription>
                      )}
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground mt-auto">
                          <Calendar className="h-4 w-4" />
                          {project.startDate && new Date(project.startDate).toLocaleDateString()} 
                          {project.endDate && ` - ${new Date(project.endDate).toLocaleDateString()}`}
                      </div>
                    </CardContent>
                  </Card>
                </Link>
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-100 hover:text-red-500"
                  onClick={(e) => handleDelete(e, project.id)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
                </div>
              ))
            ) : (
              <div className="col-span-full flex flex-col items-center justify-center p-12 text-center border-2 border-dashed rounded-xl bg-gray-50/50 dark:bg-gray-900/50">
                <Briefcase className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold">No projects found</h3>
                <p className="text-muted-foreground mb-6">
                  Get started by creating your first project.
                </p>
                <CreateProjectDialog />
              </div>
            )}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
