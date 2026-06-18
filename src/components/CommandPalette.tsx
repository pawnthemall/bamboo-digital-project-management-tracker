"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Command } from "cmdk";
import { useProjects } from "@/hooks/useProjects";
import { useTasks } from "@/hooks/useTasks";

const PAGES = [
  { name: "Dashboard", path: "/dashboard", icon: "◈" },
  { name: "Projects", path: "/projects", icon: "★" },
  { name: "Tasks", path: "/tasks", icon: "▪" },
  { name: "Roadmap", path: "/roadmap", icon: "▤" },
  { name: "Timeline", path: "/timeline", icon: "→" },
  { name: "Reports", path: "/reports", icon: "📊" },
  { name: "Settings", path: "/settings", icon: "⚙" },
];

export default function CommandPalette() {
  const [open, setOpen] = useState(false);
  const router = useRouter();
  const { data: projects } = useProjects();
  const { data: tasks } = useTasks();

  const handleSelect = useCallback(
    (path: string) => {
      setOpen(false);
      router.push(path);
    },
    [router]
  );

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((prev) => !prev);
      }
      if (e.key === "Escape") {
        setOpen(false);
      }
    };
    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, []);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex items-start justify-center pt-[20vh]">
      <div className="absolute inset-0 bg-black/80" onClick={() => setOpen(false)} />
      <Command
        className="relative w-full max-w-lg border border-border bg-surface shadow-2xl"
        onKeyDown={(e) => {
          if (e.key === "Escape") {
            e.preventDefault();
            setOpen(false);
          }
        }}
      >
        <div className="flex items-center border-b border-border px-3">
          <span className="text-muted text-xs mr-2">&gt;</span>
          <Command.Input
            placeholder="Type a command or search..."
            className="w-full bg-transparent py-3 text-sm text-foreground outline-none placeholder:text-muted"
            autoFocus
          />
          <kbd className="text-xs text-muted border border-border px-1.5 py-0.5">ESC</kbd>
        </div>
        <Command.List className="max-h-[400px] overflow-y-auto p-2">
          <Command.Empty className="text-xs text-muted py-4 text-center">No results found.</Command.Empty>

          <Command.Group heading="Pages" className="text-xs text-muted uppercase mb-2">
            {PAGES.map((page) => (
              <Command.Item
                key={page.path}
                value={`page ${page.name}`}
                onSelect={() => handleSelect(page.path)}
                className="flex items-center gap-2 px-2 py-1.5 text-sm text-foreground cursor-pointer hover:bg-surface-hover aria-selected:bg-surface-hover"
              >
                <span className="text-accent-green text-xs">{page.icon}</span>
                <span>{page.name}</span>
              </Command.Item>
            ))}
          </Command.Group>

          {projects && projects.length > 0 && (
            <Command.Group heading="Projects" className="text-xs text-muted uppercase mb-2">
              {projects.map((project) => (
                <Command.Item
                  key={project.id}
                  value={`project ${project.name}`}
                  onSelect={() => handleSelect(`/projects/${project.id}`)}
                  className="flex items-center gap-2 px-2 py-1.5 text-sm text-foreground cursor-pointer hover:bg-surface-hover aria-selected:bg-surface-hover"
                >
                  <span
                    className="inline-block w-2 h-2"
                    style={{ backgroundColor: project.color }}
                  />
                  <span>{project.name}</span>
                </Command.Item>
              ))}
            </Command.Group>
          )}

          {tasks && tasks.length > 0 && (
            <Command.Group heading="Tasks" className="text-xs text-muted uppercase mb-2">
              {tasks.slice(0, 10).map((task) => (
                <Command.Item
                  key={task.id}
                  value={`task ${task.title}`}
                  onSelect={() => handleSelect(`/tasks/${task.id}`)}
                  className="flex items-center gap-2 px-2 py-1.5 text-sm text-foreground cursor-pointer hover:bg-surface-hover aria-selected:bg-surface-hover"
                >
                  <span className="text-accent-blue text-xs">▪</span>
                  <span>{task.title}</span>
                </Command.Item>
              ))}
            </Command.Group>
          )}
        </Command.List>
      </Command>
    </div>
  );
}
