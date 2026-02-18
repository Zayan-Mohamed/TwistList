"use client";

import { useState, useEffect, useRef } from "react";
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
import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import { apiClient, authApi } from "@/lib/api";
import { toast } from "sonner";
import { UserPlus, Search, User as UserIcon } from "lucide-react";
import { User } from "@/types";

const formSchema = z.object({
  usernameOrEmail: z.string().min(1, "Username or email is required"),
});

type FormValues = z.infer<typeof formSchema>;

export function AddMemberDialog({ teamId }: { teamId: number }) {
  const [open, setOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const queryClient = useQueryClient();

  const addMember = useMutation({
    mutationFn: async (usernameOrEmail: string) => {
      const { data } = await apiClient.post(`/teams/${teamId}/members`, {
        usernameOrEmail,
      });
      return data;
    },
    onSuccess: () => {
      toast.success("Member added successfully");
      setOpen(false);
      setSearchQuery("");
      queryClient.invalidateQueries({ queryKey: ["teams"] });
      form.reset();
    },
    onError: (error: unknown) => {
      const err = error as { response?: { data?: { message?: string } } };
      if (err.response?.data?.message) {
        toast.error(`Error: ${err.response.data.message}`);
      } else {
        toast.error("Failed to add member");
      }
    },
  });

  const { data: searchResults } = useQuery({
    queryKey: ["users", "search", searchQuery],
    queryFn: () => authApi.searchUsers(searchQuery),
    enabled: searchQuery.length >= 2,
    staleTime: 30000,
  });

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      usernameOrEmail: "",
    },
  });

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setShowDropdown(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchQuery(value);
    form.setValue("usernameOrEmail", value);
    setShowDropdown(value.length >= 2);
  };

  const handleSelectUser = (user: User) => {
    form.setValue("usernameOrEmail", user.username);
    setSearchQuery(user.username);
    setShowDropdown(false);
  };

  const onSubmit = (values: z.infer<typeof formSchema>) => {
    addMember.mutate(values.usernameOrEmail);
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(isOpen) => {
        setOpen(isOpen);
        if (!isOpen) {
          setSearchQuery("");
          setShowDropdown(false);
          form.reset();
        }
      }}
    >
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2">
          <UserPlus className="h-4 w-4" />
          Add Member
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Add Team Member</DialogTitle>
          <DialogDescription>
            Search for a user by username or email to add them to your team.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-4">
          <div className="grid gap-2 relative">
            <Label htmlFor="usernameOrEmail">Username or Email</Label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                id="usernameOrEmail"
                placeholder="Start typing to search..."
                value={searchQuery}
                onChange={handleInputChange}
                onFocus={() => searchQuery.length >= 2 && setShowDropdown(true)}
                className="pl-9"
                autoComplete="off"
              />
            </div>

            {/* Autocomplete Dropdown */}
            {showDropdown && searchResults && searchResults.length > 0 && (
              <div
                ref={dropdownRef}
                className="absolute z-50 top-full mt-1 w-full bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg max-h-60 overflow-y-auto"
              >
                {searchResults.map((user) => (
                  <button
                    key={user.userId}
                    type="button"
                    onClick={() => handleSelectUser(user)}
                    className="w-full px-4 py-3 text-left hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors flex items-center gap-3 border-b border-gray-100 dark:border-gray-800 last:border-0"
                  >
                    <div className="flex items-center justify-center w-8 h-8 rounded-full bg-linear-to-r from-blue-500 to-purple-500 text-white text-sm font-semibold">
                      {user.username.charAt(0).toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-sm truncate">
                        {user.username}
                      </div>
                      <div className="text-xs text-muted-foreground truncate">
                        {user.email}
                      </div>
                    </div>
                    <UserIcon className="h-4 w-4 text-muted-foreground shrink-0" />
                  </button>
                ))}
              </div>
            )}

            {showDropdown &&
              searchResults &&
              searchResults.length === 0 &&
              searchQuery.length >= 2 && (
                <div
                  ref={dropdownRef}
                  className="absolute z-50 top-full mt-1 w-full bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg p-4 text-center text-sm text-muted-foreground"
                >
                  No users found matching &ldquo;{searchQuery}&rdquo;
                </div>
              )}

            {form.formState.errors.usernameOrEmail && (
              <p className="text-sm text-red-500">
                {form.formState.errors.usernameOrEmail.message}
              </p>
            )}
          </div>
          <DialogFooter>
            <Button type="submit" disabled={addMember.isPending}>
              {addMember.isPending ? "Adding..." : "Add Member"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
