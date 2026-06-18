"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

const COLORS = [
  { label: "Green", value: "#00ff66" },
  { label: "Purple", value: "#8b5cf6" },
  { label: "Red", value: "#ef4444" },
  { label: "Orange", value: "#f97316" },
  { label: "Blue", value: "#3b82f6" },
  { label: "Cyan", value: "#06b6d4" },
];

export default function NewProjectPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [status, setStatus] = useState("ACTIVE");
  const [color, setColor] = useState("#00ff66");
  const [estimatedHours, setEstimatedHours] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/projects", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          description,
          status,
          color,
          estimatedHours: estimatedHours ? parseFloat(estimatedHours) : 0,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Failed to create project");
        setLoading(false);
        return;
      }

      router.push("/projects");
      router.refresh();
    } catch {
      setError("Network error");
      setLoading(false);
    }
  }

  return (
    <div className="max-w-xl">
      <h2 className="text-lg font-bold text-foreground mb-4 text-glow">NEW PROJECT</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="border border-accent-red text-accent-red px-3 py-2 text-sm">
            {error}
          </div>
        )}

        <div>
          <label className="block text-xs text-muted mb-1 uppercase">Name</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full bg-background border border-border px-3 py-2 text-foreground focus:border-accent-green focus:outline-none"
            placeholder="Project name"
            required
          />
        </div>

        <div>
          <label className="block text-xs text-muted mb-1 uppercase">Description</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full bg-background border border-border px-3 py-2 text-foreground focus:border-accent-green focus:outline-none min-h-[80px]"
            placeholder="Project description"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs text-muted mb-1 uppercase">Status</label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="w-full bg-background border border-border px-3 py-2 text-foreground focus:border-accent-green focus:outline-none"
            >
              <option value="ACTIVE">ACTIVE</option>
              <option value="ON_HOLD">ON_HOLD</option>
              <option value="COMPLETED">COMPLETED</option>
              <option value="ARCHIVED">ARCHIVED</option>
            </select>
          </div>

          <div>
            <label className="block text-xs text-muted mb-1 uppercase">Est. Hours</label>
            <input
              type="number"
              value={estimatedHours}
              onChange={(e) => setEstimatedHours(e.target.value)}
              className="w-full bg-background border border-border px-3 py-2 text-foreground focus:border-accent-green focus:outline-none"
              placeholder="0"
              min="0"
              step="0.5"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs text-muted mb-2 uppercase">Color</label>
          <div className="flex gap-3">
            {COLORS.map((c) => (
              <button
                key={c.value}
                type="button"
                onClick={() => setColor(c.value)}
                className={`w-8 h-8 border-2 ${color === c.value ? "border-foreground" : "border-transparent"}`}
                style={{ backgroundColor: c.value }}
                title={c.label}
              />
            ))}
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
            onClick={() => router.push("/projects")}
            className="border border-border px-4 py-2 text-foreground hover:bg-surface-hover transition-colors"
          >
            CANCEL
          </button>
        </div>
      </form>
    </div>
  );
}
