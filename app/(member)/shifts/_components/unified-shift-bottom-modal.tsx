"use client";

import { ArrowRight, Edit3 } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { useNotification } from "@/app/_providers/notifications";
import { AdminShiftModal } from "@/app/(member)/shifts/_components/base-shift-modal";
import { Button } from "@/components/ui/button";
import { DrawerFooter } from "@/components/ui/drawer";
import { useAuth } from "@/contexts/auth-context";
import { hasManagePermission } from "@/lib/auth/permissions";
import type { AuthenticatedUser } from "@/lib/auth/types";
import { cn } from "@/lib/utils";
import { prepareShift } from "../_lib/api-client";
import type {
  ApiResponse,
  DayData,
  Department,
  ShiftType,
} from "../_lib/types";
import { useCreateShift } from "../_lib/use-shifts";
import type { ExistingShiftData } from "./duplicate-shift-dialog";
import { InstructorSelector } from "./instructor-selector";
import { ShiftBasicInfoForm } from "./shift-basic-info-form";

type ModalStep = "create-step1" | "create-step2";

type Instructor = {
  id: number;
  lastName: string;
  firstName: string;
  lastNameKana?: string;
  firstNameKana?: string;
  status: string;
  certifications: {
    id: number;
    name: string;
    shortName: string;
    organization: string;
    department: {
      id: number;
      name: string;
    };
  }[];
};

type ShiftFormData = {
  departmentId: number;
  shiftTypeId: number;
  notes: string;
  selectedInstructorIds: number[];
};

type UnifiedShiftBottomModalProps = {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  selectedDate: string | null;
  dayData: DayData | null;
  onShiftUpdated?: () => Promise<void>;
  initialStep?: "create-step1" | "create-step2";
};

const INITIAL_FORM_DATA: ShiftFormData = {
  departmentId: 0,
  shiftTypeId: 0,
  notes: "",
  selectedInstructorIds: [],
};

