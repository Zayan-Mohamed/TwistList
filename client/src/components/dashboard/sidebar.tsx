"use client";

import { Bell, CheckSquare, LayoutDashboard, Settings, User as UserIcon, LogOut, Plus, Menu } from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { authApi } from "@/lib/api";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useState } from "react";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";

export function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);

  const handleLogout = async () => {
    try {
      // Clear cookies and redirect
      document.cookie = "auth_token=; path=/; max-age=0; SameSite=Lax";
      // Also try backend logout if available
      // await authApi.logout(); 
      router.push("/login");
      toast.success("Logged out successfully");
    } catch (error) {
      console.error("Logout failed", error);
      document.cookie = "auth_token=; path=/; max-age=0; SameSite=Lax";
      router.push("/login");
    }
  };

  const links = [
    {
      href: "/dashboard",
      label: "Dashboard",
      icon: LayoutDashboard,
    },
    {
      href: "/tasks",
      label: "My Tasks",
      icon: CheckSquare,
    },
    {
      href: "/profile",
      label: "Profile",
      icon: UserIcon,
    },
    {
      href: "/settings",
      label: "Settings",
      icon: Settings,
    },
  ];

  const SidebarContent = () => (
    <div className="flex h-full flex-col justify-between py-6">
      {/* Logo */}
      <div className="px-6 mb-8 flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-linear-to-br from-blue-600 to-purple-600 text-white font-bold shadow-lg shadow-blue-500/20">
          TL
        </div>
        <span className="text-xl font-bold bg-linear-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
          TwistList
        </span>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-2 px-4">
        {links.map((link) => {
          const Icon = link.icon;
          const isActive = pathname === link.href;

          return (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setIsOpen(false)}
              className={cn(
                "group flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-all duration-200",
                isActive
                  ? "bg-blue-50 text-blue-600 shadow-sm dark:bg-blue-900/20 dark:text-blue-400"
                  : "text-gray-600 hover:bg-gray-100 hover:text-gray-900 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-gray-100",
              )}
            >
              <Icon className={cn("h-5 w-5 transition-colors", isActive ? "text-blue-600 dark:text-blue-400" : "text-gray-500 group-hover:text-gray-900 dark:text-gray-500 dark:group-hover:text-gray-100")} />
              <span>{link.label}</span>
              {isActive && (
                <div className="ml-auto h-2 w-2 rounded-full bg-blue-600 dark:bg-blue-400" />
              )}
            </Link>
          );
        })}
      </nav>

      {/* Actions */}
      <div className="space-y-4 px-4 mt-auto">
        <div className="bg-linear-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700">
             <div className="flex items-center gap-3 mb-3">
                <div className="h-8 w-8 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-blue-600 dark:text-blue-400">
                    <span className="text-xs font-bold">PRO</span>
                </div>
                <div>
                    <h4 className="text-sm font-semibold">Upgrade to Pro</h4>
                    <p className="text-xs text-muted-foreground">Get more features</p>
                </div>
             </div>
             <Button size="sm" className="w-full bg-blue-600 hover:bg-blue-700 text-white shadow-sm">
                Upgrade Now
             </Button>
        </div>

        <div className="h-px bg-gray-200 dark:bg-gray-800 my-4" />

        <button
          onClick={handleLogout}
          className="group flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium text-red-600 transition-colors hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/20"
        >
          <LogOut className="h-5 w-5 shrink-0 transition-transform group-hover:-translate-x-1" />
          <span>Logout</span>
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="hidden fixed left-0 top-0 z-40 h-screen w-64 border-r border-gray-200 bg-white/50 backdrop-blur-xl dark:border-gray-800 dark:bg-black/50 md:block">
        <SidebarContent />
      </aside>

      {/* Mobile Sidebar Trigger */}
      <div className="md:hidden fixed top-4 left-4 z-50">
        <Sheet open={isOpen} onOpenChange={setIsOpen}>
            <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="bg-white/80 backdrop-blur-md shadow-sm border border-gray-200 dark:bg-black/80 dark:border-gray-800">
                    <Menu className="h-5 w-5" />
                </Button>
            </SheetTrigger>
            <SheetContent side="left" className="p-0 w-72">
                <SidebarContent />
            </SheetContent>
        </Sheet>
      </div>
    </>
  );
}
