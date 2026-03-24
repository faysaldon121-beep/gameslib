"use client";

import { useEffect, useState } from "react";

const initialForm = { name: "", logoUrl: "", tier: "bronze", amount: 1000, websiteUrl: "", expiryDate: "", isActive: true };

export default function AdminSponsorsPage() {
  const [sponsors, setSponsors] = useState<any[]>([]);
  const [form, setForm] = useState<any>(initialForm);
  const [editingId, setEditingId] = useState<string | null>(null);

  const fetchSponsors = async () => {
    const res = await fetch("/api/admin/sponsors");
    const data = await res.json();
    setSponsors(data.sponsors || []);
  };

  useEffect(() => { fetchSponsors(); }, []);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await fetch(editingId ? `/api/admin/sponsors/${editingId}` : "/api/admin/sponsors", {
      method: editingId ? "PUT" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    if (!res.ok) return alert("Failed to save sponsor");
    setForm(initialForm);
    setEditingId(null);
    fetchSponsors();
  };

  const editSponsor = (item: any) => {
    setEditingId(item._id);
    setForm({ ...item, expiryDate: item.expiryDate ? new Date(item.expiryDate).toISOString().slice(0, 10) : "" });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const deleteSponsor = async (id: string) => {
    if (!confirm("Delete sponsor?")) return;
    const res = await fetch(`/api/admin/sponsors/${id}`, { method: "DELETE" });
    if (res.ok) fetchSponsors();
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-g-text mb-2">Manage Sponsors</h1>
        <p className="text-g-muted">Maintain sponsor visibility and homepage wall data.</p>
      </div>
      <form onSubmit={submit} className="card p-6 space-y-4">
        <div className="flex items-center justify-between gap-4">
          <h2 className="text-xl font-bold text-g-text">{editingId ? "Edit sponsor" : "Add sponsor"}</h2>
          {editingId && <button type="button" className="btn-secondary" onClick={() => { setEditingId(null); setForm(initialForm); }}>Cancel</button>}
        </div>
        <div className="grid md:grid-cols-2 gap-4">
          <input className="input" placeholder="Sponsor name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
          <input className="input" placeholder="Logo URL" value={form.logoUrl} onChange={(e) => setForm({ ...form, logoUrl: e.target.value })} />
          <select className="input" value={form.tier} onChange={(e) => setForm({ ...form, tier: e.target.value })}><option value="bronze">Bronze</option><option value="silver">Silver</option><option value="gold">Gold</option></select>
          <input className="input" type="number" placeholder="Amount in cents" value={form.amount} onChange={(e) => setForm({ ...form, amount: Number(e.target.value) })} required />
          <input className="input" placeholder="Website URL" value={form.websiteUrl} onChange={(e) => setForm({ ...form, websiteUrl: e.target.value })} />
          <input className="input" type="date" value={form.expiryDate} onChange={(e) => setForm({ ...form, expiryDate: e.target.value })} required />
        </div>
        <label className="flex items-center gap-2 text-sm text-g-text"><input type="checkbox" checked={form.isActive} onChange={(e) => setForm({ ...form, isActive: e.target.checked })} /> Active</label>
        <button className="btn-primary">{editingId ? "Update sponsor" : "Create sponsor"}</button>
      </form>
      <div className="space-y-4">
        {sponsors.map((item) => (
          <div key={item._id} className="card p-5 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <div className="font-semibold text-g-text">{item.name}</div>
              <div className="text-sm text-g-muted capitalize">{item.tier} · {item.amount} cents · {item.isActive ? "Active" : "Inactive"}</div>
            </div>
            <div className="flex gap-2">
              <button className="btn-secondary" onClick={() => editSponsor(item)}>Edit</button>
              <button className="btn-secondary border-g-red text-g-red" onClick={() => deleteSponsor(item._id)}>Delete</button>
            </div>
          </div>
        ))}
        {sponsors.length === 0 && <div className="card p-5 text-g-muted">No sponsors yet.</div>}
      </div>
    </div>
  );
}
