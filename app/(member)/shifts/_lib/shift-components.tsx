"use client";

import { User } from "@phosphor-icons/react";
import type React from "react";
import { DepartmentIcon } from "@/app/(member)/_components/department-icon";
import { cn } from "@/lib/utils";
import { DEPARTMENT_NAMES, DEPARTMENT_STYLES } from "./constants";
import { getDepartmentBgClass } from "./shift-utils";
import type { AssignedInstructor, DayData, DepartmentType } from "./types";

/**
 * インストラクターチップを生成する共通関数
 * 実際にアサインされたインストラクター情報を使用
 */
export function generateInstructorChips(
  assignedInstructors: AssignedInstructor[],
  departmentType: DepartmentType
) {
  const chipClass = DEPARTMENT_STYLES[departmentType].chipClass;

  return assignedInstructors.map((instructor) => (
    <div
      className={cn(
        "inline-flex cursor-pointer items-center gap-1 rounded-full border px-3 py-1 font-medium text-xs transition-all duration-200 hover:scale-105",
        chipClass
      )}
      key={instructor.id}
    >
      <User className="h-3 w-3" weight="fill" />
      {instructor.displayName}
    </div>
  ));
}

/**
 * 部門セクション作成のオプション設定
 */
export type DepartmentSectionOptions = {
  clickable?: boolean;
  onShiftClick?: (shiftType: string, departmentType: DepartmentType) => void;
  showEditButtons?: boolean;
  isLoading?: boolean;
};

/**
 * シフトカードのスタイルクラス名を生成
 */
function getShiftCardClassName(clickable: boolean, isLoading: boolean): string {
  const baseClass =
    "rounded-lg border border-border bg-background p-3 transition-all duration-200";

  if (!clickable) {
    return cn(baseClass, "hover:shadow-sm");
  }

  return cn(baseClass, [
    "w-full cursor-pointer text-left",
    "hover:scale-[1.02] hover:bg-accent/50 hover:shadow-md",
    "focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2",
    isLoading &&
      "disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:scale-100 disabled:hover:bg-background disabled:hover:shadow-sm",
  ]);
}

/**
 * シフトタイプバッジのスタイルクラス名を生成
 */
function getShiftTypeBadgeClassName(
  clickable: boolean,
  styles: (typeof DEPARTMENT_STYLES)[DepartmentType],
  department: DepartmentType
): string {
  const baseClass = "rounded-lg px-3 py-2 font-medium text-foreground text-sm";

  if (clickable) {
    return cn(baseClass, styles.chipClass, "pointer-events-none");
  }

  return cn(baseClass, getDepartmentBgClass(department));
}

/**
 * インストラクターチップをレンダリング
 */
function renderInstructorChips(
  instructors: AssignedInstructor[],
  departmentType: DepartmentType,
  clickable: boolean,
  styles: (typeof DEPARTMENT_STYLES)[DepartmentType]
) {
  if (clickable) {
    return instructors.map((instructor) => (
      <div
        className={cn(
          "pointer-events-none inline-flex cursor-pointer items-center gap-1 rounded-full border px-3 py-1 font-medium text-xs",
          styles.chipClass
        )}
        key={instructor.id}
      >
        <User className="h-3 w-3" weight="fill" />
        {instructor.displayName}
      </div>
    ));
  }

  return generateInstructorChips(instructors, departmentType);
}

/**
 * シフトカードをレンダリング
 */
