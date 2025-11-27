"use client";

import { ArrowRight, Edit3 } from "lucide-react";
import { useEffect, useState } from "react";
import { useAuth } from "@/app/_providers/auth";
import { useNotification } from "@/app/_providers/notifications";
import { AdminShiftModal } from "@/app/(member)/shifts/_components/base-shift-modal";
import { Button } from "@/components/ui/button";
import { DrawerFooter } from "@/components/ui/drawer";
import { hasManagePermission } from "@/lib/auth/permissions";
import { cn } from "@/lib/utils";
import { createShiftAction } from "../_lib/actions";
import { useShiftEditData } from "../_lib/hooks/use-shift-edit-data";
import type { DayData } from "../_lib/types";
import { toFormattedInstructors } from "../_lib/utils/instructor-mappers";
import { InstructorSelector } from "./instructor-selector";
import { ShiftBasicInfoForm } from "./shift-basic-info-form";

type ModalStep = "create-step1" | "create-step2";

type ShiftFormData = {
  departmentId: number;
  shiftTypeId: number;
  notes: string;
  selectedInstructorIds: number[];
};

type ShiftFormMasterData = {
  departments: Array<{ id: number; name: string; code: string }>;
  shiftTypes: Array<{ id: number; name: string }>;
  stats: { activeInstructorCount: number };
};

type UnifiedShiftBottomModalProps = {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  selectedDate: string | null;
  dayData: DayData | null;
  onShiftUpdated?: () => void | Promise<void>;
  initialStep?: "create-step1" | "create-step2";
  shiftFormData: ShiftFormMasterData;
};

const INITIAL_FORM_DATA: ShiftFormData = {
  departmentId: 0,
  shiftTypeId: 0,
  notes: "",
  selectedInstructorIds: [],
};

/**
 * シフト作成/編集の統合ボトムシートモーダル
 *
 * @description
 * シフトの作成と編集を担当する2ステップのモーダルコンポーネント。
 * - ステップ1: 基本情報（部門、シフトタイプ、ノート）の入力
 * - ステップ2: インストラクターの選択
 * 既存シフトの編集にも対応し、管理者権限のチェックとバリデーションを実装しています。
 *
 * @component
 * @example
 * ```tsx
 * <UnifiedShiftBottomModal
 *   isOpen={true}
 *   onOpenChange={setIsOpen}
 *   selectedDate="2024-01-15"
 *   dayData={dayData}
 *   onShiftUpdated={handleUpdate}
 *   initialStep="create-step1"
 *   shiftFormData={masterData}
 * />
 * ```
 */
