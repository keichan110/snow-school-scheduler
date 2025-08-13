"use client";

import { ArrowRight, ArrowLeft } from "lucide-react";
import { PersonSimpleSki, PersonSimpleSnowboard, Calendar, User } from "@phosphor-icons/react";
import { Button } from "@/components/ui/button";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { DayData, DepartmentType, Department, ShiftType, ApiResponse } from "./types";
import { getDepartmentBgClass } from "./utils/shiftUtils";
import {
  SAMPLE_INSTRUCTOR_NAMES,
  DEPARTMENT_STYLES,
  DEPARTMENT_NAMES,
} from "./constants/shiftConstants";
import { useState, useEffect } from "react";

type ModalStep = "view" | "create-step1";

interface ShiftFormData {
  departmentId: number;
  shiftTypeId: number;
  notes: string;
}

interface ShiftBottomModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  selectedDate: string | null;
  dayData: DayData | null;
  onStartShiftCreation?: () => void;
}

export function ShiftBottomModal({
  isOpen,
  onOpenChange,
  selectedDate,
  dayData,
  onStartShiftCreation = () => {}, // eslint-disable-line @typescript-eslint/no-unused-vars
}: ShiftBottomModalProps) {
  const [currentStep, setCurrentStep] = useState<ModalStep>("view");
  const [formData, setFormData] = useState<ShiftFormData>({
    departmentId: 0,
    shiftTypeId: 0,
    notes: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [departments, setDepartments] = useState<Department[]>([]);
  const [shiftTypes, setShiftTypes] = useState<ShiftType[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // API データ取得
  useEffect(() => {
    const fetchData = async () => {
      if (currentStep !== "create-step1") return;

      setIsLoading(true);
      try {
        const [departmentsRes, shiftTypesRes] = await Promise.all([
          fetch("/api/departments"),
          fetch("/api/shift-types"),
        ]);

        if (departmentsRes.ok) {
          const departmentsData: ApiResponse<Department[]> = await departmentsRes.json();
          if (departmentsData.success && departmentsData.data) {
            setDepartments(departmentsData.data);
          }
        }

        if (shiftTypesRes.ok) {
          const shiftTypesData: ApiResponse<ShiftType[]> = await shiftTypesRes.json();
          if (shiftTypesData.success && shiftTypesData.data) {
            setShiftTypes(shiftTypesData.data);
          }
        }
      } catch (error) {
        console.error("Failed to fetch data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [currentStep]);

  if (!selectedDate || !dayData) return null;

  const formatSelectedDate = () => {
    try {
      const date = new Date(selectedDate);
      const dateStr = date.toLocaleDateString("ja-JP", {
        year: "numeric",
        month: "long",
        day: "numeric",
      });
      const weekdayStr = date.toLocaleDateString("ja-JP", {
        weekday: "short",
      });
      return `${dateStr}（${weekdayStr}）`;
    } catch {
      return selectedDate;
    }
  };

  const handleStartShiftCreation = () => {
    setCurrentStep("create-step1");
  };

  const handleBackToView = () => {
    setCurrentStep("view");
    setFormData({ departmentId: 0, shiftTypeId: 0, notes: "" });
    setErrors({});
  };

  const handleDepartmentSelect = (departmentId: number) => {
    setFormData((prev) => ({ ...prev, departmentId }));
    if (errors.departmentId) {
      setErrors((prev) => ({ ...prev, departmentId: "" }));
    }
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

  const handleNext = () => {
    if (validateForm()) {
      // TODO: 次のステップ（インストラクター選択）へ進む
      console.log("Form data:", formData);
      // ここでインストラクター選択ステップへ遷移する予定
    }
  };

  const handleModalOpenChange = (open: boolean) => {
    // モーダルが閉じられた時にステップをリセット
    if (!open) {
      setCurrentStep("view");
      setFormData({ departmentId: 0, shiftTypeId: 0, notes: "" });
      setErrors({});
    }
    onOpenChange(open);
  };

  const renderDepartmentCard = (department: Department) => {
    // 部門名から判定するための簡易関数
    const getDepartmentType = (name: string): DepartmentType => {
      if (name.toLowerCase().includes("スキー") || name.toLowerCase().includes("ski")) {
        return "ski";
      } else if (
        name.toLowerCase().includes("スノーボード") ||
        name.toLowerCase().includes("snowboard")
      ) {
        return "snowboard";
      }
      return "mixed";
    };

    const departmentType = getDepartmentType(department.name);
    const styles = DEPARTMENT_STYLES[departmentType];
    const isSelected = formData.departmentId === department.id;

    const Icon =
      departmentType === "ski"
        ? PersonSimpleSki
        : departmentType === "snowboard"
        ? PersonSimpleSnowboard
        : Calendar;

    return (
      <div
        key={department.id}
        onClick={() => handleDepartmentSelect(department.id)}
        className={cn(
          "p-3 border rounded-lg cursor-pointer transition-all duration-200 hover:bg-accent flex items-center space-x-2",
          isSelected
            ? `${styles.sectionBorderClass} ${styles.sectionBgClass}`
            : "border-gray-200 hover:border-gray-300"
        )}
      >
        <Icon
          className={cn("w-5 h-5", isSelected ? styles.iconColor : "text-gray-400")}
          weight="regular"
        />
        <span className={cn("font-medium", isSelected ? styles.sectionTextClass : "text-gray-600")}>
          {department.name}
        </span>
      </div>
    );
  };

  const generateInstructorChips = (count: number, departmentType: DepartmentType) => {
    const chipClass = DEPARTMENT_STYLES[departmentType].chipClass;

    return Array.from({ length: count }).map((_, i) => (
      <div
        key={i}
        className={cn(
          "inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium cursor-pointer transition-all duration-200 hover:scale-105 border",
          chipClass
        )}
      >
        <User className="w-3 h-3" weight="fill" />
        {SAMPLE_INSTRUCTOR_NAMES[i % SAMPLE_INSTRUCTOR_NAMES.length]}
      </div>
    ));
  };

  const createDepartmentSection = (
    departmentType: DepartmentType,
    shifts: typeof dayData.shifts,
    icon: React.ReactNode
  ) => {
    const departmentName = DEPARTMENT_NAMES[departmentType];
    const styles = DEPARTMENT_STYLES[departmentType];
    const {
      sectionBgClass: bgClass,
      sectionBorderClass: borderClass,
      sectionTextClass: textClass,
    } = styles;

    return (
      <div
        key={departmentType}
        className={cn(
          "rounded-xl p-3 md:p-4 border transition-all duration-300",
          bgClass,
          borderClass
        )}
      >
        <div className="md:flex md:items-start md:gap-4">
          {/* 部門ヘッダー */}
          <div className="flex items-center gap-2 md:gap-3 mb-3 md:mb-0 md:w-40 md:flex-shrink-0">
            {icon}
            <div>
              <h4 className={cn("font-semibold text-base md:text-lg", textClass)}>
                {departmentName}
              </h4>
              <p className="text-xs text-muted-foreground">{styles.label}</p>
            </div>
          </div>

          {/* シフト種類とインストラクター */}
          <div className="flex-1 space-y-3">
            {shifts
              .filter((s) => s.department === departmentType)
              .map((shift, idx) => (
                <div
                  key={idx}
                  className="bg-background rounded-lg p-3 border border-border hover:shadow-sm transition-all duration-200"
                >
                  <div className="flex items-center justify-between mb-2 md:mb-3">
                    <div
                      className={cn(
                        "px-3 py-2 rounded-lg font-medium text-sm text-foreground",
                        getDepartmentBgClass(shift.department as DepartmentType)
                      )}
                    >
                      {shift.type}
                    </div>
                    <div className="text-xs text-muted-foreground">{shift.count}名配置</div>
                  </div>
                  <div className="space-y-1 md:space-y-0 md:flex md:flex-wrap md:gap-2">
                    {generateInstructorChips(shift.count, departmentType)}
                  </div>
                </div>
              ))}
          </div>
        </div>
      </div>
    );
  };

  return (
    <Drawer open={isOpen} onOpenChange={handleModalOpenChange}>
      <DrawerContent className="max-h-[80vh]">
        <DrawerHeader className="text-center pb-2">
          <DrawerTitle className="flex items-center justify-center gap-2 text-xl md:text-2xl">
            {formatSelectedDate()}
          </DrawerTitle>
        </DrawerHeader>

        <div className="px-4 pb-4 overflow-y-auto">
          {currentStep === "view" ? (
            /* シフト表示モード */
            <div className="space-y-4">
              {dayData.shifts.length === 0 ? (
                /* シフトなしの場合 */
                <div className="text-center py-8 text-muted-foreground">
                  <Calendar className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <div className="text-lg font-medium">シフトが設定されていません</div>
                  <div className="text-sm mt-1">新しいシフトを作成できます</div>
                </div>
              ) : (
                /* シフトがある場合 */
                <>
                  {/* スキー部門 */}
                  {dayData.shifts.filter((s) => s.department === "ski").length > 0 &&
                    createDepartmentSection(
                      "ski",
                      dayData.shifts,
                      <PersonSimpleSki
                        className={cn("w-5 h-5", DEPARTMENT_STYLES.ski.iconColor)}
                        weight="fill"
                      />
                    )}

                  {/* スノーボード部門 */}
                  {dayData.shifts.filter((s) => s.department === "snowboard").length > 0 &&
                    createDepartmentSection(
                      "snowboard",
                      dayData.shifts,
                      <PersonSimpleSnowboard
                        className={cn("w-5 h-5", DEPARTMENT_STYLES.snowboard.iconColor)}
                        weight="fill"
                      />
                    )}

                  {/* 共通部門 */}
                  {dayData.shifts.filter((s) => s.department === "mixed").length > 0 &&
                    createDepartmentSection(
                      "mixed",
                      dayData.shifts,
                      <Calendar
                        className={cn("w-5 h-5", DEPARTMENT_STYLES.mixed.iconColor)}
                        weight="fill"
                      />
                    )}
                </>
              )}
            </div>
          ) : (
            /* シフト作成フォームモード */
            <div className="space-y-6 max-w-2xl mx-auto">
              {/* 進捗ステップ */}
              <div className="flex items-center justify-center space-x-2 mb-6">
                <div className="w-6 h-6 bg-primary border-2 border-primary rounded-full flex items-center justify-center">
                  <div className="w-1.5 h-1.5 bg-primary-foreground rounded-full"></div>
                </div>
                <div className="w-8 h-px bg-border"></div>
                <div className="w-6 h-6 bg-background border-2 border-border rounded-full flex items-center justify-center"></div>
              </div>

              {/* 部門選択 */}
              <div className="space-y-3">
                <Label className="text-sm font-medium">
                  部門 <span className="text-red-500">*</span>
                </Label>
                {isLoading ? (
                  <div className="text-sm text-muted-foreground">読み込み中...</div>
                ) : (
                  <div className="flex gap-4">
                    {departments.map((dept) => renderDepartmentCard(dept))}
                  </div>
                )}
                {errors.departmentId && (
                  <p className="text-sm text-red-500">{errors.departmentId}</p>
                )}
              </div>

              {/* シフト種類選択 */}
              <div className="space-y-3">
                <Label htmlFor="shiftType" className="text-sm font-medium">
                  シフト種類 <span className="text-red-500">*</span>
                </Label>
                <select
                  id="shiftType"
                  value={formData.shiftTypeId}
                  onChange={(e) => {
                    const value = parseInt(e.target.value) || 0;
                    setFormData((prev) => ({ ...prev, shiftTypeId: value }));
                    if (errors.shiftTypeId) {
                      setErrors((prev) => ({ ...prev, shiftTypeId: "" }));
                    }
                  }}
                  className="w-full px-3 py-2 border border-input rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent bg-background"
                  disabled={isLoading}
                >
                  <option value={0}>選択してください</option>
                  {shiftTypes.map((type) => (
                    <option key={type.id} value={type.id}>
                      {type.name}
                    </option>
                  ))}
                </select>
                {errors.shiftTypeId && <p className="text-sm text-red-500">{errors.shiftTypeId}</p>}
              </div>

              {/* 備考 */}
              <div className="space-y-3">
                <Label htmlFor="notes" className="text-sm font-medium">
                  備考
                </Label>
                <textarea
                  id="notes"
                  value={formData.notes}
                  onChange={(e) => setFormData((prev) => ({ ...prev, notes: e.target.value }))}
                  placeholder="追加の情報があれば入力してください"
                  rows={4}
                  className="w-full px-3 py-2 border border-input rounded-md text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                />
              </div>
            </div>
          )}
        </div>

        <DrawerFooter>
          {currentStep === "view" ? (
            <div className="flex flex-col md:flex-row gap-2 md:gap-4">
              <DrawerClose asChild>
                <Button variant="outline" size="lg" className="md:flex-1">
                  閉じる
                </Button>
              </DrawerClose>
              <Button onClick={handleStartShiftCreation} className="md:flex-1 gap-2" size="lg">
                選択した日でシフト作成を開始
                <ArrowRight className="w-4 h-4" />
              </Button>
            </div>
          ) : (
            <div className="flex flex-col md:flex-row gap-2 md:gap-4">
              <Button
                onClick={handleBackToView}
                variant="outline"
                size="lg"
                className="md:flex-1 gap-2"
              >
                <ArrowLeft className="w-4 h-4" />
                戻る
              </Button>
              <Button onClick={handleNext} size="lg" className="md:flex-1 gap-2">
                次へ：インストラクター選択
                <ArrowRight className="w-4 h-4" />
              </Button>
            </div>
          )}
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
}
