import { Skeleton } from '@/components/ui/skeleton'

export const ProductGridSkeleton = () => {
  return (
    <div className="w-full p-6 md:p-8">
      <div className="mb-6 flex items-center justify-between">
        <div className="space-y-2">
          <Skeleton className="h-9 w-64" />
          <Skeleton className="h-4 w-48" />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {Array.from({ length: 8 }).map((_, index) => (
          <ProductCardSkeleton key={index} />
        ))}
      </div>
    </div>
  )
}

const ProductCardSkeleton = () => {
  return (
    <div className="group overflow-hidden border border-border rounded-lg">
      {/* Image skeleton */}
      <Skeleton className="aspect-square w-full" />

      {/* Content skeleton */}
      <div className="p-4 space-y-2">
        <div className="space-y-1">
          <Skeleton className="h-5 w-3/4" />
          <Skeleton className="h-4 w-full" />
        </div>
        <div className="flex items-center justify-between pt-2">
          <Skeleton className="h-6 w-20" />
          <Skeleton className="h-9 w-24 rounded-md" />
        </div>
      </div>
    </div>
  )
}
