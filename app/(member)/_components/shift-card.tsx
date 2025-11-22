import { formatDateString } from "@/app/api/usecases/helpers/formatters";

type ShiftCardProps = {
  shift: {
    id: number;
    date: Date;
    department: {
      name: string;
    };
    shiftType: {
      name: string;
    };
  };
};

/**
 * 個別のシフト情報を表示するカード
 *
 * @description
 * シフトの日付、部門、シフトタイプを表示する再利用可能なコンポーネント
 */
export function ShiftCard({ shift }: ShiftCardProps) {
  return (
    <div
      className="flex items-start justify-between rounded-lg border p-4"
      key={shift.id}
    >
      <div className="space-y-1">
        <div className="flex items-center gap-2">
          <p className="font-medium text-sm">{formatDateString(shift.date)}</p>
          <span className="text-muted-foreground text-xs">·</span>
          <p className="text-muted-foreground text-sm">
            {shift.department.name}
          </p>
        </div>
        <p className="text-sm">{shift.shiftType.name}</p>
      </div>
    </div>
  );
}
