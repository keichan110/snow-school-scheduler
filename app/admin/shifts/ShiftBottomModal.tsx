'use client';

import { ArrowRight, ArrowLeft, Search, X } from 'lucide-react';
import {
  PersonSimpleSki,
  PersonSimpleSnowboard,
  Calendar,
  User,
  Check,
} from '@phosphor-icons/react';
import { Button } from '@/components/ui/button';
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from '@/components/ui/drawer';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';
import { DayData, DepartmentType, Department, ShiftType, ApiResponse } from './types';
import { getDepartmentBgClass } from './utils/shiftUtils';
import {
  SAMPLE_INSTRUCTOR_NAMES,
  DEPARTMENT_STYLES,
  DEPARTMENT_NAMES,
} from './constants/shiftConstants';
import { useState, useEffect } from 'react';

type ModalStep = 'view' | 'create-step1' | 'create-step2';

interface Instructor {
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
}

interface ShiftFormData {
  departmentId: number;
  shiftTypeId: number;
  notes: string;
  selectedInstructorIds: number[];
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
  const [currentStep, setCurrentStep] = useState<ModalStep>('view');
  const [formData, setFormData] = useState<ShiftFormData>({
    departmentId: 0,
    shiftTypeId: 0,
    notes: '',
    selectedInstructorIds: [],
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [departments, setDepartments] = useState<Department[]>([]);
  const [shiftTypes, setShiftTypes] = useState<ShiftType[]>([]);
  const [instructors, setInstructors] = useState<Instructor[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isCreatingShift, setIsCreatingShift] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  // API データ取得
  useEffect(() => {
    const fetchData = async () => {
      if (currentStep === 'view') return;

      setIsLoading(true);
      try {
        const requests = [];

        if (currentStep === 'create-step1') {
          requests.push(fetch('/api/departments'), fetch('/api/shift-types'));
        } else if (currentStep === 'create-step2') {
          requests.push(fetch('/api/instructors?status=ACTIVE'));
        }

        const responses = await Promise.all(requests);

        if (currentStep === 'create-step1' && responses.length >= 2) {
          const [departmentsRes, shiftTypesRes] = responses;

          if (departmentsRes && departmentsRes.ok) {
            const departmentsData: ApiResponse<Department[]> = await departmentsRes.json();
            if (departmentsData.success && departmentsData.data) {
              setDepartments(departmentsData.data);
            }
          }

          if (shiftTypesRes && shiftTypesRes.ok) {
            const shiftTypesData: ApiResponse<ShiftType[]> = await shiftTypesRes.json();
            if (shiftTypesData.success && shiftTypesData.data) {
              setShiftTypes(shiftTypesData.data);
            }
          }
        } else if (currentStep === 'create-step2' && responses.length >= 1) {
          const [instructorsRes] = responses;

          if (instructorsRes && instructorsRes.ok) {
            const instructorsData: ApiResponse<Instructor[]> = await instructorsRes.json();
            if (instructorsData.success && instructorsData.data) {
              setInstructors(instructorsData.data);
            }
          }
        }
      } catch (error) {
        console.error('Failed to fetch data:', error);
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
      const dateStr = date.toLocaleDateString('ja-JP', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      });
      const weekdayStr = date.toLocaleDateString('ja-JP', {
        weekday: 'short',
      });
      return `${dateStr}（${weekdayStr}）`;
    } catch {
      return selectedDate;
    }
  };

  const handleStartShiftCreation = () => {
    setCurrentStep('create-step1');
  };

  const handleBackToView = () => {
    setCurrentStep('view');
    setFormData({ departmentId: 0, shiftTypeId: 0, notes: '', selectedInstructorIds: [] });
    setErrors({});
  };

  const handleBackToStep1 = () => {
    setCurrentStep('create-step1');
    setFormData((prev) => ({ ...prev, selectedInstructorIds: [] }));
    setErrors({});
    setSearchTerm('');
  };

  const handleDepartmentSelect = (departmentId: number) => {
    setFormData((prev) => ({ ...prev, departmentId }));
    if (errors.departmentId) {
      setErrors((prev) => ({ ...prev, departmentId: '' }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.departmentId) {
      newErrors.departmentId = '部門を選択してください';
    }

    if (!formData.shiftTypeId) {
      newErrors.shiftTypeId = 'シフト種類を選択してください';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validateForm()) {
      setCurrentStep('create-step2');
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

  const handleCreateShift = async () => {
    if (formData.selectedInstructorIds.length === 0) {
      setErrors({ instructors: '最低1名のインストラクターを選択してください' });
      return;
    }

    setIsCreatingShift(true);
    try {
      const response = await fetch('/api/shifts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          date: selectedDate,
          departmentId: formData.departmentId,
          shiftTypeId: formData.shiftTypeId,
          description: formData.notes || null,
          assignedInstructorIds: formData.selectedInstructorIds,
        }),
      });

      const result = await response.json();

      if (result.success) {
        // 成功時の処理
        alert('シフトが正常に作成されました');
        handleModalOpenChange(false);
        // TODO: 親コンポーネントでシフトデータを更新する処理が必要
      } else {
        setErrors({ submit: result.error || 'シフトの作成に失敗しました' });
      }
    } catch (error) {
      console.error('Shift creation error:', error);
      setErrors({ submit: 'シフトの作成中にエラーが発生しました' });
    } finally {
      setIsCreatingShift(false);
    }
  };

  const handleModalOpenChange = (open: boolean) => {
    // モーダルが閉じられた時にステップをリセット
    if (!open) {
      setCurrentStep('view');
      setFormData({ departmentId: 0, shiftTypeId: 0, notes: '', selectedInstructorIds: [] });
      setErrors({});
      setSearchTerm('');
    }
    onOpenChange(open);
  };

  // インストラクター検索（名前・フリガナ）
  const filteredInstructors = instructors.filter((instructor) => {
    // 検索条件のチェック
    if (!searchTerm) return true;

    const searchLower = searchTerm.toLowerCase();
    return (
      instructor.lastName.toLowerCase().includes(searchLower) ||
      instructor.firstName.toLowerCase().includes(searchLower) ||
      (instructor.lastNameKana && instructor.lastNameKana.toLowerCase().includes(searchLower)) ||
      (instructor.firstNameKana && instructor.firstNameKana.toLowerCase().includes(searchLower))
    );
  });

  // 選択済みインストラクターの取得
  const selectedInstructors = instructors.filter((instructor) =>
    formData.selectedInstructorIds.includes(instructor.id)
  );

  const handleRemoveSelectedInstructor = (instructorId: number) => {
    setFormData((prev) => ({
      ...prev,
      selectedInstructorIds: prev.selectedInstructorIds.filter((id) => id !== instructorId),
    }));
  };

  const renderDepartmentCard = (department: Department) => {
    // 部門名から判定するための簡易関数
    const getDepartmentType = (name: string): DepartmentType => {
      if (name.toLowerCase().includes('スキー') || name.toLowerCase().includes('ski')) {
        return 'ski';
      } else if (
        name.toLowerCase().includes('スノーボード') ||
        name.toLowerCase().includes('snowboard')
      ) {
        return 'snowboard';
      }
      return 'mixed';
    };

    const departmentType = getDepartmentType(department.name);
    const styles = DEPARTMENT_STYLES[departmentType];
    const isSelected = formData.departmentId === department.id;

    const Icon =
      departmentType === 'ski'
        ? PersonSimpleSki
        : departmentType === 'snowboard'
          ? PersonSimpleSnowboard
          : Calendar;

    return (
      <div
        key={department.id}
        onClick={() => handleDepartmentSelect(department.id)}
        className={cn(
          'flex cursor-pointer items-center space-x-2 rounded-lg border p-3 transition-all duration-200 hover:bg-accent',
          isSelected
            ? `${styles.sectionBorderClass} ${styles.sectionBgClass}`
            : 'border-gray-200 hover:border-gray-300'
        )}
      >
        <Icon
          className={cn('h-5 w-5', isSelected ? styles.iconColor : 'text-gray-400')}
          weight="regular"
        />
        <span className={cn('font-medium', isSelected ? styles.sectionTextClass : 'text-gray-600')}>
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
          'inline-flex cursor-pointer items-center gap-1 rounded-full border px-3 py-1 text-xs font-medium transition-all duration-200 hover:scale-105',
          chipClass
        )}
      >
        <User className="h-3 w-3" weight="fill" />
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
          'rounded-xl border p-3 transition-all duration-300 md:p-4',
          bgClass,
          borderClass
        )}
      >
        <div className="md:flex md:items-start md:gap-4">
          {/* 部門ヘッダー */}
          <div className="mb-3 flex items-center gap-2 md:mb-0 md:w-40 md:flex-shrink-0 md:gap-3">
            {icon}
            <div>
              <h4 className={cn('text-base font-semibold md:text-lg', textClass)}>
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
                  className="rounded-lg border border-border bg-background p-3 transition-all duration-200 hover:shadow-sm"
                >
                  <div className="mb-2 flex items-center justify-between md:mb-3">
                    <div
                      className={cn(
                        'rounded-lg px-3 py-2 text-sm font-medium text-foreground',
                        getDepartmentBgClass(shift.department as DepartmentType)
                      )}
                    >
                      {shift.type}
                    </div>
                    <div className="text-xs text-muted-foreground">{shift.count}名配置</div>
                  </div>
                  <div className="space-y-1 md:flex md:flex-wrap md:gap-2 md:space-y-0">
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
        <DrawerHeader className="pb-2 text-center">
          <DrawerTitle className="flex items-center justify-center gap-2 text-xl md:text-2xl">
            {formatSelectedDate()}
          </DrawerTitle>
        </DrawerHeader>

        <div className="overflow-y-auto px-4 pb-4">
          {currentStep === 'view' ? (
            /* シフト表示モード */
            <div className="space-y-4">
              {dayData.shifts.length === 0 ? (
                /* シフトなしの場合 */
                <div className="py-8 text-center text-muted-foreground">
                  <Calendar className="mx-auto mb-4 h-12 w-12 opacity-50" />
                  <div className="text-lg font-medium">シフトが設定されていません</div>
                  <div className="mt-1 text-sm">新しいシフトを作成できます</div>
                </div>
              ) : (
                /* シフトがある場合 */
                <>
                  {/* スキー部門 */}
                  {dayData.shifts.filter((s) => s.department === 'ski').length > 0 &&
                    createDepartmentSection(
                      'ski',
                      dayData.shifts,
                      <PersonSimpleSki
                        className={cn('h-5 w-5', DEPARTMENT_STYLES.ski.iconColor)}
                        weight="fill"
                      />
                    )}

                  {/* スノーボード部門 */}
                  {dayData.shifts.filter((s) => s.department === 'snowboard').length > 0 &&
                    createDepartmentSection(
                      'snowboard',
                      dayData.shifts,
                      <PersonSimpleSnowboard
                        className={cn('h-5 w-5', DEPARTMENT_STYLES.snowboard.iconColor)}
                        weight="fill"
                      />
                    )}

                  {/* 共通部門 */}
                  {dayData.shifts.filter((s) => s.department === 'mixed').length > 0 &&
                    createDepartmentSection(
                      'mixed',
                      dayData.shifts,
                      <Calendar
                        className={cn('h-5 w-5', DEPARTMENT_STYLES.mixed.iconColor)}
                        weight="fill"
                      />
                    )}
                </>
              )}
            </div>
          ) : (
            /* シフト作成フォームモード */
            <div className="mx-auto max-w-2xl space-y-6">
              {/* 進捗ステップ */}
              <div className="mb-6 flex items-center justify-center space-x-2">
                <div
                  className={cn(
                    'flex h-6 w-6 items-center justify-center rounded-full border-2 text-xs font-medium',
                    currentStep === 'create-step1' || currentStep === 'create-step2'
                      ? 'border-primary bg-primary text-primary-foreground'
                      : 'border-border bg-background'
                  )}
                >
                  1
                </div>
                <div
                  className={cn(
                    'h-px w-8',
                    currentStep === 'create-step2' ? 'bg-primary' : 'bg-border'
                  )}
                ></div>
                <div
                  className={cn(
                    'flex h-6 w-6 items-center justify-center rounded-full border-2 text-xs font-medium',
                    currentStep === 'create-step2'
                      ? 'border-primary bg-primary text-primary-foreground'
                      : 'border-border bg-background'
                  )}
                >
                  2
                </div>
              </div>

              {currentStep === 'create-step2' && (
                /* 選択した部門とシフト種別の表示 */
                <div className="mb-6 space-y-1 text-center">
                  <div className="text-sm text-muted-foreground">
                    {departments.find((d) => d.id === formData.departmentId)?.name} -{' '}
                    {shiftTypes.find((t) => t.id === formData.shiftTypeId)?.name}
                  </div>
                </div>
              )}

              {currentStep === 'create-step1' && (
                <>
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
                          setErrors((prev) => ({ ...prev, shiftTypeId: '' }));
                        }
                      }}
                      className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:border-transparent focus:outline-none focus:ring-2 focus:ring-primary"
                      disabled={isLoading}
                    >
                      <option value={0}>選択してください</option>
                      {shiftTypes.map((type) => (
                        <option key={type.id} value={type.id}>
                          {type.name}
                        </option>
                      ))}
                    </select>
                    {errors.shiftTypeId && (
                      <p className="text-sm text-red-500">{errors.shiftTypeId}</p>
                    )}
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
                      className="w-full rounded-md border border-input px-3 py-2 text-sm placeholder:text-muted-foreground focus:border-transparent focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                  </div>
                </>
              )}

              {currentStep === 'create-step2' && (
                <>
                  {/* インストラクター選択 */}
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <Label className="text-sm font-medium">
                        インストラクター選択 <span className="text-red-500">*</span>
                      </Label>
                      <div className="text-xs text-muted-foreground">
                        {formData.selectedInstructorIds.length}名選択中
                      </div>
                    </div>

                    {isLoading ? (
                      <div className="py-8 text-center text-sm text-muted-foreground">
                        読み込み中...
                      </div>
                    ) : (
                      <>
                        {/* 選択済みインストラクター表示エリア */}
                        {selectedInstructors.length > 0 && (
                          <div className="rounded-lg border border-blue-200 bg-blue-50 p-3 dark:border-blue-700 dark:bg-blue-950">
                            <div className="mb-2 text-sm font-medium text-blue-800 dark:text-blue-200">
                              選択済み（{selectedInstructors.length}名）
                            </div>
                            <div className="flex flex-wrap gap-2">
                              {selectedInstructors.map((instructor) => (
                                <div
                                  key={instructor.id}
                                  className="group inline-flex items-center gap-1 rounded-md border border-blue-200 bg-blue-100 px-2 py-1 text-xs font-medium text-blue-800 transition-colors hover:bg-blue-200 dark:border-blue-700 dark:bg-blue-900 dark:text-blue-100 dark:hover:bg-blue-800"
                                >
                                  <User className="h-3 w-3" />
                                  <span>
                                    {instructor.lastName} {instructor.firstName}
                                  </span>
                                  <button
                                    onClick={() => handleRemoveSelectedInstructor(instructor.id)}
                                    className="ml-1 text-blue-600 transition-colors hover:text-blue-800 dark:text-blue-300 dark:hover:text-blue-200"
                                    type="button"
                                  >
                                    <X className="h-3 w-3" />
                                  </button>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* 検索 */}
                        <div className="relative">
                          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 transform text-muted-foreground" />
                          <input
                            type="text"
                            placeholder="インストラクターを検索（名前・フリガナ）"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full rounded-md border border-input py-2 pl-10 pr-4 text-sm focus:border-transparent focus:outline-none focus:ring-2 focus:ring-primary"
                          />
                          {searchTerm && (
                            <button
                              onClick={() => setSearchTerm('')}
                              className="absolute right-3 top-1/2 -translate-y-1/2 transform text-muted-foreground hover:text-foreground"
                              type="button"
                            >
                              <X className="h-4 w-4" />
                            </button>
                          )}
                        </div>

                        {/* インストラクター一覧 */}
                        <div className="max-h-80 space-y-2 overflow-y-auto rounded-lg border">
                          {filteredInstructors.length === 0 ? (
                            <div className="py-8 text-center text-muted-foreground">
                              <User className="mx-auto mb-2 h-8 w-8 opacity-50" />
                              <div className="text-sm">
                                {searchTerm
                                  ? '該当するインストラクターが見つかりません'
                                  : 'インストラクターが登録されていません'}
                              </div>
                              {searchTerm && (
                                <button
                                  onClick={() => setSearchTerm('')}
                                  className="mt-1 text-xs text-primary hover:underline"
                                  type="button"
                                >
                                  検索条件をクリア
                                </button>
                              )}
                            </div>
                          ) : (
                            filteredInstructors.map((instructor) => {
                              const isSelected = formData.selectedInstructorIds.includes(
                                instructor.id
                              );
                              const selectedDepartment = departments.find(
                                (d) => d.id === formData.departmentId
                              );

                              // 選択された部門に対応する資格を持っているかチェック
                              const hasRequiredCertification = instructor.certifications.some(
                                (cert) => cert.department.id === formData.departmentId
                              );

                              return (
                                <div
                                  key={instructor.id}
                                  onClick={() => handleInstructorToggle(instructor.id)}
                                  className={cn(
                                    'flex cursor-pointer items-center justify-between p-3 transition-all duration-200',
                                    'border-b border-gray-100 last:border-b-0 hover:bg-blue-50 dark:border-gray-800 dark:hover:bg-blue-950',
                                    isSelected &&
                                      'border-blue-200 bg-blue-50 dark:border-blue-700 dark:bg-blue-950',
                                    !hasRequiredCertification && 'opacity-60'
                                  )}
                                >
                                  <div className="flex items-center space-x-3">
                                    <div
                                      className={cn(
                                        'flex h-6 w-6 items-center justify-center rounded-full border-2 transition-all',
                                        isSelected
                                          ? 'scale-110 border-blue-500 bg-blue-500 text-white dark:border-blue-400 dark:bg-blue-500'
                                          : 'border-gray-300 hover:border-blue-300 dark:border-gray-500 dark:hover:border-blue-400'
                                      )}
                                    >
                                      {isSelected ? (
                                        <Check className="h-3 w-3" weight="bold" />
                                      ) : (
                                        <div className="h-2 w-2 rounded-full bg-transparent" />
                                      )}
                                    </div>
                                    <div>
                                      <div className="text-sm font-medium">
                                        {instructor.lastName} {instructor.firstName}
                                      </div>
                                      {instructor.lastNameKana && instructor.firstNameKana && (
                                        <div className="text-xs text-muted-foreground">
                                          {instructor.lastNameKana} {instructor.firstNameKana}
                                        </div>
                                      )}
                                    </div>
                                  </div>
                                  <div className="text-right">
                                    {hasRequiredCertification ? (
                                      <div className="inline-flex items-center gap-1 rounded-full border border-green-200 bg-green-100 px-2 py-1 text-xs font-medium text-green-800 dark:border-green-700 dark:bg-green-900 dark:text-green-100">
                                        <Check className="h-3 w-3" />
                                        {selectedDepartment?.name}認定
                                      </div>
                                    ) : (
                                      <div className="rounded-full border border-orange-200 bg-orange-100 px-2 py-1 text-xs text-orange-800 dark:border-orange-700 dark:bg-orange-900 dark:text-orange-100">
                                        認定なし
                                      </div>
                                    )}
                                    <div className="mt-1 text-xs text-muted-foreground">
                                      {instructor.certifications.length}資格保有
                                    </div>
                                  </div>
                                </div>
                              );
                            })
                          )}
                        </div>

                        {/* 選択状況の統計 */}
                        <div className="flex items-center justify-between rounded-md border border-gray-200 bg-gray-50 px-3 py-2 text-xs text-muted-foreground dark:border-gray-700 dark:bg-gray-900">
                          <div>
                            表示: {filteredInstructors.length}名{searchTerm && ` (検索結果)`}
                          </div>
                          <div className="flex items-center gap-4">
                            <span>
                              認定保有者:{' '}
                              {
                                filteredInstructors.filter((i) =>
                                  i.certifications.some(
                                    (c) => c.department.id === formData.departmentId
                                  )
                                ).length
                              }
                              名
                            </span>
                            <span>全体: {instructors.length}名</span>
                          </div>
                        </div>
                      </>
                    )}

                    {errors.instructors && (
                      <p className="text-sm text-red-500">{errors.instructors}</p>
                    )}
                    {errors.submit && <p className="text-sm text-red-500">{errors.submit}</p>}
                  </div>
                </>
              )}
            </div>
          )}
        </div>

        <DrawerFooter>
          {currentStep === 'view' ? (
            <div className="flex flex-col gap-2 md:flex-row md:gap-4">
              <DrawerClose asChild>
                <Button variant="outline" size="lg" className="md:flex-1">
                  閉じる
                </Button>
              </DrawerClose>
              <Button onClick={handleStartShiftCreation} className="gap-2 md:flex-1" size="lg">
                選択した日でシフト作成を開始
                <ArrowRight className="h-4 w-4" />
              </Button>
            </div>
          ) : currentStep === 'create-step1' ? (
            <div className="flex flex-col gap-2 md:flex-row md:gap-4">
              <Button
                onClick={handleBackToView}
                variant="outline"
                size="lg"
                className="gap-2 md:flex-1"
              >
                <ArrowLeft className="h-4 w-4" />
                戻る
              </Button>
              <Button onClick={handleNext} size="lg" className="gap-2 md:flex-1">
                次へ：インストラクター選択
                <ArrowRight className="h-4 w-4" />
              </Button>
            </div>
          ) : (
            <div className="flex flex-col gap-2 md:flex-row md:gap-4">
              <Button
                onClick={handleBackToStep1}
                variant="outline"
                size="lg"
                className="gap-2 md:flex-1"
              >
                <ArrowLeft className="h-4 w-4" />
                戻る
              </Button>
              <Button
                onClick={handleCreateShift}
                size="lg"
                className="gap-2 md:flex-1"
                disabled={isCreatingShift}
              >
                {isCreatingShift ? '作成中...' : 'シフト登録'}
              </Button>
            </div>
          )}
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
}
