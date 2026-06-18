"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
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
      <div className="flex items-center gap-2 mb-2">
        <img src="/bd-icon.svg" alt="" width={28} height={28} />
        <h1 className="text-2xl font-bold text-foreground text-glow">BambooDigital</h1>
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
            className="w-full bg-background border border-border px-3 py-2 text-foreground focus:border-accent-green focus:outline-none"
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
              className="w-full bg-background border border-border px-3 py-2 text-foreground focus:border-accent-green focus:outline-none pr-10"
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
      <div className="mt-4 border border-border bg-surface p-3">
        <p className="text-xs text-muted font-bold uppercase mb-1">Install as App</p>
        <p className="text-xs text-muted">
          You can install BambooDigital as a PWA on your device for quick access:
        </p>
        <ul className="mt-1 text-xs text-muted list-disc list-inside space-y-0.5">
          <li><strong>Chrome / Edge:</strong> Click the icon in the address bar (or menu {'>'} Install)</li>
          <li><strong>Safari (iOS):</strong> Share {'>'} Add to Home Screen</li>
          <li><strong>Safari (macOS):</strong> File {'>'} Add to Dock</li>
        </ul>
      </div>
    </div>
  );
}
