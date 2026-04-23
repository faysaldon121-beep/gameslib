export default function NewsDetailLoading() {
  return (
    <div className="min-h-screen bg-black">
      <div className="relative h-[600px] bg-g-secondary animate-pulse">
        <div className="absolute bottom-0 left-0 right-0 p-8">
          <div className="container mx-auto max-w-4xl space-y-4">
            <div className="h-4 bg-g-border rounded w-32" />
            <div className="h-16 bg-g-border rounded w-3/4" />
            <div className="h-6 bg-g-border rounded w-full" />
            <div className="flex gap-4">
              <div className="h-4 bg-g-border rounded w-24" />
              <div className="h-4 bg-g-border rounded w-24" />
              <div className="h-4 bg-g-border rounded w-24" />
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-12 max-w-4xl">
        <div className="space-y-4 animate-pulse">
          {[...Array(10)].map((_, i) => (
            <div key={i} className="h-4 bg-g-secondary rounded w-full" />
          ))}
        </div>
      </div>
    </div>
  );
}
