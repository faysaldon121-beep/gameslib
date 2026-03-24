"use client";

import type React from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";

export default function AdminLoginClient() {
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const res = await fetch("/api/admin/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password }),
    });

    if (!res.ok) {
      setError("Invalid password");
      setLoading(false);
      return;
    }

    router.push(searchParams.get("from") || "/admin");
    router.refresh();
  };

  return (
    <div className="max-w-md mx-auto px-4 py-24">
      <div className="card p-8">
        <h1 className="text-2xl font-bold text-g-text mb-2">Admin Login</h1>
        <p className="text-g-muted text-sm mb-6">
          Enter the admin password to manage Gameslib.
        </p>
        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="password"
            className="input"
            placeholder="Admin password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          {error && <p className="text-sm text-g-red">{error}</p>}
          <button
            className="btn-primary w-full justify-center"
            disabled={loading}
          >
            {loading ? "Signing in..." : "Login"}
          </button>
        </form>
      </div>
    </div>
  );
}
