import { HTMLAttributes } from 'react';

import { cn } from '@/lib/utils';

export interface SkeletonTableProps extends HTMLAttributes<HTMLDivElement> {
  columns?: number;
  rows?: number;
  showHeader?: boolean;
}

/**
 * SkeletonTable mimics tabular data so list-heavy routes can keep layout stability while fetching content.
 */
export function SkeletonTable({
  columns = 5,
  rows = 5,
  showHeader = true,
  className,
  ...rest
}: SkeletonTableProps) {
  const columnCount = Math.max(1, columns);
  const rowCount = Math.max(1, rows);
  const columnArray = Array.from({ length: columnCount });
  const rowArray = Array.from({ length: rowCount });

  return (
    <div
      aria-hidden="true"
      className={cn(
        'animate-pulse overflow-hidden rounded-xl border border-border/40 bg-card/60 shadow-sm',
        className
      )}
      {...rest}
    >
      {showHeader ? (
        <div className="hidden border-b border-border/40 bg-muted/20 px-6 py-3 sm:block">
          <div className="flex items-center gap-4">
            {columnArray.map((_, index) => (
              <div
                key={`skeleton-table-header-${index}`}
                className="h-4 flex-1 rounded-md bg-muted/60"
              />
            ))}
          </div>
        </div>
      ) : null}
      <div className="divide-y divide-border/40">
        {rowArray.map((_, rowIndex) => (
          <div
            key={`skeleton-table-row-${rowIndex}`}
            className="flex flex-col gap-3 px-4 py-4 sm:flex-row sm:items-center sm:gap-4 sm:px-6"
          >
            {columnArray.map((_, columnIndex) => (
              <div
                key={`skeleton-table-row-${rowIndex}-col-${columnIndex}`}
                className={cn(
                  'h-4 rounded-md bg-muted/50',
                  columnIndex === columnArray.length - 1 ? 'w-1/3 sm:w-1/4' : 'w-full',
                  'sm:flex-1'
                )}
              />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
