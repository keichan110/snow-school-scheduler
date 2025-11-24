import { Suspense } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { authenticate } from "@/lib/auth/auth";
import {
  getAvailableInstructors,
  getInstructorProfile,
} from "@/lib/data/instructor";
import { getUpcomingShifts } from "@/lib/data/shift";
import { InstructorLinkageSection } from "./_components/instructor-linkage-section";
import { UpcomingShiftsSection } from "./_components/upcoming-shifts-section";

/**
 * 今後のシフトとして表示する最大件数
 */
const MAX_UPCOMING_SHIFTS_DISPLAY = 5;

/**
 * 今後のシフトセクションの非同期コンポーネント
 */
async function UpcomingShiftsAsync({ instructorId }: { instructorId: number }) {
  const upcomingShifts = await getUpcomingShifts(
    instructorId,
    MAX_UPCOMING_SHIFTS_DISPLAY
  );

  return <UpcomingShiftsSection shifts={upcomingShifts} />;
}

/**
 * 今後のシフトセクションのスケルトン
 */
function UpcomingShiftsSkeleton() {
  return (
    <Card>
      <CardHeader>
        <Skeleton className="h-7 w-48" />
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Skeleton className="h-6 w-32" />
          <Skeleton className="h-20 w-full" />
        </div>
        <div className="space-y-2">
          <Skeleton className="h-6 w-32" />
          <Skeleton className="h-20 w-full" />
        </div>
        <div className="space-y-2">
          <Skeleton className="h-6 w-32" />
          <Skeleton className="h-20 w-full" />
        </div>
      </CardContent>
    </Card>
  );
}

/**
 * ダッシュボードページ
 *
 * このページの役割：
 * - 認証済みユーザー（MEMBER以上）のホームページ
 * - システムの概要情報を一目で確認できる画面
 * - インストラクター紐付け状況の表示と操作
 * - 親レイアウト (member)/layout.tsx で認証済み
 *
 * URL: /
 */
export default async function DashboardPage() {
  // 認証チェック
  const user = await authenticate();
  if (!user) {
    throw new Error("認証が必要です");
  }

  // インストラクター情報取得（React.cacheでメモ化されているため、layout.tsxと重複してもDBクエリは1回のみ）
  // 今後のシフトはSuspenseで遅延読み込みするため、ここでは取得しない
  const [instructorProfile, availableInstructors] = await Promise.all([
    user.instructorId ? getInstructorProfile(user.instructorId) : null,
    // 未紐付けの場合でもHeaderで使用するため、常に取得する
    getAvailableInstructors(),
  ]).catch(() => {
    throw new Error("ダッシュボードデータの取得に失敗しました");
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-bold text-3xl tracking-tight">ダッシュボード</h1>
        <p className="text-muted-foreground">
          スキー・スノーボードスクール シフト管理システム
        </p>
      </div>

      {/* インストラクター紐付け状況 */}
      <InstructorLinkageSection
        availableInstructors={availableInstructors}
        instructorProfile={instructorProfile}
      />

      {/* 今後のシフト（インストラクター紐付け済みの場合のみ表示） */}
      {user.instructorId && (
        <Suspense fallback={<UpcomingShiftsSkeleton />}>
          <UpcomingShiftsAsync instructorId={user.instructorId} />
        </Suspense>
      )}

      {/* 今後追加される他のダッシュボードコンテンツ */}
    </div>
  );
}
