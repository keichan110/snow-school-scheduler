'use client';

'use client';

import { useState, useEffect, useCallback } from 'react';
import { notFound } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { Plus, Tag, SealCheck } from '@phosphor-icons/react';
import ShiftTypeModal from './ShiftTypeModal';
import { fetchShiftTypes, createShiftType, updateShiftType } from './api';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
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
import type { ShiftType, ShiftTypeFormData, ShiftTypeStats } from './types';

export default function ShiftTypesPage() {
  const { user, status } = useAuth();
  const [shiftTypes, setShiftTypes] = useState<ShiftType[]>([]);
  const [filteredShiftTypes, setFilteredShiftTypes] = useState<ShiftType[]>([]);
  const [showActiveOnly, setShowActiveOnly] = useState<boolean>(true);
  const [stats, setStats] = useState<ShiftTypeStats>({
    total: 0,
    active: 0,
  });
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingShiftType, setEditingShiftType] = useState<ShiftType | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // 権限チェック
  useEffect(() => {
    if (status !== 'loading' && (!user || (user.role !== 'MANAGER' && user.role !== 'ADMIN'))) {
      notFound();
    }
  }, [user, status]);

  const loadShiftTypes = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await fetchShiftTypes();
      setShiftTypes(data);
    } catch (error) {
      console.error('Failed to load shift types:', error);
      setError(error instanceof Error ? error.message : 'データの取得に失敗しました');
    } finally {
      setIsLoading(false);
    }
  };

  const applyFilter = useCallback(() => {
    let filtered = [...shiftTypes];

    // 有効フィルター
    if (showActiveOnly) {
      filtered = filtered.filter((shiftType) => shiftType.isActive);
    }

    // 名前順でソート
    filtered.sort((a, b) => {
      // 有効なものが先に来るようにソート
      if (a.isActive && !b.isActive) return -1;
      if (!a.isActive && b.isActive) return 1;
      // 名前でソート
      return a.name.localeCompare(b.name, 'ja');
    });

    setFilteredShiftTypes(filtered);
  }, [shiftTypes, showActiveOnly]);

  const updateStats = useCallback(() => {
    const total = filteredShiftTypes.length;
    const active = filteredShiftTypes.filter((shiftType) => shiftType.isActive).length;

    setStats({ total, active });
  }, [filteredShiftTypes]);

  // データ取得
  useEffect(() => {
    if (user && (user.role === 'MANAGER' || user.role === 'ADMIN')) {
      loadShiftTypes();
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

  const handleActiveFilterChange = (checked: boolean) => {
    setShowActiveOnly(checked);
  };

  const handleOpenModal = (shiftType?: ShiftType) => {
    setEditingShiftType(shiftType || null);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingShiftType(null);
  };

  const handleSave = async (data: ShiftTypeFormData) => {
    try {
      if (editingShiftType) {
        // 更新
        const updated = await updateShiftType(editingShiftType.id, data);
        setShiftTypes((prev) =>
          prev.map((shiftType) => (shiftType.id === editingShiftType.id ? updated : shiftType))
        );
      } else {
        // 新規作成
        const created = await createShiftType(data);
        setShiftTypes((prev) => [...prev, created]);
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
            <Button onClick={loadShiftTypes}>再試行</Button>
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
            <h1 className="mb-2 text-2xl font-bold text-foreground md:text-3xl">シフト種類管理</h1>
            <p className="text-sm text-muted-foreground md:text-base">
              シフト種類の登録・管理を行います
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
                <Tag className="h-4 w-4 text-primary" weight="regular" />
                <div className="text-base font-bold text-primary">{stats.total}</div>
                <span className="text-sm text-muted-foreground">合計</span>
              </div>

              <div className="flex items-center gap-2 px-4 py-1">
                <SealCheck
                  className="h-4 w-4 text-green-600 dark:text-green-400"
                  weight="regular"
                />
                <div className="text-base font-bold text-green-600 dark:text-green-400">
                  {stats.active}
                </div>
                <span className="text-sm text-muted-foreground">有効</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* シフト種類一覧テーブル */}
      <div className="overflow-x-auto rounded-lg border bg-white shadow-lg dark:bg-gray-900">
        <div className="space-y-4 border-b p-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">シフト種類一覧</h2>
            <Button onClick={() => handleOpenModal()} className="flex items-center gap-2">
              <Plus className="h-4 w-4" weight="regular" />
              追加
            </Button>
          </div>

          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            {/* 有効のみスイッチ */}
            <div className="flex items-center space-x-2">
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
              <TableHead className="min-w-[200px]">シフト種類名</TableHead>
              <TableHead className="w-24 text-center">状態</TableHead>
              <TableHead className="hidden min-w-[150px] md:table-cell">作成日</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredShiftTypes.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} className="py-8 text-center text-muted-foreground">
                  {showActiveOnly
                    ? '有効なシフト種類がありません'
                    : 'シフト種類が登録されていません'}
                </TableCell>
              </TableRow>
            ) : (
              filteredShiftTypes.map((shiftType) => (
                <TableRow
                  key={shiftType.id}
                  className={`cursor-pointer transition-colors hover:bg-accent/50 ${
                    !shiftType.isActive ? 'opacity-60' : ''
                  }`}
                  onClick={() => handleOpenModal(shiftType)}
                >
                  <TableCell>
                    <Tag className="h-5 w-5 text-primary" weight="regular" />
                  </TableCell>
                  <TableCell>
                    <span className={`font-medium ${!shiftType.isActive ? 'line-through' : ''}`}>
                      {shiftType.name}
                    </span>
                  </TableCell>
                  <TableCell className="text-center">
                    <span
                      className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ${
                        shiftType.isActive
                          ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300'
                          : 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400'
                      }`}
                    >
                      {shiftType.isActive ? '有効' : '無効'}
                    </span>
                  </TableCell>
                  <TableCell className="hidden text-sm text-muted-foreground md:table-cell">
                    {new Date(shiftType.createdAt).toLocaleDateString('ja-JP')}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* モーダル */}
      <ShiftTypeModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        shiftType={editingShiftType}
        onSave={handleSave}
      />
    </div>
  );
}
