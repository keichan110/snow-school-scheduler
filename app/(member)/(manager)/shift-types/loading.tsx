import { SkeletonTable } from "@/app/_components/ui";

export default function Loading() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6 md:py-8 lg:px-8">
      <div className="mb-6 space-y-3 md:mb-8">
        <div className="h-8 w-48 rounded-md bg-muted/70" />
        <div className="h-4 w-64 rounded-md bg-muted/50" />
      </div>

      <div className="mb-4 md:mb-6">
        <div className="flex items-center justify-center divide-x divide-border rounded-lg border border-border/40 bg-card/60 p-4 shadow-sm">
          <div className="flex items-center gap-2 px-4">
            <div className="h-6 w-6 rounded-full bg-muted/60" />
            <div className="h-5 w-8 rounded-md bg-muted/40" />
          </div>
          <div className="flex items-center gap-2 px-4">
            <div className="h-6 w-6 rounded-full bg-muted/60" />
            <div className="h-5 w-8 rounded-md bg-muted/40" />
          </div>
        </div>
      </div>

      <div className="overflow-hidden rounded-lg border border-border/40 bg-card/60 shadow-sm">
        <div className="space-y-4 border-border/40 border-b p-4">
          <div className="flex items-center justify-between">
            <div className="h-5 w-24 rounded-md bg-muted/60" />
            <div className="h-9 w-24 rounded-md bg-muted/50" />
          </div>
          <div className="h-9 w-40 rounded-md bg-muted/40" />
        </div>
        <div className="p-4">
          <SkeletonTable
            className="border-none bg-transparent p-0 shadow-none"
            columns={4}
            rows={6}
          />
        </div>
      </div>
    </div>
  );
}
