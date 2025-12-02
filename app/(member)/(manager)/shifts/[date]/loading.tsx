import { Skeleton } from "@/components/ui/skeleton";

/**
 * ローディングUI - 1日単位のシフト管理ページ
 *
 * @description
 * ページのデータ読み込み中に表示されるスケルトンUI。
 */
export default function Loading() {
  return (
    <div className="min-h-screen bg-background">
      {/* ヘッダー */}
      <div className="border-b bg-card">
        <div className="container mx-auto px-4 py-4">
          <Skeleton className="h-5 w-32" />
        </div>
      </div>

      {/* メインコンテンツ */}
      <div className="container mx-auto px-4 py-6">
        {/* 日付 */}
        <div className="mb-6">
          <Skeleton className="h-8 w-64" />
        </div>

        {/* 登録済みシフト */}
        <div className="mb-8">
          <Skeleton className="mb-4 h-6 w-32" />
          <div className="space-y-4">
            <Skeleton className="h-48 w-full" />
            <Skeleton className="h-48 w-full" />
          </div>
        </div>

        {/* インストラクター一覧 */}
        <div>
          <Skeleton className="mb-4 h-6 w-40" />
          <Skeleton className="mb-4 h-10 w-full" />
          <div className="grid grid-cols-2 gap-3 md:grid-cols-4 lg:grid-cols-6">
            {Array.from({ length: 12 }).map((_, i) => (
              <Skeleton className="h-24 w-full" key={`skeleton-${i}`} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
