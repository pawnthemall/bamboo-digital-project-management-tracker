"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

interface ProjectOption {
  id: string;
  name: string;
}

interface MemberUser {
  id: string;
  userId: string;
  role: string;
  user: { id: string; email: string; name: string | null };
}

export default function NewTaskPage() {
  const router = useRouter();
  const [projects, setProjects] = useState<ProjectOption[]>([]);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [projectId, setProjectId] = useState("");
  const [category, setCategory] = useState("");
  const [priority, setPriority] = useState("MEDIUM");
  const [status, setStatus] = useState("TODO");
  const [estimatedDuration, setEstimatedDuration] = useState("");
  const [assigneeId, setAssigneeId] = useState("");
  const [members, setMembers] = useState<MemberUser[]>([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    async function fetchProjects() {
      try {
        const res = await fetch("/api/projects");
        if (!res.ok) return;
        const data = await res.json();
        setProjects(data.projects);
        if (data.projects.length > 0) setProjectId(data.projects[0].id);
      } catch (e) {
        console.error("Failed to fetch projects", e);
      }
    }
    fetchProjects();
  }, []);

  useEffect(() => {
    async function fetchMembers() {
      if (!projectId) return;
      try {
        const res = await fetch(`/api/projects/${projectId}/members`);
        if (res.ok) {
          const data = await res.json();
          setMembers(data.members || []);
        }
      } catch {
        // ignore
      }
    }
    fetchMembers();
    setAssigneeId("");
  }, [projectId]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/tasks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          description,
          projectId,
          category,
          priority,
          status,
          estimatedDuration: estimatedDuration ? parseFloat(estimatedDuration) * 3600 : 0,
          assigneeId: assigneeId || undefined,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Failed to create task");
        setLoading(false);
        return;
      }

      router.push("/tasks");
      router.refresh();
    } catch {
      setError("Network error");
      setLoading(false);
    }
  }

  return (
    <div className="max-w-xl">
      <h2 className="text-lg font-bold text-foreground mb-4 text-glow">NEW TASK</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="border border-accent-red text-accent-red px-3 py-2 text-sm">
            {error}
          </div>
        )}

        <div>
          <label className="block text-xs text-muted mb-1 uppercase">Title</label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full bg-background border border-border px-3 py-2 text-foreground focus:border-accent-green focus:outline-none"
            placeholder="Task title"
            required
          />
        </div>

        <div>
          <label className="block text-xs text-muted mb-1 uppercase">Description</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full bg-background border border-border px-3 py-2 text-foreground focus:border-accent-green focus:outline-none min-h-[80px]"
            placeholder="Task description"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs text-muted mb-1 uppercase">Project</label>
            <select
              value={projectId}
              onChange={(e) => setProjectId(e.target.value)}
              className="w-full bg-background border border-border px-3 py-2 text-foreground focus:border-accent-green focus:outline-none"
              required
            >
              {projects.map((p) => (
                <option key={p.id} value={p.id}>{p.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs text-muted mb-1 uppercase">Category</label>
            <input
              type="text"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full bg-background border border-border px-3 py-2 text-foreground focus:border-accent-green focus:outline-none"
              placeholder="e.g. UI, Backend"
            />
          </div>
        </div>

        <div className="grid grid-cols-4 gap-4">
          <div>
            <label className="block text-xs text-muted mb-1 uppercase">Priority</label>
            <select
              value={priority}
              onChange={(e) => setPriority(e.target.value)}
              className="w-full bg-background border border-border px-3 py-2 text-foreground focus:border-accent-green focus:outline-none"
            >
              <option value="LOW">LOW</option>
              <option value="MEDIUM">MEDIUM</option>
              <option value="HIGH">HIGH</option>
              <option value="URGENT">URGENT</option>
            </select>
          </div>

          <div>
            <label className="block text-xs text-muted mb-1 uppercase">Status</label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="w-full bg-background border border-border px-3 py-2 text-foreground focus:border-accent-green focus:outline-none"
            >
              <option value="TODO">TODO</option>
              <option value="IN_PROGRESS">IN_PROGRESS</option>
              <option value="REVIEW">REVIEW</option>
              <option value="COMPLETED">COMPLETED</option>
            </select>
          </div>

          <div>
            <label className="block text-xs text-muted mb-1 uppercase">Assignee</label>
            <select
              value={assigneeId}
              onChange={(e) => setAssigneeId(e.target.value)}
              className="w-full bg-background border border-border px-3 py-2 text-foreground focus:border-accent-green focus:outline-none"
            >
              <option value="">Unassigned</option>
              {members.map((m) => (
                <option key={m.userId} value={m.userId}>
                  {m.user.name || m.user.email}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs text-muted mb-1 uppercase">Est. Hours</label>
            <input
              type="number"
              value={estimatedDuration}
              onChange={(e) => setEstimatedDuration(e.target.value)}
              className="w-full bg-background border border-border px-3 py-2 text-foreground focus:border-accent-green focus:outline-none"
              placeholder="0"
              min="0"
              step="0.5"
            />
          </div>
        </div>

        <div className="flex gap-3 pt-2">
          <button
            type="submit"
            disabled={loading}
            className="bg-accent-green text-background px-4 py-2 font-bold hover:bg-foreground transition-colors disabled:opacity-50"
          >
            {loading ? "CREATING..." : "CREATE"}
          </button>
          <button
            type="button"
            onClick={() => router.push("/tasks")}
            className="border border-border px-4 py-2 text-foreground hover:bg-surface-hover transition-colors"
          >
            CANCEL
          </button>
        </div>
      </form>
    </div>
  );
}
