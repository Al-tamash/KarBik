/**
 * Skeleton — Loading placeholder for premium UI
 *
 * WHAT: Highly accurate loading skeleton matching the actual content layouts.
 * WHY: Mimics the exact card grid blocks to prevent layout shifts (CLS),
 *      making the page transition from loading to loaded feel seamless and premium.
 */
export default function Skeleton({ className = "", ...props }: { className?: string } & React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={`animate-pulse bg-neutral-200 ${className}`}
      {...props}
    />
  );
}

export function CarCardSkeleton() {
  return (
    <div className="rounded-2xl border border-neutral-200/50 bg-white overflow-hidden shadow-xs">
      
      {/* 1. Image area skeleton */}
      <div className="aspect-video bg-neutral-200 animate-pulse" />
      
      {/* 2. Text content area skeleton */}
      <div className="p-5 pb-0">
        
        {/* Status badges placeholder row */}
        <div className="flex gap-2 mb-3">
          <Skeleton className="h-4.5 w-16 rounded-md" />
          <Skeleton className="h-4.5 w-12 rounded-md" />
        </div>
        
        {/* Title & subtitle placeholder */}
        <Skeleton className="h-5 w-4/5 rounded-md" />
        <Skeleton className="h-3.5 w-1/3 rounded-md mt-2" />
        
        {/* Specs grid placeholder mirroring CarCard specs */}
        <div className="grid grid-cols-2 gap-y-3 gap-x-4 py-3 border-y border-neutral-100 my-4">
          <div className="flex items-center gap-1.5">
            <Skeleton className="h-3.5 w-3.5 rounded-full shrink-0" />
            <Skeleton className="h-3.5 w-12 rounded-md" />
          </div>
          <div className="flex items-center gap-1.5">
            <Skeleton className="h-3.5 w-3.5 rounded-full shrink-0" />
            <Skeleton className="h-3.5 w-14 rounded-md" />
          </div>
          <div className="flex items-center gap-1.5">
            <Skeleton className="h-3.5 w-3.5 rounded-full shrink-0" />
            <Skeleton className="h-3.5 w-16 rounded-md" />
          </div>
          <div className="flex items-center gap-1.5">
            <Skeleton className="h-3.5 w-3.5 rounded-full shrink-0" />
            <Skeleton className="h-3.5 w-14 rounded-md" />
          </div>
        </div>
        
        {/* Price and EMI details row */}
        <div className="flex items-baseline justify-between mt-1">
          <div>
            <Skeleton className="h-6 w-24 rounded-md" />
            <Skeleton className="h-3 w-16 rounded-md mt-1.5" />
          </div>
          <Skeleton className="h-4.5 w-16 rounded-full" />
        </div>

      </div>

      {/* 3. CTA Action buttons row skeleton */}
      <div className="p-5 pt-0">
        <div className="flex items-center gap-2 mt-4.5">
          <Skeleton className="h-9.5 rounded-xl flex-1" />
          <Skeleton className="h-9.5 w-9.5 rounded-full" />
        </div>
      </div>

    </div>
  );
}
