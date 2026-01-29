/**
 * SearchSkeleton - Loading skeleton for search results
 */

function SearchSkeleton() {
  return (
    <div className="
      bg-white
      border-2 border-[#111111]
      rounded-xl
      shadow-[4px_4px_0_#111111]
      p-5
      animate-pulse
    ">
      {/* Type Badge Skeleton */}
      <div className="w-20 h-6 bg-[#E8E8E4] rounded-lg mb-3" />

      {/* Title Skeleton */}
      <div className="w-3/4 h-6 bg-[#E8E8E4] rounded-lg mb-3" />

      {/* Snippet Skeleton */}
      <div className="space-y-2 mb-4">
        <div className="w-full h-4 bg-[#E8E8E4] rounded" />
        <div className="w-full h-4 bg-[#E8E8E4] rounded" />
        <div className="w-2/3 h-4 bg-[#E8E8E4] rounded" />
      </div>

      {/* Source Skeleton */}
      <div className="w-32 h-4 bg-[#E8E8E4] rounded mb-4" />

      {/* Buttons Skeleton */}
      <div className="flex gap-2 pt-3 border-t-2 border-[#111111]/10">
        <div className="w-32 h-9 bg-[#E8E8E4] rounded-lg" />
        <div className="w-24 h-9 bg-[#E8E8E4] rounded-lg" />
      </div>
    </div>
  )
}

export default SearchSkeleton
