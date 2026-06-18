"use client";

import Link from "next/link";
import { useTaskTimer } from "@/hooks/useTaskTimer";

export default function TimerWidget() {
  const timer = useTaskTimer();

  if (!timer.isRunning && !timer.activeTaskId) return null;

  return (
    <Link href={timer.activeTaskId ? `/tasks/${timer.activeTaskId}` : "/tasks"}>
      <div className="fixed bottom-4 right-4 border border-accent-green bg-background px-4 py-2 hover:bg-surface transition-colors z-50">
        <div className="flex items-center gap-3">
          <span className={`inline-block w-2 h-2 rounded-full ${timer.isRunning ? "bg-accent-green animate-pulse" : "bg-accent-orange"}`} />
          <span className="text-sm font-bold text-accent-green font-mono">{timer.formatted}</span>
          <span className="text-xs text-muted">{timer.isRunning ? "RUNNING" : "PAUSED"}</span>
        </div>
      </div>
    </Link>
  );
}
