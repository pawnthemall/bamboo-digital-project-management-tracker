"use client";

import { useEffect } from "react";

function injectAccent(color: string) {
  document.documentElement.style.setProperty("--color-accent-green", color);
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

export default function AccentColorProvider() {
  useEffect(() => {
    try {
      const raw = localStorage.getItem("bd-settings");
      if (raw) {
        const parsed = JSON.parse(raw);
        if (parsed.accentColor) {
          injectAccent(parsed.accentColor);
        }
      }
    } catch {
      /* ignore */
    }
  }, []);

  return null;
}
