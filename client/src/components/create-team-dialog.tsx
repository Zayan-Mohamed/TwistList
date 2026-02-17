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
import { useCreateTeam } from "@/lib/hooks";
import { toast } from "sonner";
import { Plus } from "lucide-react";

const formSchema = z.object({
  teamName: z.string().min(1, "Team Name is required"),
});

type FormValues = z.infer<typeof formSchema>;

export function CreateTeamDialog() {
  const [open, setOpen] = useState(false);
  const createTeam = useCreateTeam();

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      teamName: "",
    },
  });

  const onSubmit = (values: z.infer<typeof formSchema>) => {
    // Description is not part of CreateTeamDto on backend
    const payload = {
      teamName: values.teamName,
    };

    createTeam.mutate(payload, {
      onSuccess: () => {
        toast.success("Team created successfully");
        setOpen(false);
        form.reset();
      },
      onError: (error) => {
        console.error("Mutation Error:", error);
        toast.error("Failed to create team");
      },
    });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="gap-2 bg-linear-to-r from-blue-600 to-purple-600 text-white hover:opacity-90">
          <Plus className="h-4 w-4" />
          New Team
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Create Team</DialogTitle>
          <DialogDescription>
            Create a new team to collaborate with others.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="teamName">Team Name</Label>
            <Input
              id="teamName"
              placeholder="Team Name"
              {...form.register("teamName")}
            />
            {form.formState.errors.teamName && (
              <p className="text-sm text-red-500">
                {form.formState.errors.teamName.message}
              </p>
            )}
          </div>
          <DialogFooter>
            <Button type="submit" disabled={createTeam.isPending}>
              {createTeam.isPending ? "Creating..." : "Create Team"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
