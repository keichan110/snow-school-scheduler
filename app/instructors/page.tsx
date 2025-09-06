'use client';

'use client';

import { useState, useEffect, useCallback } from 'react';
import { notFound } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { Plus, SealCheck, PersonSimpleSki, PersonSimpleSnowboard } from '@phosphor-icons/react';
import InstructorModal from './InstructorModal';
import { fetchInstructors, createInstructor, updateInstructor } from './api';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import type {
  InstructorWithCertifications,
  InstructorFormData,
  InstructorStats,
  CategoryFilterType,
} from './types';
import { CertificationBadge } from '@/components/ui/certification-badge';

export default function InstructorsPage() {
  const { user, status } = useAuth();
  const [instructors, setInstructors] = useState<InstructorWithCertifications[]>([]);
  const [filteredInstructors, setFilteredInstructors] = useState<InstructorWithCertifications[]>(
    []
  );
  const [currentCategory, setCurrentCategory] = useState<CategoryFilterType>('all');
  const [showActiveOnly, setShowActiveOnly] = useState<boolean>(true);
  const [stats, setStats] = useState<InstructorStats>({
    total: 0,
    active: 0,
    skiInstructors: 0,
    snowboardInstructors: 0,
  });
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingInstructor, setEditingInstructor] = useState<InstructorWithCertifications | null>(
    null
  );
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // 権限チェック
  useEffect(() => {
    if (status !== 'loading' && (!user || (user.role !== 'MANAGER' && user.role !== 'ADMIN'))) {
      notFound();
    }
  }, [user, status]);

  const loadInstructors = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await fetchInstructors();
      setInstructors(data);
    } catch (error) {
      console.error('Failed to load instructors:', error);
      setError(error instanceof Error ? error.message : 'データの取得に失敗しました');
    } finally {
      setIsLoading(false);
    }
  };

  const applyFilter = useCallback(() => {
    let filtered = [...instructors];

    // 資格カテゴリフィルター
    switch (currentCategory) {
      case 'ski':
        filtered = filtered.filter((instructor) =>
          instructor.certifications.some(
            (cert) =>
              cert.department.name.toLowerCase().includes('スキー') ||
              cert.department.name.toLowerCase().includes('ski')
          )
        );
        break;
      case 'snowboard':
        filtered = filtered.filter((instructor) =>
          instructor.certifications.some(
            (cert) =>
              cert.department.name.toLowerCase().includes('スノーボード') ||
              cert.department.name.toLowerCase().includes('snowboard') ||
              cert.department.name.toLowerCase().includes('ボード')
          )
        );
        break;
      case 'all':
      default:
        break;
    }

    // 有効のみフィルター（ONの場合はACTIVEのみ、OFFの場合はすべてのステータス）
    if (showActiveOnly) {
      filtered = filtered.filter((instructor) => instructor.status === 'ACTIVE');
    }

    // ステータス順でソート（ACTIVE -> INACTIVE -> RETIRED）
    filtered.sort((a, b) => {
      const statusOrder = { ACTIVE: 0, INACTIVE: 1, RETIRED: 2 };
      const orderA = statusOrder[a.status as keyof typeof statusOrder];
      const orderB = statusOrder[b.status as keyof typeof statusOrder];

      if (orderA !== orderB) {
        return orderA - orderB;
      }

      // 同じステータス内では名前順
      const nameA = `${a.lastName} ${a.firstName}`;
      const nameB = `${b.lastName} ${b.firstName}`;
      return nameA.localeCompare(nameB, 'ja');
    });

    setFilteredInstructors(filtered);
  }, [instructors, currentCategory, showActiveOnly]);

  const updateStats = useCallback(() => {
    // 有効なインストラクター（ACTIVEステータス）のみを対象とする
    const activeInstructors = instructors.filter((instructor) => instructor.status === 'ACTIVE');

    const active = activeInstructors.length;

    // スキーの資格を持つ有効なインストラクター数
    const skiInstructors = activeInstructors.filter((instructor) =>
      instructor.certifications.some(
        (cert) =>
          cert.department.name.toLowerCase().includes('スキー') ||
          cert.department.name.toLowerCase().includes('ski')
      )
    ).length;

    // スノーボードの資格を持つ有効なインストラクター数
    const snowboardInstructors = activeInstructors.filter((instructor) =>
      instructor.certifications.some(
        (cert) =>
          cert.department.name.toLowerCase().includes('スノーボード') ||
          cert.department.name.toLowerCase().includes('snowboard') ||
          cert.department.name.toLowerCase().includes('ボード')
      )
    ).length;

    setStats({ total: active, active, skiInstructors, snowboardInstructors });
  }, [instructors]);

  // データ取得
  useEffect(() => {
    if (user && (user.role === 'MANAGER' || user.role === 'ADMIN')) {
      loadInstructors();
    }
  }, [user]);

  // フィルター適用
  useEffect(() => {
    applyFilter();
  }, [applyFilter]);

  // 統計更新
  useEffect(() => {
    updateStats();
  }, [updateStats]);

  const handleCategoryChange = (category: string) => {
    setCurrentCategory(category as CategoryFilterType);
  };

  const handleActiveFilterChange = (checked: boolean) => {
    setShowActiveOnly(checked);
  };

  const handleOpenModal = (instructor?: InstructorWithCertifications) => {
    setEditingInstructor(instructor || null);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingInstructor(null);
  };

  const handleSave = async (data: InstructorFormData) => {
    try {
      if (editingInstructor) {
        // 更新
        const updated = await updateInstructor(editingInstructor.id, data);
        setInstructors((prev) =>
          prev.map((instructor) => (instructor.id === editingInstructor.id ? updated : instructor))
        );
      } else {
        // 新規作成
        const created = await createInstructor(data);
        setInstructors((prev) => [...prev, created]);
      }

      handleCloseModal();
    } catch (error) {
      throw error; // モーダル側でエラーハンドリング
    }
  };

  // 認証中の場合
  if (status === 'loading') {
    return (
      <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6 md:py-8 lg:px-8">
        <div className="flex h-64 items-center justify-center">
          <div className="text-center">
            <div className="mx-auto mb-4 h-8 w-8 animate-spin rounded-full border-4 border-primary-500 border-t-transparent"></div>
            <p className="text-muted-foreground">認証情報を確認しています...</p>
          </div>
        </div>
      </div>
    );
  }

  // 権限不足の場合
  if (!user || (user.role !== 'MANAGER' && user.role !== 'ADMIN')) {
    notFound();
  }

  if (isLoading) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6 md:py-8 lg:px-8">
        <div className="flex h-64 items-center justify-center">
          <div className="text-center">
            <div className="mx-auto mb-4 h-8 w-8 animate-spin rounded-full border-4 border-primary-500 border-t-transparent"></div>
            <p className="text-muted-foreground">データを読み込んでいます...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6 md:py-8 lg:px-8">
        <div className="flex h-64 items-center justify-center">
          <div className="text-center">
            <p className="mb-4 text-destructive">{error}</p>
            <Button onClick={loadInstructors}>再試行</Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6 md:py-8 lg:px-8">
      {/* ページタイトル */}
      <div className="mb-6 md:mb-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="mb-2 text-2xl font-bold text-foreground md:text-3xl">
              インストラクター管理
            </h1>
            <p className="text-sm text-muted-foreground md:text-base">
              インストラクターの登録・管理を行います
            </p>
          </div>
        </div>
      </div>

      {/* 統計情報 */}
      <div className="mb-4 md:mb-6">
        <Card className="mx-auto w-full max-w-md md:mx-0">
          <CardContent className="px-3 py-2">
            <div className="flex items-center justify-center divide-x divide-border">
              <div className="flex items-center gap-2 px-4 py-1">
                <SealCheck
                  className="h-4 w-4 text-green-600 dark:text-green-400"
                  weight="regular"
                />
                <div className="text-base font-bold text-green-600 dark:text-green-400">
                  {stats.active}
                </div>
              </div>

              <div className="flex items-center gap-2 px-4 py-1">
                <PersonSimpleSki
                  className="h-4 w-4 text-ski-600 dark:text-ski-400"
                  weight="regular"
                />
                <div className="text-base font-bold text-ski-600 dark:text-ski-400">
                  {stats.skiInstructors}
                </div>
              </div>

              <div className="flex items-center gap-2 px-4 py-1">
                <PersonSimpleSnowboard
                  className="h-4 w-4 text-snowboard-600 dark:text-snowboard-400"
                  weight="regular"
                />
                <div className="text-base font-bold text-snowboard-600 dark:text-snowboard-400">
                  {stats.snowboardInstructors}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* インストラクター一覧テーブル */}
      <div className="overflow-x-auto rounded-lg border bg-white shadow-lg dark:bg-gray-900">
        <div className="space-y-4 border-b p-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">インストラクター一覧</h2>
            <Button onClick={() => handleOpenModal()} className="flex items-center gap-2">
              <Plus className="h-4 w-4" weight="regular" />
              追加
            </Button>
          </div>

          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            {/* タブフィルター */}
            <Tabs
              value={currentCategory}
              onValueChange={handleCategoryChange}
              className="w-full sm:w-auto"
            >
              <TabsList className="grid w-full grid-cols-3 sm:w-auto">
                <TabsTrigger value="all" className="flex items-center gap-2">
                  すべて
                </TabsTrigger>
                <TabsTrigger value="ski" className="flex items-center gap-2">
                  スキー
                </TabsTrigger>
                <TabsTrigger value="snowboard" className="flex items-center gap-2">
                  スノーボード
                </TabsTrigger>
              </TabsList>
            </Tabs>

            {/* 有効のみスイッチ - モバイルでは非表示 */}
            <div className="hidden items-center space-x-2 sm:flex">
              <Switch
                id="active-only"
                checked={showActiveOnly}
                onCheckedChange={handleActiveFilterChange}
              />
              <Label htmlFor="active-only" className="flex cursor-pointer items-center gap-1">
                <SealCheck
                  className="h-4 w-4 text-green-600 dark:text-green-400"
                  weight="regular"
                />
                有効のみ
              </Label>
            </div>
          </div>
        </div>
        <Table>
          <TableHeader>
            <TableRow className="bg-white dark:bg-gray-900">
              <TableHead className="w-12">資格</TableHead>
              <TableHead className="min-w-[120px]">氏名</TableHead>
              <TableHead className="min-w-[120px]">フリガナ</TableHead>
              <TableHead className="min-w-[200px]">保有資格</TableHead>
              <TableHead className="hidden min-w-[200px] md:table-cell">備考</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredInstructors.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="py-8 text-center text-muted-foreground">
                  {currentCategory === 'all' && !showActiveOnly
                    ? 'インストラクターが登録されていません'
                    : showActiveOnly
                      ? '有効なインストラクターがいません'
                      : 'フィルター条件に一致するインストラクターがいません'}
                </TableCell>
              </TableRow>
            ) : (
              filteredInstructors.map((instructor) => {
                const statusStyles = {
                  ACTIVE: {
                    row: 'bg-green-50/30 hover:bg-green-50/50 dark:bg-green-900/5 dark:hover:bg-green-900/10',
                    text: 'text-foreground',
                  },
                  INACTIVE: {
                    row: 'bg-yellow-50/30 hover:bg-yellow-50/50 dark:bg-yellow-900/5 dark:hover:bg-yellow-900/10',
                    text: 'text-foreground',
                  },
                  RETIRED: {
                    row: 'bg-gray-50/30 hover:bg-gray-50/50 dark:bg-gray-900/5 dark:hover:bg-gray-900/10',
                    text: 'text-foreground',
                  },
                }[instructor.status];

                // 資格に基づいてアイコンを決定
                const hasSkiCert = instructor.certifications.some(
                  (cert) =>
                    cert.department.name.toLowerCase().includes('スキー') ||
                    cert.department.name.toLowerCase().includes('ski')
                );
                const hasSnowboardCert = instructor.certifications.some(
                  (cert) =>
                    cert.department.name.toLowerCase().includes('スノーボード') ||
                    cert.department.name.toLowerCase().includes('snowboard') ||
                    cert.department.name.toLowerCase().includes('ボード')
                );

                return (
                  <TableRow
                    key={instructor.id}
                    className={`cursor-pointer transition-colors ${statusStyles?.row} ${
                      instructor.status !== 'ACTIVE' ? 'opacity-60' : ''
                    }`}
                    onClick={() => handleOpenModal(instructor)}
                  >
                    <TableCell>
                      <div className="flex items-center gap-1">
                        {hasSkiCert && (
                          <PersonSimpleSki
                            className="h-4 w-4 text-ski-600 dark:text-ski-400"
                            weight="regular"
                          />
                        )}
                        {hasSnowboardCert && (
                          <PersonSimpleSnowboard
                            className="h-4 w-4 text-snowboard-600 dark:text-snowboard-400"
                            weight="regular"
                          />
                        )}
                        {!hasSkiCert && !hasSnowboardCert && <div className="h-4 w-4"></div>}
                      </div>
                    </TableCell>
                    <TableCell>
                      <span
                        className={`whitespace-nowrap font-medium md:whitespace-normal ${
                          statusStyles?.text
                        } ${instructor.status !== 'ACTIVE' ? 'line-through' : ''}`}
                      >
                        {instructor.lastName} {instructor.firstName}
                      </span>
                    </TableCell>
                    <TableCell
                      className={`whitespace-nowrap md:whitespace-normal ${statusStyles?.text} ${
                        instructor.status !== 'ACTIVE' ? 'line-through' : ''
                      }`}
                    >
                      {instructor.lastNameKana && instructor.firstNameKana
                        ? `${instructor.lastNameKana} ${instructor.firstNameKana}`
                        : '-'}
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-1">
                        {instructor.certifications.length > 0 ? (
                          instructor.certifications.map((cert) => (
                            <CertificationBadge
                              key={cert.id}
                              shortName={cert.shortName || cert.name}
                              departmentName={cert.department.name || ''}
                            />
                          ))
                        ) : (
                          <span className="text-sm text-muted-foreground">なし</span>
                        )}
                      </div>
                    </TableCell>
                    <TableCell
                      className={`hidden max-w-xs md:table-cell ${
                        instructor.status !== 'ACTIVE' ? 'line-through' : ''
                      }`}
                    >
                      <p className={`line-clamp-2 text-sm ${statusStyles?.text} opacity-70`}>
                        {instructor.notes || '備考なし'}
                      </p>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>

      {/* モーダル */}
      <InstructorModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        instructor={editingInstructor}
        onSave={handleSave}
      />
    </div>
  );
}
