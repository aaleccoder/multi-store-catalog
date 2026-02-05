import { Skeleton } from "@/components/ui/skeleton";

interface ProductGridSkeletonProps {
  mobileView?: "grid" | "list";
  desktopColumns?: number;
}

export const ProductGridSkeleton = ({
  mobileView = "grid",
  desktopColumns = 3,
}: ProductGridSkeletonProps) => {
  const mobileCols = mobileView === "list" ? 1 : 2;
  return (
    <div className="w-full p-6 md:p-8">
      <div className="mb-6 flex items-center justify-between">
        <div className="space-y-2">
          <Skeleton className="h-9 w-64" />
          <Skeleton className="h-4 w-48" />
        </div>
      </div>

      <div
        className={`grid gap-6 ${mobileCols === 1 ? "grid-cols-1" : "grid-cols-2"} md:grid-cols-[repeat(var(--grid-cols),minmax(0,1fr))]`}
        style={{ "--grid-cols": desktopColumns } as React.CSSProperties}
      >
        {Array.from({ length: 8 }).map((_, index) => (
          <ProductCardSkeleton key={index} />
        ))}
      </div>
    </div>
  );
};

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
  );
};