export function UnifiedShiftBottomModal({
  isOpen,
  onOpenChange,
  selectedDate,
  dayData,
  onShiftUpdated,
  initialStep = "create-step1",
  shiftFormData,
}: UnifiedShiftBottomModalProps) {
  const { user } = useAuth();
  const { showNotification } = useNotification();

  // 管理権限チェック（MANAGER以上）
  const canManage = user ? hasManagePermission(user, "shifts") : false;

  // 管理機能の状態
  const [currentStep, setCurrentStep] = useState<ModalStep>(initialStep);
  const [formData, setFormData] = useState<ShiftFormData>(INITIAL_FORM_DATA);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [editMode, setEditMode] = useState<{
    isEdit: boolean;
  }>({ isEdit: false });
  const [localDayData, setLocalDayData] = useState<DayData | null>(dayData);

  // シフト編集データを取得（React Query）
  const { data: shiftEditData, isLoading: isLoadingEditData } =
    useShiftEditData({
      date: selectedDate || "",
      departmentId: formData.departmentId,
      shiftTypeId: formData.shiftTypeId,
      enabled:
        currentStep === "create-step2" &&
        Boolean(selectedDate) &&
        formData.departmentId > 0 &&
        formData.shiftTypeId > 0,
    });

  // ローディング状態管理
  const [isSubmitting, setIsSubmitting] = useState(false);

  // dayDataが変更された時にlocalDayDataを更新
  useEffect(() => {
    setLocalDayData(dayData);
  }, [dayData]);

  // initialStepが変更された時にcurrentStepを更新
  useEffect(() => {
    setCurrentStep(initialStep);
  }, [initialStep]);

  /**
   * シフト編集データが取得できたらフォームを初期化
   *
   * @description
   * Step2に遷移した際に、APIから取得したデータでフォームを初期化する。
   * 既存シフトがある場合は編集モード、ない場合は作成モードに設定。
   *
   * React Queryのキャッシュメカニズムにより、同一クエリキーのデータは
   * 参照が安定しているため、shiftEditDataを依存配列に含めても無限ループは発生しない。
   */
  useEffect(() => {
    if (shiftEditData && currentStep === "create-step2") {
      // 編集モードか作成モードかを判定
      if (shiftEditData.mode === "edit" && shiftEditData.shift) {
        setEditMode({
          isEdit: true,
        });
      } else {
        setEditMode({
          isEdit: false,
        });
      }

      // フォームデータを設定
      setFormData((prev) => ({
        ...prev,
        notes: shiftEditData.formData.description || "",
        selectedInstructorIds: shiftEditData.formData.selectedInstructorIds,
      }));
    }
  }, [shiftEditData, currentStep]);

  // 権限がない場合、選択された日付がない場合はモーダルを表示しない
  if (!(canManage && selectedDate && localDayData)) {
    return null;
  }

  // 管理機能のハンドラー
  /**
   * キャンセルハンドラー
   *
   * @description
   * モーダルを閉じ、フォーム状態をリセットします。
   */
  const handleCancel = () => {
    setFormData(INITIAL_FORM_DATA);
    setErrors({});
    setEditMode({ isEdit: false });
    onOpenChange(false);
  };

  /**
   * 部門変更ハンドラー
   *
   * @param departmentId - 選択された部門ID
   */
  const handleDepartmentChange = (departmentId: number) => {
    setFormData((prev) => ({ ...prev, departmentId }));
    if (errors.departmentId) {
      setErrors((prev) => ({ ...prev, departmentId: "" }));
    }
  };

  /**
   * シフト種別変更ハンドラー
   *
   * @param shiftTypeId - 選択されたシフト種別ID
   */
  const handleShiftTypeChange = (shiftTypeId: number) => {
    setFormData((prev) => ({ ...prev, shiftTypeId }));
    if (errors.shiftTypeId) {
      setErrors((prev) => ({ ...prev, shiftTypeId: "" }));
    }
  };

  /**
   * 備考変更ハンドラー
   *
   * @param notes - 入力された備考テキスト
   */
  const handleNotesChange = (notes: string) => {
    setFormData((prev) => ({ ...prev, notes }));
  };

  /**
   * フォームバリデーション
   *
   * @description
   * Step1のフォーム（部門・シフト種別）を検証します。
   *
   * @returns {boolean} バリデーション結果（true: 成功、false: 失敗）
   */
  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.departmentId) {
      newErrors.departmentId = "部門を選択してください";
    }

    if (!formData.shiftTypeId) {
      newErrors.shiftTypeId = "シフト種類を選択してください";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  /**
   * 次へボタンハンドラー（Step1 → Step2）
   *
   * @description
   * フォームをバリデーションしてStep2に遷移します。
   * Step2への遷移時に、useShiftEditDataフックが自動的にAPIからデータを取得します。
   */
  const handleNext = () => {
    if (!(canManage && validateForm() && selectedDate)) {
      return;
    }

    // Step2に遷移（useShiftEditDataが自動的にデータを取得）
    setCurrentStep("create-step2");
  };

  /**
   * インストラクター選択トグルハンドラー
   *
   * @description
   * インストラクターの選択/選択解除を切り替えます。
   *
   * @param instructorId - トグルするインストラクターのID
   */
  const handleInstructorToggle = (instructorId: number) => {
    setFormData((prev) => {
      const isSelected = prev.selectedInstructorIds.includes(instructorId);
      const newSelectedIds = isSelected
        ? prev.selectedInstructorIds.filter((id) => id !== instructorId)
        : [...prev.selectedInstructorIds, instructorId];

      return { ...prev, selectedInstructorIds: newSelectedIds };
    });
  };

  /**
   * フォーム状態リセット
   *
   * @description
   * フォームデータ、エラー、編集モードを初期状態に戻します。
   */
  const resetFormState = () => {
    setFormData(INITIAL_FORM_DATA);
    setErrors({});
    setEditMode({ isEdit: false });
  };

  /**
   * シフト作成/更新成功時の処理
   *
   * @description
   * 成功通知を表示し、フォームをリセットしてモーダルを閉じます。
   * 親コンポーネントのonShiftUpdatedコールバックを呼び出してデータを更新します。
   */
  const handleShiftSuccess = async () => {
    const message = editMode.isEdit
      ? "シフトが正常に更新されました"
      : "シフトが正常に作成されました";

    showNotification(message, "success");
    resetFormState();
    onOpenChange(false);

    if (onShiftUpdated) {
      await onShiftUpdated();
    }
  };

  /**
   * シフト作成/更新ハンドラー
   *
   * @description
   * バリデーションを実行し、シフトの作成または更新を行います。
   * エラーハンドリングはReact Query mutationに委譲し、結果のみをチェックします。
   */
  const handleCreateShift = async () => {
    // バリデーション
    if (!canManage || formData.selectedInstructorIds.length === 0) {
      setErrors({ instructors: "最低1名のインストラクターを選択してください" });
      return;
    }

    if (!selectedDate) {
      setErrors({ submit: "日付が選択されていません" });
      return;
    }

    setErrors({});
    setIsSubmitting(true);

    try {
      // Server Actionを実行
      const result = await createShiftAction({
        date: selectedDate,
        departmentId: formData.departmentId,
        shiftTypeId: formData.shiftTypeId,
        description: formData.notes || null,
        assignedInstructorIds: formData.selectedInstructorIds,
        force: editMode.isEdit,
      });

      // 成功時の処理
      if (result.success) {
        await handleShiftSuccess();
      } else {
        setErrors({ submit: result.error || "シフトの処理に失敗しました" });
      }
    } catch (error) {
      setErrors({
        submit:
          error instanceof Error
            ? error.message
            : "シフトの処理中にエラーが発生しました",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  /**
   * モーダル開閉ハンドラー
   *
   * @description
   * モーダルを閉じる際にフォーム状態をリセットします。
   *
   * @param open - モーダルの開閉状態
   */
  const handleModalOpenChange = (open: boolean) => {
    if (!open) {
      resetFormState();
    }
    onOpenChange(open);
  };

  /**
   * インストラクター削除ハンドラー
   *
   * @description
   * 選択済みインストラクター一覧から指定したインストラクターを削除します。
   *
   * @param instructorId - 削除するインストラクターのID
   */
  const handleRemoveInstructor = (instructorId: number) => {
    setFormData((prev) => ({
      ...prev,
      selectedInstructorIds: prev.selectedInstructorIds.filter(
        (id) => id !== instructorId
      ),
    }));
  };

  // 進捗ステップUI
  const renderProgressSteps = () => (
    <div className="mb-6 flex items-center justify-center space-x-2">
      <div
        className={cn(
          "flex h-6 w-6 items-center justify-center rounded-full border-2 font-medium text-xs",
          currentStep === "create-step1" || currentStep === "create-step2"
            ? "border-primary bg-primary text-primary-foreground"
            : "border-border bg-background"
        )}
      >
        1
      </div>
      <div
        className={cn(
          "h-px w-8",
          currentStep === "create-step2" ? "bg-primary" : "bg-border"
        )}
      />
      <div
        className={cn(
          "flex h-6 w-6 items-center justify-center rounded-full border-2 font-medium text-xs",
          currentStep === "create-step2"
            ? "border-primary bg-primary text-primary-foreground"
            : "border-border bg-background"
        )}
      >
        2
      </div>
    </div>
  );

  // ステップ情報表示
  const renderStepInfo = () => {
    if (currentStep !== "create-step2") {
      return null;
    }

    const departmentName = shiftFormData?.departments.find(
      (d) => d.id === formData.departmentId
    )?.name;
    const shiftTypeName = shiftFormData?.shiftTypes.find(
      (t) => t.id === formData.shiftTypeId
    )?.name;

    return (
      <>
        <div className="mb-6 space-y-1 text-center">
          <div className="text-muted-foreground text-sm">
            {departmentName} - {shiftTypeName}
          </div>
        </div>

        {editMode.isEdit && (
          <div className="mb-4 rounded-lg border-2 border-blue-200 bg-blue-50 p-4 dark:border-blue-700 dark:bg-blue-950">
            <div className="mb-2 flex items-center gap-2">
              <Edit3 className="h-4 w-4 text-blue-600 dark:text-blue-400" />
              <span className="font-medium text-blue-800 text-sm dark:text-blue-200">
                編集モード
              </span>
            </div>
            <p className="text-blue-700 text-xs dark:text-blue-300">
              既存のシフトデータを編集しています。変更内容を確認して「シフトを更新」をクリックしてください。
            </p>
          </div>
        )}
      </>
    );
  };

  // フッター（ステップ1）
  const renderStep1Footer = () => (
    <div className="flex flex-col gap-2 md:flex-row md:gap-4">
      <Button
        className="gap-2 md:flex-1"
        onClick={handleCancel}
        size="lg"
        variant="outline"
      >
        キャンセル
      </Button>
      <Button className="gap-2 md:flex-1" onClick={handleNext} size="lg">
        次へ：インストラクター選択
        <ArrowRight className="h-4 w-4" />
      </Button>
    </div>
  );

  // フッター（ステップ2）
  const renderStep2Footer = () => {
    const getSubmitButtonLabel = () => {
      if (isSubmitting) {
        return "処理中...";
      }
      if (editMode.isEdit) {
        return "シフトを更新";
      }
      return "シフト登録";
    };

    return (
      <div className="flex flex-col gap-2 md:flex-row md:gap-4">
        <Button
          className="gap-2 md:flex-1"
          onClick={handleCancel}
          size="lg"
          variant="outline"
        >
          キャンセル
        </Button>
        <Button
          className="gap-2 md:flex-1"
          disabled={isSubmitting}
          onClick={handleCreateShift}
          size="lg"
        >
          {getSubmitButtonLabel()}
        </Button>
      </div>
    );
  };

  // フッター
  const renderFooter = () => (
    <DrawerFooter>
      {currentStep === "create-step1"
        ? renderStep1Footer()
        : renderStep2Footer()}
    </DrawerFooter>
  );

  return (
    <AdminShiftModal
      dayData={localDayData}
      footer={renderFooter()}
      isOpen={isOpen}
      onOpenChange={handleModalOpenChange}
      selectedDate={selectedDate}
      showEmptyState={false}
    >
      {/* 管理機能のフォーム */}
      <div className="mx-auto max-w-2xl space-y-6">
        {renderProgressSteps()}
        {renderStepInfo()}

        {currentStep === "create-step1" && (
          <ShiftBasicInfoForm
            departments={shiftFormData?.departments ?? []}
            errors={errors}
            formData={formData}
            isLoading={false}
            onDepartmentChange={handleDepartmentChange}
            onNotesChange={handleNotesChange}
            onShiftTypeChange={handleShiftTypeChange}
            shiftTypes={shiftFormData?.shiftTypes ?? []}
          />
        )}

        {currentStep === "create-step2" && (
          <InstructorSelector
            errors={errors}
            instructors={
              shiftEditData
                ? toFormattedInstructors(shiftEditData.availableInstructors)
                : []
            }
            isLoading={isLoadingEditData}
            onRemove={handleRemoveInstructor}
            onToggle={handleInstructorToggle}
            selectedInstructorIds={formData.selectedInstructorIds}
          />
        )}
      </div>
    </AdminShiftModal>
  );
}
