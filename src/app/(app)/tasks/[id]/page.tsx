"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { useTaskTimer } from "@/hooks/useTaskTimer";

interface TaskData {
  id: string;
  title: string;
  description: string | null;
  status: string;
  priority: string;
  category: string | null;
  estimatedDuration: number;
  actualDuration: number;
  projectId: string;
  project: { id: string; name: string };
  checklistItems: { id: string; title: string; isCompleted: boolean; order: number }[];
  timeEntries: { id: string; startTime: string; endTime: string | null; pausedSeconds: number; isRunning: boolean }[];
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

export default function TaskDetailPage() {
  const router = useRouter();
  const params = useParams();
  const taskId = params.id as string;
  const [task, setTask] = useState<TaskData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const timer = useTaskTimer();

  useEffect(() => {
    async function fetchTask() {
      try {
        const res = await fetch(`/api/tasks/${taskId}`);
        if (!res.ok) {
          setError("Task not found");
          setLoading(false);
          return;
        }
        const data = await res.json();
        setTask(data.task);
      } catch {
        setError("Failed to load task");
      } finally {
        setLoading(false);
      }
    }
    fetchTask();
  }, [taskId]);

  async function handleDelete() {
    if (!confirm("Delete this task?")) return;
    try {
      const res = await fetch(`/api/tasks/${taskId}`, { method: "DELETE" });
      if (!res.ok) {
        setError("Failed to delete task");
        return;
      }
      router.push("/tasks");
      router.refresh();
    } catch {
      setError("Network error");
    }
  }

  async function toggleChecklist(itemId: string, currentValue: boolean) {
    try {
      const res = await fetch(`/api/checklist/${itemId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isCompleted: !currentValue }),
      });
      if (!res.ok) return;

      setTask((prev) => {
        if (!prev) return prev;
        return {
          ...prev,
          checklistItems: prev.checklistItems.map((item) =>
            item.id === itemId ? { ...item, isCompleted: !currentValue } : item
          ),
        };
      });
    } catch {
      console.error("Failed to toggle checklist item");
    }
  }

  if (loading) return <div className="text-muted text-sm">Loading...</div>;
  if (error) return <div className="text-accent-red text-sm">{error}</div>;
  if (!task) return <div className="text-muted text-sm">Task not found</div>;

  const totalSeconds = task.timeEntries.reduce((sum, entry) => {
    if (!entry.endTime) return sum;
    const end = new Date(entry.endTime);
    const start = new Date(entry.startTime);
    return sum + Math.floor((end.getTime() - start.getTime()) / 1000) - entry.pausedSeconds;
  }, 0);
  const hours = (totalSeconds / 3600).toFixed(1);
  const estHours = (task.estimatedDuration / 3600).toFixed(1);
  const checklistDone = task.checklistItems.filter((c) => c.isCompleted).length;
  const checklistTotal = task.checklistItems.length;

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <h1 className="text-xl font-bold text-foreground text-glow">{task.title}</h1>
          <span className={`text-xs px-2 py-0.5 font-bold ${statusBadge(task.status)}`}>
            {task.status}
          </span>
          <span className={`text-xs font-bold ${priorityBadge(task.priority)}`}>
            {task.priority}
          </span>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => router.push(`/tasks/${taskId}/edit`)}
            className="border border-border px-3 py-1 text-xs text-foreground hover:bg-surface-hover transition-colors"
          >
            EDIT
          </button>
          <button
            onClick={handleDelete}
            className="border border-accent-red px-3 py-1 text-xs text-accent-red hover:bg-accent-red hover:text-background transition-colors"
          >
            DELETE
          </button>
        </div>
      </div>

      {task.description && (
        <p className="text-xs text-muted mb-4">{task.description}</p>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="border border-border bg-surface p-4">
          <p className="text-xs text-muted uppercase">Project</p>
          <p className="text-lg font-bold text-foreground mt-1">{task.project.name}</p>
        </div>
        <div className="border border-border bg-surface p-4">
          <p className="text-xs text-muted uppercase">Time</p>
          <p className="text-lg font-bold text-foreground mt-1">{hours}h / {estHours}h</p>
        </div>
        <div className="border border-border bg-surface p-4">
          <p className="text-xs text-muted uppercase">Checklist</p>
          <p className="text-lg font-bold text-foreground mt-1">{checklistDone}/{checklistTotal}</p>
        </div>
      </div>

      {task.category && (
        <p className="text-xs text-muted mb-4">Category: {task.category}</p>
      )}

      {/* Timer */}
      <div className="border border-border bg-surface p-4 mb-6">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-bold text-foreground">TIMER</h3>
          <span className="text-2xl font-bold text-accent-green font-mono">
            {timer.activeTaskId === taskId ? timer.formatted : `${hours}h`}
          </span>
        </div>
        <div className="flex gap-2">
          {!timer.isRunning && timer.activeTaskId !== taskId && (
            <button
              onClick={async () => {
                const ok = await timer.start(taskId);
                if (ok) setTask((prev) => prev ? { ...prev, status: "IN_PROGRESS" } : prev);
              }}
              className="bg-accent-green text-background px-3 py-1 text-xs font-bold hover:bg-foreground transition-colors"
            >
              START
            </button>
          )}
          {timer.isRunning && timer.activeTaskId === taskId && (
            <button
              onClick={async () => {
                await timer.pause();
              }}
              className="bg-accent-orange text-background px-3 py-1 text-xs font-bold hover:bg-foreground transition-colors"
            >
              PAUSE
            </button>
          )}
          {!timer.isRunning && timer.activeTaskId === taskId && (
            <button
              onClick={async () => {
                await timer.resume();
                setTask((prev) => prev ? { ...prev, status: "IN_PROGRESS" } : prev);
              }}
              className="bg-accent-blue text-background px-3 py-1 text-xs font-bold hover:bg-foreground transition-colors"
            >
              RESUME
            </button>
          )}
          {(timer.isRunning || timer.activeTaskId === taskId) && (
            <>
              <button
                onClick={async () => {
                  const total = await timer.stop();
                  if (total !== null) {
                    setTask((prev) => prev ? { ...prev, actualDuration: total } : prev);
                  }
                }}
                className="border border-border px-3 py-1 text-xs text-foreground hover:bg-surface-hover transition-colors"
              >
                STOP
              </button>
              <button
                onClick={async () => {
                  const total = await timer.complete();
                  if (total !== null) {
                    setTask((prev) => prev ? { ...prev, actualDuration: total, status: "COMPLETED" } : prev);
                  }
                }}
                className="border border-accent-green px-3 py-1 text-xs text-accent-green hover:bg-accent-green hover:text-background transition-colors"
              >
                COMPLETE
              </button>
            </>
          )}
        </div>
      </div>

      {checklistTotal > 0 && (
        <div className="border border-border bg-surface p-4">
          <h3 className="text-sm font-bold text-foreground mb-3">CHECKLIST</h3>
          <div className="space-y-2">
            {task.checklistItems.map((item) => (
              <label
                key={item.id}
                className="flex items-center gap-3 cursor-pointer hover:bg-surface-hover p-1 transition-colors"
              >
                <input
                  type="checkbox"
                  checked={item.isCompleted}
                  onChange={() => toggleChecklist(item.id, item.isCompleted)}
                  className="accent-accent-green w-4 h-4"
                />
                <span className={`text-sm ${item.isCompleted ? "text-muted line-through" : "text-foreground"}`}>
                  {item.title}
                </span>
              </label>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
