import { useQuery } from "@tanstack/react-query";

interface DashboardData {
  stats: {
    totalHours: string;
    activeProjects: number;
    totalTasks: number;
    completedTasks: number;
    completedToday: number;
    completedThisWeek: number;
  };
  upcomingTasks: Array<{ id: string; title: string; description: string | null; dueDate: string | null; project: { name: string } }>;
  recentlyCompleted: Array<{ id: string; title: string; description: string | null; project: { name: string } }>;
  activityFeed: Array<{ id: string; eventType: string; timestamp: string; notes: string | null }>;
  charts: {
    timeByProject: Array<{ name: string; hours: number }>;
    timeByCategory: Array<{ name: string; hours: number }>;
    burnDown: Array<{ name: string; estimated: number; actual: number; remaining: number }>;
  };
}

const DASHBOARD_KEY = "dashboard";

async function fetchDashboard(): Promise<DashboardData> {
  const res = await fetch("/api/dashboard");
  if (!res.ok) throw new Error("Failed to fetch dashboard");
  return res.json();
}

export function useDashboard() {
  return useQuery({ queryKey: [DASHBOARD_KEY], queryFn: fetchDashboard });
}
