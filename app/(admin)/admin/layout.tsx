import Link from "next/link";

const items = [
  { href: "/admin", label: "Dashboard" },
  { href: "/admin/games", label: "Games" },
  { href: "/admin/requests", label: "Requests" },
  { href: "/admin/reviews", label: "Reviews" },
  { href: "/admin/sponsors", label: "Sponsors" },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="flex flex-col lg:flex-row gap-8">
        <aside className="lg:w-64 shrink-0">
          <div className="card p-5 sticky top-24">
            <h1 className="text-xl font-bold text-g-text mb-4">Admin Panel</h1>
            <nav className="space-y-2">
              {items.map((item) => (
                <Link key={item.href} href={item.href} className="block rounded-lg px-3 py-2 text-sm text-g-muted hover:bg-g-border hover:text-g-text">
                  {item.label}
                </Link>
              ))}
            </nav>
            <form action="/api/admin/logout" method="post" className="mt-5">
              <button className="btn-secondary w-full justify-center">Logout</button>
            </form>
          </div>
        </aside>
        <section className="flex-1 min-w-0">{children}</section>
      </div>
    </div>
  );
}
