"use client";

import { Check, MagnifyingGlass } from "@phosphor-icons/react";
import { useMemo, useState } from "react";
import { DepartmentIcon } from "@/app/(member)/_components/department-icon";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import type { InstructorWithAssignment, ShiftSlot } from "../_lib/types";
import { formatAssignmentInfo } from "../_lib/utils";

type InstructorListProps = {
  instructors: InstructorWithAssignment[];
  shiftSlots: ShiftSlot[];
  selectedInstructorIds: number[];
  onToggleInstructor: (instructorId: number) => void;
};

/**
 * インストラクター一覧
 *
 * @description
 * インストラクター一覧を縦並びリスト表示し、選択可能にします。
 * 検索機能と配置状況の可視化を提供します。
 */
export function InstructorList({
  instructors,
  shiftSlots,
  selectedInstructorIds,
  onToggleInstructor,
}: InstructorListProps) {
  const [searchTerm, setSearchTerm] = useState("");

  // 検索フィルター
  const filteredInstructors = useMemo(() => {
    if (!searchTerm) {
      return instructors;
    }

    const term = searchTerm.toLowerCase();
    return instructors.filter(
      (instructor) =>
        instructor.displayName.toLowerCase().includes(term) ||
        instructor.displayNameKana.toLowerCase().includes(term)
    );
  }, [instructors, searchTerm]);

  // 配置状況の集計
  const stats = useMemo(() => {
    const assignedIds = new Set(
      shiftSlots.flatMap((slot) => slot.instructorIds)
    );
    const assignedCount = instructors.filter((i) =>
      assignedIds.has(i.id)
    ).length;
    const availableCount = instructors.length - assignedCount;

    return {
      available: availableCount,
      assigned: assignedCount,
      total: instructors.length,
    };
  }, [instructors, shiftSlots]);

  return (
    <div className="space-y-4">
      {/* 検索 */}
      <div className="relative">
        <MagnifyingGlass className="absolute top-2.5 left-3 h-4 w-4 text-muted-foreground" />
        <Input
          className="pl-9"
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="名前で検索"
          value={searchTerm}
        />
      </div>

      {/* 統計 */}
      <div className="flex gap-4 text-sm">
        <span>
          利用可能: <strong>{stats.available}名</strong>
        </span>
        <span>
          配置済み: <strong>{stats.assigned}名</strong>
        </span>
        <span>
          合計: <strong>{stats.total}名</strong>
        </span>
      </div>

      {/* リスト表示 */}
      <div className="space-y-2">
        {filteredInstructors.length === 0 ? (
          <p className="py-8 text-center text-muted-foreground">
            該当するインストラクターが見つかりません
          </p>
        ) : (
          filteredInstructors.map((instructor) => {
            const isSelected = selectedInstructorIds.includes(instructor.id);
            const isAssigned = instructor.assignedToShiftIds.length > 0;
            const assignmentInfo = formatAssignmentInfo(
              instructor.assignmentInfo
            );

            return (
              <button
                className={cn(
                  "w-full rounded-lg border bg-card p-3 text-left transition-all hover:bg-accent",
                  isSelected &&
                    "border-primary bg-primary/5 ring-2 ring-primary ring-offset-2",
                  isAssigned && !isSelected && "opacity-60"
                )}
                key={instructor.id}
                onClick={() => onToggleInstructor(instructor.id)}
                type="button"
              >
                <div className="flex items-center gap-3">
                  {/* チェックボックス */}
                  <div
                    className={cn(
                      "flex h-5 w-5 shrink-0 items-center justify-center rounded border",
                      isSelected ? "border-primary bg-primary" : "border-input"
                    )}
                  >
                    {isSelected && (
                      <Check
                        className="h-4 w-4 text-primary-foreground"
                        weight="bold"
                      />
                    )}
                  </div>

                  {/* 部門アイコン */}
                  <DepartmentIcon
                    className="h-5 w-5 shrink-0"
                    code={instructor.departmentCode.toLowerCase()}
                  />

                  {/* インストラクター情報 */}
                  <div className="min-w-0 flex-1">
                    <div className="truncate font-medium text-sm">
                      {instructor.displayName}
                    </div>
                    <div className="text-xs">
                      {isAssigned ? (
                        <span className="text-orange-600">
                          {assignmentInfo}
                        </span>
                      ) : (
                        <span className="text-green-600">利用可能</span>
                      )}
                    </div>
                  </div>
                </div>
              </button>
            );
          })
        )}
      </div>
    </div>
  );
}
