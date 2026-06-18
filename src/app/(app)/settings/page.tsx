"use client";

import { useState, useEffect } from "react";

const COLORS = [
  { label: "Green", value: "#00ff66", var: "--color-accent-green" },
  { label: "Purple", value: "#8b5cf6", var: "--color-accent-purple" },
  { label: "Red", value: "#ef4444", var: "--color-accent-red" },
  { label: "Orange", value: "#f97316", var: "--color-accent-orange" },
  { label: "Blue", value: "#3b82f6", var: "--color-accent-blue" },
  { label: "Cyan", value: "#06b6d4", var: "--color-accent-cyan" },
];

const ACCENT_CSS_VARS = [
  "--color-accent-green",
  "--color-accent-purple",
  "--color-accent-red",
  "--color-accent-orange",
  "--color-accent-blue",
  "--color-accent-cyan",
];

export default function SettingsPage() {
  const [accentColor, setAccentColor] = useState("#00ff66");
  const [workHours, setWorkHours] = useState("8");
  const [timezone, setTimezone] = useState("UTC");
  const [exportLoading, setExportLoading] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem("bd-settings");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed.accentColor) {
          setAccentColor(parsed.accentColor);
          applyAccent(parsed.accentColor);
        }
        if (parsed.workHours) setWorkHours(parsed.workHours);
        if (parsed.timezone) setTimezone(parsed.timezone);
      } catch {
        /* ignore */
      }
    }
  }, []);

  function applyAccent(color: string) {
    const root = document.documentElement;
    root.style.setProperty("--color-accent-green", color);

    // Inject override style for Tailwind v4 compiled utilities
    let style = document.getElementById("bd-accent-override") as HTMLStyleElement | null;
    if (!style) {
      style = document.createElement("style");
      style.id = "bd-accent-override";
      document.head.appendChild(style);
    }
    style.textContent = `
      :root { --color-accent-green: ${color} !important; }
      .bg-accent-green { background-color: ${color} !important; }
      .text-accent-green { color: ${color} !important; }
      .border-accent-green { border-color: ${color} !important; }
      .hover\\:border-accent-green:hover { border-color: ${color} !important; }
      .hover\\:bg-accent-green:hover { background-color: ${color} !important; }
      .hover\\:text-accent-green:hover { color: ${color} !important; }
      ::selection { background: ${color} !important; color: #0a0a0a !important; }
      *:focus-visible { outline-color: ${color} !important; }
      ::-webkit-scrollbar-thumb:hover { background: ${color} !important; }
      .text-glow { text-shadow: 0 0 8px ${color}40 !important; }
      .border-glow { box-shadow: 0 0 8px ${color}26 !important; }
    `;
  }

  function handleSave() {
    console.log("[Settings] Save clicked, color:", accentColor);
    localStorage.setItem("bd-settings", JSON.stringify({ accentColor, workHours, timezone }));
    applyAccent(accentColor);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  async function handleExport() {
    setExportLoading(true);
    try {
      const res = await fetch("/api/export");
      if (!res.ok) return;
      const data = await res.json();
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `bamboo-digital-backup-${new Date().toISOString().slice(0, 10)}.json`;
      a.click();
      URL.revokeObjectURL(url);
    } catch {
      console.error("Export failed");
    } finally {
      setExportLoading(false);
    }
  }

  return (
    <div className="max-w-xl space-y-6">
      <h2 className="text-lg font-bold text-foreground text-glow">SETTINGS</h2>

      <div className="border border-border bg-surface p-4 space-y-4">
        <h3 className="text-sm font-bold text-foreground">Appearance</h3>
        <div>
          <label className="block text-xs text-muted mb-2 uppercase">Accent Color</label>
          <div className="flex gap-3">
            {COLORS.map((c) => (
              <button
                key={c.value}
                type="button"
                onClick={() => setAccentColor(c.value)}
                className={`w-8 h-8 border-2 ${accentColor === c.value ? "border-foreground" : "border-transparent"}`}
                style={{ backgroundColor: c.value }}
                title={c.label}
              />
            ))}
          </div>
        </div>
      </div>

      <div className="border border-border bg-surface p-4 space-y-4">
        <h3 className="text-sm font-bold text-foreground">Preferences</h3>
        <div>
          <label className="block text-xs text-muted mb-1 uppercase">Default Work Hours</label>
          <input
            type="number"
            value={workHours}
            onChange={(e) => setWorkHours(e.target.value)}
            className="w-24 bg-background border border-border px-3 py-2 text-foreground focus:border-accent-green focus:outline-none"
            min="1"
            max="24"
          />
        </div>
        <div>
          <label className="block text-xs text-muted mb-1 uppercase">Timezone</label>
          <select
            value={timezone}
            onChange={(e) => setTimezone(e.target.value)}
            className="bg-background border border-border px-3 py-2 text-foreground focus:border-accent-green focus:outline-none"
          >
            <option>UTC</option>
            <option>Pacific/Auckland</option>
            <option>America/Los_Angeles</option>
            <option>America/New_York</option>
            <option>Europe/London</option>
          </select>
        </div>
      </div>

      <div className="border border-border bg-surface p-4 space-y-4">
        <h3 className="text-sm font-bold text-foreground">Data</h3>
        <button
          onClick={handleExport}
          disabled={exportLoading}
          className="border border-border px-4 py-2 text-xs text-foreground hover:bg-surface-hover transition-colors disabled:opacity-50"
        >
          {exportLoading ? "EXPORTING..." : "EXPORT JSON"}
        </button>
        <p className="text-xs text-muted">Download all projects, tasks, time entries, and activity as JSON.</p>
      </div>

      <div className="flex gap-3">
        <button
          type="button"
          onClick={handleSave}
          className="bg-accent-green text-background px-4 py-2 font-bold hover:bg-foreground transition-colors"
        >
          {saved ? "SAVED!" : "SAVE SETTINGS"}
        </button>
      </div>
    </div>
  );
}
