"use client";

import { Plus, SealCheck, Tag } from "@phosphor-icons/react";
import { useCallback, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type {
  ShiftType,
  ShiftTypeFormData,
  ShiftTypeStats,
} from "../_lib/types";
import {
  useCreateShiftType,
  useShiftTypesQuery,
  useUpdateShiftType,
} from "../_lib/use-shift-types";
import ShiftTypeModal from "./shift-type-modal";

function sortShiftTypes(shiftTypes: ShiftType[]): ShiftType[] {
  return [...shiftTypes].sort((a, b) => {
    if (a.isActive && !b.isActive) {
      return -1;
    }

    if (!a.isActive && b.isActive) {
      return 1;
    }

    return a.name.localeCompare(b.name, "ja");
  });
}

function filterShiftTypes(
  shiftTypes: ShiftType[],
  showActiveOnly: boolean
): ShiftType[] {
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
  const [editingShiftType, setEditingShiftType] = useState<ShiftType | null>(
    null
  );

  const { data: shiftTypes } = useShiftTypesQuery({
    select: sortShiftTypes,
  });

  const filteredShiftTypes = useMemo(
    () => filterShiftTypes(shiftTypes, showActiveOnly),
    [shiftTypes, showActiveOnly]
  );

  const stats = useMemo<ShiftTypeStats>(
    () => calculateStats(shiftTypes ?? []),
    [shiftTypes]
  );

  const createShiftTypeMutation = useCreateShiftType();
  const updateShiftTypeMutation = useUpdateShiftType();

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
    [
      createShiftTypeMutation,
      editingShiftType,
      handleCloseModal,
      updateShiftTypeMutation,
    ]
  );

  return (
    <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6 md:py-8 lg:px-8">
      <div className="mb-6 md:mb-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="mb-2 font-bold text-2xl text-foreground md:text-3xl">
              シフト種類管理
            </h1>
            <p className="text-muted-foreground text-sm md:text-base">
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
                <div className="font-bold text-base text-primary">
                  {stats.total}
                </div>
                <span className="text-muted-foreground text-sm">合計</span>
              </div>

              <div className="flex items-center gap-2 px-4 py-1">
                <SealCheck
                  className="h-4 w-4 text-green-600 dark:text-green-400"
                  weight="regular"
                />
                <div className="font-bold text-base text-green-600 dark:text-green-400">
                  {stats.active}
                </div>
                <span className="text-muted-foreground text-sm">有効</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="overflow-x-auto rounded-lg border bg-white shadow-lg dark:bg-gray-900">
        <div className="space-y-4 border-b p-4">
          <div className="flex items-center justify-between">
            <h2 className="font-semibold text-lg">シフト種類一覧</h2>
            <Button
              className="flex items-center gap-2"
              onClick={() => handleOpenModal()}
            >
              <Plus className="h-4 w-4" weight="regular" />
              追加
            </Button>
          </div>

          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center space-x-2">
              <Switch
                checked={showActiveOnly}
                id="active-only"
                onCheckedChange={handleActiveFilterChange}
              />
              <Label
                className="flex cursor-pointer items-center gap-1"
                htmlFor="active-only"
              >
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
              <TableHead className="w-12" />
              <TableHead className="min-w-[200px]">シフト種類名</TableHead>
              <TableHead className="w-24 text-center">状態</TableHead>
              <TableHead className="hidden min-w-[150px] md:table-cell">
                作成日
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredShiftTypes.length === 0 ? (
              <TableRow>
                <TableCell
                  className="py-8 text-center text-muted-foreground"
                  colSpan={4}
                >
                  {showActiveOnly
                    ? "有効なシフト種類がありません"
                    : "シフト種類が登録されていません"}
                </TableCell>
              </TableRow>
            ) : (
              filteredShiftTypes.map((shiftType) => (
                <TableRow
                  className={`cursor-pointer transition-colors hover:bg-accent/50 ${
                    shiftType.isActive ? "" : "opacity-60"
                  }`}
                  key={shiftType.id}
                  onClick={() => handleOpenModal(shiftType)}
                >
                  <TableCell>
                    <Tag className="h-5 w-5 text-primary" weight="regular" />
                  </TableCell>
                  <TableCell>
                    <span
                      className={`font-medium ${shiftType.isActive ? "" : "line-through"}`}
                    >
                      {shiftType.name}
                    </span>
                  </TableCell>
                  <TableCell className="text-center">
                    <span
                      className={`inline-flex items-center rounded-full px-2 py-1 font-medium text-xs ${
                        shiftType.isActive
                          ? "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300"
                          : "bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400"
                      }`}
                    >
                      {shiftType.isActive ? "有効" : "無効"}
                    </span>
                  </TableCell>
                  <TableCell className="hidden text-muted-foreground text-sm md:table-cell">
                    {new Date(shiftType.createdAt).toLocaleDateString("ja-JP")}
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
        onSave={handleSave}
        shiftType={editingShiftType}
      />
    </div>
  );
}
