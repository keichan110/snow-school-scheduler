import { cache } from "react";
import { prisma } from "@/lib/db";

/**
 * インストラクター向け今後のシフト情報
 */
export type UpcomingShift = {
  id: number;
  date: Date;
  department: {
    id: number;
    name: string;
    code: string;
  };
  shiftType: {
    id: number;
    name: string;
  };
};

/**
 * インストラクターの今後のシフトを取得（React.cacheでメモ化）
 *
 * 同一リクエスト内で複数回呼び出されても、実際のDBクエリは1回のみ実行される
 *
 * @param instructorId - インストラクターID
 * @param limit - 取得件数の上限（デフォルト: 3）
 * @returns 今後のシフト一覧（日付昇順）
 */
export const getUpcomingShifts = cache(
  async (instructorId: number, limit = 3): Promise<UpcomingShift[]> => {
    // 今日の日付（時刻を00:00:00にリセット）
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const shifts = await prisma.shift.findMany({
      where: {
        date: {
          gte: today,
        },
        shiftAssignments: {
          some: {
            instructorId,
          },
        },
      },
      select: {
        id: true,
        date: true,
        department: {
          select: {
            id: true,
            name: true,
            code: true,
          },
        },
        shiftType: {
          select: {
            id: true,
            name: true,
          },
        },
      },
      orderBy: {
        date: "asc",
      },
      take: limit,
    });

    return shifts;
  }
);
