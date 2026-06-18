"use client";

import { useState, useMemo } from "react";
import { useReports } from "@/hooks/useReports";
import { useAnalytics } from "@/hooks/useAnalytics";
import { LineChart, Line, CartesianGrid, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import * as XLSX from "xlsx";

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
  const { data, isLoading } = useReports(activeTab) as { data: ReportData | undefined; isLoading: boolean };
  const { data: analytics } = useAnalytics(30);

  const today = useMemo(() => new Date().toISOString().slice(0, 10), []);
  const [fromDate, setFromDate] = useState(today);
  const [toDate, setToDate] = useState(today);

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
    a.download = `report-${data.period}-${today}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  function exportExcel() {
    if (!data) return;
    const wb = XLSX.utils.book_new();

    const summaryWs = XLSX.utils.aoa_to_sheet([
      ["Metric", "Value"],
      ["Period", data.period],
      ["Date Range", `${data.startDate} to ${data.endDate}`],
      ["Est. Hours", data.summary.totalEstimated],
      ["Actual Hours", data.summary.totalActual],
      ["Productivity %", data.summary.productivity],
      ["Tasks", data.summary.taskCount],
      ["Completed", data.summary.completedTasks],
    ]);
    XLSX.utils.book_append_sheet(wb, summaryWs, "Summary");

    const projectWs = XLSX.utils.aoa_to_sheet([
      ["Project", "Est. Hours", "Actual Hours", "Tasks", "Completed"],
      ...data.projectSummary.map((p) => [p.name, p.estimatedHours, p.actualHours, p.taskCount, p.completedTasks]),
    ]);
    XLSX.utils.book_append_sheet(wb, projectWs, "Projects");

    const taskWs = XLSX.utils.aoa_to_sheet([
      ["Title", "Status", "Project", "Est. Hours", "Actual Hours"],
      ...data.tasks.map((t) => [t.title, t.status, t.projectName, t.estimatedHours, t.actualHours]),
    ]);
    XLSX.utils.book_append_sheet(wb, taskWs, "Tasks");

    XLSX.writeFile(wb, `report-${data.period}-${today}.xlsx`);
  }

  if (isLoading) return <div className="text-muted text-sm">Loading report...</div>;
  if (!data) return <div className="text-muted text-sm">No data</div>;

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between mb-4 gap-3">
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
        <div className="flex items-center gap-2">
          <input
            type="date"
            value={fromDate}
            onChange={(e) => setFromDate(e.target.value)}
            className="bg-background border border-border text-xs text-foreground px-2 py-1"
          />
          <span className="text-xs text-muted">to</span>
          <input
            type="date"
            value={toDate}
            onChange={(e) => setToDate(e.target.value)}
            className="bg-background border border-border text-xs text-foreground px-2 py-1"
          />
          <button
            onClick={exportCSV}
            className="border border-border px-3 py-1 text-xs text-foreground hover:bg-surface-hover transition-colors"
          >
            CSV
          </button>
          <button
            onClick={exportExcel}
            className="bg-accent-green text-background px-3 py-1 text-xs font-bold hover:bg-foreground transition-colors"
          >
            EXCEL
          </button>
        </div>
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

      {/* Productivity Trend */}
      {analytics && analytics.dailyHours.length > 0 && (
        <div className="border border-border bg-surface p-4 mb-6">
          <h3 className="text-xs text-muted uppercase mb-3">Productivity Trend (30 days)</h3>
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={analytics.dailyHours}>
              <CartesianGrid strokeDasharray="3 3" stroke="#333" />
              <XAxis dataKey="date" tick={{ fill: "#888", fontSize: 10 }} tickFormatter={(v) => v.slice(5)} />
              <YAxis tick={{ fill: "#888", fontSize: 10 }} />
              <Tooltip contentStyle={{ backgroundColor: "#0a0a0a", border: "1px solid #333" }} />
              <Line type="monotone" dataKey="hours" stroke="#00ff66" strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}

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
