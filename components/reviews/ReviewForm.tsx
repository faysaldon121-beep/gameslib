"use client";

import { useState } from "react";
import StarRating from "@/components/reviews/StarRating";

export default function ReviewForm({ gameSlug, gameId }: { gameSlug: string; gameId: string }) {
  const [form, setForm] = useState({ userName: "", userEmail: "", rating: 5, title: "", body: "" });
  const [honeypot, setHoneypot] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (honeypot) return;
    setStatus("loading");
    try {
      const res = await fetch("/api/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, honeypot, gameSlug, gameId }),
      });
      if (!res.ok) throw new Error();
      setStatus("success");
      setForm({ userName: "", userEmail: "", rating: 5, title: "", body: "" });
    } catch {
      setStatus("error");
    }
  };

  return (
    <form onSubmit={submit} className="space-y-4">
      <input className="hidden" value={honeypot} onChange={(e) => setHoneypot(e.target.value)} tabIndex={-1} autoComplete="off" />
      <div className="grid md:grid-cols-2 gap-4">
        <input className="input" placeholder="Your name" value={form.userName} onChange={(e) => setForm({ ...form, userName: e.target.value })} required />
        <input className="input" type="email" placeholder="Email" value={form.userEmail} onChange={(e) => setForm({ ...form, userEmail: e.target.value })} required />
      </div>
      <div>
        <label className="text-sm font-medium text-g-text block mb-2">Rating</label>
        <StarRating rating={form.rating} onChange={(rating) => setForm({ ...form, rating })} />
      </div>
      <input className="input" placeholder="Review title" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required />
      <textarea className="input resize-none" rows={5} minLength={20} maxLength={2000} placeholder="Share your experience, performance, bugs, and settings..." value={form.body} onChange={(e) => setForm({ ...form, body: e.target.value })} required />
      {status === "success" && <p className="text-sm text-g-green">Thanks. Your review was submitted for approval.</p>}
      {status === "error" && <p className="text-sm text-g-red">Could not submit your review right now.</p>}
      <button className="btn-primary" disabled={status === "loading"}>
        {status === "loading" ? "Submitting..." : "Submit Review"}
      </button>
    </form>
  );
}
