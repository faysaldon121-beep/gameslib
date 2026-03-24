"use client";

import { useEffect, useMemo, useState } from "react";
import { GENRES, PLATFORMS, slugify } from "@/lib/utils";

interface GameItem { _id: string; title: string; slug: string; genre: string; version?: string; isFeatured?: boolean; averageRating?: number }

const initialForm: any = {
  title: "", slug: "", genre: GENRES[0], description: "", shortDescription: "", coverImage: "", images: "", platforms: ["PC"], version: "1.0", developer: "", publisher: "", releaseDate: "", fileSize: "", installationGuide: "", tags: "", changelog: "", isFeatured: false,
  minOs: "", minCpu: "", minRam: "", minGpu: "", minStorage: "", minDirectx: "",
  recOs: "", recCpu: "", recRam: "", recGpu: "", recStorage: "", recDirectx: "",
  downloadLinks: "",
};

export default function AdminGamesPage() {
  const [games, setGames] = useState<GameItem[]>([]);
  const [form, setForm] = useState(initialForm);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const fetchGames = async () => {
    const res = await fetch("/api/admin/games");
    const data = await res.json();
    setGames(data.games || []);
  };

  useEffect(() => { fetchGames(); }, []);
  useEffect(() => { if (!editingId && form.title && !form.slug) setForm((prev: any) => ({ ...prev, slug: slugify(prev.title) })); }, [form.title, form.slug, editingId]);

  const payload = useMemo(() => ({
    title: form.title,
    slug: form.slug || slugify(form.title),
    genre: form.genre,
    description: form.description,
    shortDescription: form.shortDescription,
    coverImage: form.coverImage,
    images: form.images.split("\n").map((v: string) => v.trim()).filter(Boolean),
    platforms: form.platforms,
    version: form.version,
    developer: form.developer,
    publisher: form.publisher,
    releaseDate: form.releaseDate || undefined,
    fileSize: form.fileSize,
    installationGuide: form.installationGuide.split("\n").map((v: string) => v.trim()).filter(Boolean),
    tags: form.tags.split(",").map((v: string) => v.trim()).filter(Boolean),
    changelog: form.changelog,
    isFeatured: form.isFeatured,
    requirements: {
      minimum: { os: form.minOs, cpu: form.minCpu, ram: form.minRam, gpu: form.minGpu, storage: form.minStorage, directx: form.minDirectx },
      recommended: { os: form.recOs, cpu: form.recCpu, ram: form.recRam, gpu: form.recGpu, storage: form.recStorage, directx: form.recDirectx },
    },
    downloadLinks: form.downloadLinks.split("\n").map((line: string) => line.trim()).filter(Boolean).map((line: string) => {
      const [label, url, size, host] = line.split("|").map((v: string) => v.trim());
      return { label, url, size, host };
    }),
  }), [form]);

  const reset = () => { setForm(initialForm); setEditingId(null); };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const res = await fetch(editingId ? `/api/admin/games/${editingId}` : "/api/admin/games", {
      method: editingId ? "PUT" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    setLoading(false);
    if (!res.ok) return alert("Failed to save game");
    reset();
    fetchGames();
  };

  const editGame = async (id: string) => {
    const res = await fetch(`/api/admin/games/${id}`);
    const game = await res.json();
    setEditingId(id);
    setForm({
      title: game.title || "", slug: game.slug || "", genre: game.genre || GENRES[0], description: game.description || "", shortDescription: game.shortDescription || "", coverImage: game.coverImage || "", images: (game.images || []).join("\n"), platforms: game.platforms || ["PC"], version: game.version || "1.0", developer: game.developer || "", publisher: game.publisher || "", releaseDate: game.releaseDate ? new Date(game.releaseDate).toISOString().slice(0, 10) : "", fileSize: game.fileSize || "", installationGuide: (game.installationGuide || []).join("\n"), tags: (game.tags || []).join(", "), changelog: game.changelog || "", isFeatured: Boolean(game.isFeatured),
      minOs: game.requirements?.minimum?.os || "", minCpu: game.requirements?.minimum?.cpu || "", minRam: game.requirements?.minimum?.ram || "", minGpu: game.requirements?.minimum?.gpu || "", minStorage: game.requirements?.minimum?.storage || "", minDirectx: game.requirements?.minimum?.directx || "",
      recOs: game.requirements?.recommended?.os || "", recCpu: game.requirements?.recommended?.cpu || "", recRam: game.requirements?.recommended?.ram || "", recGpu: game.requirements?.recommended?.gpu || "", recStorage: game.requirements?.recommended?.storage || "", recDirectx: game.requirements?.recommended?.directx || "",
      downloadLinks: (game.downloadLinks || []).map((link: any) => [link.label, link.url, link.size, link.host].filter(Boolean).join(" | ")).join("\n"),
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const deleteGame = async (id: string) => {
    if (!confirm("Delete this game?")) return;
    const res = await fetch(`/api/admin/games/${id}`, { method: "DELETE" });
    if (!res.ok) return alert("Delete failed");
    fetchGames();
  };

  const togglePlatform = (platform: string) => setForm((prev: any) => ({ ...prev, platforms: prev.platforms.includes(platform) ? prev.platforms.filter((item: string) => item !== platform) : [...prev.platforms, platform] }));

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-g-text mb-2">Manage Games</h1>
        <p className="text-g-muted">Create, edit, and delete game pages with SEO metadata and download data.</p>
      </div>
      <form onSubmit={submit} className="card p-6 space-y-5">
        <div className="flex items-center justify-between gap-4">
          <h2 className="text-xl font-bold text-g-text">{editingId ? "Edit game" : "Add new game"}</h2>
          {editingId && <button type="button" onClick={reset} className="btn-secondary">Cancel edit</button>}
        </div>
        <div className="grid md:grid-cols-2 gap-4">
          <input className="input" placeholder="Title" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required />
          <input className="input" placeholder="Slug" value={form.slug} onChange={(e) => setForm({ ...form, slug: e.target.value })} required />
          <select className="input" value={form.genre} onChange={(e) => setForm({ ...form, genre: e.target.value })}>{GENRES.map((genre) => <option key={genre}>{genre}</option>)}</select>
          <input className="input" placeholder="Version" value={form.version} onChange={(e) => setForm({ ...form, version: e.target.value })} />
          <input className="input" placeholder="Developer" value={form.developer} onChange={(e) => setForm({ ...form, developer: e.target.value })} />
          <input className="input" placeholder="Publisher" value={form.publisher} onChange={(e) => setForm({ ...form, publisher: e.target.value })} />
          <input className="input" type="date" value={form.releaseDate} onChange={(e) => setForm({ ...form, releaseDate: e.target.value })} />
          <input className="input" placeholder="File size e.g. 24 GB" value={form.fileSize} onChange={(e) => setForm({ ...form, fileSize: e.target.value })} />
          <input className="input md:col-span-2" placeholder="Cover image URL" value={form.coverImage} onChange={(e) => setForm({ ...form, coverImage: e.target.value })} />
          <textarea className="input md:col-span-2 resize-none" rows={2} placeholder="Short description" value={form.shortDescription} onChange={(e) => setForm({ ...form, shortDescription: e.target.value })} />
          <textarea className="input md:col-span-2 resize-none" rows={5} placeholder="Full description" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} required />
        </div>
        <div>
          <div className="text-sm font-medium text-g-text mb-2">Platforms</div>
          <div className="flex flex-wrap gap-2">{PLATFORMS.map((platform) => <label key={platform} className={`px-3 py-2 rounded-lg border cursor-pointer ${form.platforms.includes(platform) ? "border-g-purple text-g-text" : "border-g-border text-g-muted"}`}><input type="checkbox" className="hidden" checked={form.platforms.includes(platform)} onChange={() => togglePlatform(platform)} />{platform}</label>)}</div>
        </div>
        <div className="grid md:grid-cols-2 gap-4">
          <textarea className="input resize-none" rows={4} placeholder="Image URLs, one per line" value={form.images} onChange={(e) => setForm({ ...form, images: e.target.value })} />
          <textarea className="input resize-none" rows={4} placeholder="Tags, comma separated" value={form.tags} onChange={(e) => setForm({ ...form, tags: e.target.value })} />
          <textarea className="input resize-none" rows={4} placeholder="Install guide, one step per line" value={form.installationGuide} onChange={(e) => setForm({ ...form, installationGuide: e.target.value })} />
          <textarea className="input resize-none" rows={4} placeholder="Download links: Label | URL | Size | Host, one per line" value={form.downloadLinks} onChange={(e) => setForm({ ...form, downloadLinks: e.target.value })} />
          <textarea className="input md:col-span-2 resize-none" rows={3} placeholder="Changelog" value={form.changelog} onChange={(e) => setForm({ ...form, changelog: e.target.value })} />
        </div>
        <div className="grid md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <h3 className="font-semibold text-g-text">Minimum requirements</h3>
            {[["minOs", "OS"], ["minCpu", "CPU"], ["minRam", "RAM"], ["minGpu", "GPU"], ["minStorage", "Storage"], ["minDirectx", "DirectX"]].map(([key, label]) => <input key={key} className="input" placeholder={label} value={(form as any)[key]} onChange={(e) => setForm({ ...form, [key]: e.target.value })} />)}
          </div>
          <div className="space-y-2">
            <h3 className="font-semibold text-g-text">Recommended requirements</h3>
            {[["recOs", "OS"], ["recCpu", "CPU"], ["recRam", "RAM"], ["recGpu", "GPU"], ["recStorage", "Storage"], ["recDirectx", "DirectX"]].map(([key, label]) => <input key={key} className="input" placeholder={label} value={(form as any)[key]} onChange={(e) => setForm({ ...form, [key]: e.target.value })} />)}
          </div>
        </div>
        <label className="flex items-center gap-3 text-sm text-g-text"><input type="checkbox" checked={form.isFeatured} onChange={(e) => setForm({ ...form, isFeatured: e.target.checked })} /> Featured game</label>
        <button className="btn-primary" disabled={loading}>{loading ? "Saving..." : editingId ? "Update game" : "Create game"}</button>
      </form>
      <div className="card overflow-hidden">
        <div className="p-5 border-b border-g-border"><h2 className="text-xl font-bold text-g-text">Existing games</h2></div>
        <div className="divide-y divide-g-border">
          {games.map((game) => (
            <div key={game._id} className="p-5 flex flex-col md:flex-row md:items-center md:justify-between gap-3">
              <div>
                <div className="font-semibold text-g-text">{game.title}</div>
                <div className="text-sm text-g-muted">/{game.slug} · {game.genre} · {game.version || "1.0"}</div>
              </div>
              <div className="flex gap-2">
                <button className="btn-secondary" onClick={() => editGame(game._id)}>Edit</button>
                <button className="btn-secondary border-g-red text-g-red" onClick={() => deleteGame(game._id)}>Delete</button>
              </div>
            </div>
          ))}
          {games.length === 0 && <div className="p-5 text-g-muted">No games yet.</div>}
        </div>
      </div>
    </div>
  );
}
