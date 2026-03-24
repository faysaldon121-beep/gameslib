"use client";
import { useState } from "react";
import { Send, CheckCircle } from "lucide-react";

export default function RequestPage() {
  const [form, setForm] = useState({ gameName: "", userEmail: "", message: "" });
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [honeypot, setHoneypot] = useState("");
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (honeypot) return;
    setStatus("loading");
    try {
      const res = await fetch("/api/requests", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) });
      if (!res.ok) throw new Error(await res.text());
      setStatus("success");
    } catch {
      setStatus("error");
    }
  };
  if (status === "success") {
    return <div className="max-w-lg mx-auto px-4 py-24 text-center"><CheckCircle size={48} className="text-g-green mx-auto mb-4" /><h1 className="text-2xl font-bold text-g-text mb-2">Request Received!</h1><p className="text-g-muted">We&apos;ll review your request and add the game if possible. Thank you!</p><a href="/games" className="btn-primary mt-6 inline-flex">Browse Games</a></div>;
  }
  return (
    <div className="max-w-lg mx-auto px-4 sm:px-6 lg:px-8 py-16">
      <h1 className="text-3xl font-bold text-g-text mb-2">Request a Game</h1>
      <p className="text-g-muted mb-8">Can&apos;t find a game in our library? Let us know and we&apos;ll try to add it.</p>
      <form onSubmit={handleSubmit} className="space-y-5">
        <input type="text" tabIndex={-1} autoComplete="off" aria-hidden="true" className="hidden" value={honeypot} onChange={(e) => setHoneypot(e.target.value)} />
        <div><label className="block text-sm font-medium text-g-text mb-1.5">Game Name *</label><input className="input" required placeholder="e.g. Cyberpunk 2077" value={form.gameName} onChange={(e) => setForm({ ...form, gameName: e.target.value })} /></div>
        <div><label className="block text-sm font-medium text-g-text mb-1.5">Your Email *</label><input type="email" className="input" required placeholder="you@example.com" value={form.userEmail} onChange={(e) => setForm({ ...form, userEmail: e.target.value })} /></div>
        <div><label className="block text-sm font-medium text-g-text mb-1.5">Additional Info</label><textarea className="input resize-none" rows={4} placeholder="Platform, version, or anything else helpful..." value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} /></div>
        {status === "error" && <p className="text-g-red text-sm">Something went wrong. You may have already submitted a request recently.</p>}
        <button type="submit" disabled={status === "loading"} className="btn-primary w-full justify-center"><Send size={16} />{status === "loading" ? "Submitting..." : "Submit Request"}</button>
      </form>
    </div>
  );
}
