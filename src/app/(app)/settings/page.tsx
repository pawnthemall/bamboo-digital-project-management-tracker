"use client";

import { useState, useEffect } from "react";
import { useAppStore } from "@/stores/appStore";

const COLORS = [
  { label: "Green", value: "#00ff66" },
  { label: "Purple", value: "#8b5cf6" },
  { label: "Red", value: "#ef4444" },
  { label: "Orange", value: "#f97316" },
  { label: "Blue", value: "#3b82f6" },
  { label: "Cyan", value: "#06b6d4" },
];

export default function SettingsPage() {
  const storeAccent = useAppStore((s) => s.accentColor);
  const storeWorkHours = useAppStore((s) => s.workHours);
  const storeTimezone = useAppStore((s) => s.timezone);
  const setStoreAccent = useAppStore((s) => s.setAccentColor);
  const setStoreWorkHours = useAppStore((s) => s.setWorkHours);
  const setStoreTimezone = useAppStore((s) => s.setTimezone);

  const [accentColor, setAccentColor] = useState(storeAccent);
  const [workHours, setWorkHours] = useState(storeWorkHours);
  const [timezone, setTimezone] = useState(storeTimezone);
  const [exportLoading, setExportLoading] = useState(false);
  const [saved, setSaved] = useState(false);
  const [devices, setDevices] = useState<Array<{
    id: string;
    deviceName: string | null;
    browser: string | null;
    os: string | null;
    ipAddress: string | null;
    lastUsedAt: string;
    createdAt: string;
  }>>([]);
  const [devicesLoading, setDevicesLoading] = useState(true);
  const [revokingId, setRevokingId] = useState<string | null>(null);

  useEffect(() => {
    applyAccent(storeAccent);
  }, [storeAccent]);

  useEffect(() => {
    fetchDevices();
  }, []);

  async function fetchDevices() {
    try {
      const res = await fetch("/api/devices");
      if (!res.ok) return;
      const data = await res.json();
      setDevices(data.devices || []);
    } catch {
      console.error("Failed to fetch devices");
    } finally {
      setDevicesLoading(false);
    }
  }

  async function revokeDevice(id: string) {
    setRevokingId(id);
    try {
      const res = await fetch(`/api/devices/${id}`, { method: "DELETE" });
      if (res.ok) {
        setDevices((prev) => prev.filter((d) => d.id !== id));
      }
    } catch {
      console.error("Failed to revoke device");
    } finally {
      setRevokingId(null);
    }
  }

  function applyAccent(color: string) {
    const root = document.documentElement;
    root.style.setProperty("--color-accent-green", color);
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
    setStoreAccent(accentColor);
    setStoreWorkHours(workHours);
    setStoreTimezone(timezone);
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

      <div className="border border-accent-green bg-surface p-4 space-y-4">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 bg-accent-green rounded-full animate-pulse" />
          <h3 className="text-sm font-bold text-accent-green">Device Manager</h3>
        </div>
        <p className="text-xs text-muted">
          Devices you have chosen to remember. Revoke any device to sign it out immediately.
        </p>
        {devicesLoading ? (
          <p className="text-xs text-muted">Loading devices...</p>
        ) : devices.length === 0 ? (
          <p className="text-xs text-muted">No remembered devices.</p>
        ) : (
          <div className="space-y-2">
            {devices.map((device) => (
              <div
                key={device.id}
                className="border border-border bg-background p-3 flex items-center justify-between"
              >
                <div className="space-y-0.5">
                  <p className="text-xs text-foreground font-bold">
                    {device.deviceName || "Unknown Device"}
                  </p>
                  <p className="text-xs text-muted">
                    {device.browser} · {device.os} · {device.ipAddress}
                  </p>
                  <p className="text-xs text-muted">
                    Last used: {new Date(device.lastUsedAt).toLocaleString()}
                  </p>
                </div>
                <button
                  onClick={() => revokeDevice(device.id)}
                  disabled={revokingId === device.id}
                  className="border border-accent-red text-accent-red px-3 py-1 text-xs font-bold hover:bg-accent-red hover:text-background transition-colors disabled:opacity-50"
                >
                  {revokingId === device.id ? "REVOKING..." : "REVOKE"}
                </button>
              </div>
            ))}
          </div>
        )}
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