function renderShiftCard(
  shift: DayData["shifts"][number],
  departmentType: DepartmentType,
  styles: (typeof DEPARTMENT_STYLES)[DepartmentType],
  options: DepartmentSectionOptions
) {
  const { clickable = false, onShiftClick, isLoading = false } = options;
  const Element = clickable ? "button" : "div";
  const clickProps =
    clickable && onShiftClick
      ? {
          onClick: () => onShiftClick(shift.type, departmentType),
          disabled: isLoading,
        }
      : {};

  // ユニークキーを生成（部門 + シフトタイプの組み合わせ）
  const uniqueKey = `${departmentType}-${shift.type}`;

  return (
    <Element
      className={getShiftCardClassName(clickable, isLoading)}
      key={uniqueKey}
      {...clickProps}
    >
      <div className="mb-2 flex items-center justify-between md:mb-3">
        <div
          className={getShiftTypeBadgeClassName(
            clickable,
            styles,
            shift.department as DepartmentType
          )}
        >
          {shift.type}
        </div>
        <div className="text-muted-foreground text-xs">{shift.count}名配置</div>
      </div>
      <div className="space-y-1 md:flex md:flex-wrap md:gap-2 md:space-y-0">
        {shift.assignedInstructors && shift.assignedInstructors.length > 0 ? (
          renderInstructorChips(
            shift.assignedInstructors,
            departmentType,
            clickable,
            styles
          )
        ) : (
          <div className="text-muted-foreground text-xs">
            インストラクターが未配置です
          </div>
        )}
      </div>
    </Element>
  );
}

/**
 * 部門セクションを作成する統合関数
 * 表示専用（公開画面）とクリック可能（管理画面）の両方に対応
 */
export function createDepartmentSection(
  departmentType: DepartmentType,
  shifts: DayData["shifts"],
  icon: React.ReactNode,
  options: DepartmentSectionOptions = {}
) {
  const departmentName = DEPARTMENT_NAMES[departmentType];
  const styles = DEPARTMENT_STYLES[departmentType];
  const {
    sectionBgClass: bgClass,
    sectionBorderClass: borderClass,
    sectionTextClass: textClass,
  } = styles;

  const departmentShifts = shifts.filter(
    (s) => s.department === departmentType
  );

  return (
    <div
      className={cn(
        "rounded-xl border p-3 transition-all duration-300 md:p-4",
        bgClass,
        borderClass
      )}
      key={departmentType}
    >
      <div className="md:flex md:items-start md:gap-4">
        {/* 部門ヘッダー */}
        <div className="mb-3 flex items-center gap-2 md:mb-0 md:w-40 md:flex-shrink-0 md:gap-3">
          {icon}
          <div>
            <h4 className={cn("font-semibold text-base md:text-lg", textClass)}>
              {departmentName}
            </h4>
            <p className="text-muted-foreground text-xs">{styles.label}</p>
          </div>
        </div>

        {/* シフト種類とインストラクター */}
        <div className="flex-1 space-y-3">
          {departmentShifts.map((shift) =>
            renderShiftCard(shift, departmentType, styles, options)
          )}
        </div>
      </div>
    </div>
  );
}

/**
 * 部門別のアイコンを取得する関数
 * @deprecated DepartmentIconコンポーネントを直接使用してください
 */
export function getDepartmentIcon(departmentCode: string, className?: string) {
  const iconClass = cn(
    "h-5 w-5",
    DEPARTMENT_STYLES[departmentCode.toLowerCase() as "ski" | "snowboard"]
      ?.iconColor || "",
    className
  );

  return <DepartmentIcon className={iconClass} code={departmentCode} />;
}

/**
 * 部門別のセクションを生成する関数（統一されたアイコン付き）
 */
export function renderDepartmentSections(
  shifts: DayData["shifts"],
  options?: DepartmentSectionOptions
) {
  const sections: React.ReactNode[] = [];

  // スキー部門
  if (shifts.filter((s) => s.department === "ski").length > 0) {
    sections.push(
      createDepartmentSection("ski", shifts, getDepartmentIcon("SKI"), options)
    );
  }

  // スノーボード部門
  if (shifts.filter((s) => s.department === "snowboard").length > 0) {
    sections.push(
      createDepartmentSection(
        "snowboard",
        shifts,
        getDepartmentIcon("SNOWBOARD"),
        options
      )
    );
  }

  return sections;
}
