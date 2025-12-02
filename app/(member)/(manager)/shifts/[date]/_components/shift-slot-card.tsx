"use client";

import { PencilSimple, Trash } from "@phosphor-icons/react";
import { DepartmentIcon } from "@/app/(member)/_components/department-icon";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import type {
  DepartmentMinimal,
  InstructorWithAssignment,
  ShiftSlot,
  ShiftTypeMinimal,
} from "../_lib/types";

type ShiftSlotCardProps = {
  slot: ShiftSlot;
  departments: DepartmentMinimal[];
  shiftTypes: ShiftTypeMinimal[];
  instructors: InstructorWithAssignment[];
  onEdit: () => void;
  onDelete: () => void;
};

/**
 * シフト枠カード（通常表示）
 *
 * @description
 * 1つのシフト枠を表示するカード。
 * 部門・シフト種別・配置人数・インストラクター名・備考を表示し、
 * 編集・削除ボタンを提供します。
 */
export function ShiftSlotCard({
  slot,
  departments,
  shiftTypes,
  instructors,
  onEdit,
  onDelete,
}: ShiftSlotCardProps) {
  const department = departments.find((d) => d.id === slot.departmentId);
  const shiftType = shiftTypes.find((st) => st.id === slot.shiftTypeId);
  const assignedInstructors = instructors.filter((i) =>
    slot.instructorIds.includes(i.id)
  );

  if (!(department && shiftType)) {
    return null;
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <DepartmentIcon
              className="h-5 w-5"
              code={department.code.toLowerCase()}
            />
            <span className="font-semibold">{department.name}</span>
            <span className="text-muted-foreground">/</span>
            <span>{shiftType.name}</span>
          </div>
          <div className="flex gap-2">
            <Button onClick={onEdit} size="icon" type="button" variant="ghost">
              <PencilSimple className="h-4 w-4" />
            </Button>
            <Button
              onClick={onDelete}
              size="icon"
              type="button"
              variant="ghost"
            >
              <Trash className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="mb-2">
          <span className="text-muted-foreground text-sm">配置: </span>
          <span className="font-medium">{slot.instructorIds.length}名</span>
        </div>
        <div className="mb-3 flex flex-wrap gap-2">
          {assignedInstructors.map((instructor) => (
            <span
              className="rounded-md bg-secondary px-2 py-1 text-secondary-foreground text-sm"
              key={instructor.id}
            >
              {instructor.displayName}
            </span>
          ))}
        </div>
        {slot.description && (
          <div className="text-muted-foreground text-sm">
            備考: {slot.description}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
