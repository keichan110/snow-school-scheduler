'use client';

import { useState, useEffect, useCallback } from 'react';
import { notFound } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { Plus, PersonSimpleSki, PersonSimpleSnowboard, SealCheck } from '@phosphor-icons/react';
import CertificationModal from './CertificationModal';
import { fetchCertifications, createCertification, updateCertification } from './api';
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
  CertificationWithDepartment,
  CertificationFormData,
  CertificationStats,
} from './types';
import { getDepartmentType } from './utils';

export default function CertificationsPage() {
  const { user, status } = useAuth();

  const [certifications, setCertifications] = useState<CertificationWithDepartment[]>([]);
  const [filteredCertifications, setFilteredCertifications] = useState<
    CertificationWithDepartment[]
  >([]);
  const [currentDepartment, setCurrentDepartment] = useState<'all' | 'ski' | 'snowboard'>('all');
  const [showActiveOnly, setShowActiveOnly] = useState<boolean>(true);
  const [stats, setStats] = useState<CertificationStats>({
    total: 0,
    active: 0,
    ski: 0,
    snowboard: 0,
  });
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCertification, setEditingCertification] =
    useState<CertificationWithDepartment | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadCertifications = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await fetchCertifications();
      setCertifications(data);
    } catch (error) {
      console.error('Failed to load certifications:', error);
      setError(error instanceof Error ? error.message : 'データの取得に失敗しました');
    } finally {
      setIsLoading(false);
    }
  };

  const applyFilter = useCallback(() => {
    let filtered = [...certifications];

    // 部門フィルター
    switch (currentDepartment) {
      case 'ski':
        filtered = filtered.filter((cert) => getDepartmentType(cert.department.name) === 'ski');
        break;
      case 'snowboard':
        filtered = filtered.filter(
          (cert) => getDepartmentType(cert.department.name) === 'snowboard'
        );
        break;
      case 'all':
      default:
        break;
    }

    // 有効フィルター
    if (showActiveOnly) {
      filtered = filtered.filter((cert) => cert.isActive);
    }

    // ステータス順でソート（有効なものが先）
    filtered.sort((a, b) => {
      if (a.isActive && !b.isActive) return -1;
      if (!a.isActive && b.isActive) return 1;
      return 0;
    });

    setFilteredCertifications(filtered);
  }, [certifications, currentDepartment, showActiveOnly]);

  const updateStats = useCallback(() => {
    const total = filteredCertifications.length;
    const active = filteredCertifications.filter((cert) => cert.isActive).length;
    const ski = filteredCertifications.filter(
      (cert) => getDepartmentType(cert.department.name) === 'ski'
    ).length;
    const snowboard = filteredCertifications.filter(
      (cert) => getDepartmentType(cert.department.name) === 'snowboard'
    ).length;

    setStats({ total, active, ski, snowboard });
  }, [filteredCertifications]);

  // 権限チェック
  useEffect(() => {
    if (status !== 'loading' && (!user || (user.role !== 'MANAGER' && user.role !== 'ADMIN'))) {
      notFound();
    }
  }, [user, status]);

  // データ取得
  useEffect(() => {
    if (user && (user.role === 'MANAGER' || user.role === 'ADMIN')) {
      loadCertifications();
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

  const handleDepartmentChange = (department: string) => {
    setCurrentDepartment(department as 'all' | 'ski' | 'snowboard');
  };

  const handleActiveFilterChange = (checked: boolean) => {
    setShowActiveOnly(checked);
  };

  const handleOpenModal = (certification?: CertificationWithDepartment) => {
    setEditingCertification(certification || null);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingCertification(null);
  };

  const handleSave = async (data: CertificationFormData) => {
    try {
      if (editingCertification) {
        // 更新
        const updated = await updateCertification(editingCertification.id, data);
        setCertifications((prev) =>
          prev.map((cert) => (cert.id === editingCertification.id ? updated : cert))
        );
      } else {
        // 新規作成
        const created = await createCertification(data);
        setCertifications((prev) => [...prev, created]);
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
            <Button onClick={loadCertifications}>再試行</Button>
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
            <h1 className="mb-2 text-2xl font-bold text-foreground md:text-3xl">資格管理</h1>
            <p className="text-sm text-muted-foreground md:text-base">
              スキー・スノーボード資格の登録・管理を行います
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
                  className="h-4 w-4 text-blue-600 dark:text-blue-400"
                  weight="regular"
                />
                <div className="text-base font-bold text-blue-600 dark:text-blue-400">
                  {stats.ski}
                </div>
              </div>

              <div className="flex items-center gap-2 px-4 py-1">
                <PersonSimpleSnowboard
                  className="h-4 w-4 text-amber-600 dark:text-amber-400"
                  weight="regular"
                />
                <div className="text-base font-bold text-amber-600 dark:text-amber-400">
                  {stats.snowboard}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 資格一覧テーブル */}
      <div className="overflow-x-auto rounded-lg border bg-white shadow-lg dark:bg-gray-900">
        <div className="space-y-4 border-b p-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">資格一覧</h2>
            <Button onClick={() => handleOpenModal()} className="flex items-center gap-2">
              <Plus className="h-4 w-4" weight="regular" />
              追加
            </Button>
          </div>

          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            {/* タブフィルター */}
            <Tabs
              value={currentDepartment}
              onValueChange={handleDepartmentChange}
              className="w-full sm:w-auto"
            >
              <TabsList className="grid w-full grid-cols-3 sm:w-auto">
                <TabsTrigger value="all" className="flex items-center gap-2">
                  すべて
                </TabsTrigger>
                <TabsTrigger value="ski" className="flex items-center gap-2">
                  <PersonSimpleSki className="h-4 w-4" weight="regular" />
                  スキー
                </TabsTrigger>
                <TabsTrigger value="snowboard" className="flex items-center gap-2">
                  <PersonSimpleSnowboard className="h-4 w-4" weight="regular" />
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
              <TableHead className="w-12"></TableHead>
              <TableHead className="min-w-[80px]">資格名</TableHead>
              <TableHead className="min-w-[200px]">正式名称</TableHead>
              <TableHead className="hidden min-w-[300px] md:table-cell">説明</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredCertifications.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} className="py-8 text-center text-muted-foreground">
                  {currentDepartment === 'all' && !showActiveOnly
                    ? '資格が登録されていません'
                    : showActiveOnly
                      ? '有効な資格がありません'
                      : 'フィルター条件に一致する資格がありません'}
                </TableCell>
              </TableRow>
            ) : (
              filteredCertifications.map((certification) => {
                const deptType = getDepartmentType(certification.department.name);
                const DeptIcon = deptType === 'ski' ? PersonSimpleSki : PersonSimpleSnowboard;

                // 部門別の背景色とテキスト色を設定（微細な色味で控えめに）
                const departmentStyles = {
                  ski: {
                    row: `bg-ski-50/30 hover:bg-ski-50/50 dark:bg-ski-900/5 dark:hover:bg-ski-900/10`,
                    icon: 'text-ski-600 dark:text-ski-400',
                    text: 'text-foreground',
                  },
                  snowboard: {
                    row: `bg-snowboard-50/30 hover:bg-snowboard-50/50 dark:bg-snowboard-900/5 dark:hover:bg-snowboard-900/10`,
                    icon: 'text-snowboard-600 dark:text-snowboard-400',
                    text: 'text-foreground',
                  },
                }[deptType];

                return (
                  <TableRow
                    key={certification.id}
                    className={`cursor-pointer transition-colors ${departmentStyles.row} ${
                      !certification.isActive ? 'opacity-60' : ''
                    }`}
                    onClick={() => handleOpenModal(certification)}
                  >
                    <TableCell>
                      <DeptIcon className={`h-5 w-5 ${departmentStyles.icon}`} weight="regular" />
                    </TableCell>
                    <TableCell>
                      <span
                        className={`whitespace-nowrap font-mono text-xs md:whitespace-normal ${
                          departmentStyles.text
                        } ${!certification.isActive ? 'line-through' : ''}`}
                      >
                        {certification.shortName || '-'}
                      </span>
                    </TableCell>
                    <TableCell
                      className={`whitespace-nowrap font-medium md:whitespace-normal ${
                        departmentStyles.text
                      } ${!certification.isActive ? 'line-through' : ''}`}
                    >
                      <div className="flex items-center gap-2">
                        <span
                          className={`inline-flex items-center rounded px-2 py-1 text-xs font-medium ${deptType === 'ski' ? 'badge-ski' : 'badge-snowboard'}`}
                        >
                          {certification.organization}
                        </span>
                        <span>{certification.name}</span>
                      </div>
                    </TableCell>
                    <TableCell
                      className={`hidden max-w-xs md:table-cell ${
                        !certification.isActive ? 'line-through' : ''
                      }`}
                    >
                      <p className={`line-clamp-2 text-sm ${departmentStyles.text} opacity-70`}>
                        {certification.description || '説明なし'}
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
      <CertificationModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        certification={editingCertification}
        onSave={handleSave}
      />
    </div>
  );
}
