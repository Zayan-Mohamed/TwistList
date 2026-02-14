"use client";

import { Sidebar } from "@/components/dashboard/sidebar";
import { TopBar } from "@/components/dashboard/topbar";

export function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen bg-linear-to-br from-gray-50 via-blue-50 to-purple-50 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950">
      {/* Sidebar - Positioned Fixed */}
      <Sidebar />

      {/* Main Content - Pushed by Sidebar */}
      <div className="flex-1 flex flex-col md:pl-64 transition-all duration-300">
        <TopBar />
        <main className="flex-1 p-6 md:p-8 animate-in fade-in-50 slide-in-from-bottom-4 duration-500">
          {children}
        </main>
      </div>
    </div>
  );
}
