"use client";

import Link from "next/link";
import { Menu, Search, X } from "lucide-react";
import { useState } from "react";
import useSearch from "@/hooks/useSearch";

const links = [
  { href: "/games", label: "Games" },
  { href: "/request", label: "Request" },
  { href: "/sponsors", label: "Sponsors" },
  { href: "/donate", label: "Donate" },
];

export default function Header() {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const { results } = useSearch(query);

  return (
    <header className="sticky top-0 z-40 border-b border-g-border bg-g-bg/90 backdrop-blur">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        <Link href="/" className="text-xl font-bold text-white tracking-tight">
          Games<span className="text-g-purple">lib</span>
        </Link>

        <nav className="hidden md:flex items-center gap-6 text-sm text-g-muted">
          {links.map((link) => (
            <Link key={link.href} href={link.href} className="hover:text-g-text transition-colors">
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="hidden md:block relative w-full max-w-sm">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-g-muted" />
          <input
            className="input pl-9"
            placeholder="Quick search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          {query && results.length > 0 && (
            <div className="absolute mt-2 w-full rounded-xl border border-g-border bg-g-card p-2 shadow-2xl">
              {results.slice(0, 5).map((game) => (
                <Link
                  key={game._id}
                  href={`/games/${game.slug}`}
                  onClick={() => setQuery("")}
                  className="block rounded-lg px-3 py-2 hover:bg-g-border"
                >
                  <div className="font-medium text-g-text">{game.title}</div>
                  <div className="text-xs text-g-muted">{game.genre}</div>
                </Link>
              ))}
            </div>
          )}
        </div>

        <button className="md:hidden btn-secondary px-3 py-2" onClick={() => setOpen((v) => !v)} aria-label="Toggle menu">
          {open ? <X size={18} /> : <Menu size={18} />}
        </button>
      </div>

      {open && (
        <div className="md:hidden border-t border-g-border px-4 pb-4 pt-3 space-y-3 bg-g-bg">
          {links.map((link) => (
            <Link key={link.href} href={link.href} onClick={() => setOpen(false)} className="block text-g-muted hover:text-g-text">
              {link.label}
            </Link>
          ))}
        </div>
      )}
    </header>
  );
}
