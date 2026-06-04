import { Skeleton } from "@/components/ui/skeleton";

/**
 * Loading placeholder for the dashboard list pages (companies/contacts/
 * inquiries/admin). Mirrors the header + optional filters + table layout so the
 * skeleton lines up with the real content.
 */
export function ListPageSkeleton({
  columns,
  rows = 5,
  withAction = true,
  withFilters = false,
}: {
  columns: number;
  rows?: number;
  withAction?: boolean;
  withFilters?: boolean;
}) {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div className="flex flex-col gap-2">
          <Skeleton className="h-7 w-40" />
          <Skeleton className="h-4 w-64" />
        </div>
        {withAction ? <Skeleton className="h-8 w-32" /> : null}
      </div>

      {withFilters ? (
        <div className="flex flex-wrap gap-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="flex flex-col gap-1.5">
              <Skeleton className="h-3 w-16" />
              <Skeleton className="h-8 w-40" />
            </div>
          ))}
        </div>
      ) : null}

      <div className="rounded-md border">
        <div className="flex gap-4 border-b p-3">
          {Array.from({ length: columns }).map((_, i) => (
            <Skeleton key={i} className="h-4 flex-1" />
          ))}
        </div>
        <div className="divide-y">
          {Array.from({ length: rows }).map((_, r) => (
            <div key={r} className="flex gap-4 p-3">
              {Array.from({ length: columns }).map((_, c) => (
                <Skeleton key={c} className="h-5 flex-1" />
              ))}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
