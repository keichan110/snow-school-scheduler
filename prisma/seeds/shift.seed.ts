import { isHoliday } from "japanese-holidays";
import type { PrismaClient } from "../../generated/prisma";
import type { DepartmentSeeds } from "./department.seed";
import type { ShiftTypeSeeds } from "./shiftType.seed";

export interface ShiftSeed {
  id: number;
  date: Date;
  departmentId: number;
  shiftTypeId: number;
  description: string | null;
}

export async function seedShifts(
  prisma: PrismaClient,
  departments: DepartmentSeeds,
  shiftTypes: ShiftTypeSeeds
): Promise<ShiftSeed[]> {
  console.log("シフトデータを作成中...");

  const { skiDepartment, snowboardDepartment } = departments;
  const {
    generalLessonType,
    groupLessonType,
    badgeTestType,
    prefectureEventType,
  } = shiftTypes;

  const shifts: ShiftSeed[] = [];

  // 実行日の年を基準に期間を設定(UTC)
  const today = new Date();
  const currentYear = today.getFullYear();
  const startDate = new Date(Date.UTC(currentYear, 11, 1)); // 12月1日 00:00:00 UTC
  const endDate = new Date(Date.UTC(currentYear + 1, 2, 31, 23, 59, 59, 999)); // 翌年3月31日 23:59:59.999 UTC

  // 1月の団体レッスン日を設定（1月の第2土曜日）
  const groupLessonDates: Date[] = [];
  for (let d = 1; d <= 31; d++) {
    const date = new Date(Date.UTC(currentYear + 1, 0, d));
    const dayOfWeek = date.getUTCDay();
    const weekOfMonth = Math.ceil(d / 7);
    if (weekOfMonth === 2 && dayOfWeek === 6) {
      groupLessonDates.push(date);
      break;
    }
  }

  // バッジテストの日程を設定（1月・2月に各2回）
  const badgeTestDates: Date[] = [];
  // 1月の第2・第4土曜日
  for (let d = 1; d <= 31; d++) {
    const date = new Date(Date.UTC(currentYear + 1, 0, d));
    const dayOfWeek = date.getUTCDay();
    const weekOfMonth = Math.ceil(d / 7);
    if ((weekOfMonth === 2 || weekOfMonth === 4) && dayOfWeek === 6) {
      badgeTestDates.push(date);
    }
  }
  // 2月の第2・第4土曜日
  for (let d = 1; d <= 28; d++) {
    const date = new Date(Date.UTC(currentYear + 1, 1, d));
    const dayOfWeek = date.getUTCDay();
    const weekOfMonth = Math.ceil(d / 7);
    if ((weekOfMonth === 2 || weekOfMonth === 4) && dayOfWeek === 6) {
      badgeTestDates.push(date);
    }
  }

  // 県連事業の日程を設定（1月・2月に隔週日曜日）
  const prefectureEventDates: Date[] = [];
  // 1月の第1・第3日曜日
  for (let d = 1; d <= 31; d++) {
    const date = new Date(Date.UTC(currentYear + 1, 0, d));
    const dayOfWeek = date.getUTCDay();
    const weekOfMonth = Math.ceil(d / 7);
    if ((weekOfMonth === 1 || weekOfMonth === 3) && dayOfWeek === 0) {
      prefectureEventDates.push(date);
    }
  }
  // 2月の第1・第3日曜日
  for (let d = 1; d <= 28; d++) {
    const date = new Date(Date.UTC(currentYear + 1, 1, d));
    const dayOfWeek = date.getUTCDay();
    const weekOfMonth = Math.ceil(d / 7);
    if ((weekOfMonth === 1 || weekOfMonth === 3) && dayOfWeek === 0) {
      prefectureEventDates.push(date);
    }
  }

  // 日付ループ処理
  for (
    let currentDate = new Date(startDate);
    currentDate <= endDate;
    currentDate.setUTCDate(currentDate.getUTCDate() + 1)
  ) {
    // UTC基準で日付文字列を生成
    const year = currentDate.getUTCFullYear();
    const month = String(currentDate.getUTCMonth() + 1).padStart(2, "0");
    const day = String(currentDate.getUTCDate()).padStart(2, "0");
    const dateString = `${year}-${month}-${day}`;

    // 判定用のDateオブジェクト(UTC)
    const checkDate = new Date(`${dateString}T00:00:00Z`);
    const dayOfWeek = checkDate.getUTCDay(); // 0:日曜日, 6:土曜日
    const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
    const isNationalHoliday = isHoliday(checkDate);
    const isWeekendOrHoliday = isWeekend || isNationalHoliday;

    if (isWeekendOrHoliday) {
      // === 土日・祝日のシフト ===

      // スキー一般レッスン（土日・祝日すべて）
      const ski1 = await prisma.shift.create({
        data: {
          date: new Date(`${dateString}T00:00:00Z`),
          departmentId: skiDepartment.id,
          shiftTypeId: generalLessonType.id,
          description: "スキー一般レッスン",
        },
      });
      shifts.push(ski1);

      // スノーボード一般レッスン（土日・祝日すべて）
      const snowboard1 = await prisma.shift.create({
        data: {
          date: new Date(`${dateString}T00:00:00Z`),
          departmentId: snowboardDepartment.id,
          shiftTypeId: generalLessonType.id,
          description: "スノーボード一般レッスン",
        },
      });
      shifts.push(snowboard1);

      // 団体レッスン（1月に1回のみ）
      const isGroupLessonDate = groupLessonDates.some(
        (d) => d.toISOString().split("T")[0] === dateString
      );
      if (isGroupLessonDate) {
        // スキー団体レッスン
        const ski2 = await prisma.shift.create({
          data: {
            date: new Date(`${dateString}T00:00:00Z`),
            departmentId: skiDepartment.id,
            shiftTypeId: groupLessonType.id,
            description: "スキー団体レッスン",
          },
        });
        shifts.push(ski2);

        // スノーボード団体レッスン
        const snowboard2 = await prisma.shift.create({
          data: {
            date: new Date(`${dateString}T00:00:00Z`),
            departmentId: snowboardDepartment.id,
            shiftTypeId: groupLessonType.id,
            description: "スノーボード団体レッスン",
          },
        });
        shifts.push(snowboard2);
      }

      // バッジテスト（1月・2月に各2回）
      const isBadgeTestDate = badgeTestDates.some(
        (d) => d.toISOString().split("T")[0] === dateString
      );
      if (isBadgeTestDate) {
        const badgeTest = await prisma.shift.create({
          data: {
            date: new Date(`${dateString}T00:00:00Z`),
            departmentId: skiDepartment.id,
            shiftTypeId: badgeTestType.id,
            description: "スキーバッジテスト",
          },
        });
        shifts.push(badgeTest);
      }

      // 県連事業（1月・2月に隔週日曜日）
      const isPrefectureEventDate = prefectureEventDates.some(
        (d) => d.toISOString().split("T")[0] === dateString
      );
      if (isPrefectureEventDate) {
        const prefectureEvent = await prisma.shift.create({
          data: {
            date: new Date(`${dateString}T00:00:00Z`),
            departmentId: snowboardDepartment.id,
            shiftTypeId: prefectureEventType.id,
            description: "県連事業",
          },
        });
        shifts.push(prefectureEvent);
      }
    } else {
      // === 平日のシフト（スキー一般レッスンのみ）===

      const skiWeekday = await prisma.shift.create({
        data: {
          date: new Date(`${dateString}T00:00:00Z`),
          departmentId: skiDepartment.id,
          shiftTypeId: generalLessonType.id,
          description: "スキー一般レッスン",
        },
      });
      shifts.push(skiWeekday);
    }
  }

  const weekdayCount = shifts.filter((s) => {
    const dayOfWeek = new Date(s.date).getUTCDay();
    return dayOfWeek !== 0 && dayOfWeek !== 6;
  }).length;

  const weekendCount = shifts.filter((s) => {
    const dayOfWeek = new Date(s.date).getUTCDay();
    return dayOfWeek === 0 || dayOfWeek === 6;
  }).length;

  console.log(`シフト: ${shifts.length}件作成`);
  console.log(`   - 平日シフト: ${weekdayCount}件`);
  console.log(`   - 土日シフト: ${weekendCount}件`);

  return shifts;
}
