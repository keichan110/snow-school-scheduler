import { cn } from "@/lib/utils";

interface ShiftCalendarSkeletonProps {
  className?: string;
}

export function ShiftCalendarSkeleton({
  className,
}: ShiftCalendarSkeletonProps) {
  return (
    <div className={cn("hidden animate-pulse sm:block", className)}>
      {/* カレンダーグリッド */}
      <div className="grid grid-cols-7 gap-2 md:gap-2">
        {/* 35 日分のスケルトン (5週間) */}
        {Array.from({ length: 35 }).map((_, index) => (
          <div
            className="min-h-[120px] rounded-xl border-2 border-border/20 bg-muted/50 p-3 shadow-lg md:min-h-[140px]"
            key={`skeleton-${index}`}
          >
            <div className="flex flex-col space-y-2">
              {/* 日付のスケルトン */}
              <div className="h-6 w-8 rounded-md bg-muted" />

              {/* シフトバッジのスケルトン（ランダムに0-3個） */}
              {Array.from({ length: Math.floor(Math.random() * 4) }).map(
                (_, badgeIndex) => (
                  <div
                    className="h-6 w-16 rounded-full bg-muted"
                    key={badgeIndex}
                  />
                )
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
