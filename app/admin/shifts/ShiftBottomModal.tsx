'use client';

import { ArrowRight, Search, X, Calendar } from 'lucide-react';
import { User, Check } from '@phosphor-icons/react';
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
import { DEPARTMENT_STYLES } from './constants/shiftConstants';
import { CertificationBadge } from '@/components/ui/certification-badge';
import { useState, useEffect } from 'react';
import { Edit3 } from 'lucide-react';
import { prepareShift } from './shiftApiClient';
import { ExistingShiftData } from './DuplicateShiftDialog';
import { useNotification } from '@/components/notifications';
import { formatDateForDisplay } from '@/shared/utils/dateFormatter';
import { renderDepartmentSections, getDepartmentIcon } from '@/app/shifts/utils/shiftComponents';

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
  onShiftUpdated?: () => Promise<void>;
}

export function ShiftBottomModal({
  isOpen,
  onOpenChange,
  selectedDate,
  dayData,
  onStartShiftCreation = () => {}, // eslint-disable-line @typescript-eslint/no-unused-vars
  onShiftUpdated,
}: ShiftBottomModalProps) {
  const { showNotification } = useNotification();
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
  // 編集モード状態
  const [editMode, setEditMode] = useState<{
    isEdit: boolean;
    existingShift?: ExistingShiftData;
  }>({ isEdit: false });
  // ローカルシフトデータ状態（更新可能）
  const [localDayData, setLocalDayData] = useState<DayData | null>(dayData);

  // dayDataが変更された時にlocalDayDataを更新
  useEffect(() => {
    setLocalDayData(dayData);
  }, [dayData]);

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
          requests.push(
            fetch(`/api/instructors?status=ACTIVE&departmentId=${formData.departmentId}`)
          );
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
  }, [currentStep, formData.departmentId]);

  if (!selectedDate || !localDayData) return null;

  const handleStartShiftCreation = () => {
    setCurrentStep('create-step1');
  };

  const handleBackToView = () => {
    setCurrentStep('view');
    setFormData({ departmentId: 0, shiftTypeId: 0, notes: '', selectedInstructorIds: [] });
    setErrors({});
    setEditMode({ isEdit: false });
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

  const handleNext = async () => {
    if (validateForm()) {
      setIsLoading(true);

      try {
        // 統合APIコール
        const prepareResponse = await prepareShift({
          date: selectedDate!,
          departmentId: formData.departmentId,
          shiftTypeId: formData.shiftTypeId,
        });

        if (prepareResponse.success && prepareResponse.data) {
          // レスポンスに基づいてモード設定
          if (prepareResponse.data.mode === 'edit' && prepareResponse.data.shift) {
            setEditMode({
              isEdit: true,
              existingShift: prepareResponse.data.shift,
            });
          } else {
            setEditMode({
              isEdit: false,
            });
          }

          // フォームデータを事前設定
          setFormData((prev) => ({
            ...prev,
            notes: prepareResponse.data?.formData.description || '',
            selectedInstructorIds: prepareResponse.data?.formData.selectedInstructorIds || [],
          }));

          setCurrentStep('create-step2');
        } else {
          setErrors({ submit: prepareResponse.error || 'エラーが発生しました' });
        }
      } catch (error) {
        console.error('Prepare shift error:', error);
        setErrors({ submit: 'ネットワークエラーが発生しました' });
      } finally {
        setIsLoading(false);
      }
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

  // 直接編集（Step1スキップ）機能
  const handleDirectEdit = async (shiftType: string, departmentType: DepartmentType) => {
    if (!selectedDate) {
      setErrors({ submit: '日付が選択されていません' });
      return;
    }

    // ローディング中は重複実行を防止
    if (isLoading) return;

    // エラーをクリア
    setErrors({});
    setIsLoading(true);

    try {
      // 部門とシフト種類の情報を取得
      const [departmentsRes, shiftTypesRes] = await Promise.all([
        fetch('/api/departments'),
        fetch('/api/shift-types'),
      ]);

      if (departmentsRes.ok && shiftTypesRes.ok) {
        const departmentsData: ApiResponse<Department[]> = await departmentsRes.json();
        const shiftTypesData: ApiResponse<ShiftType[]> = await shiftTypesRes.json();

        if (
          departmentsData.success &&
          shiftTypesData.success &&
          departmentsData.data &&
          shiftTypesData.data
        ) {
          // 部門タイプから部門IDを特定
          const department = departmentsData.data.find((dept) => {
            const name = dept.name.toLowerCase();
            return (
              (departmentType === 'ski' && (name.includes('スキー') || name.includes('ski'))) ||
              (departmentType === 'snowboard' &&
                (name.includes('スノーボード') || name.includes('snowboard'))) ||
              (departmentType === 'mixed' &&
                !name.includes('スキー') &&
                !name.includes('snowboard'))
            );
          });

          // シフト種類名からシフト種類IDを特定
          const shiftTypeData = shiftTypesData.data.find((type) => type.name === shiftType);

          if (department && shiftTypeData) {
            // フォームデータを設定
            setFormData({
              departmentId: department.id,
              shiftTypeId: shiftTypeData.id,
              notes: '',
              selectedInstructorIds: [],
            });

            // 部門とシフト種類データを状態に保存
            setDepartments(departmentsData.data);
            setShiftTypes(shiftTypesData.data);

            // 統合APIを呼び出して編集準備
            const prepareResponse = await prepareShift({
              date: selectedDate,
              departmentId: department.id,
              shiftTypeId: shiftTypeData.id,
            });

            if (prepareResponse.success && prepareResponse.data) {
              // レスポンスに基づいてモード設定
              if (prepareResponse.data.mode === 'edit' && prepareResponse.data.shift) {
                setEditMode({
                  isEdit: true,
                  existingShift: prepareResponse.data.shift,
                });
              } else {
                setEditMode({
                  isEdit: false,
                });
              }

              // フォームデータを事前設定
              setFormData((prev) => ({
                ...prev,
                notes: prepareResponse.data?.formData.description || '',
                selectedInstructorIds: prepareResponse.data?.formData.selectedInstructorIds || [],
              }));

              // Step2に直接遷移
              setCurrentStep('create-step2');
            } else {
              setErrors({ submit: prepareResponse.error || 'エラーが発生しました' });
            }
          } else {
            setErrors({ submit: '対応する部門またはシフト種類が見つかりません' });
          }
        }
      }
    } catch (error) {
      console.error('Direct edit error:', error);
      setErrors({ submit: 'ネットワークエラーが発生しました' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateShift = async () => {
    if (formData.selectedInstructorIds.length === 0) {
      setErrors({ instructors: '最低1名のインストラクターを選択してください' });
      return;
    }

    setIsCreatingShift(true);
    setErrors({}); // エラーをクリア

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
          // 編集モードの場合はforce=trueで送信
          force: editMode.isEdit,
        }),
      });

      const result = await response.json();

      if (result.success) {
        // 成功時の処理
        const message = editMode.isEdit
          ? 'シフトが正常に更新されました'
          : 'シフトが正常に作成されました';

        // 新しい通知システム
        showNotification(message, 'success');

        // フォームをリセット
        setFormData({ departmentId: 0, shiftTypeId: 0, notes: '', selectedInstructorIds: [] });
        setErrors({});
        setSearchTerm('');
        setEditMode({ isEdit: false });

        // viewステップに遷移
        setCurrentStep('view');

        // 親コンポーネントにシフトデータの更新を通知し、データ更新完了を待つ
        if (onShiftUpdated) {
          await onShiftUpdated();
        }
      } else {
        setErrors({ submit: result.error || 'シフトの処理に失敗しました' });
      }
    } catch (error) {
      console.error('Shift creation error:', error);
      setErrors({ submit: 'シフトの処理中にエラーが発生しました' });
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
      setEditMode({ isEdit: false });
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

    const iconElement = getDepartmentIcon(departmentType, cn('h-5 w-5', styles.iconColor));

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
        {iconElement}
        <span className={cn('font-medium', isSelected ? styles.sectionTextClass : 'text-gray-600')}>
          {department.name}
        </span>
      </div>
    );
  };

  return (
    <Drawer open={isOpen} onOpenChange={handleModalOpenChange}>
      <DrawerContent className="max-h-[80vh]">
        <DrawerHeader className="pb-2 text-center">
          <DrawerTitle className="flex items-center justify-center gap-2 text-xl md:text-2xl">
            {formatDateForDisplay(selectedDate)}
          </DrawerTitle>
        </DrawerHeader>

        <div className="overflow-y-auto px-4 pb-4">
          {currentStep === 'view' ? (
            /* シフト表示モード */
            <div className="space-y-4">
              {localDayData.shifts.length === 0 ? (
                /* シフトなしの場合 */
                <div className="py-8 text-center text-muted-foreground">
                  <Calendar className="mx-auto mb-4 h-12 w-12 opacity-50" />
                  <div className="text-lg font-medium">シフトが設定されていません</div>
                  <div className="mt-1 text-sm">新しいシフトを作成できます</div>
                </div>
              ) : (
                /* シフトがある場合 */
                <>
                  {/* 部門別セクション表示（統合版） */}
                  {renderDepartmentSections(localDayData.shifts, {
                    clickable: true,
                    onShiftClick: handleDirectEdit,
                    isLoading: isLoading,
                  })}
                </>
              )}

              {/* エラー表示 */}
              {errors.submit && (
                <div className="mt-4 rounded-lg border border-red-200 bg-red-50 p-3 dark:border-red-700 dark:bg-red-950">
                  <p className="text-sm text-red-600 dark:text-red-400">{errors.submit}</p>
                </div>
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

              {currentStep === 'create-step2' && editMode.isEdit && (
                /* 編集モード表示 */
                <div className="mb-4 rounded-lg border-2 border-blue-200 bg-blue-50 p-4 dark:border-blue-700 dark:bg-blue-950">
                  <div className="mb-2 flex items-center gap-2">
                    <Edit3 className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                    <h3 className="font-semibold text-blue-900 dark:text-blue-100">
                      既存シフトの編集
                    </h3>
                  </div>
                  <p className="text-sm text-blue-700 dark:text-blue-200">
                    このシフトは既に存在します。インストラクターの追加・変更・削除ができます。
                  </p>
                  <div className="mt-2 text-xs text-blue-600 dark:text-blue-300">
                    現在の割り当て: {editMode.existingShift?.assignedCount || 0}名
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

                              // 選択された部門に対応する資格を持っているかチェック
                              const hasRequiredCertification = instructor.certifications.some(
                                (cert) => cert.department.id === formData.departmentId
                              );

                              // 該当部門の資格名を取得
                              const departmentCertifications = instructor.certifications.filter(
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
                                      <div className="flex flex-wrap justify-end gap-1">
                                        {departmentCertifications.map((cert) => (
                                          <CertificationBadge
                                            key={cert.id}
                                            shortName={cert.shortName}
                                            departmentName={cert.department.name}
                                          />
                                        ))}
                                      </div>
                                    ) : (
                                      <div className="rounded-full border border-orange-200 bg-orange-100 px-2 py-1 text-xs text-orange-800 dark:border-orange-700 dark:bg-orange-900 dark:text-orange-100">
                                        認定なし
                                      </div>
                                    )}
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
                キャンセル
              </Button>
              <Button onClick={handleNext} size="lg" className="gap-2 md:flex-1">
                次へ：インストラクター選択
                <ArrowRight className="h-4 w-4" />
              </Button>
            </div>
          ) : (
            <div className="flex flex-col gap-2 md:flex-row md:gap-4">
              <Button
                onClick={handleBackToView}
                variant="outline"
                size="lg"
                className="gap-2 md:flex-1"
              >
                キャンセル
              </Button>
              <Button
                onClick={handleCreateShift}
                size="lg"
                className="gap-2 md:flex-1"
                disabled={isCreatingShift}
              >
                {isCreatingShift ? '処理中...' : editMode.isEdit ? 'シフトを更新' : 'シフト登録'}
              </Button>
            </div>
          )}
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
}
