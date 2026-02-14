"use client";

import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import Link from "next/link";
import Image from "next/image";
import { LayoutList, Users, CheckCircle } from "lucide-react";

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen bg-white dark:bg-black font-sans">
      <header className="px-4 lg:px-6 h-14 flex items-center border-b border-gray-200 dark:border-gray-800">
        <Link className="flex items-center justify-center" href="#">
          <span className="sr-only">TwistList</span>
          <span className="font-bold text-2xl bg-linear-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            TwistList
          </span>
        </Link>
        <nav className="ml-auto flex gap-4 sm:gap-6">
          <Link
            className="text-sm font-medium hover:text-blue-600 dark:hover:text-blue-400 transition-colors flex items-center"
            href="/login"
          >
            Sign In
          </Link>
          <Link href="/register">
            <Button size="sm" className="bg-blue-600 hover:bg-blue-700 text-white">
              Get Started
            </Button>
          </Link>
        </nav>
      </header>
      <main className="flex-1">
        <section className="w-full py-12 md:py-24 lg:py-32 xl:py-48 flex items-center justify-center bg-linear-to-br from-gray-50 via-blue-50 to-purple-50 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center space-y-4 text-center">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="space-y-2"
              >
                <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl lg:text-6xl/none bg-clip-text text-transparent bg-linear-to-r from-gray-900 via-blue-800 to-gray-900 dark:from-white dark:via-blue-200 dark:to-white">
                  Manage Tasks with a Twist
                </h1>
                <p className="mx-auto max-w-[700px] text-gray-500 md:text-xl dark:text-gray-400">
                  TwistList helps you organize, prioritize, and complete your projects with an intuitive and powerful dashboard.
                </p>
              </motion.div>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                className="space-x-4"
              >
                <Link href="/register">
                  <Button size="lg" className="h-12 px-8 bg-blue-600 hover:bg-blue-700 text-white shadow-lg hover:shadow-xl transition-all hover:scale-105">
                    Start for Free
                  </Button>
                </Link>
                <Link href="/login">
                  <Button variant="outline" size="lg" className="h-12 px-8 border-gray-300 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800 transition-all">
                    Sign In
                  </Button>
                </Link>
              </motion.div>
            </div>
          </div>
        </section>
        <section className="w-full py-12 md:py-24 lg:py-32 bg-white dark:bg-black flex justify-center">
          <div className="container px-4 md:px-6">
            <motion.div
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              transition={{ duration: 0.7 }}
              viewport={{ once: true }}
              className="grid gap-10 sm:grid-cols-2 md:grid-cols-3"
            >
              <div className="flex flex-col items-center space-y-2 border-gray-200 dark:border-gray-800 p-6 rounded-xl shadow-xs hover:shadow-md transition-shadow">
                <div className="p-3 rounded-full bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-300">
                  <LayoutList className="h-6 w-6" />
                </div>
                <h2 className="text-xl font-bold">Smart Organization</h2>
                <p className="text-center text-gray-500 dark:text-gray-400">
                  Categorize tasks with tags, priorities, and custom lists to keep everything in order.
                </p>
              </div>
              <div className="flex flex-col items-center space-y-2 border-gray-200 dark:border-gray-800 p-6 rounded-xl shadow-xs hover:shadow-md transition-shadow">
                <div className="p-3 rounded-full bg-purple-100 dark:bg-purple-900 text-purple-600 dark:text-purple-300">
                  <Users className="h-6 w-6" />
                </div>
                <h2 className="text-xl font-bold">Collaborative Workspaces</h2>
                <p className="text-center text-gray-500 dark:text-gray-400">
                  Share lists with your team and collaborate in real-time on projects.
                </p>
              </div>
              <div className="flex flex-col items-center space-y-2 border-gray-200 dark:border-gray-800 p-6 rounded-xl shadow-xs hover:shadow-md transition-shadow">
                <div className="p-3 rounded-full bg-green-100 dark:bg-green-900 text-green-600 dark:text-green-300">
                  <CheckCircle className="h-6 w-6" />
                </div>
                <h2 className="text-xl font-bold">Stay on Track</h2>
                <p className="text-center text-gray-500 dark:text-gray-400">
                  Set due dates, reminders, and track your progress with insightful analytics.
                </p>
              </div>
            </motion.div>
          </div>
        </section>
      </main>
      <footer className="flex flex-col gap-2 sm:flex-row py-6 w-full shrink-0 items-center px-4 md:px-6 border-t border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-900">
        <p className="text-xs text-gray-500 dark:text-gray-400">
          © 2024 TwistList Inc. All rights reserved.
        </p>
        <nav className="sm:ml-auto flex gap-4 sm:gap-6">
          <Link className="text-xs hover:underline underline-offset-4" href="#">
            Terms of Service
          </Link>
          <Link className="text-xs hover:underline underline-offset-4" href="#">
            Privacy
          </Link>
        </nav>
      </footer>
    </div>
  );
}
