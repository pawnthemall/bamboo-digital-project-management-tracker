"use client";

import { useProjects } from "@/hooks/useProjects";
import ProjectCard from "@/components/ProjectCard";
import Link from "next/link";

export default function ProjectsPage() {
  const { data: projects, isLoading } = useProjects();

  if (isLoading) return <div className="text-muted text-sm">Loading projects...</div>;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <Link
          href="/projects/new"
          className="bg-accent-green text-background px-4 py-2 text-sm font-bold hover:bg-foreground transition-colors"
        >
          + NEW PROJECT
        </Link>
      </div>

      {!projects || projects.length === 0 ? (
        <div className="border border-dashed border-border p-12 text-center">
          <p className="text-muted">No projects yet. Create your first project to get started.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {projects.map((project) => (
            <ProjectCard key={project.id} project={project} />
          ))}
        </div>
      )}
    </div>
  );
}
