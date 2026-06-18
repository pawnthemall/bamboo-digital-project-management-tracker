"use client";

import { useState, useEffect, useMemo } from "react";
import { useRouter, useParams } from "next/navigation";
import { useFormatDate } from "@/lib/dateFormat";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from "recharts";

interface ProjectData {
  id: string;
  name: string;
  description: string | null;
  status: string;
  color: string;
  estimatedHours: number;
  actualHours: number;
  remainingHours: number;
  startDate: string | null;
  targetDate: string | null;
  createdAt: string;
  tasks: {
    id: string;
    title: string;
    status: string;
    priority: string;
    category: string | null;
    startDate: string | null;
    dueDate: string | null;
    estimatedDuration: number;
    actualDuration: number;
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

function categoryColor(category: string | null) {
  switch (category) {
    case "Phase 1": return "#00ff66";
    case "Phase 2": return "#3b82f6";
    case "Infrastructure": return "#f97316";
    case "Design": return "#ef4444";
    case "UI": return "#8b5cf6";
    case "Backend": return "#06b6d4";
    case "Feature": return "#eab308";
    case "DevOps": return "#ec4899";
    default: return "#6b7280";
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

interface GanttTask {
  id: string;
  title: string;
  status: string;
  priority: string;
  category: string | null;
  startDate: string | null;
  dueDate: string | null;
  estimatedDuration: number;
  actualDuration: number;
}

function ProjectGantt({ tasks, projectColor, onTaskClick }: { tasks: GanttTask[]; projectColor: string; onTaskClick: (id: string) => void }) {
  const { formatDate } = useFormatDate();

  const tasksWithDates = tasks.filter((t) => t.startDate && t.dueDate);
  if (tasksWithDates.length === 0) {
    return <p className="text-muted text-sm">No tasks with dates.</p>;
  }

  const dates = tasksWithDates.map((t) => ({
    start: new Date(t.startDate!).getTime(),
    end: new Date(t.dueDate!).getTime(),
  }));
  const minTime = Math.min(...dates.map((d) => d.start));
  const maxTime = Math.max(...dates.map((d) => d.end));
  const range = maxTime - minTime || 1;

  const dayMs = 24 * 3600 * 1000;
  const totalDays = Math.max(1, Math.ceil(range / dayMs));
  const labelInterval = Math.ceil(totalDays / 10);

  const sortedTasks = [...tasksWithDates].sort((a, b) => {
    return new Date(a.startDate!).getTime() - new Date(b.startDate!).getTime();
  });

  return (
    <div className="border border-border bg-surface p-4 overflow-x-auto">
      {/* Top legend */}
      <div className="flex flex-wrap gap-3 mb-3">
        {Array.from(new Set(tasksWithDates.map((t) => t.category).filter(Boolean))).sort().map((cat) => (
          <div key={cat} className="flex items-center gap-1.5">
            <span className="inline-block w-3 h-3" style={{ backgroundColor: categoryColor(cat) }} />
            <span className="text-xs text-muted">{cat}</span>
          </div>
        ))}
      </div>

      {/* Time axis */}
      <div className="relative h-8 mb-2 ml-48" style={{ minWidth: "600px" }}>
        {Array.from({ length: Math.min(totalDays + 1, 12) }).map((_, i) => {
          const pct = (i / Math.min(totalDays, 11)) * 100;
          const date = new Date(minTime + (range * (i / Math.min(totalDays, 11))));
          return (
            <div key={i} className="absolute top-0 text-xs text-muted" style={{ left: `${pct}%`, transform: "translateX(-50%)" }}>
              {formatDate(date)}
            </div>
          );
        })}
      </div>

      {/* Task bars */}
      <div className="space-y-1" style={{ minWidth: "600px" }}>
        {sortedTasks.map((task) => {
          const start = new Date(task.startDate!).getTime();
          const end = new Date(task.dueDate!).getTime();
          const left = ((start - minTime) / range) * 100;
          const width = Math.max(((end - start) / range) * 100, 0.5);
          const color = categoryColor(task.category);

          return (
            <div key={task.id} className="flex items-center gap-2">
              <div className="w-48 shrink-0 truncate">
                <span className="text-xs font-bold truncate" style={{ color }}>{task.title}</span>
              </div>
              <div className="flex-1 relative h-6 bg-background border border-border">
                <div
                  onClick={() => onTaskClick(task.id)}
                  className="absolute top-0.5 h-5 cursor-pointer hover:opacity-80 transition-opacity border border-white/20"
                  style={{
                    left: `${left}%`,
                    width: `${width}%`,
                    backgroundColor: color,
                    minWidth: "4px",
                  }}
                  title={`${task.title}: ${formatDate(task.startDate)} → ${formatDate(task.dueDate)}`}
                />
              </div>
            </div>
          );
        })}
      </div>

      {/* Bottom legend */}
      <div className="flex flex-wrap gap-3 mt-4 pt-3 border-t border-border">
        {Array.from(new Set(tasksWithDates.map((t) => t.category).filter(Boolean))).sort().map((cat) => (
          <div key={cat} className="flex items-center gap-1.5">
            <span className="inline-block w-3 h-3" style={{ backgroundColor: categoryColor(cat) }} />
            <span className="text-xs text-muted">{cat}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function RoadmapChart({ tasks }: { tasks: GanttTask[] }) {
  const [interval, setInterval] = useState<"day" | "week">("day");
  const { formatDate } = useFormatDate();

  const completedTasks = tasks.filter((t) => t.status === "COMPLETED" && t.dueDate);

  const data = useMemo(() => {
    const counts = new Map<string, number>();

    for (const task of completedTasks) {
      const date = new Date(task.dueDate!);
      let key: string;
      if (interval === "day") {
        key = formatDate(date);
      } else {
        const d = new Date(date);
        d.setHours(0, 0, 0, 0);
        const day = d.getDay();
        const diff = d.getDate() - day + (day === 0 ? -6 : 1);
        const monday = new Date(d.setDate(diff));
        key = formatDate(monday);
      }
      counts.set(key, (counts.get(key) || 0) + 1);
    }

    const entries = Array.from(counts.entries())
      .map(([label, count]) => ({ label, count }))
      .sort((a, b) => {
        const da = new Date(a.label.split("/").reverse().join("-"));
        const db = new Date(b.label.split("/").reverse().join("-"));
        return da.getTime() - db.getTime();
      });

    return entries;
  }, [completedTasks, interval, formatDate]);

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <span className="text-xs text-muted uppercase">Interval</span>
        <div className="flex border border-border">
          <button
            onClick={() => setInterval("day")}
            className={`px-3 py-1 text-xs ${interval === "day" ? "bg-accent-green text-background" : "text-foreground hover:bg-surface-hover"}`}
          >
            DAY
          </button>
          <button
            onClick={() => setInterval("week")}
            className={`px-3 py-1 text-xs ${interval === "week" ? "bg-accent-green text-background" : "text-foreground hover:bg-surface-hover"}`}
          >
            WEEK
          </button>
        </div>
        <span className="text-xs text-muted ml-auto">{completedTasks.length} completed tasks</span>
      </div>

      {data.length === 0 ? (
        <p className="text-muted text-sm">No completed tasks with dates.</p>
      ) : (
        <div className="border border-border bg-surface p-4" style={{ height: "320px" }}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} margin={{ top: 5, right: 5, bottom: 5, left: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
              <XAxis dataKey="label" tick={{ fill: "#94a3b8", fontSize: 10 }} interval={Math.floor(data.length / 8)} angle={-30} textAnchor="end" height={50} />
              <YAxis tick={{ fill: "#94a3b8", fontSize: 10 }} allowDecimals={false} />
              <Tooltip
                contentStyle={{ backgroundColor: "#0f172a", border: "1px solid #334155", fontSize: "12px" }}
                itemStyle={{ color: "#e2e8f0" }}
                formatter={(value: any) => [`${value} tasks`, "Completed"]}
              />
              <Bar dataKey="count" radius={[2, 2, 0, 0]}>
                {data.map((_, i) => (
                  <Cell key={i} fill={i % 2 === 0 ? "#00ff66" : "#3b82f6"} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
}

export default function ProjectDetailPage() {
  const router = useRouter();
  const params = useParams();
  const projectId = params.id as string;
  const [project, setProject] = useState<ProjectData | null>(null);
  const [activeTab, setActiveTab] = useState("overview");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const { formatDate } = useFormatDate();

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

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="border border-border bg-surface p-4">
              <p className="text-xs text-muted uppercase">Start Date</p>
              <p className="text-lg font-bold text-foreground mt-1">{formatDate(project.startDate)}</p>
            </div>
            <div className="border border-border bg-surface p-4">
              <p className="text-xs text-muted uppercase">Target Date</p>
              <p className="text-lg font-bold text-foreground mt-1">{formatDate(project.targetDate)}</p>
            </div>
            <div className="border border-border bg-surface p-4">
              <p className="text-xs text-muted uppercase">Created</p>
              <p className="text-lg font-bold text-foreground mt-1">{formatDate(project.createdAt)}</p>
            </div>
            <div className="border border-border bg-surface p-4">
              <p className="text-xs text-muted uppercase">Actual Hours</p>
              <p className="text-lg font-bold text-accent-green mt-1">{project.actualHours}h</p>
            </div>
          </div>

          {project.description && (
            <div className="border border-border bg-surface p-4">
              <p className="text-xs text-muted uppercase mb-2">Description</p>
              <p className="text-sm text-foreground">{project.description}</p>
            </div>
          )}
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
        <ProjectGantt tasks={project.tasks} projectColor={project.color} onTaskClick={(id) => router.push(`/tasks/${id}`)} />
      )}

      {activeTab === "roadmap" && <RoadmapChart tasks={project.tasks} />}

      {activeTab === "reports" && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="border border-border bg-surface p-4">
              <p className="text-xs text-muted uppercase">Total Tasks</p>
              <p className="text-2xl font-bold text-foreground mt-1">{totalTasks}</p>
            </div>
            <div className="border border-border bg-surface p-4">
              <p className="text-xs text-muted uppercase">Completed</p>
              <p className="text-2xl font-bold text-accent-green mt-1">{completedTasks}</p>
            </div>
            <div className="border border-border bg-surface p-4">
              <p className="text-xs text-muted uppercase">Estimated Hours</p>
              <p className="text-2xl font-bold text-accent-blue mt-1">{project.estimatedHours}h</p>
            </div>
            <div className="border border-border bg-surface p-4">
              <p className="text-xs text-muted uppercase">Actual Hours</p>
              <p className="text-2xl font-bold text-accent-orange mt-1">{project.actualHours}h</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="border border-border bg-surface p-4">
              <p className="text-xs text-muted uppercase mb-3">Status Breakdown</p>
              <div className="space-y-2">
                {["TODO", "PLANNED", "IN_PROGRESS", "REVIEW", "COMPLETED"].map((status) => {
                  const count = project.tasks.filter((t) => t.status === status).length;
                  return (
                    <div key={status} className="flex items-center justify-between">
                      <span className="text-xs text-foreground">{status.replace("_", " ")}</span>
                      <span className="text-xs font-bold text-foreground">{count}</span>
                    </div>
                  );
                })}
              </div>
            </div>
            <div className="border border-border bg-surface p-4">
              <p className="text-xs text-muted uppercase mb-3">Category Breakdown</p>
              <div className="space-y-2">
                {Array.from(new Set(project.tasks.map((t) => t.category).filter(Boolean))).sort().map((cat) => {
                  const count = project.tasks.filter((t) => t.category === cat).length;
                  return (
                    <div key={cat} className="flex items-center justify-between">
                      <span className="text-xs text-foreground">{cat}</span>
                      <span className="text-xs font-bold text-foreground">{count}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          <div className="border border-border bg-surface p-4">
            <p className="text-xs text-muted uppercase mb-3">Priority Breakdown</p>
            <div className="grid grid-cols-3 gap-4">
              {["HIGH", "MEDIUM", "LOW"].map((priority) => {
                const count = project.tasks.filter((t) => t.priority === priority).length;
                const pct = totalTasks > 0 ? Math.round((count / totalTasks) * 100) : 0;
                return (
                  <div key={priority} className="text-center">
                    <p className={`text-2xl font-bold ${priorityDot(priority)}`}>{count}</p>
                    <p className="text-xs text-muted">{priority} ({pct}%)</p>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {activeTab === "notes" && (
        <div className="border border-border bg-surface p-4">
          <p className="text-xs text-muted uppercase mb-3">Project Notes</p>
          {project.description ? (
            <p className="text-sm text-foreground whitespace-pre-wrap">{project.description}</p>
          ) : (
            <p className="text-sm text-muted">No notes for this project.</p>
          )}
        </div>
      )}
    </div>
  );
}
