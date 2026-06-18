import { useQuery } from "@tanstack/react-query";

interface AnalyticsData {
  dailyHours: Array<{ date: string; hours: number }>;
  velocity: Array<{ week: string; estimated: number; actual: number }>;
  completionRate: Array<{ week: string; rate: number }>;
  categoryBreakdown: Array<Record<string, number | string>>;
}

const ANALYTICS_KEY = "analytics";

async function fetchAnalytics(days = 30): Promise<AnalyticsData> {
  const res = await fetch(`/api/analytics?days=${days}`);
  if (!res.ok) throw new Error("Failed to fetch analytics");
  return res.json();
}

export function useAnalytics(days = 30) {
  return useQuery({ queryKey: [ANALYTICS_KEY, days], queryFn: () => fetchAnalytics(days) });
}
