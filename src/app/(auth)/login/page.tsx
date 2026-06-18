"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState<Event | null>(null);
  const [isInstalled, setIsInstalled] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };
    window.addEventListener("beforeinstallprompt", handler);
    window.addEventListener("appinstalled", () => {
      setDeferredPrompt(null);
      setIsInstalled(true);
    });
    if ((window.navigator as { standalone?: boolean }).standalone) {
      setIsInstalled(true);
    }
    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password, rememberMe }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Login failed");
        setLoading(false);
        return;
      }

      router.push("/dashboard");
      router.refresh();
    } catch {
      setError("Network error");
      setLoading(false);
    }
  }

  return (
    <div className="w-full max-w-sm">
      <style>{`
        @keyframes crt-blink {
          0%, 100% { opacity: 1; }
          50% { opacity: 0; }
        }
        .crt-cursor {
          animation: crt-blink 1.06s step-end infinite;
        }
        .crt-input-caret {
          caret-color: var(--color-accent-green, #00ff66);
        }
      `}</style>
      <div className="flex items-center gap-2 mb-2">
        <img src="/bd-icon.svg" alt="" width={28} height={28} />
        <h1 className="text-2xl font-bold text-foreground text-glow">
          BambooDigital<span className="inline-block w-2.5 h-5 bg-accent-green ml-0.5 crt-cursor" />
        </h1>
      </div>
      <p className="text-muted mb-6">Project Management Tracker v0.1.0</p>
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="border border-accent-red text-accent-red px-3 py-2 text-sm">
            {error}
          </div>
        )}
        <div>
          <label className="block text-sm text-foreground mb-1">Email</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="crt-input-caret w-full bg-background border border-border px-3 py-2 text-foreground focus:border-accent-green focus:outline-none"
            placeholder="user@example.com"
            required
          />
        </div>
        <div>
          <label className="block text-sm text-foreground mb-1">Password</label>
          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="crt-input-caret w-full bg-background border border-border px-3 py-2 text-foreground focus:border-accent-green focus:outline-none pr-10"
              placeholder="••••••••"
              required
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted hover:text-foreground transition-colors"
            >
              {showPassword ? (
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M9.88 9.88a3 3 0 1 0 4.24 4.24"/>
                  <path d="M10.73 5.08A10.43 10.43 0 0 1 12 5c4.478 0 8.268 2.943 9.543 7a10.06 10.06 0 0 1-4.132 5.411"/>
                  <path d="M3 3l18 18"/>
                  <path d="M9.88 9.88a3 3 0 1 0 4.24 4.24"/>
                </svg>
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"/>
                  <circle cx="12" cy="12" r="3"/>
                </svg>
              )}
            </button>
          </div>
        </div>
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={rememberMe}
            onChange={(e) => setRememberMe(e.target.checked)}
            className="w-4 h-4 accent-accent-green"
          />
          <span className="text-xs text-muted">Remember this device for 30 days</span>
        </label>
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-accent-green text-background py-2 font-bold hover:bg-foreground transition-colors disabled:opacity-50"
        >
          {loading ? "AUTHENTICATING..." : "LOGIN"}
        </button>
      </form>
      <p className="mt-4 text-xs text-muted">
        Enter your credentials to continue.
      </p>
      {mounted && (
        isInstalled ? (
          <p className="mt-4 text-xs text-accent-green">App is installed. Enjoy!</p>
        ) : deferredPrompt ? (
          <div className="mt-4 border border-border bg-surface p-3">
            <p className="text-xs text-muted mb-2">Install BambooDigital for quick access from your home screen.</p>
            <button
              type="button"
              onClick={async () => {
                if (!deferredPrompt) return;
                await (deferredPrompt as any).prompt();
                const { outcome } = await (deferredPrompt as any).userChoice;
                if (outcome === "accepted") {
                  setDeferredPrompt(null);
                }
              }}
              className="w-full bg-accent-green text-background py-2 font-bold hover:bg-foreground transition-colors"
            >
              INSTALL APP
            </button>
          </div>
        ) : null
      )}
    </div>
  );
}
