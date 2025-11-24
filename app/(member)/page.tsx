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
  const [instructorProfile, availableInstructors, upcomingShifts] =
    await Promise.all([
      user.instructorId ? getInstructorProfile(user.instructorId) : null,
      // 未紐付けの場合でもHeaderで使用するため、常に取得する
      getAvailableInstructors(),
      // 今後のシフトを取得
      user.instructorId
        ? getUpcomingShifts(user.instructorId, MAX_UPCOMING_SHIFTS_DISPLAY)
        : [],
    ]);

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
        <UpcomingShiftsSection
          instructorId={user.instructorId}
          shifts={upcomingShifts}
        />
      )}

      {/* 今後追加される他のダッシュボードコンテンツ */}
    </div>
  );
}
