"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";

const navItems = [
  { label: "Dashboard", href: "/dashboard" },
  { label: "Projects", href: "/projects" },
  { label: "Roadmap", href: "/roadmap" },
  { label: "Timeline", href: "/timeline" },
  { label: "Tasks", href: "/tasks" },
  { label: "Reports", href: "/reports" },
  { label: "Calendar", href: "/calendar" },
  { label: "Settings", href: "/settings" },
];

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();

  async function handleLogout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/login");
    router.refresh();
  }

  return (
    <aside className="w-56 border-r border-border bg-surface flex flex-col shrink-0">
      <div className="p-4 border-b border-border">
        <div className="flex items-center gap-2">
          <img src="/bd-icon.svg" alt="" width={24} height={24} className="shrink-0" />
          <h2 className="text-lg font-bold text-foreground text-glow">BambooDigital</h2>
        </div>
        <p className="text-xs text-muted mt-1">PM Tracker v0.1.0</p>
      </div>
      <nav className="flex-1 p-2 space-y-1">
        {navItems.map((item) => {
          const active = pathname === item.href || pathname.startsWith(item.href + "/");
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`block px-3 py-2 text-sm transition-colors ${
                active
                  ? "bg-accent-green text-background font-bold"
                  : "text-foreground hover:bg-surface-hover hover:text-glow"
              }`}
            >
              {active ? "> " : "  "}{item.label}
            </Link>
          );
        })}
      </nav>
      <div className="p-4 border-t border-border text-xs">
        <button
          onClick={handleLogout}
          className="w-full text-left px-2 py-1 text-muted hover:text-accent-red hover:bg-surface-hover transition-colors"
        >
          [ LOGOUT ]
        </button>
      </div>
    </aside>
  );
}
