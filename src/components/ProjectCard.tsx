"use client";

import Link from "next/link";
import type { Project, Task } from "@prisma/client";

interface ProjectCardProps {
  project: Project & { tasks: Task[] };
}

function statusBadge(status: string) {
  switch (status) {
    case "ACTIVE":
      return "bg-accent-green text-background";
    case "COMPLETED":
      return "bg-accent-blue text-background";
    case "ON_HOLD":
      return "bg-accent-orange text-background";
    default:
      return "border border-border text-muted";
  }
}

export default function ProjectCard({ project }: ProjectCardProps) {
  const completedTasks = project.tasks.filter((t) => t.status === "COMPLETED").length;
  const totalTasks = project.tasks.length;
  const taskPercent = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;
  const hourPercent = project.estimatedHours > 0
    ? Math.round((project.actualHours / project.estimatedHours) * 100)
    : 0;

  return (
    <Link href={`/projects/${project.id}`}>
      <div className="border border-border bg-surface p-4 hover:border-accent-green transition-colors border-glow h-full flex flex-col">
        <div className="flex items-center gap-3 mb-2">
          <span
            className="inline-block w-3 h-3 shrink-0"
            style={{ backgroundColor: project.color }}
          />
          <span className="text-sm text-foreground font-bold truncate">{project.name}</span>
          <span className={`text-xs px-2 py-0.5 font-bold shrink-0 ${statusBadge(project.status)}`}>
            {project.status}
          </span>
        </div>

        {project.description && (
          <p className="text-xs text-muted mb-3 line-clamp-2">{project.description}</p>
        )}

        <div className="mt-auto space-y-2">
          {/* Task progress bar */}
          <div>
            <div className="flex justify-between text-xs text-muted mb-1">
              <span>Tasks</span>
              <span>{completedTasks}/{totalTasks}</span>
            </div>
            <div className="w-full h-1.5 bg-background border border-border">
              <div
                className="h-full bg-accent-green"
                style={{ width: `${taskPercent}%` }}
              />
            </div>
          </div>

          {/* Hour progress bar */}
          <div>
            <div className="flex justify-between text-xs text-muted mb-1">
              <span>Hours</span>
              <span>{hourPercent}% done</span>
            </div>
            <div className="w-full h-1.5 bg-background border border-border">
              <div
                className="h-full bg-accent-blue"
                style={{ width: `${Math.min(hourPercent, 100)}%` }}
              />
            </div>
          </div>

          <div className="flex items-center gap-4 text-xs text-muted pt-1">
            <span>Est: {project.estimatedHours}h</span>
            <span>Act: {project.actualHours}h</span>
            <span>Rem: {project.remainingHours}h</span>
          </div>
        </div>
      </div>
    </Link>
  );
}
