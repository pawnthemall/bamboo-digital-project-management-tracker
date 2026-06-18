"use client";

import { useTaskTimer } from "@/hooks/useTaskTimer";
import { useDashboard } from "@/hooks/useDashboard";
import { useAnalytics } from "@/hooks/useAnalytics";
import { useFormatDate } from "@/lib/dateFormat";
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, AreaChart, Area } from "recharts";

const CHART_COLORS = ["#00ff66", "#8b5cf6", "#ef4444", "#f97316", "#3b82f6", "#06b6d4"];

function eventIcon(type: string) {
  switch (type) {
    case "TASK_CREATED": return "+";
    case "TASK_STATUS_CHANGED": return "→";
    case "PROJECT_CREATED": return "★";
    case "PROJECT_UPDATED": return "✎";
    case "TIMER_STARTED": return "▶";
    case "TIMER_COMPLETED": return "◼";
    default: return "•";
  }
}

export default function DashboardPage() {
  const { data, isLoading } = useDashboard();
  const { data: analytics } = useAnalytics(30);
  const timer = useTaskTimer();
  const { formatDate, formatDateTime } = useFormatDate();

  const chartDateFormatter = (v: string) => formatDate(v, { month: "2-digit", day: "2-digit" });

  if (isLoading) return <div className="text-muted text-sm">Loading dashboard...</div>;
  if (!data) return <div className="text-muted text-sm">No data</div>;

  const stats = [
    { label: "Total Hours", value: data.stats.totalHours + "h" },
    { label: "Active Projects", value: String(data.stats.activeProjects) },
    { label: "Total Tasks", value: String(data.stats.totalTasks) },
    { label: "Completed", value: String(data.stats.completedTasks) },
    { label: "Today", value: String(data.stats.completedToday) },
    { label: "This Week", value: String(data.stats.completedThisWeek) },
  ];

  return (
    <div>
      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-6">
        {stats.map((stat) => (
          <div key={stat.label} className="border border-border bg-surface p-4 hover:border-accent-green transition-colors border-glow">
            <p className="text-xs text-muted uppercase tracking-wider">{stat.label}</p>
            <p className="text-2xl font-bold text-foreground mt-1">{stat.value}</p>
          </div>
        ))}
      </div>

      {/* Live Timer */}
      {(timer.isRunning || timer.activeTaskId) && (
        <div className="border border-accent-green bg-surface p-4 mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className={`inline-block w-3 h-3 rounded-full ${timer.isRunning ? "bg-accent-green animate-pulse" : "bg-accent-orange"}`} />
              <span className="text-sm font-bold text-foreground">Active Timer</span>
              <span className="text-xs text-muted">{timer.isRunning ? "RUNNING" : "PAUSED"}</span>
            </div>
            <span className="text-3xl font-bold text-accent-green font-mono">{timer.formatted}</span>
          </div>
        </div>
      )}

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        {/* Burn-down */}
        <div className="border border-border bg-surface p-4">
          <h3 className="text-xs text-muted uppercase mb-3">Hours (Est / Actual / Rem)</h3>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={data.charts.burnDown}>
              <CartesianGrid strokeDasharray="3 3" stroke="#333" />
              <XAxis dataKey="name" tick={{ fill: "#888", fontSize: 10 }} />
              <YAxis tick={{ fill: "#888", fontSize: 10 }} />
              <Tooltip contentStyle={{ backgroundColor: "#0a0a0a", border: "1px solid #333" }} />
              <Bar dataKey="estimated" fill="#333" />
              <Bar dataKey="actual" fill="#00ff66" />
              <Bar dataKey="remaining" fill="#3b82f6" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Time by Project */}
        <div className="border border-border bg-surface p-4">
          <h3 className="text-xs text-muted uppercase mb-3">Time by Project</h3>
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie
                data={data.charts.timeByProject}
                dataKey="hours"
                nameKey="name"
                cx="50%"
                cy="50%"
                outerRadius={70}
                label={(props) => {
                  const { name, value } = props as { name: string; value: number };
                  return `${name}: ${value}h`;
                }}
                labelLine={false}
              >
                {data.charts.timeByProject.map((_entry, index) => (
                  <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                ))}
              </Pie>
              <Tooltip contentStyle={{ backgroundColor: "#0a0a0a", border: "1px solid #333" }} />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Time by Category */}
        <div className="border border-border bg-surface p-4">
          <h3 className="text-xs text-muted uppercase mb-3">Time by Category</h3>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={data.charts.timeByCategory} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="#333" />
              <XAxis type="number" tick={{ fill: "#888", fontSize: 10 }} />
              <YAxis dataKey="name" type="category" width={80} tick={{ fill: "#888", fontSize: 10 }} />
              <Tooltip contentStyle={{ backgroundColor: "#0a0a0a", border: "1px solid #333" }} />
              <Bar dataKey="hours" fill="#00ff66" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Analytics Row */}
      {analytics && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
          <div className="border border-border bg-surface p-4">
            <h3 className="text-xs text-muted uppercase mb-3">Productivity Trend (30d)</h3>
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={analytics.dailyHours}>
                <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                <XAxis dataKey="date" tick={{ fill: "#888", fontSize: 10 }} tickFormatter={chartDateFormatter} />
                <YAxis tick={{ fill: "#888", fontSize: 10 }} />
                <Tooltip contentStyle={{ backgroundColor: "#0a0a0a", border: "1px solid #333" }} />
                <Line type="monotone" dataKey="hours" stroke="#00ff66" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>

          <div className="border border-border bg-surface p-4">
            <h3 className="text-xs text-muted uppercase mb-3">Velocity (Est vs Actual)</h3>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={analytics.velocity}>
                <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                <XAxis dataKey="week" tick={{ fill: "#888", fontSize: 10 }} tickFormatter={chartDateFormatter} />
                <YAxis tick={{ fill: "#888", fontSize: 10 }} />
                <Tooltip contentStyle={{ backgroundColor: "#0a0a0a", border: "1px solid #333" }} />
                <Bar dataKey="estimated" fill="#333" />
                <Bar dataKey="actual" fill="#00ff66" />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="border border-border bg-surface p-4">
            <h3 className="text-xs text-muted uppercase mb-3">Completion Rate</h3>
            <ResponsiveContainer width="100%" height={200}>
              <AreaChart data={analytics.completionRate}>
                <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                <XAxis dataKey="week" tick={{ fill: "#888", fontSize: 10 }} tickFormatter={chartDateFormatter} />
                <YAxis tick={{ fill: "#888", fontSize: 10 }} domain={[0, 100]} />
                <Tooltip contentStyle={{ backgroundColor: "#0a0a0a", border: "1px solid #333" }} formatter={(v: any) => `${v}%`} />
                <Area type="monotone" dataKey="rate" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.3} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* Bottom Row: Activity + Lists */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Activity Feed */}
        <div>
          <h2 className="text-sm font-bold text-foreground mb-3 text-glow uppercase">Activity Feed</h2>
          <div className="space-y-2 max-h-[300px] overflow-y-auto">
            {data.activityFeed.map((event) => (
              <div key={event.id} className="border border-border bg-surface p-2 flex items-start gap-2">
                <span className="text-accent-green text-xs font-bold mt-0.5">{eventIcon(event.eventType)}</span>
                <div>
                  <p className="text-xs text-foreground">{event.eventType}</p>
                  {event.notes && <p className="text-xs text-muted">{event.notes}</p>}
                  <p className="text-xs text-muted mt-0.5">
                    {formatDateTime(event.timestamp)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Upcoming Due */}
        <div>
          <h2 className="text-sm font-bold text-foreground mb-3 text-glow uppercase">Due Soon (7d)</h2>
          {data.upcomingTasks.length === 0 ? (
            <p className="text-xs text-muted">No upcoming tasks.</p>
          ) : (
            <div className="space-y-2">
              {data.upcomingTasks.map((task) => (
                <div key={task.id} className="border border-border bg-surface p-3 hover:border-accent-green transition-colors">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-foreground font-bold">{task.title}</span>
                    <span className="text-xs text-accent-orange">
                      {task.dueDate ? formatDate(task.dueDate) : "No date"}
                    </span>
                  </div>
                  <p className="text-xs text-muted">{task.project.name}</p>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Recently Completed */}
        <div>
          <h2 className="text-sm font-bold text-foreground mb-3 text-glow uppercase">Recently Completed</h2>
          {data.recentlyCompleted.length === 0 ? (
            <p className="text-xs text-muted">No recently completed tasks.</p>
          ) : (
            <div className="space-y-2">
              {data.recentlyCompleted.map((task) => (
                <div key={task.id} className="border border-border bg-surface p-3 hover:border-accent-blue transition-colors">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-foreground font-bold">{task.title}</span>
                    <span className="text-xs text-accent-green">✓ DONE</span>
                  </div>
                  <p className="text-xs text-muted">{task.project.name}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
