"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import TaskCard from "@/components/TaskCard";

interface TaskData {
  id: string;
  title: string;
  description: string | null;
  status: string;
  priority: string;
  category: string | null;
  actualDuration: number;
  project: { id: string; name: string };
  checklistItems: { id: string; isCompleted: boolean }[];
  timeEntries: { id: string; startTime: string; endTime: string | null; pausedSeconds: number }[];
}

const STATUS_OPTIONS = ["ALL", "TODO", "IN_PROGRESS", "REVIEW", "COMPLETED"];
const PRIORITY_OPTIONS = ["ALL", "LOW", "MEDIUM", "HIGH", "URGENT"];

export default function TasksPage() {
  const [tasks, setTasks] = useState<TaskData[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [priorityFilter, setPriorityFilter] = useState("ALL");

  useEffect(() => {
    async function fetchTasks() {
      try {
        const res = await fetch("/api/tasks");
        if (!res.ok) return;
        const data = await res.json();
        setTasks(data.tasks);
      } catch (e) {
        console.error("Failed to fetch tasks", e);
      } finally {
        setLoading(false);
      }
    }
    fetchTasks();
  }, []);

  const filtered = tasks.filter((t) => {
    if (statusFilter !== "ALL" && t.status !== statusFilter) return false;
    if (priorityFilter !== "ALL" && t.priority !== priorityFilter) return false;
    return true;
  });

  if (loading) return <div className="text-muted text-sm">Loading tasks...</div>;

  return (
    <div>
      <div className="flex flex-wrap items-center gap-3 mb-6">
        <Link
          href="/tasks/new"
          className="bg-accent-green text-background px-4 py-2 text-sm font-bold hover:bg-foreground transition-colors"
        >
          + NEW TASK
        </Link>

        <div className="flex items-center gap-2">
          <label className="text-xs text-muted uppercase">Status</label>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-background border border-border px-2 py-1 text-xs text-foreground focus:border-accent-green focus:outline-none"
          >
            {STATUS_OPTIONS.map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
        </div>

        <div className="flex items-center gap-2">
          <label className="text-xs text-muted uppercase">Priority</label>
          <select
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value)}
            className="bg-background border border-border px-2 py-1 text-xs text-foreground focus:border-accent-green focus:outline-none"
          >
            {PRIORITY_OPTIONS.map((p) => (
              <option key={p} value={p}>{p}</option>
            ))}
          </select>
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="border border-dashed border-border p-12 text-center">
          <p className="text-muted">No tasks match the current filters.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((task) => (
            <TaskCard key={task.id} task={task} />
          ))}
        </div>
      )}
    </div>
  );
}
