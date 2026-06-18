"use client";

import { usePathname } from "next/navigation";

const routeLabels: Record<string, string> = {
  "/dashboard": "Dashboard",
  "/projects": "Projects",
  "/roadmap": "Roadmap",
  "/timeline": "Timeline",
  "/tasks": "Tasks",
  "/reports": "Reports",
  "/calendar": "Calendar",
  "/settings": "Settings",
};

export default function Header() {
  const pathname = usePathname();
  const label = routeLabels[pathname] || "BambooDigital";

  return (
    <header className="h-14 border-b border-border bg-surface/90 backdrop-blur flex items-center justify-between px-6 shrink-0 relative overflow-hidden">
      <div className="absolute inset-0 pointer-events-none bg-[linear-gradient(90deg,transparent_0%,rgba(0,255,102,0.03)_50%,transparent_100%)]" />
      <div className="flex items-center gap-3 relative z-10">
        <div className="relative flex items-center justify-center w-8 h-8 rounded-md bg-[radial-gradient(circle,rgba(0,255,102,0.25)_0%,transparent_70%)] shadow-[0_0_12px_rgba(0,255,102,0.4)]">
          <img
            src="/kimi-green.svg"
            alt="Kimi AI"
            width={28}
            height={28}
            className="shrink-0 opacity-90"
          />
        </div>
        <h1 className="text-sm font-bold tracking-widest text-foreground text-glow uppercase cursor-blink">
          &gt; {label}
        </h1>
      </div>
      <div className="flex items-center gap-2 relative z-10">
        <span className="inline-block w-2 h-2 bg-accent-green rounded-full animate-pulse shadow-[0_0_6px_rgba(0,255,102,0.6)]" />
        <span className="text-xs text-muted uppercase tracking-wider">System Online</span>
      </div>
    </header>
  );
}
