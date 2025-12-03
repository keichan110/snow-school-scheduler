import { ArrowLeft } from "@phosphor-icons/react/dist/ssr";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { DayShiftManager } from "./_components/day-shift-manager";
import {
  getActiveShiftTypes,
  getDepartments,
  getInstructorsWithAssignments,
  getShiftsByDate,
} from "./_lib/queries";
import type { DayShiftData } from "./_lib/types";
import {
  formatDateJa,
  isDateHoliday,
  transformShiftsToSlots,
} from "./_lib/utils";

type PageProps = {
  params: Promise<{
    date: string;
  }>;
  searchParams: Promise<{
    department?: string;
  }>;
};

// 日付形式の検証（YYYY-MM-DD）
const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

// 動的ルートを常にサーバーサイドで処理
export const dynamic = "force-dynamic";
export const dynamicParams = true;

/**
 * 1日単位のシフト管理ページ
 *
 * @description
 * MANAGER以上の権限を持つユーザーが、特定の日付のシフトを一元管理するページ。
 * URLパラメータから日付を取得し、サーバー側でデータをフェッチしてClient Componentに渡す。
 *
 * @route /shifts/[date]
 * @example /shifts/2024-12-15
 */
export default async function DayShiftPage({
  params,
  searchParams,
}: PageProps) {
  const { date } = await params;
  const { department } = await searchParams;

  if (!DATE_PATTERN.test(date)) {
    notFound();
  }

  // 部門IDを数値に変換
  const departmentId = department ? Number.parseInt(department, 10) : undefined;

  // データを並列取得（部門IDがある場合はその部門のシフトとインストラクターのみ取得）
  const [shifts, instructors, departments, shiftTypes] = await Promise.all([
    getShiftsByDate(date, departmentId),
    getInstructorsWithAssignments(date, departmentId),
    getDepartments(),
    getActiveShiftTypes(),
  ]);

  // データを整形
  const dayShiftData: DayShiftData = {
    date,
    shiftSlots: transformShiftsToSlots(shifts),
    availableInstructors: instructors,
    departments,
    shiftTypes,
    // 部門IDを渡す（既にサーバー側でフィルタリング済み）
    ...(departmentId && {
      preselectedDepartmentId: departmentId,
    }),
  };

  // 日付情報の整形
  const formattedDate = formatDateJa(date);
  const isHoliday = isDateHoliday(date);

  return (
    <div className="min-h-screen bg-background">
      {/* ヘッダー */}
      <div className="border-b bg-card">
        <div className="container mx-auto px-4 py-4">
          <Link
            className="inline-flex items-center gap-2 text-muted-foreground text-sm transition-colors hover:text-foreground"
            href="/shifts"
          >
            <ArrowLeft className="h-4 w-4" />
            シフト一覧に戻る
          </Link>
        </div>
      </div>

      {/* メインコンテンツ */}
      <div className="container mx-auto px-4 py-6">
        <div className="mb-6">
          <h1 className="flex items-center gap-2 font-bold text-2xl">
            📅 {formattedDate}
            {isHoliday && <span className="text-red-500 text-sm">🔴祝日</span>}
          </h1>
        </div>

        <Suspense fallback={<div>読み込み中...</div>}>
          <DayShiftManager initialData={dayShiftData} />
        </Suspense>
      </div>
    </div>
  );
}
