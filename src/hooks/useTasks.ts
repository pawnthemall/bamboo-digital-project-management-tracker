import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useToastStore } from "@/stores/toastStore";

interface Task {
  id: string;
  title: string;
  description: string | null;
  status: string;
  priority: string;
  category: string | null;
  estimatedDuration: number;
  actualDuration: number;
  startDate: string | null;
  dueDate: string | null;
  projectId: string;
  project: { id: string; name: string; color: string };
  checklistItems: { id: string; title: string; isCompleted: boolean }[];
  timeEntries: { id: string; startTime: string; endTime: string | null; pausedSeconds: number }[];
}

const TASKS_KEY = "tasks";

async function fetchTasks(): Promise<Task[]> {
  const res = await fetch("/api/tasks");
  if (!res.ok) throw new Error("Failed to fetch tasks");
  const data = await res.json();
  return data.tasks;
}

async function fetchTask(id: string): Promise<Task> {
  const res = await fetch(`/api/tasks/${id}`);
  if (!res.ok) throw new Error("Failed to fetch task");
  return res.json();
}

export function useTasks() {
  return useQuery({ queryKey: [TASKS_KEY], queryFn: fetchTasks });
}

export function useTask(id: string) {
  return useQuery({ queryKey: [TASKS_KEY, id], queryFn: () => fetchTask(id), enabled: !!id });
}

export function useCreateTask() {
  const queryClient = useQueryClient();
  const addToast = useToastStore((s) => s.addToast);
  return useMutation({
    mutationFn: async (body: Record<string, unknown>) => {
      const res = await fetch("/api/tasks", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
      if (!res.ok) throw new Error("Failed to create task");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [TASKS_KEY] });
      addToast("Task created", "success");
    },
    onError: () => {
      addToast("Failed to create task", "error");
    },
  });
}

export function useUpdateTask() {
  const queryClient = useQueryClient();
  const addToast = useToastStore((s) => s.addToast);
  return useMutation({
    mutationFn: async ({ id, body }: { id: string; body: Record<string, unknown> }) => {
      const res = await fetch(`/api/tasks/${id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
      if (!res.ok) throw new Error("Failed to update task");
      return res.json();
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: [TASKS_KEY] });
      queryClient.invalidateQueries({ queryKey: [TASKS_KEY, variables.id] });
      addToast("Task updated", "success");
    },
    onError: () => {
      addToast("Failed to update task", "error");
    },
  });
}

export function useDeleteTask() {
  const queryClient = useQueryClient();
  const addToast = useToastStore((s) => s.addToast);
  return useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/tasks/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete task");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [TASKS_KEY] });
      addToast("Task deleted", "success");
    },
    onError: () => {
      addToast("Failed to delete task", "error");
    },
  });
}

export function useToggleChecklist() {
  const queryClient = useQueryClient();
  const addToast = useToastStore((s) => s.addToast);
  return useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/checklist/${id}`, { method: "PATCH" });
      if (!res.ok) throw new Error("Failed to toggle checklist item");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [TASKS_KEY] });
    },
    onError: () => {
      addToast("Failed to toggle checklist item", "error");
    },
  });
}
