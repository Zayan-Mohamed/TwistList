"use client";

import { useState } from "react";
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
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useCreateProject, useUser } from "@/lib/hooks";
import { toast } from "sonner";
import { Plus, AlertCircle } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

const formSchema = z.object({
  name: z.string().min(1, "Name is required"),
  description: z.string().optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

export function CreateProjectDialog() {
  const [open, setOpen] = useState(false);
  const createProject = useCreateProject();
  const { data: user, isLoading: isLoadingUser } = useUser();

  const hasTeam = user?.teamId !== null && user?.teamId !== undefined;
  const isDisabled = !hasTeam || isLoadingUser;

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      description: "",
      startDate: "",
      endDate: "",
    },
  });

  const onSubmit = (values: z.infer<typeof formSchema>) => {
    // Ensure we handle date strings correctly or pass undefined
    const payload = {
      name: values.name,
      description: values.description || undefined,
      startDate: values.startDate
        ? new Date(values.startDate).toISOString()
        : undefined,
      endDate: values.endDate
        ? new Date(values.endDate).toISOString()
        : undefined,
      // Backend DTO allows these to be optional
    };

    console.log("Create Project Payload:", payload);

    createProject.mutate(payload, {
      onSuccess: () => {
        toast.success("Project created successfully");
        setOpen(false);
        form.reset();
      },
      onError: (error) => {
        console.error("Mutation Error:", error);
        toast.error("Failed to create project");
      },
    });
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(openState) => {
        if (openState && !hasTeam) {
          toast.error("Please join or create a team first to create projects");
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
          New Project
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Create Project</DialogTitle>
          <DialogDescription>
            Create a new project to organize your tasks.
          </DialogDescription>
        </DialogHeader>
        {!hasTeam && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Team Required</AlertTitle>
            <AlertDescription>
              You must join or create a team before creating projects. Visit the
              Teams page to get started.
            </AlertDescription>
          </Alert>
        )}
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="name">Name</Label>
            <Input
              id="name"
              placeholder="Project Name"
              {...form.register("name")}
            />
            {form.formState.errors.name && (
              <p className="text-sm text-red-500">
                {form.formState.errors.name.message}
              </p>
            )}
          </div>
          <div className="grid gap-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              placeholder="Project Description"
              {...form.register("description")}
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label htmlFor="startDate">Start Date</Label>
              <Input
                id="startDate"
                type="date"
                {...form.register("startDate")}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="endDate">End Date</Label>
              <Input id="endDate" type="date" {...form.register("endDate")} />
            </div>
          </div>
          <DialogFooter>
            <Button type="submit" disabled={createProject.isPending}>
              {createProject.isPending ? "Creating..." : "Create Project"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