export function UnifiedShiftBottomModal({
  isOpen,
  onOpenChange,
  selectedDate,
  dayData,
  onShiftUpdated,
  initialStep = "create-step1",
}: UnifiedShiftBottomModalProps) {
  const { user } = useAuth();
  const { showNotification } = useNotification();

  // 管理権限チェック（MANAGER以上）
  const canManage = user
    ? hasManagePermission(user as AuthenticatedUser, "shifts")
    : false;

  // 管理機能の状態
  const [currentStep, setCurrentStep] = useState<ModalStep>(initialStep);
  const [formData, setFormData] = useState<ShiftFormData>(INITIAL_FORM_DATA);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [departments, setDepartments] = useState<Department[]>([]);
  const [shiftTypes, setShiftTypes] = useState<ShiftType[]>([]);
  const [instructors, setInstructors] = useState<Instructor[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [editMode, setEditMode] = useState<{
    isEdit: boolean;
    existingShift?: ExistingShiftData;
  }>({ isEdit: false });
  const [localDayData, setLocalDayData] = useState<DayData | null>(dayData);

  // Server Actions
  const createShiftMutation = useCreateShift();

  // dayDataが変更された時にlocalDayDataを更新
  useEffect(() => {
    setLocalDayData(dayData);
  }, [dayData]);

  // initialStepが変更された時にcurrentStepを更新
  useEffect(() => {
    setCurrentStep(initialStep);
  }, [initialStep]);

  // データ取得ヘルパー関数
  const fetchDepartmentsAndShiftTypes = useCallback(async () => {
    const [departmentsRes, shiftTypesRes] = await Promise.all([
      fetch("/api/departments"),
      fetch("/api/shift-types"),
    ]);

    if (departmentsRes?.ok) {
      const departmentsData: ApiResponse<Department[]> =
        await departmentsRes.json();
      if (departmentsData.success && departmentsData.data) {
        setDepartments(departmentsData.data);
      }
    }

    if (shiftTypesRes?.ok) {
      const shiftTypesData: ApiResponse<ShiftType[]> =
        await shiftTypesRes.json();
      if (shiftTypesData.success && shiftTypesData.data) {
        setShiftTypes(shiftTypesData.data);
      }
    }
  }, []);

  const fetchInstructors = useCallback(async () => {
    const instructorsRes = await fetch(
      `/api/instructors?status=ACTIVE&departmentId=${formData.departmentId}`
    );

    if (instructorsRes?.ok) {
      const instructorsData: ApiResponse<Instructor[]> =
        await instructorsRes.json();
      if (instructorsData.success && instructorsData.data) {
        setInstructors(instructorsData.data);
      }
    }
  }, [formData.departmentId]);

  // API データ取得
  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        if (currentStep === "create-step1") {
          await fetchDepartmentsAndShiftTypes();
        } else if (currentStep === "create-step2") {
          await fetchInstructors();
        }
      } catch (_error) {
        // エラーは無視してデフォルト値を使用
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [currentStep, fetchDepartmentsAndShiftTypes, fetchInstructors]);

  // 権限がない場合、選択された日付がない場合はモーダルを表示しない
  if (!(canManage && selectedDate && localDayData)) {
    return null;
  }

  // 管理機能のハンドラー
  const handleCancel = () => {
    setFormData(INITIAL_FORM_DATA);
    setErrors({});
    setEditMode({ isEdit: false });
    onOpenChange(false);
  };

  const handleDepartmentChange = (departmentId: number) => {
    setFormData((prev) => ({ ...prev, departmentId }));
    if (errors.departmentId) {
      setErrors((prev) => ({ ...prev, departmentId: "" }));
    }
  };

  const handleShiftTypeChange = (shiftTypeId: number) => {
    setFormData((prev) => ({ ...prev, shiftTypeId }));
    if (errors.shiftTypeId) {
      setErrors((prev) => ({ ...prev, shiftTypeId: "" }));
    }
  };

  const handleNotesChange = (notes: string) => {
    setFormData((prev) => ({ ...prev, notes }));
  };

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

  const handleNext = async () => {
    if (!(canManage && validateForm() && selectedDate)) {
      return;
    }

    setIsLoading(true);

    try {
      const prepareResponse = await prepareShift({
        date: selectedDate,
        departmentId: formData.departmentId,
        shiftTypeId: formData.shiftTypeId,
      });

      if (prepareResponse.success && prepareResponse.data) {
        if (
          prepareResponse.data.mode === "edit" &&
          prepareResponse.data.shift
        ) {
          setEditMode({
            isEdit: true,
            existingShift: prepareResponse.data.shift,
          });
        } else {
          setEditMode({
            isEdit: false,
          });
        }

        setFormData((prev) => ({
          ...prev,
          notes: prepareResponse.data?.formData.description || "",
          selectedInstructorIds:
            prepareResponse.data?.formData.selectedInstructorIds || [],
        }));

        setCurrentStep("create-step2");
      } else {
        setErrors({ submit: prepareResponse.error || "エラーが発生しました" });
      }
    } catch (_error) {
      setErrors({ submit: "ネットワークエラーが発生しました" });
    } finally {
      setIsLoading(false);
    }
  };

  const handleInstructorToggle = (instructorId: number) => {
    setFormData((prev) => {
      const isSelected = prev.selectedInstructorIds.includes(instructorId);
      const newSelectedIds = isSelected
        ? prev.selectedInstructorIds.filter((id) => id !== instructorId)
        : [...prev.selectedInstructorIds, instructorId];

      return { ...prev, selectedInstructorIds: newSelectedIds };
    });
  };

  const resetFormState = () => {
    setFormData(INITIAL_FORM_DATA);
    setErrors({});
    setEditMode({ isEdit: false });
  };

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

  const handleCreateShift = async () => {
    if (!canManage || formData.selectedInstructorIds.length === 0) {
      setErrors({ instructors: "最低1名のインストラクターを選択してください" });
      return;
    }

    if (!selectedDate) {
      setErrors({ submit: "日付が選択されていません" });
      return;
    }

    setErrors({});

    const result = await createShiftMutation.mutateAsync({
      date: selectedDate,
      departmentId: formData.departmentId,
      shiftTypeId: formData.shiftTypeId,
      description: formData.notes || null,
      assignedInstructorIds: formData.selectedInstructorIds,
      force: editMode.isEdit,
    });

    if (result.success) {
      await handleShiftSuccess();
    } else {
      setErrors({ submit: result.error || "シフトの処理に失敗しました" });
    }
  };

  const handleModalOpenChange = (open: boolean) => {
    if (!open) {
      resetFormState();
    }
    onOpenChange(open);
  };

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

    const departmentName = departments.find(
      (d) => d.id === formData.departmentId
    )?.name;
    const shiftTypeName = shiftTypes.find(
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
      if (createShiftMutation.isPending) {
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
          disabled={createShiftMutation.isPending}
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
            departments={departments}
            errors={errors}
            formData={formData}
            isLoading={isLoading}
            onDepartmentChange={handleDepartmentChange}
            onNotesChange={handleNotesChange}
            onShiftTypeChange={handleShiftTypeChange}
            shiftTypes={shiftTypes}
          />
        )}

        {currentStep === "create-step2" && (
          <InstructorSelector
            departmentId={formData.departmentId}
            errors={errors}
            instructors={instructors}
            isLoading={isLoading}
            onRemove={handleRemoveInstructor}
            onToggle={handleInstructorToggle}
            selectedInstructorIds={formData.selectedInstructorIds}
          />
        )}
      </div>
    </AdminShiftModal>
  );
}
