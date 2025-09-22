'use client';

import { useCallback, useMemo, useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, PersonSimpleSki, PersonSimpleSnowboard, SealCheck } from '@phosphor-icons/react';

import { certificationsQueryKeys, useCertificationsQuery } from '@/features/certifications';
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

import CertificationModal from './CertificationModal';
import { createCertification, updateCertification } from './api';
import type {
  CertificationFormData,
  CertificationStats,
  CertificationWithDepartment,
} from './types';
import { getDepartmentType } from './utils';

function sortCertifications(
  certifications: CertificationWithDepartment[]
): CertificationWithDepartment[] {
  return [...certifications].sort((a, b) => {
    if (a.isActive && !b.isActive) {
      return -1;
    }
    if (!a.isActive && b.isActive) {
      return 1;
    }
    return 0;
  });
}

function filterCertifications(
  certifications: CertificationWithDepartment[],
  currentDepartment: 'all' | 'ski' | 'snowboard',
  showActiveOnly: boolean
): CertificationWithDepartment[] {
  let filtered = [...certifications];

  switch (currentDepartment) {
    case 'ski':
      filtered = filtered.filter((cert) => getDepartmentType(cert.department.name) === 'ski');
      break;
    case 'snowboard':
      filtered = filtered.filter((cert) => getDepartmentType(cert.department.name) === 'snowboard');
      break;
    case 'all':
    default:
      break;
  }

  if (showActiveOnly) {
    filtered = filtered.filter((cert) => cert.isActive);
  }

  return sortCertifications(filtered);
}

function calculateStats(certifications: CertificationWithDepartment[]): CertificationStats {
  const total = certifications.length;
  const active = certifications.filter((cert) => cert.isActive).length;
  const ski = certifications.filter(
    (cert) => getDepartmentType(cert.department.name) === 'ski'
  ).length;
  const snowboard = certifications.filter(
    (cert) => getDepartmentType(cert.department.name) === 'snowboard'
  ).length;

  return {
    total,
    active,
    ski,
    snowboard,
  };
}

export default function CertificationsPageClient() {
  const [currentDepartment, setCurrentDepartment] = useState<'all' | 'ski' | 'snowboard'>('all');
  const [showActiveOnly, setShowActiveOnly] = useState<boolean>(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCertification, setEditingCertification] =
    useState<CertificationWithDepartment | null>(null);

  const queryClient = useQueryClient();
  const { data: certifications } = useCertificationsQuery();

  const filteredCertifications = useMemo(
    () => filterCertifications(certifications ?? [], currentDepartment, showActiveOnly),
    [certifications, currentDepartment, showActiveOnly]
  );

  const stats = useMemo<CertificationStats>(
    () => calculateStats(certifications ?? []),
    [certifications]
  );

  const createCertificationMutation = useMutation<
    CertificationWithDepartment,
    Error,
    CertificationFormData
  >({
    mutationFn: (formData) => createCertification(formData),
    onSuccess: (created) => {
      queryClient.setQueryData<CertificationWithDepartment[]>(
        certificationsQueryKeys.list(),
        (previous) => {
          if (!previous) {
            return [created];
          }

          return sortCertifications([...previous, created]);
        }
      );
    },
  });

  const updateCertificationMutation = useMutation<
    CertificationWithDepartment,
    Error,
    { id: number; data: CertificationFormData }
  >({
    mutationFn: ({ id, data }) => updateCertification(id, data),
    onSuccess: (updated) => {
      queryClient.setQueryData<CertificationWithDepartment[]>(
        certificationsQueryKeys.list(),
        (previous) => {
          if (!previous) {
            return [updated];
          }

          const next = previous.map((certification) =>
            certification.id === updated.id ? updated : certification
          );

          return sortCertifications(next);
        }
      );
    },
  });

  const handleDepartmentChange = useCallback((department: string) => {
    setCurrentDepartment(department as 'all' | 'ski' | 'snowboard');
  }, []);

  const handleActiveFilterChange = useCallback((checked: boolean) => {
    setShowActiveOnly(checked);
  }, []);

  const handleOpenModal = useCallback((certification?: CertificationWithDepartment) => {
    setEditingCertification(certification ?? null);
    setIsModalOpen(true);
  }, []);

  const handleCloseModal = useCallback(() => {
    setIsModalOpen(false);
    setEditingCertification(null);
  }, []);

  const handleSave = useCallback(
    async (data: CertificationFormData) => {
      if (editingCertification) {
        await updateCertificationMutation.mutateAsync({
          id: editingCertification.id,
          data,
        });
      } else {
        await createCertificationMutation.mutateAsync(data);
      }

      handleCloseModal();
    },
    [
      createCertificationMutation,
      editingCertification,
      handleCloseModal,
      updateCertificationMutation,
    ]
  );

  return (
    <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6 md:py-8 lg:px-8">
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

                const departmentStyles = {
                  ski: {
                    row: 'bg-ski-50/30 hover:bg-ski-50/50 dark:bg-ski-900/5 dark:hover:bg-ski-900/10',
                    icon: 'text-ski-600 dark:text-ski-400',
                    text: 'text-foreground',
                  },
                  snowboard: {
                    row: 'bg-snowboard-50/30 hover:bg-snowboard-50/50 dark:bg-snowboard-900/5 dark:hover:bg-snowboard-900/10',
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

      <CertificationModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        certification={editingCertification}
        onSave={handleSave}
      />
    </div>
  );
}
