import { NewspaperIcon } from '@heroicons/react/24/outline';

export default function NewsLoading() {
  return (
    <div className="min-h-screen bg-black">
      <section className="bg-gradient-to-r from-purple-900 via-blue-900 to-purple-900 py-16">
        <div className="container mx-auto px-4 text-center">
          <div className="flex items-center justify-center gap-3 mb-4">
            <NewspaperIcon className="w-12 h-12 text-white animate-pulse" />
            <div className="h-16 bg-white/20 rounded-lg w-96 animate-pulse" />
          </div>
          <div className="h-8 bg-white/10 rounded-lg w-[600px] mx-auto mb-8 animate-pulse" />
          <div className="h-14 bg-white/10 rounded-full w-[500px] mx-auto animate-pulse" />
        </div>
      </section>

      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          <main className="lg:w-2/3">
            <div className="h-8 bg-g-secondary rounded w-48 mb-8 animate-pulse" />
            
            <div className="grid md:grid-cols-2 gap-6">
              {[...Array(6)].map((_, i) => (
                <div
                  key={i}
                  className="bg-g-secondary rounded-xl overflow-hidden animate-pulse"
                >
                  <div className="h-48 bg-g-border" />
                  <div className="p-5 space-y-3">
                    <div className="h-4 bg-g-border rounded w-3/4" />
                    <div className="h-4 bg-g-border rounded w-full" />
                    <div className="h-4 bg-g-border rounded w-5/6" />
                  </div>
                </div>
              ))}
            </div>
          </main>

          <aside className="lg:w-1/3">
            <div className="space-y-8">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="bg-g-secondary p-6 rounded-xl animate-pulse">
                  <div className="h-6 bg-g-border rounded w-32 mb-4" />
                  <div className="space-y-3">
                    <div className="h-4 bg-g-border rounded" />
                    <div className="h-4 bg-g-border rounded" />
                    <div className="h-4 bg-g-border rounded" />
                  </div>
                </div>
              ))}
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
