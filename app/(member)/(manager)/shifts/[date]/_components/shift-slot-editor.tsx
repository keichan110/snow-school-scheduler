"use client";

import { X } from "@phosphor-icons/react";
import { DepartmentSelector } from "@/app/(member)/shifts/_components/department-selector";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import type {
  DepartmentMinimal,
  InstructorWithAssignment,
  ShiftSlot,
  ShiftTypeMinimal,
} from "../_lib/types";

type ShiftSlotEditorProps = {
  slot: ShiftSlot;
  departments: DepartmentMinimal[];
  shiftTypes: ShiftTypeMinimal[];
  instructors: InstructorWithAssignment[];
  isSubmitting: boolean;
  onDepartmentChange: (departmentId: number) => void;
  onShiftTypeChange: (shiftTypeId: number) => void;
  onDescriptionChange: (description: string) => void;
  onRemoveInstructor: (instructorId: number) => void;
  onSave: () => void;
  onCancel: () => void;
};

/**
 * シフト枠エディター（編集モード）
 *
 * @description
 * シフト枠の編集フォーム。
 * 新規作成時は部門・シフト種別を選択可能、既存シフト編集時は変更不可。
 * 備考を編集し、インストラクターは下部のグリッドから選択します。
 */
export function ShiftSlotEditor({
  slot,
  departments,
  shiftTypes,
  instructors,
  isSubmitting,
  onDepartmentChange,
  onShiftTypeChange,
  onDescriptionChange,
  onRemoveInstructor,
  onSave,
  onCancel,
}: ShiftSlotEditorProps) {
  const selectedInstructors = instructors.filter((i) =>
    slot.instructorIds.includes(i.id)
  );

  // 既存シフトの場合、部門とシフト種別を取得
  const selectedDepartment = departments.find(
    (d) => d.id === slot.departmentId
  );
  const selectedShiftType = shiftTypes.find((t) => t.id === slot.shiftTypeId);

  return (
    <Card className="border-primary">
      <CardHeader>
        <span className="font-medium text-sm">
          {slot.isNew ? "シフト枠を作成" : "シフト枠を編集"}
        </span>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* 部門選択（新規作成時のみ変更可能） */}
          {slot.isNew ? (
            <DepartmentSelector
              departments={departments}
              onSelect={onDepartmentChange}
              selectedId={slot.departmentId}
            />
          ) : (
            <div>
              <Label>部門</Label>
              <div className="rounded-md border bg-muted px-3 py-2 text-sm">
                {selectedDepartment?.name ?? "未選択"}
              </div>
              <p className="mt-1 text-muted-foreground text-xs">
                既存シフトの部門は変更できません
              </p>
            </div>
          )}

          {/* シフト種別選択（新規作成時のみ変更可能） */}
          {slot.isNew ? (
            <div>
              <Label>
                シフト種別 <span className="text-red-500">*</span>
              </Label>
              <Select
                onValueChange={(value) => onShiftTypeChange(Number(value))}
                value={slot.shiftTypeId > 0 ? String(slot.shiftTypeId) : ""}
              >
                <SelectTrigger>
                  <SelectValue placeholder="シフト種別を選択" />
                </SelectTrigger>
                <SelectContent>
                  {shiftTypes.map((type) => (
                    <SelectItem key={type.id} value={String(type.id)}>
                      {type.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          ) : (
            <div>
              <Label>シフト種別</Label>
              <div className="rounded-md border bg-muted px-3 py-2 text-sm">
                {selectedShiftType?.name ?? "未選択"}
              </div>
              <p className="mt-1 text-muted-foreground text-xs">
                既存シフトの種別は変更できません
              </p>
            </div>
          )}

          {/* 備考 */}
          <div>
            <Label>備考</Label>
            <Textarea
              onChange={(e) => onDescriptionChange(e.target.value)}
              placeholder="追加の情報があれば入力してください"
              value={slot.description}
            />
          </div>

          {/* 選択中のインストラクター */}
          <div>
            <Label>インストラクター</Label>
            <div className="mb-2 text-muted-foreground text-sm">
              下のインストラクター一覧から選択してください
            </div>
            {selectedInstructors.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {selectedInstructors.map((instructor) => (
                  <span
                    className="inline-flex items-center gap-1 rounded-md bg-primary/10 px-2 py-1 text-primary text-sm"
                    key={instructor.id}
                  >
                    {instructor.displayName}
                    <button
                      className="rounded-full p-0.5 hover:bg-primary/20"
                      onClick={() => onRemoveInstructor(instructor.id)}
                      type="button"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </span>
                ))}
              </div>
            ) : (
              <p className="text-muted-foreground text-sm">
                インストラクターが選択されていません
              </p>
            )}
          </div>

          {/* アクションボタン */}
          <div className="flex gap-2">
            <Button
              disabled={isSubmitting}
              onClick={onCancel}
              type="button"
              variant="outline"
            >
              キャンセル
            </Button>
            <Button disabled={isSubmitting} onClick={onSave} type="button">
              {isSubmitting ? "保存中..." : "保存"}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
