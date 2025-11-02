import { authenticate } from "@/lib/auth/auth";
import { prisma } from "@/lib/db";
import type {
  InstructorBasicInfo,
  UserInstructorProfile,
} from "@/types/actions";
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
  // 認証チェック
  const user = await authenticate();
  if (!user) {
    throw new Error("認証が必要です");
  }

  // インストラクター情報取得（Server Componentで直接Prismaクエリ）
  let instructorProfile: UserInstructorProfile | null = null;
  if (user.instructorId) {
    const instructor = await prisma.instructor.findUnique({
      where: { id: user.instructorId },
      include: {
        certifications: {
          include: {
            certification: {
              select: {
                id: true,
                name: true,
                shortName: true,
                organization: true,
              },
            },
          },
        },
      },
    });

    if (instructor) {
      instructorProfile = {
        id: instructor.id,
        lastName: instructor.lastName,
        firstName: instructor.firstName,
        lastNameKana: instructor.lastNameKana,
        firstNameKana: instructor.firstNameKana,
        status: instructor.status,
        certifications: instructor.certifications.map((ic) => ic.certification),
      };
    }
  }

  // 紐付け可能なインストラクター一覧取得（未紐付けの場合のみ）
  let availableInstructors: InstructorBasicInfo[] = [];
  if (!instructorProfile) {
    availableInstructors = await prisma.instructor.findMany({
      where: {
        status: "ACTIVE",
      },
      select: {
        id: true,
        lastName: true,
        firstName: true,
        lastNameKana: true,
        firstNameKana: true,
        status: true,
      },
      orderBy: [{ lastNameKana: "asc" }, { firstNameKana: "asc" }],
    });
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
