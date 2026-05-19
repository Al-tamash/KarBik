/**
 * Skeleton — Loading placeholder for premium UI
 *
 * Use this to mimic the shape of content before it loads.
 * This reduces layout shift (CLS) and feels much more "premium" 
 * than a simple loading spinner.
 */
export default function Skeleton({ className, ...props }) {
  return (
    <div
      className={`animate-pulse rounded-md bg-neutral-200 ${className}`}
      {...props}
    />
  );
}

export function CarCardSkeleton() {
  return (
    <div className="rounded-3xl border border-neutral-200 bg-white overflow-hidden shadow-sm">
      {/* Image area skeleton */}
      <div className="aspect-4/3 bg-neutral-200 animate-pulse" />
      
      {/* Text content skeleton */}
      <div className="p-5 space-y-3">
        <div className="flex justify-between">
           <Skeleton className="h-3 w-16" />
           <Skeleton className="h-3 w-4 rounded-full" />
        </div>
        <Skeleton className="h-5 w-full" />
        <Skeleton className="h-4 w-2/3" />
        <Skeleton className="h-7 w-24 mt-2" />
      </div>
    </div>
  );
}
