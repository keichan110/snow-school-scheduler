'use client';

import { useCallback, useMemo, useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, SealCheck, Tag } from '@phosphor-icons/react';

import { shiftTypesQueryKeys, useShiftTypesQuery } from '@/features/shift-types';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

import ShiftTypeModal from './ShiftTypeModal';
import { createShiftType, updateShiftType } from './api';
import type { ShiftType, ShiftTypeFormData, ShiftTypeStats } from './types';

function sortShiftTypes(shiftTypes: ShiftType[]): ShiftType[] {
  return [...shiftTypes].sort((a, b) => {
    if (a.isActive && !b.isActive) {
      return -1;
    }

    if (!a.isActive && b.isActive) {
      return 1;
    }

    return a.name.localeCompare(b.name, 'ja');
  });
}

function filterShiftTypes(shiftTypes: ShiftType[], showActiveOnly: boolean): ShiftType[] {
  if (showActiveOnly) {
    return shiftTypes.filter((shiftType) => shiftType.isActive);
  }

  return [...shiftTypes];
}

function calculateStats(shiftTypes: ShiftType[]): ShiftTypeStats {
  return {
    total: shiftTypes.length,
    active: shiftTypes.filter((shiftType) => shiftType.isActive).length,
  };
}

export default function ShiftTypesPageClient() {
  const [showActiveOnly, setShowActiveOnly] = useState<boolean>(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingShiftType, setEditingShiftType] = useState<ShiftType | null>(null);

  const queryClient = useQueryClient();
  const { data: shiftTypes } = useShiftTypesQuery({
    select: sortShiftTypes,
  });

  const filteredShiftTypes = useMemo(
    () => filterShiftTypes(shiftTypes, showActiveOnly),
    [shiftTypes, showActiveOnly]
  );

  const stats = useMemo<ShiftTypeStats>(() => calculateStats(shiftTypes ?? []), [shiftTypes]);

  const createShiftTypeMutation = useMutation<ShiftType, Error, ShiftTypeFormData>({
    mutationFn: (formData) => createShiftType(formData),
    onSuccess: (created) => {
      queryClient.setQueryData<ShiftType[]>(shiftTypesQueryKeys.list(), (previous) => {
        if (!previous) {
          return [created];
        }

        return sortShiftTypes([...previous, created]);
      });
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: shiftTypesQueryKeys.list() });
    },
  });

  const updateShiftTypeMutation = useMutation<
    ShiftType,
    Error,
    { id: number; data: ShiftTypeFormData }
  >({
    mutationFn: ({ id, data }) => updateShiftType(id, data),
    onSuccess: (updated) => {
      queryClient.setQueryData<ShiftType[]>(shiftTypesQueryKeys.list(), (previous) => {
        if (!previous) {
          return [updated];
        }

        const next = previous.map((shiftType) =>
          shiftType.id === updated.id ? updated : shiftType
        );

        return sortShiftTypes(next);
      });
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: shiftTypesQueryKeys.list() });
    },
  });

  const handleActiveFilterChange = useCallback((checked: boolean) => {
    setShowActiveOnly(checked);
  }, []);

  const handleOpenModal = useCallback((shiftType?: ShiftType) => {
    setEditingShiftType(shiftType ?? null);
    setIsModalOpen(true);
  }, []);

  const handleCloseModal = useCallback(() => {
    setIsModalOpen(false);
    setEditingShiftType(null);
  }, []);

  const handleSave = useCallback(
    async (data: ShiftTypeFormData) => {
      if (editingShiftType) {
        await updateShiftTypeMutation.mutateAsync({
          id: editingShiftType.id,
          data,
        });
      } else {
        await createShiftTypeMutation.mutateAsync(data);
      }

      handleCloseModal();
    },
    [createShiftTypeMutation, editingShiftType, handleCloseModal, updateShiftTypeMutation]
  );

  return (
    <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6 md:py-8 lg:px-8">
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

      <ShiftTypeModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        shiftType={editingShiftType}
        onSave={handleSave}
      />
    </div>
  );
}
