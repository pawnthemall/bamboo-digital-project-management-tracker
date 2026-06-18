import { useQuery } from "@tanstack/react-query";

interface ReportData {
  summary: Record<string, number | string>;
  projects: unknown[];
  tasks: unknown[];
  startDate: string;
  endDate: string;
}

const REPORTS_KEY = "reports";

async function fetchReports(period: string): Promise<ReportData> {
  const res = await fetch(`/api/reports?period=${period}`);
  if (!res.ok) throw new Error("Failed to fetch reports");
  return res.json();
}

export function useReports(period: string) {
  return useQuery({ queryKey: [REPORTS_KEY, period], queryFn: () => fetchReports(period) });
}
