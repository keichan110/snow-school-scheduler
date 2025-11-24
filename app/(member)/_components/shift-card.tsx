import { cn } from "@/lib/utils";
import { DepartmentIcon } from "./department-icon";

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
 * 部門名から部門タイプを判定
 */
function getDepartmentType(
  departmentName: string
): "ski" | "snowboard" | "mixed" {
  const name = departmentName.toLowerCase();
  if (name.includes("スキー") || name.includes("ski")) {
    return "ski";
  }
  if (
    name.includes("スノーボード") ||
    name.includes("snowboard") ||
    name.includes("ボード")
  ) {
    return "snowboard";
  }
  return "mixed";
}

/**
 * 部門タイプに応じたスタイルを返す
 */
function getDepartmentStyles(departmentType: string) {
  switch (departmentType) {
    case "ski":
      return "bg-ski-100 text-ski-700 border-ski-300 dark:bg-ski-950/30 dark:text-ski-300 dark:border-ski-700";
    case "snowboard":
      return "bg-snowboard-100 text-snowboard-700 border-snowboard-300 dark:bg-snowboard-950/30 dark:text-snowboard-300 dark:border-snowboard-700";
    default:
      return "bg-muted text-muted-foreground border-border";
  }
}

/**
 * 個別のシフト情報を表示するカード
 *
 * @description
 * シフトの日付、部門、シフトタイプを表示する再利用可能なコンポーネント
 */
export function ShiftCard({ shift }: ShiftCardProps) {
  const date = new Date(shift.date);
  const month = date.getMonth() + 1;
  const day = date.getDate();
  const weekday = ["日", "月", "火", "水", "木", "金", "土"][date.getDay()];

  const departmentType = getDepartmentType(shift.department.name);
  const departmentStyles = getDepartmentStyles(departmentType);

  return (
    <div className="h-full rounded-lg border p-4">
      <div className="flex h-full flex-col space-y-3">
        <div className="flex items-baseline justify-center gap-1.5 text-center">
          <span className="font-bold text-3xl">
            {month}/{day}
          </span>
          <span className="text-muted-foreground text-xs">({weekday})</span>
        </div>
        <div className="flex flex-col items-center">
          <span
            className={cn(
              "flex items-center gap-1.5 rounded-full border px-2.5 py-1 font-medium text-xs",
              departmentStyles
            )}
          >
            <DepartmentIcon type={departmentType} />
            {shift.shiftType.name}
          </span>
        </div>
      </div>
    </div>
  );
}
