"use client";

import { useState, useEffect } from "react";

interface ReportData {
  period: string;
  startDate: string;
  endDate: string;
  summary: {
    totalEstimated: number;
    totalActual: number;
    productivity: number;
    taskCount: number;
    completedTasks: number;
  };
  projectSummary: Array<{
    id: string;
    name: string;
    estimatedHours: number;
    actualHours: number;
    taskCount: number;
    completedTasks: number;
  }>;
  tasks: Array<{
    id: string;
    title: string;
    status: string;
    estimatedHours: number;
    actualHours: number;
    projectName: string;
  }>;
}

const TABS = [
  { key: "daily", label: "Daily" },
  { key: "weekly", label: "Weekly" },
  { key: "monthly", label: "Monthly" },
];

function statusBadge(status: string) {
  switch (status) {
    case "TODO": return "border border-border text-muted";
    case "IN_PROGRESS": return "bg-accent-orange text-background";
    case "REVIEW": return "bg-accent-blue text-background";
    case "COMPLETED": return "bg-accent-green text-background";
    default: return "border border-border text-muted";
  }
}

export default function ReportsPage() {
  const [activeTab, setActiveTab] = useState("weekly");
  const [data, setData] = useState<ReportData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchReport() {
      setLoading(true);
      try {
        const res = await fetch(`/api/reports?period=${activeTab}`);
        if (!res.ok) return;
        const json = await res.json();
        setData(json);
      } catch (e) {
        console.error("Failed to fetch report", e);
      } finally {
        setLoading(false);
      }
    }
    fetchReport();
  }, [activeTab]);

  function exportCSV() {
    if (!data) return;
    const rows = [
      ["Title", "Status", "Project", "Estimated (h)", "Actual (h)"],
      ...data.tasks.map((t) => [t.title, t.status, t.projectName, String(t.estimatedHours), String(t.actualHours)]),
    ];
    const csv = rows.map((r) => r.map((c) => `"${c.replace(/"/g, "\"\"")}"`).join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `report-${data.period}-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  if (loading) return <div className="text-muted text-sm">Loading report...</div>;
  if (!data) return <div className="text-muted text-sm">No data</div>;

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <div className="flex border-b border-border">
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
        <button
          onClick={exportCSV}
          className="border border-border px-3 py-1 text-xs text-foreground hover:bg-surface-hover transition-colors"
        >
          EXPORT CSV
        </button>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
        <div className="border border-border bg-surface p-4">
          <p className="text-xs text-muted uppercase">Est. Hours</p>
          <p className="text-xl font-bold text-foreground mt-1">{data.summary.totalEstimated}h</p>
        </div>
        <div className="border border-border bg-surface p-4">
          <p className="text-xs text-muted uppercase">Actual Hours</p>
          <p className="text-xl font-bold text-foreground mt-1">{data.summary.totalActual}h</p>
        </div>
        <div className="border border-border bg-surface p-4">
          <p className="text-xs text-muted uppercase">Productivity</p>
          <p className="text-xl font-bold text-accent-green mt-1">{data.summary.productivity}%</p>
        </div>
        <div className="border border-border bg-surface p-4">
          <p className="text-xs text-muted uppercase">Tasks</p>
          <p className="text-xl font-bold text-foreground mt-1">{data.summary.taskCount}</p>
        </div>
        <div className="border border-border bg-surface p-4">
          <p className="text-xs text-muted uppercase">Completed</p>
          <p className="text-xl font-bold text-accent-green mt-1">{data.summary.completedTasks}</p>
        </div>
      </div>

      {/* Project breakdown */}
      <div className="border border-border bg-surface p-4 mb-6">
        <h3 className="text-sm font-bold text-foreground mb-3">PROJECT BREAKDOWN</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="text-muted border-b border-border">
                <th className="text-left py-2">Project</th>
                <th className="text-right py-2">Est. (h)</th>
                <th className="text-right py-2">Actual (h)</th>
                <th className="text-right py-2">Tasks</th>
                <th className="text-right py-2">Done</th>
              </tr>
            </thead>
            <tbody>
              {data.projectSummary.map((p) => (
                <tr key={p.id} className="border-b border-border/50">
                  <td className="py-2 text-foreground font-bold">{p.name}</td>
                  <td className="py-2 text-right text-muted">{p.estimatedHours}h</td>
                  <td className="py-2 text-right text-accent-green">{p.actualHours}h</td>
                  <td className="py-2 text-right text-muted">{p.taskCount}</td>
                  <td className="py-2 text-right text-accent-green">{p.completedTasks}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Task list */}
      <div className="border border-border bg-surface p-4">
        <h3 className="text-sm font-bold text-foreground mb-3">TASKS</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="text-muted border-b border-border">
                <th className="text-left py-2">Title</th>
                <th className="text-left py-2">Project</th>
                <th className="text-left py-2">Status</th>
                <th className="text-right py-2">Est. (h)</th>
                <th className="text-right py-2">Actual (h)</th>
              </tr>
            </thead>
            <tbody>
              {data.tasks.map((t) => (
                <tr key={t.id} className="border-b border-border/50">
                  <td className="py-2 text-foreground font-bold">{t.title}</td>
                  <td className="py-2 text-muted">{t.projectName}</td>
                  <td className="py-2">
                    <span className={`text-xs px-2 py-0.5 ${statusBadge(t.status)}`}>{t.status}</span>
                  </td>
                  <td className="py-2 text-right text-muted">{t.estimatedHours}h</td>
                  <td className="py-2 text-right text-accent-green">{t.actualHours}h</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
