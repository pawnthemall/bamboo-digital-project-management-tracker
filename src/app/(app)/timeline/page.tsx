"use client";

import Link from "next/link";
import { useTasks } from "@/hooks/useTasks";
import { useFormatDate } from "@/lib/dateFormat";

export default function TimelinePage() {
  const { data: tasks, isLoading } = useTasks();
  const { formatDate } = useFormatDate();

  if (isLoading) return <div className="text-muted text-sm">Loading...</div>;

  const sorted = (tasks || [])
    .filter((t) => t.startDate || t.dueDate)
    .sort((a, b) => {
      const aDate = a.dueDate ? new Date(a.dueDate).getTime() : Infinity;
      const bDate = b.dueDate ? new Date(b.dueDate).getTime() : Infinity;
      return aDate - bDate;
    });

  return (
    <div className="space-y-4">
      {sorted.map((task) => (
        <Link key={task.id} href={`/tasks/${task.id}`}>
          <div className="flex items-center gap-4 border border-border bg-surface p-3 hover:border-accent-green transition-colors">
            <div className="w-36 shrink-0">
              {task.dueDate && (
                <p className="text-xs text-muted">Due: {formatDate(task.dueDate)}</p>
              )}
              {task.startDate && (
                <p className="text-xs text-muted">Start: {formatDate(task.startDate)}</p>
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
