'use client';

import { useState, useEffect } from 'react';
import {
  Info,
  User,
  SealCheck,
  UserGear,
  UserMinus,
  PersonSimpleSki,
  PersonSimpleSnowboard,
} from '@phosphor-icons/react';
import type { InstructorModalProps, InstructorFormData } from './types';
import { fetchCertifications } from '../certifications/api';
import { getDepartmentType } from '../certifications/utils';
import type { CertificationWithDepartment } from '../certifications/types';
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerFooter,
} from '@/components/ui/drawer';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Separator } from '@/components/ui/separator';
import { useNotification } from '@/components/notifications';

export default function InstructorModal({
  isOpen,
  onClose,
  instructor,
  onSave,
}: InstructorModalProps) {
  const { showNotification } = useNotification();
  const [formData, setFormData] = useState<InstructorFormData>({
    lastName: '',
    firstName: '',
    lastNameKana: '',
    firstNameKana: '',
    status: 'active',
    notes: '',
    certificationIds: [],
  });
  const [availableCertifications, setAvailableCertifications] = useState<
    CertificationWithDepartment[]
  >([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoadingCertifications, setIsLoadingCertifications] = useState(false);
  const [selectedDepartment, setSelectedDepartment] = useState<string>('');
  const [selectedCertification, setSelectedCertification] = useState<string>('');
  const [assignedCertifications, setAssignedCertifications] = useState<
    {
      id: number;
      name: string;
      shortName: string | null;
      organization: string;
      department: { name: string };
    }[]
  >([]);

  useEffect(() => {
    if (instructor) {
      // 編集モード
      setFormData({
        lastName: instructor.lastName,
        firstName: instructor.firstName,
        lastNameKana: instructor.lastNameKana || '',
        firstNameKana: instructor.firstNameKana || '',
        status:
          instructor.status === 'ACTIVE'
            ? 'active'
            : instructor.status === 'INACTIVE'
              ? 'inactive'
              : 'retired',
        notes: instructor.notes || '',
        certificationIds: instructor.certifications.map((c) => c.id),
      });
      setAssignedCertifications(instructor.certifications);
    } else {
      // 新規追加モード
      setFormData({
        lastName: '',
        firstName: '',
        lastNameKana: '',
        firstNameKana: '',
        status: 'active',
        notes: '',
        certificationIds: [],
      });
      setAssignedCertifications([]);
    }
    setSelectedDepartment('');
    setSelectedCertification('');
  }, [instructor, isOpen]);

  useEffect(() => {
    if (isOpen) {
      loadCertifications();
    }
  }, [isOpen]);

  const loadCertifications = async () => {
    try {
      setIsLoadingCertifications(true);
      const certifications = await fetchCertifications();
      // 有効な資格のみ選択可能にする
      const activeCertifications = certifications.filter((cert) => cert.isActive);
      setAvailableCertifications(activeCertifications);
    } catch (error) {
      console.error('Failed to load certifications:', error);
    } finally {
      setIsLoadingCertifications(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      await onSave(formData);
      showNotification(
        instructor
          ? 'インストラクターが正常に更新されました'
          : 'インストラクターが正常に作成されました',
        'success'
      );
      onClose();
    } catch (error) {
      console.error('Save error:', error);
      showNotification(error instanceof Error ? error.message : '保存に失敗しました', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDepartmentChange = (value: string) => {
    setSelectedDepartment(value);
    setSelectedCertification('');
  };

  const getFilteredCertifications = () => {
    if (!selectedDepartment) return [];

    return availableCertifications.filter((cert) => {
      const deptType = getDepartmentType(cert.department.name);
      return deptType === selectedDepartment;
    });
  };

  const handleAddCertification = () => {
    if (!selectedCertification) return;

    const certificationToAdd = availableCertifications.find(
      (cert) => cert.id.toString() === selectedCertification
    );

    if (!certificationToAdd) return;

    // 重複チェック
    if (assignedCertifications.find((cert) => cert.id === certificationToAdd.id)) {
      showNotification('この資格は既に追加されています', 'warning');
      return;
    }

    const newCertification = {
      id: certificationToAdd.id,
      name: certificationToAdd.name,
      shortName: certificationToAdd.shortName,
      organization: certificationToAdd.organization,
      department: { name: certificationToAdd.department.name },
    };

    setAssignedCertifications((prev) => [...prev, newCertification]);
    setFormData((prev) => ({
      ...prev,
      certificationIds: [...(prev.certificationIds || []), certificationToAdd.id],
    }));

    // リセット
    setSelectedDepartment('');
    setSelectedCertification('');
  };

  const handleRemoveCertification = (certificationId: number) => {
    setAssignedCertifications((prev) => prev.filter((cert) => cert.id !== certificationId));
    setFormData((prev) => ({
      ...prev,
      certificationIds: (prev.certificationIds || []).filter((id) => id !== certificationId),
    }));
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active':
        return <SealCheck className="h-4 w-4 text-green-600" weight="regular" />;
      case 'inactive':
        return <UserGear className="h-4 w-4 text-yellow-600" weight="regular" />;
      case 'retired':
        return <UserMinus className="h-4 w-4 text-gray-600" weight="regular" />;
      default:
        return <User className="h-4 w-4" weight="regular" />;
    }
  };

  return (
    <Drawer open={isOpen} onClose={onClose}>
      <DrawerContent className="flex h-[90vh] flex-col">
        <DrawerHeader className="flex-shrink-0">
          <DrawerTitle className="flex items-center gap-2">
            <User className="h-5 w-5 text-primary" weight="regular" />
            {instructor ? 'インストラクター編集' : '新規インストラクター'}
          </DrawerTitle>
        </DrawerHeader>

        <ScrollArea className="flex-1 px-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* 基本情報 */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                <Info className="h-4 w-4" weight="regular" />
                基本情報
              </div>

              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="lastName" className="text-sm font-medium">
                    姓 <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="lastName"
                    type="text"
                    value={formData.lastName}
                    onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                    placeholder="田中"
                    required
                    className="w-full"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="firstName" className="text-sm font-medium">
                    名 <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="firstName"
                    type="text"
                    value={formData.firstName}
                    onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                    placeholder="太郎"
                    required
                    className="w-full"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="lastNameKana" className="text-sm font-medium">
                    セイ（カタカナ）
                  </Label>
                  <Input
                    id="lastNameKana"
                    type="text"
                    value={formData.lastNameKana}
                    onChange={(e) => setFormData({ ...formData, lastNameKana: e.target.value })}
                    placeholder="タナカ"
                    className="w-full"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="firstNameKana" className="text-sm font-medium">
                    メイ（カタカナ）
                  </Label>
                  <Input
                    id="firstNameKana"
                    type="text"
                    value={formData.firstNameKana}
                    onChange={(e) => setFormData({ ...formData, firstNameKana: e.target.value })}
                    placeholder="タロウ"
                    className="w-full"
                  />
                </div>
              </div>
            </div>

            <Separator />

            {/* ステータス */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                {getStatusIcon(formData.status)}
                ステータス
              </div>

              <RadioGroup
                value={formData.status}
                onValueChange={(value) =>
                  setFormData({ ...formData, status: value as 'active' | 'inactive' | 'retired' })
                }
                className="grid grid-cols-1 gap-4 md:grid-cols-3"
              >
                <div className="flex items-center space-x-2 rounded-lg border p-3 hover:bg-accent">
                  <RadioGroupItem value="active" id="active" />
                  <Label htmlFor="active" className="flex flex-1 cursor-pointer items-center gap-2">
                    <SealCheck className="h-4 w-4 text-green-600" weight="regular" />
                    <div>
                      <div className="font-medium">有効</div>
                      <div className="text-xs text-muted-foreground">アクティブな状態</div>
                    </div>
                  </Label>
                </div>

                <div className="flex items-center space-x-2 rounded-lg border p-3 hover:bg-accent">
                  <RadioGroupItem value="inactive" id="inactive" />
                  <Label
                    htmlFor="inactive"
                    className="flex flex-1 cursor-pointer items-center gap-2"
                  >
                    <UserGear className="h-4 w-4 text-yellow-600" weight="regular" />
                    <div>
                      <div className="font-medium">休止</div>
                      <div className="text-xs text-muted-foreground">一時的に休止中</div>
                    </div>
                  </Label>
                </div>

                <div className="flex items-center space-x-2 rounded-lg border p-3 hover:bg-accent">
                  <RadioGroupItem value="retired" id="retired" />
                  <Label
                    htmlFor="retired"
                    className="flex flex-1 cursor-pointer items-center gap-2"
                  >
                    <UserMinus className="h-4 w-4 text-gray-600" weight="regular" />
                    <div>
                      <div className="font-medium">退職</div>
                      <div className="text-xs text-muted-foreground">退職済み</div>
                    </div>
                  </Label>
                </div>
              </RadioGroup>
            </div>

            <Separator />

            {/* 保有資格 */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                <SealCheck className="h-4 w-4" weight="regular" />
                保有資格
              </div>

              {/* 資格追加セクション */}
              <div className="rounded-lg border border-dashed border-gray-300 bg-gray-50 p-4">
                {/* PC: 1行配置, モバイル: 縦積み */}
                <div className="flex flex-col gap-3 md:flex-row md:items-end">
                  <div className="md:w-40">
                    <Label className="text-sm font-medium">部門</Label>
                    <select
                      value={selectedDepartment}
                      onChange={(e) => handleDepartmentChange(e.target.value)}
                      className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-primary focus:ring-2 focus:ring-primary"
                    >
                      <option value="">選択</option>
                      <option value="ski">🎿 スキー</option>
                      <option value="snowboard">🏂 スノーボード</option>
                    </select>
                  </div>
                  <div className="flex-1">
                    <Label className="text-sm font-medium">資格を選択</Label>
                    <select
                      value={selectedCertification}
                      onChange={(e) => setSelectedCertification(e.target.value)}
                      disabled={!selectedDepartment}
                      className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-primary focus:ring-2 focus:ring-primary disabled:bg-gray-100"
                    >
                      <option value="">
                        {selectedDepartment
                          ? '資格を選択してください'
                          : '部門を選択してから資格を選んでください'}
                      </option>
                      {getFilteredCertifications().map((cert) => (
                        <option key={cert.id} value={cert.id.toString()}>
                          {cert.shortName || cert.name} ({cert.organization})
                        </option>
                      ))}
                    </select>
                  </div>
                  <Button
                    type="button"
                    onClick={handleAddCertification}
                    disabled={!selectedCertification}
                    className="md:mb-0"
                  >
                    追加
                  </Button>
                </div>
              </div>

              {/* 保有資格一覧 */}
              {isLoadingCertifications ? (
                <div className="flex items-center justify-center py-8">
                  <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent"></div>
                  <span className="ml-2 text-sm text-muted-foreground">資格を読み込み中...</span>
                </div>
              ) : (
                <div className="space-y-2">
                  {assignedCertifications.length > 0 ? (
                    assignedCertifications.map((cert) => {
                      const deptType = getDepartmentType(cert.department.name);
                      const DeptIcon = deptType === 'ski' ? PersonSimpleSki : PersonSimpleSnowboard;

                      return (
                        <div
                          key={cert.id}
                          className="flex items-center justify-between rounded-lg border border-gray-200 bg-gray-50 p-3"
                        >
                          <div className="flex items-center gap-3">
                            <DeptIcon
                              className={`h-4 w-4 ${
                                deptType === 'ski'
                                  ? 'text-ski-600 dark:text-ski-400'
                                  : 'text-snowboard-600 dark:text-snowboard-400'
                              }`}
                              weight="regular"
                            />
                            <div>
                              <div className="text-sm font-medium">
                                {cert.shortName || cert.name}
                              </div>
                              <div className="text-xs text-gray-600">{cert.organization}</div>
                            </div>
                          </div>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => handleRemoveCertification(cert.id)}
                            className="text-red-500 hover:bg-red-50 hover:text-red-700"
                          >
                            <svg
                              className="h-4 w-4"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                              />
                            </svg>
                          </Button>
                        </div>
                      );
                    })
                  ) : (
                    <div className="py-4 text-center text-muted-foreground">
                      資格が登録されていません
                    </div>
                  )}
                </div>
              )}
            </div>

            <Separator />

            {/* 備考 */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                <Info className="h-4 w-4" weight="regular" />
                備考
              </div>

              <div className="space-y-2">
                <Textarea
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  placeholder="その他の特記事項があれば入力してください"
                  className="min-h-[80px] resize-none"
                />
              </div>
            </div>
          </form>
        </ScrollArea>

        <DrawerFooter className="flex-shrink-0">
          <div className="flex w-full gap-2">
            <DrawerClose asChild className="flex-1">
              <Button variant="outline" disabled={isSubmitting}>
                キャンセル
              </Button>
            </DrawerClose>
            <Button
              onClick={handleSubmit}
              disabled={isSubmitting || !formData.lastName.trim() || !formData.firstName.trim()}
              className="flex-1"
            >
              {isSubmitting ? (
                <>
                  <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                  保存中...
                </>
              ) : (
                '保存'
              )}
            </Button>
          </div>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
}
