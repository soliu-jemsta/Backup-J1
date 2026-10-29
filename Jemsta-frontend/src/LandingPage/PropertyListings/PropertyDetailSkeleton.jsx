// Ghost/skeleton placeholder matching PropertyDetail's layout, so the page
// doesn't jump when real data swaps in.
const Bar = ({ className = '' }) => <div className={`bg-gray-200 rounded ${className}`} />;

const PropertyDetailSkeleton = () => (
  <section className="pt-32 bg-gray-50">
    <div className="max-w-6xl mx-auto px-4 animate-pulse">
      <Bar className="h-4 w-40 mb-6" />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        {/* Left: gallery + description */}
        <div className="lg:col-span-2">
          <div className="w-full aspect-[4/3] md:aspect-[16/10] rounded-xl bg-gray-200" />

          <div className="flex gap-2 mt-3">
            {[0, 1, 2, 3].map((i) => (
              <div key={i} className="w-20 h-16 rounded-lg bg-gray-200 shrink-0" />
            ))}
          </div>

          <div className="mt-8">
            <Bar className="h-5 w-24 mb-3 rounded-full" />
            <Bar className="h-7 w-3/4 mb-2" />
            <Bar className="h-4 w-1/2 mb-5" />

            <div className="flex items-center gap-6 py-5 border-y border-gray-200">
              <Bar className="h-4 w-16" />
              <Bar className="h-4 w-16" />
              <Bar className="h-4 w-20" />
            </div>

            <div className="mt-6">
              <Bar className="h-5 w-40 mb-3" />
              <Bar className="h-3 w-full mb-2" />
              <Bar className="h-3 w-full mb-2" />
              <Bar className="h-3 w-2/3" />
            </div>

            <div className="mt-8">
              <Bar className="h-5 w-24 mb-3" />
              <div className="grid grid-cols-2 gap-x-6 gap-y-2.5">
                {[0, 1, 2, 3, 4, 5].map((i) => (
                  <Bar key={i} className="h-3 w-4/5" />
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Right: sticky price + contact panel */}
        <aside className="lg:col-span-1">
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
            <Bar className="h-7 w-32 mb-3" />
            <Bar className="h-3 w-40 mb-5" />
            <div className="h-11 bg-gray-200 rounded-lg mb-3" />
            <div className="h-11 bg-gray-200 rounded-lg" />
          </div>
        </aside>
      </div>
    </div>
  </section>
);

export default PropertyDetailSkeleton;