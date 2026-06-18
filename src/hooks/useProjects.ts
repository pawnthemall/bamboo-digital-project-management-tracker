import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useToastStore } from "@/stores/toastStore";

interface Project {
  id: string;
  name: string;
  description: string | null;
  status: string;
  color: string;
  startDate: string | null;
  targetDate: string | null;
  estimatedHours: number;
  actualHours: number;
  remainingHours: number;
  createdAt: string;
  tasks: { id: string; status: string }[];
}

const PROJECTS_KEY = "projects";

async function fetchProjects(): Promise<Project[]> {
  const res = await fetch("/api/projects");
  if (!res.ok) throw new Error("Failed to fetch projects");
  const data = await res.json();
  return data.projects;
}

async function fetchProject(id: string): Promise<Project> {
  const res = await fetch(`/api/projects/${id}`);
  if (!res.ok) throw new Error("Failed to fetch project");
  return res.json();
}

export function useProjects() {
  return useQuery({ queryKey: [PROJECTS_KEY], queryFn: fetchProjects });
}

export function useProject(id: string) {
  return useQuery({ queryKey: [PROJECTS_KEY, id], queryFn: () => fetchProject(id), enabled: !!id });
}

export function useCreateProject() {
  const queryClient = useQueryClient();
  const addToast = useToastStore((s) => s.addToast);
  return useMutation({
    mutationFn: async (body: Record<string, unknown>) => {
      const res = await fetch("/api/projects", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
      if (!res.ok) throw new Error("Failed to create project");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [PROJECTS_KEY] });
      addToast("Project created successfully", "success");
    },
    onError: () => {
      addToast("Failed to create project", "error");
    },
  });
}

export function useUpdateProject() {
  const queryClient = useQueryClient();
  const addToast = useToastStore((s) => s.addToast);
  return useMutation({
    mutationFn: async ({ id, body }: { id: string; body: Record<string, unknown> }) => {
      const res = await fetch(`/api/projects/${id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
      if (!res.ok) throw new Error("Failed to update project");
      return res.json();
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: [PROJECTS_KEY] });
      queryClient.invalidateQueries({ queryKey: [PROJECTS_KEY, variables.id] });
      addToast("Project updated", "success");
    },
    onError: () => {
      addToast("Failed to update project", "error");
    },
  });
}

export function useDeleteProject() {
  const queryClient = useQueryClient();
  const addToast = useToastStore((s) => s.addToast);
  return useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/projects/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete project");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [PROJECTS_KEY] });
      addToast("Project deleted", "success");
    },
    onError: () => {
      addToast("Failed to delete project", "error");
    },
  });
}
