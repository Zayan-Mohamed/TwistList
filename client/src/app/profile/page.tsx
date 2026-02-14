"use client";

import { DashboardLayout } from "@/components/dashboard/dashboard-layout";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { authApi } from "@/lib/api";
import { User } from "@/types";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Skeleton } from "@/components/ui/skeleton";
import { motion } from "framer-motion";

export default function ProfilePage() {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  
  // Form states
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [currentPassword, setCurrentPassword] = useState(""); // Kept for UI but not used by backend currently

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const { user: userData } = await authApi.getCurrentUser();
        setUser(userData);
        setUsername(userData.username);
        setEmail(userData.email);
      } catch (error) {
        console.error("Failed to fetch user", error);
        toast.error("Failed to load profile");
      } finally {
        setIsLoading(false);
      }
    };
    fetchUser();
  }, []);

  const handleSave = async () => {
    setIsSaving(true);
    try {
        const updates: any = {};
        if (username !== user?.username) updates.username = username;
        if (email !== user?.email) updates.email = email;
        if (newPassword) updates.password = newPassword;

        if (Object.keys(updates).length === 0) {
            toast.info("No changes to save");
            setIsSaving(false);
            return;
        }

        const { user: updatedUser } = await authApi.updateProfile(updates);
        setUser(updatedUser);
        setNewPassword("");
        setCurrentPassword("");
        toast.success("Profile updated successfully");
    } catch (error) {
        console.error("Failed to update profile", error);
        toast.error("Failed to update profile");
    } finally {
        setIsSaving(false);
    }
  };

  const handleCancel = () => {
      if (user) {
          setUsername(user.username);
          setEmail(user.email);
          setNewPassword("");
          setCurrentPassword("");
          toast.info("Changes discarded");
      }
  };

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="max-w-4xl mx-auto space-y-6">
          <Skeleton className="h-32 w-full rounded-xl" />
          <div className="grid gap-6 md:grid-cols-2">
            <Skeleton className="h-64 w-full rounded-xl" />
            <Skeleton className="h-64 w-full rounded-xl" />
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto space-y-8">
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
        >
            <h1 className="text-3xl font-bold bg-linear-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2">
            Profile Settings
            </h1>
            <p className="text-muted-foreground text-lg">
            Manage your personal information and preferences.
            </p>
        </motion.div>

        <motion.div
             initial={{ opacity: 0, scale: 0.95 }}
             animate={{ opacity: 1, scale: 1 }}
             transition={{ delay: 0.1 }}
             className="relative"
        >
            <div className="h-32 w-full rounded-t-2xl bg-gradient-to-r from-blue-500 to-purple-600 opacity-80"></div>
            <div className="absolute -bottom-12 left-8">
                 <Avatar className="h-24 w-24 border-4 border-white dark:border-black shadow-lg">
                    <AvatarImage src={user?.profilePictureUrl} alt={user?.username} />
                    <AvatarFallback className="text-2xl bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300">
                        {user?.username?.slice(0, 2).toUpperCase() || "TL"}
                    </AvatarFallback>
                 </Avatar>
            </div>
        </motion.div>

        <div className="pt-12 grid gap-8 md:grid-cols-[1fr_250px]">
            <div className="space-y-6">
                <Card className="border-gray-200 dark:border-gray-800 shadow-sm">
                <CardHeader>
                    <CardTitle>Personal Information</CardTitle>
                    <CardDescription>
                    Update your personal details here.
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="grid gap-2">
                    <Label htmlFor="username">Username</Label>
                    <Input 
                        id="username" 
                        value={username} 
                        onChange={(e) => setUsername(e.target.value)}
                    />
                    </div>
                    <div className="grid gap-2">
                    <Label htmlFor="email">Email</Label>
                    <Input 
                        id="email" 
                        type="email" 
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                    />
                    </div>
                </CardContent>
                </Card>

                <Card className="border-gray-200 dark:border-gray-800 shadow-sm">
                    <CardHeader>
                        <CardTitle>Change Password</CardTitle>
                        <CardDescription>
                            Ensure your account is secure by using a strong password.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid gap-2">
                            <Label htmlFor="current-password">Current Password (Optional)</Label>
                            <Input 
                                id="current-password" 
                                type="password" 
                                value={currentPassword}
                                onChange={(e) => setCurrentPassword(e.target.value)}
                                placeholder="Not verified by backend yet"
                            />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="new-password">New Password</Label>
                            <Input 
                                id="new-password" 
                                type="password" 
                                value={newPassword}
                                onChange={(e) => setNewPassword(e.target.value)}
                                placeholder="Minimum 8 characters"
                            />
                        </div>
                    </CardContent>
                </Card>
            </div>
            
            <div className="space-y-6">
                 <Card className="border-gray-200 dark:border-gray-800 shadow-sm">
                    <CardHeader>
                        <CardTitle>Actions</CardTitle>
                    </CardHeader>
                    <CardContent className="flex flex-col gap-2">
                        <Button 
                            className="w-full bg-blue-600 hover:bg-blue-700" 
                            onClick={handleSave}
                            disabled={isSaving}
                        >
                            {isSaving ? "Saving..." : "Save Changes"}
                        </Button>
                        <Button 
                            variant="outline" 
                            className="w-full"
                            onClick={handleCancel}
                            disabled={isSaving}
                        >
                            Cancel
                        </Button>
                    </CardContent>
                 </Card>
            </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
