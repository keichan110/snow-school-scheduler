import { Calendar } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { getUpcomingShifts } from "@/lib/data/shift";
import { ShiftCard } from "./shift-card";

/**
 * 今後のシフトとして表示する最大件数
 */
const MAX_UPCOMING_SHIFTS_DISPLAY = 3;

type UpcomingShiftsSectionProps = {
  instructorId: number;
};

/**
 * インストラクター向け今後のシフト表示セクション
 *
 * @description
 * 認証ユーザーに紐づくインストラクターの今後のシフト（最大3件）を表示します。
 * Server Componentとして実装し、lib/dataのメモ化された関数から直接データを取得します。
 */
export async function UpcomingShiftsSection({
  instructorId,
}: UpcomingShiftsSectionProps) {
  // lib/data/shift.ts のメモ化された関数から取得
  const shifts = await getUpcomingShifts(
    instructorId,
    MAX_UPCOMING_SHIFTS_DISPLAY
  );

  // シフトがない場合の表示
  if (shifts.length === 0) {
    return (
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Calendar className="h-5 w-5 text-muted-foreground" />
            <CardTitle>今後のシフト</CardTitle>
          </div>
          <CardDescription>直近の予定されたシフトを表示します</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground text-sm">
            現在、予定されているシフトはありません
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <Calendar className="h-5 w-5 text-muted-foreground" />
          <CardTitle>今後のシフト</CardTitle>
        </div>
        <CardDescription>直近の予定されたシフトを表示します</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {shifts.map((shift) => (
            <ShiftCard key={shift.id} shift={shift} />
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
