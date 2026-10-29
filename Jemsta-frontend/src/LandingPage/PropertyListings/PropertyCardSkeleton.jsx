// Ghost/skeleton placeholder shaped exactly like PropertyCard, so the grid
// doesn't jump when real cards swap in. Purely presentational — no props.
const PropertyCardSkeleton = () => (
  <div className="bg-white rounded-xl overflow-hidden border border-gray-100 shadow-sm animate-pulse">
    <div className="relative h-52 bg-gray-200">
      <div className="absolute top-3 left-3 h-5 w-20 bg-gray-300/80 rounded-full" />
      <div className="absolute bottom-3 right-3 h-7 w-24 bg-gray-300/80 rounded-lg" />
    </div>

    <div className="p-4">
      <div className="h-4 bg-gray-200 rounded w-5/6 mb-2" />
      <div className="h-4 bg-gray-200 rounded w-2/3 mb-3" />
      <div className="h-3 bg-gray-200 rounded w-1/2 mb-3" />

      <div className="flex items-center gap-4 mt-3 pt-3 border-t border-gray-100">
        <div className="h-3 bg-gray-200 rounded w-12" />
        <div className="h-3 bg-gray-200 rounded w-12" />
        <div className="h-3 bg-gray-200 rounded w-14" />
      </div>
    </div>
  </div>
);

export default PropertyCardSkeleton;