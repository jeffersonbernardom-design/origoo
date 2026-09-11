import { Skeleton } from "@/components/ui/skeleton";

export const CardSkeleton = () => (
  <div className="rounded-2xl border border-border bg-card p-4 shadow-card">
    <div className="flex items-start justify-between gap-4">
      <div className="flex-1 space-y-2">
        <Skeleton className="h-3 w-24" />
        <Skeleton className="h-5 w-40" />
        <Skeleton className="h-3 w-28" />
      </div>
      <Skeleton className="h-12 w-12 rounded-xl" />
    </div>
    <Skeleton className="mt-4 h-10 w-full rounded-xl" />
  </div>
);

export const ListSkeleton = ({ count = 3 }: { count?: number }) => (
  <div className="space-y-3" aria-busy="true" aria-live="polite">
    {Array.from({ length: count }).map((_, i) => (
      <CardSkeleton key={i} />
    ))}
  </div>
);

export const PageSkeleton = () => (
  <div className="mx-auto w-full max-w-5xl px-4 pt-24 sm:px-6">
    <Skeleton className="mb-2 h-8 w-48" />
    <Skeleton className="mb-6 h-4 w-64" />
    <ListSkeleton count={3} />
  </div>
);

export default ListSkeleton;
