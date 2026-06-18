"use client";

import { useState, useEffect } from "react";

interface UserData {
  id: string;
  email: string;
  name: string | null;
  role: string;
  createdAt: string;
}

export default function UsersPage() {
  const [users, setUsers] = useState<UserData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function fetchUsers() {
      try {
        const res = await fetch("/api/auth/users");
        if (!res.ok) {
          if (res.status === 403) {
            setError("Admin access required.");
          } else {
            setError("Failed to load users.");
          }
          setLoading(false);
          return;
        }
        const data = await res.json();
        setUsers(data.users);
      } catch {
        setError("Failed to load users.");
      } finally {
        setLoading(false);
      }
    }
    fetchUsers();
  }, []);

  if (loading) return <div className="text-muted text-sm">Loading users...</div>;
  if (error) return <div className="text-accent-red text-sm">{error}</div>;

  return (
    <div>
      <h2 className="text-sm font-bold text-foreground mb-4 text-glow uppercase">Users</h2>
      <div className="border border-border bg-surface overflow-x-auto">
        <table className="w-full text-xs">
          <thead>
            <tr className="text-muted border-b border-border">
              <th className="text-left py-2 px-3">Email</th>
              <th className="text-left py-2 px-3">Name</th>
              <th className="text-left py-2 px-3">Role</th>
              <th className="text-left py-2 px-3">Created</th>
            </tr>
          </thead>
          <tbody>
            {users.map((u) => (
              <tr key={u.id} className="border-b border-border/50">
                <td className="py-2 px-3 text-foreground font-bold">{u.email}</td>
                <td className="py-2 px-3 text-muted">{u.name || "—"}</td>
                <td className="py-2 px-3">
                  <span className={`text-xs px-2 py-0.5 ${u.role === "ADMIN" ? "bg-accent-green text-background" : "border border-border text-muted"}`}>
                    {u.role}
                  </span>
                </td>
                <td className="py-2 px-3 text-muted">{new Date(u.createdAt).toLocaleDateString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
