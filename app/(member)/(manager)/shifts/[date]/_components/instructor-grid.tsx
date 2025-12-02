"use client";

import { Check, MagnifyingGlass } from "@phosphor-icons/react";
import { useMemo, useState } from "react";
import { DepartmentIcon } from "@/app/(member)/_components/department-icon";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import type { InstructorWithAssignment, ShiftSlot } from "../_lib/types";
import { formatAssignmentInfo } from "../_lib/utils";

type InstructorGridProps = {
  instructors: InstructorWithAssignment[];
  shiftSlots: ShiftSlot[];
  selectedInstructorIds: number[];
  onToggleInstructor: (instructorId: number) => void;
};

/**
 * インストラクターグリッド
 *
 * @description
 * インストラクター一覧をグリッド表示し、選択可能にします。
 * 検索機能と配置状況の可視化を提供します。
 */
export function InstructorGrid({
  instructors,
  shiftSlots,
  selectedInstructorIds,
  onToggleInstructor,
}: InstructorGridProps) {
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

      {/* グリッド */}
      <div className="grid grid-cols-2 gap-3 md:grid-cols-4 lg:grid-cols-6">
        {filteredInstructors.length === 0 ? (
          <p className="col-span-full py-8 text-center text-muted-foreground">
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
              <Card
                className={cn(
                  "cursor-pointer transition-all",
                  isSelected && "border-primary bg-primary/5",
                  isAssigned && !isSelected && "opacity-60"
                )}
                key={instructor.id}
                onClick={() => onToggleInstructor(instructor.id)}
              >
                <CardContent className="p-3">
                  <div className="mb-2 flex items-start justify-between">
                    <div
                      className={cn(
                        "flex h-4 w-4 items-center justify-center rounded border",
                        isSelected
                          ? "border-primary bg-primary"
                          : "border-input"
                      )}
                    >
                      {isSelected && (
                        <Check
                          className="h-3 w-3 text-primary-foreground"
                          weight="bold"
                        />
                      )}
                    </div>
                    <DepartmentIcon
                      className="h-4 w-4"
                      code={instructor.departmentCode.toLowerCase()}
                    />
                  </div>

                  <div className="mb-1 font-medium text-sm">
                    {instructor.displayName}
                  </div>

                  <div className="text-muted-foreground text-xs">
                    {isAssigned ? (
                      <span className="text-orange-600">{assignmentInfo}</span>
                    ) : (
                      <span className="text-green-600">利用可能</span>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })
        )}
      </div>
    </div>
  );
}
