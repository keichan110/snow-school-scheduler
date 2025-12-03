"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { DepartmentSelectionPopover } from "@/app/(member)/shifts/_components/department-selection-popover";
import {
  createShiftAction,
  deleteShiftAction,
  updateShiftAction,
} from "@/app/(member)/shifts/_lib/actions";
import type { DayShiftData, ShiftSlot } from "../_lib/types";
import { validateShiftSlot } from "../_lib/utils";
import { AddShiftSlotButton } from "./add-shift-slot-button";
import { InstructorList } from "./instructor-list";
import { ShiftSlotCard } from "./shift-slot-card";
import { ShiftSlotEditor } from "./shift-slot-editor";

type DayShiftManagerProps = {
  initialData: DayShiftData;
};

/**
 * 1日分のシフト管理UI（メインコンポーネント）
 *
 * @description
 * シフト枠の表示・編集・削除を管理するメインUI。
 * インストラクターの選択状態も管理します。
 */
export function DayShiftManager({ initialData }: DayShiftManagerProps) {
  const router = useRouter();
  const [shiftSlots, setShiftSlots] = useState<ShiftSlot[]>(() => {
    // 事前選択された部門IDがある場合、新規シフト枠を追加
    // （サーバー側で既にフィルタリング済みのため、フィルタリング不要）
    if (initialData.preselectedDepartmentId) {
      return [
        ...initialData.shiftSlots,
        {
          id: null,
          departmentId: initialData.preselectedDepartmentId,
          shiftTypeId: 0,
          description: "",
          instructorIds: [],
          isEditing: true,
          isNew: true,
        },
      ];
    }
    return initialData.shiftSlots;
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDepartmentPopoverOpen, setIsDepartmentPopoverOpen] = useState(false);

  /**
   * 新しいシフト枠を追加（部門IDを指定）
   */
  const handleAddSlot = (departmentId: number) => {
    setShiftSlots((prev) => [
      ...prev,
      {
        id: null,
        departmentId,
        shiftTypeId: 0,
        description: "",
        instructorIds: [],
        isEditing: true,
        isNew: true,
      },
    ]);
  };

  /**
   * シフト枠の編集開始
   */
  const handleEditSlot = (index: number) => {
    setShiftSlots((prev) =>
      prev.map((slot, i) => (i === index ? { ...slot, isEditing: true } : slot))
    );
  };

  /**
   * シフト枠の編集キャンセル
   */
  const handleCancelEdit = (index: number) => {
    const slot = shiftSlots[index];

    if (!slot) {
      return;
    }

    if (slot.isNew) {
      // 新規作成中の場合は削除
      setShiftSlots((prev) => prev.filter((_, i) => i !== index));
    } else {
      // 編集モードを解除してデータを元に戻す
      const originalSlot = initialData.shiftSlots.find((s) => s.id === slot.id);
      if (originalSlot) {
        setShiftSlots((prev) =>
          prev.map((s, i) =>
            i === index ? { ...originalSlot, isEditing: false } : s
          )
        );
      }
    }
  };

  /**
   * 新規シフト枠を作成
   */
  const createNewShift = async (slot: ShiftSlot) => {
    const result = await createShiftAction({
      date: initialData.date,
      departmentId: slot.departmentId,
      shiftTypeId: slot.shiftTypeId,
      description: slot.description,
      assignedInstructorIds: slot.instructorIds,
      force: false,
    });

    if (!result.success) {
      throw new Error(result.error || "シフトの作成に失敗しました");
    }

    // biome-ignore lint/suspicious/noAlert: 一時的な実装、後でtoast UIを追加予定
    alert("シフトを作成しました");
  };

  /**
   * 既存シフト枠を更新
   */
  const updateExistingShift = async (slot: ShiftSlot) => {
    if (!slot.id) {
      throw new Error("シフトIDが不正です");
    }

    const result = await updateShiftAction(slot.id, {
      description: slot.description,
      assignedInstructorIds: slot.instructorIds,
    });

    if (!result.success) {
      throw new Error(result.error || "シフトの更新に失敗しました");
    }

    // biome-ignore lint/suspicious/noAlert: 一時的な実装、後でtoast UIを追加予定
    alert("シフトを更新しました");
  };

  /**
   * シフト枠の保存
   */
  const handleSaveSlot = async (index: number) => {
    const slot = shiftSlots[index];

    if (!slot) {
      return;
    }

    // バリデーション
    const errors = validateShiftSlot(slot);
    if (errors.length > 0) {
      // biome-ignore lint/suspicious/noAlert: 一時的な実装、後でtoast UIを追加予定
      alert(errors.join("\n"));
      return;
    }

    setIsSubmitting(true);

    try {
      if (slot.isNew) {
        await createNewShift(slot);
      } else {
        await updateExistingShift(slot);
      }

      // データ再取得
      router.refresh();
    } catch (error) {
      // biome-ignore lint/suspicious/noAlert: 一時的な実装、後でtoast UIを追加予定
      alert(error instanceof Error ? error.message : "保存に失敗しました");
    } finally {
      setIsSubmitting(false);
    }
  };

  /**
   * シフト枠の削除
   */
  const handleDeleteSlot = (index: number) => {
    const slot = shiftSlots[index];

    if (!slot) {
      return;
    }

    if (!slot.id) {
      // 新規作成中のものは状態から削除するだけ
      setShiftSlots((prev) => prev.filter((_, i) => i !== index));
      return;
    }

    // 確認
    // biome-ignore lint/suspicious/noAlert: 一時的な実装、後でダイアログUIを追加予定
    const confirmed = confirm(
      "このシフト枠を削除しますか？\n配置されているインストラクターの割り当ても解除されます。"
    );

    if (!confirmed) {
      return;
    }

    executeDeleteSlot(slot.id);
  };

  /**
   * シフト枠の削除実行
   */
  const executeDeleteSlot = async (shiftId: number) => {
    setIsSubmitting(true);

    try {
      const result = await deleteShiftAction(shiftId);

      if (!result.success) {
        throw new Error(result.error || "シフトの削除に失敗しました");
      }

      // biome-ignore lint/suspicious/noAlert: 一時的な実装、後でtoast UIを追加予定
      alert("シフトを削除しました");
      router.refresh();
    } catch (error) {
      // biome-ignore lint/suspicious/noAlert: 一時的な実装、後でtoast UIを追加予定
      alert(error instanceof Error ? error.message : "削除に失敗しました");
    } finally {
      setIsSubmitting(false);
    }
  };

  /**
   * シフト枠の部門変更
   */
  const handleUpdateSlotDepartment = (index: number, departmentId: number) => {
    setShiftSlots((prev) =>
      prev.map((slot, i) => (i === index ? { ...slot, departmentId } : slot))
    );
  };

  /**
   * シフト枠のシフト種別変更
   */
  const handleUpdateSlotShiftType = (index: number, shiftTypeId: number) => {
    setShiftSlots((prev) =>
      prev.map((slot, i) => (i === index ? { ...slot, shiftTypeId } : slot))
    );
  };

  /**
   * シフト枠の備考変更
   */
  const handleUpdateSlotDescription = (index: number, description: string) => {
    setShiftSlots((prev) =>
      prev.map((slot, i) => (i === index ? { ...slot, description } : slot))
    );
  };

  /**
   * インストラクターの選択/解除
   */
  const handleToggleInstructor = (instructorId: number) => {
    // 編集中のシフト枠を探す
    const editingIndex = shiftSlots.findIndex((slot) => slot.isEditing);

    if (editingIndex === -1) {
      // biome-ignore lint/suspicious/noAlert: 一時的な実装、後でtoast UIを追加予定
      alert("シフト枠を選択してください");
      return;
    }

    setShiftSlots((prev) =>
      prev.map((slot, i) => {
        if (i !== editingIndex) {
          return slot;
        }

        const isSelected = slot.instructorIds.includes(instructorId);
        return {
          ...slot,
          instructorIds: isSelected
            ? slot.instructorIds.filter((id) => id !== instructorId)
            : [...slot.instructorIds, instructorId],
        };
      })
    );
  };

  /**
   * インストラクターの削除（編集中のシフト枠から）
   */
  const handleRemoveInstructor = (instructorId: number) => {
    const editingIndex = shiftSlots.findIndex((slot) => slot.isEditing);

    if (editingIndex === -1) {
      return;
    }

    setShiftSlots((prev) =>
      prev.map((slot, i) =>
        i === editingIndex
          ? {
              ...slot,
              instructorIds: slot.instructorIds.filter(
                (id) => id !== instructorId
              ),
            }
          : slot
      )
    );
  };

  // 編集中のシフト枠のインストラクターID配列
  const editingSlot = shiftSlots.find((slot) => slot.isEditing);
  const selectedInstructorIds = editingSlot?.instructorIds ?? [];

  return (
    <div className="flex flex-col gap-6 lg:flex-row lg:gap-8">
      {/* 左ペイン: シフトスロット一覧 */}
      <section className="flex-1 lg:min-w-0">
        <h2 className="mb-4 border-b pb-2 font-semibold text-lg">
          登録済みシフト
        </h2>

        <div className="space-y-4">
          {shiftSlots.length === 0 ? (
            <p className="py-8 text-center text-muted-foreground">
              シフトが登録されていません
            </p>
          ) : (
            shiftSlots.map((slot, index) => {
              // ユニークなキーを生成（idがある場合はそれを使用、ない場合は一時的なキーを生成）
              const uniqueKey =
                slot.id !== null ? `slot-${slot.id}` : `new-slot-${index}`;

              return slot.isEditing ? (
                <ShiftSlotEditor
                  departments={initialData.departments}
                  instructors={initialData.availableInstructors}
                  isSubmitting={isSubmitting}
                  key={uniqueKey}
                  onCancel={() => handleCancelEdit(index)}
                  onDepartmentChange={(departmentId) =>
                    handleUpdateSlotDepartment(index, departmentId)
                  }
                  onDescriptionChange={(description) =>
                    handleUpdateSlotDescription(index, description)
                  }
                  onRemoveInstructor={handleRemoveInstructor}
                  onSave={() => handleSaveSlot(index)}
                  onShiftTypeChange={(shiftTypeId) =>
                    handleUpdateSlotShiftType(index, shiftTypeId)
                  }
                  shiftTypes={initialData.shiftTypes}
                  slot={slot}
                />
              ) : (
                <ShiftSlotCard
                  departments={initialData.departments}
                  instructors={initialData.availableInstructors}
                  key={uniqueKey}
                  onDelete={() => handleDeleteSlot(index)}
                  onEdit={() => handleEditSlot(index)}
                  shiftTypes={initialData.shiftTypes}
                  slot={slot}
                />
              );
            })
          )}

          {initialData.preselectedDepartmentId ? (
            // 部門が事前選択されている場合は直接追加
            <AddShiftSlotButton
              onAdd={() => handleAddSlot(initialData.preselectedDepartmentId)}
            />
          ) : (
            // 部門が選択されていない場合はポップオーバーで選択
            <DepartmentSelectionPopover
              departments={initialData.departments}
              onOpenChange={setIsDepartmentPopoverOpen}
              onSelectDepartment={handleAddSlot}
              open={isDepartmentPopoverOpen}
            >
              <AddShiftSlotButton
                onAdd={() => setIsDepartmentPopoverOpen(true)}
              />
            </DepartmentSelectionPopover>
          )}
        </div>
      </section>

      {/* 右ペイン: インストラクター一覧（固定表示） */}
      <aside className="lg:sticky lg:top-6 lg:h-[calc(100vh-12rem)] lg:w-96 lg:shrink-0">
        <div className="lg:h-full lg:overflow-auto">
          <h2 className="mb-4 border-b pb-2 font-semibold text-lg">
            インストラクター一覧
          </h2>

          <InstructorList
            instructors={initialData.availableInstructors}
            onToggleInstructor={handleToggleInstructor}
            selectedInstructorIds={selectedInstructorIds}
            shiftSlots={shiftSlots}
          />
        </div>
      </aside>
    </div>
  );
}
