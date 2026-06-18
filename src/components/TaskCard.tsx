"use client";

import Link from "next/link";

interface TaskCardProps {
  task: {
    id: string;
    title: string;
    description: string | null;
    status: string;
    priority: string;
    project: { id: string; name: string };
    checklistItems: { id: string; isCompleted: boolean }[];
    timeEntries: { id: string; startTime: string | Date; endTime: string | Date | null; pausedSeconds: number }[];
  };
}

function statusBadge(status: string) {
  switch (status) {
    case "TODO": return "border border-border text-muted";
    case "IN_PROGRESS": return "bg-accent-orange text-background";
    case "REVIEW": return "bg-accent-blue text-background";
    case "COMPLETED": return "bg-accent-green text-background";
    default: return "border border-border text-muted";
  }
}

function priorityBadge(priority: string) {
  switch (priority) {
    case "HIGH": return "text-accent-red";
    case "MEDIUM": return "text-accent-orange";
    case "LOW": return "text-accent-blue";
    default: return "text-muted";
  }
}

export default function TaskCard({ task }: TaskCardProps) {
  const checklistTotal = task.checklistItems.length;
  const checklistDone = task.checklistItems.filter((c) => c.isCompleted).length;
  const checklistPercent = checklistTotal > 0 ? Math.round((checklistDone / checklistTotal) * 100) : 0;

  const totalSeconds = task.timeEntries.reduce((sum, entry) => {
    if (!entry.endTime) return sum;
    const end = typeof entry.endTime === "string" ? new Date(entry.endTime) : entry.endTime;
    const start = typeof entry.startTime === "string" ? new Date(entry.startTime) : entry.startTime;
    return sum + Math.floor((end.getTime() - start.getTime()) / 1000) - entry.pausedSeconds;
  }, 0);
  const hours = (totalSeconds / 3600).toFixed(1);

  return (
    <Link href={`/tasks/${task.id}`}>
      <div className="border border-border bg-surface p-4 hover:border-accent-green transition-colors border-glow h-full flex flex-col">
        <div className="flex items-center gap-2 mb-2">
          <span className={`text-xs font-bold ${priorityBadge(task.priority)}`}>
            {task.priority}
          </span>
          <span className={`text-xs px-2 py-0.5 ${statusBadge(task.status)}`}>
            {task.status}
          </span>
        </div>

        <h3 className="text-sm font-bold text-foreground mb-1">{task.title}</h3>
        {task.description && (
          <p className="text-xs text-muted mb-3 line-clamp-2">{task.description}</p>
        )}

        <div className="mt-auto space-y-2">
          {checklistTotal > 0 && (
            <div>
              <div className="flex justify-between text-xs text-muted mb-1">
                <span>Checklist</span>
                <span>{checklistDone}/{checklistTotal}</span>
              </div>
              <div className="w-full h-1 bg-background border border-border">
                <div className="h-full bg-accent-green" style={{ width: `${checklistPercent}%` }} />
              </div>
            </div>
          )}

          <div className="flex items-center justify-between text-xs text-muted">
            <span>{task.project.name}</span>
            <span>{hours}h logged</span>
          </div>
        </div>
      </div>
    </Link>
  );
}
