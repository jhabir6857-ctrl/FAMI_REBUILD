export function SkeletonCard() {
  return (
    <div className="flex flex-col gap-3" aria-hidden="true">
      <div className="aspect-[4/5] w-full animate-pulse rounded-[var(--radius-sm)] bg-[var(--color-parchment-200)]" />
      <div className="h-4 w-3/4 animate-pulse rounded bg-[var(--color-parchment-200)]" />
      <div className="h-4 w-1/3 animate-pulse rounded bg-[var(--color-parchment-200)]" />
    </div>
  )
}

export function SkeletonGrid({ count = 8 }: { count?: number }) {
  return (
    <div className="grid grid-cols-2 gap-x-4 gap-y-8 md:grid-cols-3 lg:grid-cols-4" role="status" aria-label="Loading products">
      {Array.from({ length: count }).map((_, i) => (
        <SkeletonCard key={i} />
      ))}
    </div>
  )
}
