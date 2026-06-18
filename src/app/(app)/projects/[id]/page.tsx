"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";

interface ProjectData {
  id: string;
  name: string;
  description: string | null;
  status: string;
  color: string;
  estimatedHours: number;
  actualHours: number;
  remainingHours: number;
  tasks: {
    id: string;
    title: string;
    status: string;
    priority: string;
    category: string | null;
    checklistItems: { id: string; isCompleted: boolean }[];
  }[];
}

const TABS = [
  { key: "overview", label: "Overview" },
  { key: "tasks", label: "Tasks" },
  { key: "timeline", label: "Timeline" },
  { key: "roadmap", label: "Roadmap" },
  { key: "reports", label: "Reports" },
  { key: "notes", label: "Notes" },
];

function statusBadge(status: string) {
  switch (status) {
    case "ACTIVE": return "bg-accent-green text-background";
    case "COMPLETED": return "bg-accent-blue text-background";
    case "ON_HOLD": return "bg-accent-orange text-background";
    default: return "border border-border text-muted";
  }
}

function taskStatusBadge(status: string) {
  switch (status) {
    case "TODO": return "border border-border text-muted";
    case "IN_PROGRESS": return "bg-accent-orange text-background";
    case "REVIEW": return "bg-accent-blue text-background";
    case "COMPLETED": return "bg-accent-green text-background";
    default: return "border border-border text-muted";
  }
}

function priorityDot(priority: string) {
  switch (priority) {
    case "HIGH": return "text-accent-red";
    case "MEDIUM": return "text-accent-orange";
    case "LOW": return "text-accent-blue";
    default: return "text-muted";
  }
}

export default function ProjectDetailPage() {
  const router = useRouter();
  const params = useParams();
  const projectId = params.id as string;
  const [project, setProject] = useState<ProjectData | null>(null);
  const [activeTab, setActiveTab] = useState("overview");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function fetchProject() {
      try {
        const res = await fetch(`/api/projects/${projectId}`);
        if (!res.ok) {
          setError("Project not found");
          setLoading(false);
          return;
        }
        const data = await res.json();
        setProject(data.project);
      } catch {
        setError("Failed to load project");
      } finally {
        setLoading(false);
      }
    }
    fetchProject();
  }, [projectId]);

  async function handleDelete() {
    if (!confirm("Delete this project?")) return;
    try {
      const res = await fetch(`/api/projects/${projectId}`, { method: "DELETE" });
      if (!res.ok) {
        setError("Failed to delete project");
        return;
      }
      router.push("/projects");
      router.refresh();
    } catch {
      setError("Network error");
    }
  }

  if (loading) return <div className="text-muted text-sm">Loading...</div>;
  if (error) return <div className="text-accent-red text-sm">{error}</div>;
  if (!project) return <div className="text-muted text-sm">Project not found</div>;

  const completedTasks = project.tasks.filter((t) => t.status === "COMPLETED").length;
  const totalTasks = project.tasks.length;
  const taskPercent = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;
  const hourPercent = project.estimatedHours > 0
    ? Math.round((project.actualHours / project.estimatedHours) * 100)
    : 0;

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <span
            className="inline-block w-4 h-4"
            style={{ backgroundColor: project.color }}
          />
          <h1 className="text-xl font-bold text-foreground text-glow">{project.name}</h1>
          <span className={`text-xs px-2 py-0.5 font-bold ${statusBadge(project.status)}`}>
            {project.status}
          </span>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => router.push(`/projects/${projectId}/edit`)}
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

      {project.description && (
        <p className="text-xs text-muted mb-4">{project.description}</p>
      )}

      {/* Tabs */}
      <div className="flex border-b border-border mb-4">
        {TABS.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`px-4 py-2 text-xs font-bold transition-colors ${
              activeTab === tab.key
                ? "text-foreground border-b-2 border-accent-green"
                : "text-muted hover:text-foreground"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab content */}
      {activeTab === "overview" && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="border border-border bg-surface p-4">
              <p className="text-xs text-muted uppercase">Tasks</p>
              <p className="text-2xl font-bold text-foreground mt-1">{completedTasks}/{totalTasks}</p>
              <div className="w-full h-1.5 bg-background border border-border mt-2">
                <div className="h-full bg-accent-green" style={{ width: `${taskPercent}%` }} />
              </div>
            </div>
            <div className="border border-border bg-surface p-4">
              <p className="text-xs text-muted uppercase">Hours</p>
              <p className="text-2xl font-bold text-foreground mt-1">{hourPercent}%</p>
              <div className="w-full h-1.5 bg-background border border-border mt-2">
                <div className="h-full bg-accent-blue" style={{ width: `${Math.min(hourPercent, 100)}%` }} />
              </div>
            </div>
            <div className="border border-border bg-surface p-4">
              <p className="text-xs text-muted uppercase">Remaining</p>
              <p className="text-2xl font-bold text-foreground mt-1">{project.remainingHours}h</p>
              <p className="text-xs text-muted mt-1">of {project.estimatedHours}h estimated</p>
            </div>
          </div>
        </div>
      )}

      {activeTab === "tasks" && (
        <div className="space-y-2">
          {project.tasks.length === 0 ? (
            <p className="text-muted text-sm">No tasks yet.</p>
          ) : (
            project.tasks.map((task) => {
              const checklistTotal = task.checklistItems.length;
              const checklistDone = task.checklistItems.filter((c) => c.isCompleted).length;
              return (
                <div key={task.id} className="border border-border bg-surface p-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className={`text-xs ${priorityDot(task.priority)}`}>●</span>
                      <span className="text-sm text-foreground font-bold">{task.title}</span>
                      <span className={`text-xs px-2 py-0.5 ${taskStatusBadge(task.status)}`}>
                        {task.status}
                      </span>
                    </div>
                    {checklistTotal > 0 && (
                      <span className="text-xs text-muted">
                        {checklistDone}/{checklistTotal}
                      </span>
                    )}
                  </div>
                  {task.category && (
                    <p className="text-xs text-muted mt-1">{task.category}</p>
                  )}
                </div>
              );
            })
          )}
        </div>
      )}

      {activeTab === "timeline" && (
        <div className="border border-dashed border-border p-12 text-center">
          <p className="text-muted">Timeline view coming in Phase 2.</p>
        </div>
      )}

      {activeTab === "roadmap" && (
        <div className="border border-dashed border-border p-12 text-center">
          <p className="text-muted">Kanban roadmap coming in Phase 2.</p>
        </div>
      )}

      {activeTab === "reports" && (
        <div className="border border-dashed border-border p-12 text-center">
          <p className="text-muted">Project reports coming in Phase 2.</p>
        </div>
      )}

      {activeTab === "notes" && (
        <div className="border border-dashed border-border p-12 text-center">
          <p className="text-muted">Notes feature coming in Phase 2.</p>
        </div>
      )}
    </div>
  );
}
