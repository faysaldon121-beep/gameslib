import Link from "next/link";

export default function Footer() {
  return (
    <footer className="border-t border-g-border mt-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 grid gap-8 md:grid-cols-4">
        <div>
          <h3 className="font-bold text-g-text mb-3">Gameslib</h3>
          <p className="text-sm text-g-muted leading-6">
            Free PC game discovery with direct links, installation guides, system requirements, and community reviews.
          </p>
        </div>
        <div>
          <h4 className="font-semibold text-g-text mb-3">Browse</h4>
          <div className="space-y-2 text-sm text-g-muted">
            <Link href="/games" className="block hover:text-g-text">All Games</Link>
            <Link href="/request" className="block hover:text-g-text">Request a Game</Link>
            <Link href="/sponsors" className="block hover:text-g-text">Sponsors</Link>
          </div>
        </div>
        <div>
          <h4 className="font-semibold text-g-text mb-3">Support</h4>
          <div className="space-y-2 text-sm text-g-muted">
            <Link href="/donate" className="block hover:text-g-text">Donate</Link>
            <Link href="/admin" className="block hover:text-g-text">Admin</Link>
          </div>
        </div>
        <div>
          <h4 className="font-semibold text-g-text mb-3">Legal</h4>
          <div className="space-y-2 text-sm text-g-muted">
            <Link href="/sitemap.xml" className="block hover:text-g-text">Sitemap</Link>
            <Link href="/privacy-policy" className="block hover:text-g-text">Privacy Policy</Link>
          </div>
        </div>
      </div>
      <div className="border-t border-g-border py-4 text-center text-xs text-g-muted">
        © {new Date().getFullYear()} Gameslib. Built for the level of Gaming Expierience.
      </div>
    </footer>
  );
}
