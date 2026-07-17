import { Skeleton, SkeletonCard } from '@/components/ui/skeleton'

export default function AuthenticatedLoading() {
  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header skeleton */}
      <div className="space-y-2">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-4 w-72" />
      </div>

      {/* Stats grid skeleton */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="rounded-[var(--radius-lg)] border border-border-subtle bg-surface-1 p-5 space-y-3">
            <div className="flex items-center justify-between">
              <Skeleton className="h-3 w-24" />
              <Skeleton className="size-9 rounded-[var(--radius-md)]" />
            </div>
            <Skeleton className="h-7 w-32" />
            <Skeleton className="h-3 w-20" />
          </div>
        ))}
      </div>

      {/* Content skeleton */}
      <div className="grid gap-6 lg:grid-cols-7">
        <div className="lg:col-span-4 rounded-[var(--radius-lg)] border border-border-subtle bg-surface-1 p-5 space-y-4">
          <Skeleton className="h-5 w-36" />
          <Skeleton className="h-3 w-56" />
          <div className="flex items-end gap-3 h-44 pt-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} className="flex-1 rounded-t-[var(--radius-sm)]" style={{ height: `${30 + Math.random() * 60}%` }} />
            ))}
          </div>
        </div>
        <div className="lg:col-span-3 rounded-[var(--radius-lg)] border border-border-subtle bg-surface-1 p-5 space-y-3">
          <Skeleton className="h-5 w-36" />
          <Skeleton className="h-3 w-56" />
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="flex items-center justify-between p-3 rounded-[var(--radius-md)] bg-surface-2/40">
              <div className="space-y-1.5">
                <Skeleton className="h-3.5 w-28" />
                <Skeleton className="h-2.5 w-40" />
              </div>
              <Skeleton className="h-5 w-12 rounded-full" />
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
