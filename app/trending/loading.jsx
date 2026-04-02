export default function TrendingLoading() {
  return (
    <main className="min-h-screen bg-[#0a0a0f]">
      {/* Hero skeleton */}
      <section className="border-b border-white/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24">
          <div className="flex flex-col items-center gap-4">
            <div className="h-8 w-36 bg-white/5 rounded-full animate-pulse" />
            <div className="h-12 w-96 bg-white/5 rounded-lg animate-pulse" />
            <div className="h-5 w-80 bg-white/5 rounded-lg animate-pulse" />
          </div>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {/* Stats skeleton */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-10">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-20 rounded-xl bg-white/[0.03] border border-white/[0.06] animate-pulse" />
          ))}
        </div>

        {/* Tabs skeleton */}
        <div className="flex items-center gap-4 mb-8">
          <div className="h-12 w-72 bg-white/[0.04] rounded-xl animate-pulse" />
          <div className="ml-auto h-10 w-48 bg-white/[0.04] rounded-lg animate-pulse" />
        </div>

        {/* Cards skeleton */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {Array.from({ length: 8 }).map((_, i) => (
            <div
              key={i}
              className="rounded-2xl overflow-hidden bg-white/[0.03] border border-white/[0.06] animate-pulse"
            >
              <div className="aspect-[16/10] bg-white/5" />
              <div className="p-4 space-y-3">
                <div className="h-4 w-3/4 bg-white/5 rounded" />
                <div className="h-3 w-16 bg-white/5 rounded" />
                <div className="h-3 w-full bg-white/5 rounded" />
                <div className="h-3 w-2/3 bg-white/5 rounded" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
