import Link from "next/link";
import { Download, Search, Sparkles } from "lucide-react";

export default function HeroSection({ totalGames }: { totalGames: number }) {
  return (
    <section className="relative overflow-hidden border-b border-g-border">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(124,58,237,0.25),transparent_45%)]" />
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 lg:py-32">
        <div className="max-w-3xl">
          <div className="inline-flex items-center gap-2 rounded-full border border-g-purple/20 bg-g-purple/10 px-4 py-2 text-sm text-g-purpleLight mb-6">
            <Sparkles size={16} /> The best ever Games for you right on the go powered by community rivews
          </div>
          <h1 className="text-4xl md:text-6xl font-black tracking-tight text-white leading-tight">
            Discover free PC games with real reviews and direct download guides.
            Forget the husle, frustrating ads and virus files
          </h1>
          <p className="mt-6 text-lg text-g-muted leading-8 max-w-2xl">
            Browse {totalGames}+ games with screenshots, system requirements, installation steps, and community insight that keeps every page fresh and searchable.
          </p>
          <div className="mt-8 flex flex-wrap gap-4">
            <Link href="/games" className="btn-primary">
              <Search size={18} /> Browse library
            </Link>
            <Link href="/request" className="btn-secondary">
              <Download size={18} /> Request a game
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
