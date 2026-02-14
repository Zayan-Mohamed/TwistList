"use client";

import { Bell, Search } from "lucide-react";

export function TopBar() {
  return (
    <div className="sticky top-0 z-30 flex h-16 w-full items-center justify-between border-b border-gray-200 bg-white/80 px-4 md:px-8 backdrop-blur-xl dark:border-gray-800 dark:bg-black/80">
      <div className="flex items-center gap-4">
        <h1 className="text-xl font-semibold md:hidden bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">TwistList</h1>
        <div className="hidden relative md:block">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-500 dark:text-gray-400" />
          <input
            type="text"
            placeholder="Search tasks, projects..."
            className="h-9 w-64 md:w-80 rounded-full border border-gray-200 bg-gray-50/50 pl-10 pr-4 text-sm outline-none transition-all focus:border-blue-500 focus:ring-2 focus:ring-blue-100 dark:border-gray-800 dark:bg-gray-900/50 dark:text-gray-100 dark:focus:ring-blue-900"
          />
        </div>
      </div>

      <div className="flex items-center gap-4">
        <button className="relative rounded-full p-2 text-gray-500 transition-colors hover:bg-gray-100 hover:text-gray-900 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-gray-100">
          <Bell className="h-5 w-5" />
          <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-red-500 ring-2 ring-white dark:ring-black animate-pulse" />
        </button>
        {/* User Nav would go here if needed, but sidebar handles navigation */}
      </div>
    </div>
  );
}
