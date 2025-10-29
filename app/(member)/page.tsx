import { redirect } from "next/navigation";
import {
  getAvailableInstructors,
  getMyInstructorProfile,
} from "@/lib/actions/user-instructor-linkage";
import { authenticate } from "@/lib/auth/auth";
import type { InstructorBasicInfo } from "@/types/actions";
import { InstructorLinkageSection } from "./_components/instructor-linkage-section";

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
  const user = await authenticate();

  if (!user) {
    redirect("/login");
  }

  // インストラクター情報取得
  const instructorProfileResult = await getMyInstructorProfile();
  const instructorProfile = instructorProfileResult.success
    ? instructorProfileResult.data
    : null;

  // 紐付け可能なインストラクター一覧取得（未紐付けの場合）
  let availableInstructors: InstructorBasicInfo[] = [];
  if (!instructorProfile) {
    const instructorsResult = await getAvailableInstructors();
    availableInstructors = instructorsResult.success
      ? instructorsResult.data
      : [];
  }

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

      {/* 今後追加される他のダッシュボードコンテンツ */}
    </div>
  );
}
