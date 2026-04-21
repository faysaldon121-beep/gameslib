export default function Loading() {
  return (
    <div className="min-h-screen bg-g-bg">
      <section className="bg-gradient-to-r from-purple-900 to-blue-900 py-16">
        <div className="container mx-auto px-4">
          <div className="h-12 bg-white/20 rounded w-64 mb-4 animate-pulse" />
          <div className="h-6 bg-white/10 rounded w-96 animate-pulse" />
        </div>
      </section>

      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-6">
          {[...Array(12)].map((_, i) => (
            <div key={i} className="bg-g-secondary rounded-lg overflow-hidden animate-pulse">
              <div className="aspect-[3/4] bg-g-border" />
              <div className="p-4">
                <div className="h-4 bg-g-border rounded mb-2" />
                <div className="h-3 bg-g-border rounded w-2/3" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
