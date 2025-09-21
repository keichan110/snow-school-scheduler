import Header from '@/components/Header';
import { SkeletonCalendar, SkeletonSection } from '@/components/skeletons';

export default function ShiftsLoading() {
  return (
    <div className="min-h-screen">
      <Header />

      <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6 md:py-8 lg:px-8">
        <div className="mb-6 text-center md:mb-8" aria-hidden="true">
          <div className="mx-auto h-8 w-48 rounded-md bg-muted" />
          <div className="mx-auto mt-3 h-4 w-64 rounded-md bg-muted/70" />
        </div>

        <div className="mb-6 flex justify-center" aria-hidden="true">
          <div className="flex items-center gap-3">
            <div className="h-10 w-28 rounded-full bg-muted/60" />
            <div className="h-10 w-28 rounded-full bg-muted/40" />
          </div>
        </div>

        <div className="mb-8 space-y-6">
          <div
            className="sticky top-20 z-40 -mx-4 border-b border-border/30 bg-background/80 px-4 py-4 backdrop-blur-sm"
            aria-hidden="true"
          >
            <div className="flex items-center justify-between gap-4">
              <div className="h-9 w-9 rounded-full bg-muted/50" />
              <div className="h-6 w-40 rounded-md bg-muted/70" />
              <div className="h-9 w-9 rounded-full bg-muted/50" />
            </div>
          </div>

          <SkeletonCalendar className="hidden sm:block" />

          <div className="space-y-4 sm:hidden">
            <SkeletonSection bodyLines={4} />
            <SkeletonSection bodyLines={4} />
          </div>

          <SkeletonSection className="hidden sm:block" bodyLines={6} showSubtitle />
        </div>
      </div>
    </div>
  );
}
