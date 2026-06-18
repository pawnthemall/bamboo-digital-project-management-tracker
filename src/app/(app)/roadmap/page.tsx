"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

interface Task {
  id: string;
  title: string;
  status: string;
  priority: string;
  project: { name: string; color: string };
}

const COLUMNS = [
  { key: "TODO", label: "Backlog" },
  { key: "IN_PROGRESS", label: "In Progress" },
  { key: "REVIEW", label: "Review" },
  { key: "COMPLETED", label: "Completed" },
];

function priorityDot(priority: string) {
  switch (priority) {
    case "HIGH": return "text-accent-red";
    case "MEDIUM": return "text-accent-orange";
    case "LOW": return "text-accent-blue";
    default: return "text-muted";
  }
}

export default function RoadmapPage() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);

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

  if (loading) return <div className="text-muted text-sm">Loading...</div>;

  return (
    <div>
      <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
        {COLUMNS.map((col) => {
          const colTasks = tasks.filter((t) => t.status === col.key);
          return (
            <div key={col.key} className="border border-border bg-surface p-3 min-h-[200px]">
              <div className="flex items-center justify-between border-b border-border pb-2 mb-2">
                <h3 className="text-sm font-bold text-foreground">{col.label}</h3>
                <span className="text-xs text-muted">{colTasks.length}</span>
              </div>
              <div className="space-y-2">
                {colTasks.map((task) => (
                  <Link key={task.id} href={`/tasks/${task.id}`}>
                    <div className="border border-border bg-background p-2 hover:border-accent-green transition-colors">
                      <div className="flex items-center gap-2 mb-1">
                        <span className={`text-xs ${priorityDot(task.priority)}`}>●</span>
                        <span className="text-xs text-foreground font-bold truncate">{task.title}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span
                          className="inline-block w-2 h-2"
                          style={{ backgroundColor: task.project.color }}
                        />
                        <span className="text-xs text-muted truncate">{task.project.name}</span>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
