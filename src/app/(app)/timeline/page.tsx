"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

interface Task {
  id: string;
  title: string;
  status: string;
  startDate: string | null;
  dueDate: string | null;
  project: { name: string; color: string };
}

export default function TimelinePage() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchTasks() {
      try {
        const res = await fetch("/api/tasks");
        if (!res.ok) return;
        const data = await res.json();
        setTasks(data.tasks.filter((t: Task) => t.startDate || t.dueDate));
      } catch (e) {
        console.error("Failed to fetch tasks", e);
      } finally {
        setLoading(false);
      }
    }
    fetchTasks();
  }, []);

  if (loading) return <div className="text-muted text-sm">Loading...</div>;

  const sorted = [...tasks].sort((a, b) => {
    const aDate = a.dueDate ? new Date(a.dueDate).getTime() : Infinity;
    const bDate = b.dueDate ? new Date(b.dueDate).getTime() : Infinity;
    return aDate - bDate;
  });

  return (
    <div className="space-y-4">
      {sorted.map((task) => (
        <Link key={task.id} href={`/tasks/${task.id}`}>
          <div className="flex items-center gap-4 border border-border bg-surface p-3 hover:border-accent-green transition-colors">
            <div className="w-32 shrink-0">
              {task.dueDate && (
                <p className="text-xs text-muted">{new Date(task.dueDate).toLocaleDateString()}</p>
              )}
              {task.startDate && (
                <p className="text-xs text-muted">Start: {new Date(task.startDate).toLocaleDateString()}</p>
              )}
            </div>
            <span className="inline-block w-2 h-2 shrink-0" style={{ backgroundColor: task.project.color }} />
            <span className="text-sm text-foreground font-bold">{task.title}</span>
            <span className="text-xs text-muted ml-auto">{task.project.name}</span>
          </div>
        </Link>
      ))}
      {sorted.length === 0 && <p className="text-muted">No tasks with dates yet.</p>}
    </div>
  );
}
