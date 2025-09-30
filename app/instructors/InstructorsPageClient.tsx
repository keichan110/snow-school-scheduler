"use client";

import {
  PersonSimpleSki,
  PersonSimpleSnowboard,
  Plus,
  SealCheck,
} from "@phosphor-icons/react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useCallback, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { CertificationBadge } from "@/components/ui/certification-badge";
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
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  instructorsQueryKeys,
  useInstructorsQuery,
} from "@/features/instructors";
import { createInstructor, updateInstructor } from "./api";
import InstructorModal from "./InstructorModal";
import type {
  CategoryFilterType,
  InstructorFormData,
  InstructorStats,
  InstructorWithCertifications,
} from "./types";

const STATUS_ORDER: Partial<
  Record<InstructorWithCertifications["status"], number>
> = {
  ACTIVE: 0,
  INACTIVE: 1,
  RETIRED: 2,
};

function sortInstructorsByStatusAndName(
  instructors: InstructorWithCertifications[]
): InstructorWithCertifications[] {
  return [...instructors].sort((a, b) => {
    const orderA = STATUS_ORDER[a.status] ?? Number.MAX_SAFE_INTEGER;
    const orderB = STATUS_ORDER[b.status] ?? Number.MAX_SAFE_INTEGER;

    if (orderA !== orderB) {
      return orderA - orderB;
    }

    const nameA = `${a.lastName} ${a.firstName}`;
    const nameB = `${b.lastName} ${b.firstName}`;
    return nameA.localeCompare(nameB, "ja");
  });
}

function hasSkiCertification(
  instructor: InstructorWithCertifications
): boolean {
  return instructor.certifications.some((cert) => {
    const deptName = cert.department.name.toLowerCase();
    return deptName.includes("スキー") || deptName.includes("ski");
  });
}

function hasSnowboardCertification(
  instructor: InstructorWithCertifications
): boolean {
  return instructor.certifications.some((cert) => {
    const deptName = cert.department.name.toLowerCase();
    return (
      deptName.includes("スノーボード") ||
      deptName.includes("snowboard") ||
      deptName.includes("ボード")
    );
  });
}

function filterInstructors(
  instructors: InstructorWithCertifications[],
  category: CategoryFilterType,
  showActiveOnly: boolean
): InstructorWithCertifications[] {
  let filtered = [...instructors];

  switch (category) {
    case "ski":
      filtered = filtered.filter(hasSkiCertification);
      break;
    case "snowboard":
      filtered = filtered.filter(hasSnowboardCertification);
      break;
    case "all":
    default:
      break;
  }

  if (showActiveOnly) {
    filtered = filtered.filter((instructor) => instructor.status === "ACTIVE");
  }

  return sortInstructorsByStatusAndName(filtered);
}

function calculateInstructorStats(
  instructors: InstructorWithCertifications[]
): InstructorStats {
  const activeInstructors = instructors.filter(
    (instructor) => instructor.status === "ACTIVE"
  );

  const skiInstructors = activeInstructors.filter(hasSkiCertification).length;
  const snowboardInstructors = activeInstructors.filter(
    hasSnowboardCertification
  ).length;

  const active = activeInstructors.length;

  return {
    total: active,
    active,
    skiInstructors,
    snowboardInstructors,
  };
}

export default function InstructorsPageClient() {
  const [currentCategory, setCurrentCategory] =
    useState<CategoryFilterType>("all");
  const [showActiveOnly, setShowActiveOnly] = useState<boolean>(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingInstructor, setEditingInstructor] =
    useState<InstructorWithCertifications | null>(null);

  const queryClient = useQueryClient();
  const { data: instructors } = useInstructorsQuery();

  const filteredInstructors = useMemo(
    () => filterInstructors(instructors, currentCategory, showActiveOnly),
    [instructors, currentCategory, showActiveOnly]
  );

  const stats = useMemo<InstructorStats>(
    () => calculateInstructorStats(instructors),
    [instructors]
  );

  const createInstructorMutation = useMutation<
    InstructorWithCertifications,
    Error,
    InstructorFormData
  >({
    mutationFn: (formData) => createInstructor(formData),
    onSuccess: (created) => {
      queryClient.setQueryData<InstructorWithCertifications[]>(
        instructorsQueryKeys.list(),
        (previous) => {
          if (!previous) {
            return [created];
          }

          return sortInstructorsByStatusAndName([...previous, created]);
        }
      );
    },
  });

  const updateInstructorMutation = useMutation<
    InstructorWithCertifications,
    Error,
    { id: number; data: InstructorFormData }
  >({
    mutationFn: ({ id, data }) => updateInstructor(id, data),
    onSuccess: (updated) => {
      queryClient.setQueryData<InstructorWithCertifications[]>(
        instructorsQueryKeys.list(),
        (previous) => {
          if (!previous) {
            return [updated];
          }

          const next = previous.map((instructor) =>
            instructor.id === updated.id ? updated : instructor
          );
          return sortInstructorsByStatusAndName(next);
        }
      );
    },
  });

  const handleCategoryChange = useCallback((category: string) => {
    setCurrentCategory(category as CategoryFilterType);
  }, []);

  const handleActiveFilterChange = useCallback((checked: boolean) => {
    setShowActiveOnly(checked);
  }, []);

  const handleOpenModal = useCallback(
    (instructor?: InstructorWithCertifications) => {
      setEditingInstructor(instructor ?? null);
      setIsModalOpen(true);
    },
    []
  );

  const handleCloseModal = useCallback(() => {
    setIsModalOpen(false);
    setEditingInstructor(null);
  }, []);

  const handleSave = useCallback(
    async (formData: InstructorFormData) => {
      if (editingInstructor) {
        await updateInstructorMutation.mutateAsync({
          id: editingInstructor.id,
          data: formData,
        });
      } else {
        await createInstructorMutation.mutateAsync(formData);
      }

      handleCloseModal();
    },
    [
      createInstructorMutation,
      editingInstructor,
      handleCloseModal,
      updateInstructorMutation,
    ]
  );

  return (
    <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6 md:py-8 lg:px-8">
      <div className="mb-6 md:mb-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="mb-2 font-bold text-2xl text-foreground md:text-3xl">
              インストラクター管理
            </h1>
            <p className="text-muted-foreground text-sm md:text-base">
              インストラクターの登録・管理を行います
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
                <div className="font-bold text-base text-green-600 dark:text-green-400">
                  {stats.active}
                </div>
              </div>

              <div className="flex items-center gap-2 px-4 py-1">
                <PersonSimpleSki
                  className="h-4 w-4 text-ski-600 dark:text-ski-400"
                  weight="regular"
                />
                <div className="font-bold text-base text-ski-600 dark:text-ski-400">
                  {stats.skiInstructors}
                </div>
              </div>

              <div className="flex items-center gap-2 px-4 py-1">
                <PersonSimpleSnowboard
                  className="h-4 w-4 text-snowboard-600 dark:text-snowboard-400"
                  weight="regular"
                />
                <div className="font-bold text-base text-snowboard-600 dark:text-snowboard-400">
                  {stats.snowboardInstructors}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="overflow-x-auto rounded-lg border bg-white shadow-lg dark:bg-gray-900">
        <div className="space-y-4 border-b p-4">
          <div className="flex items-center justify-between">
            <h2 className="font-semibold text-lg">インストラクター一覧</h2>
            <Button
              className="flex items-center gap-2"
              onClick={() => handleOpenModal()}
            >
              <Plus className="h-4 w-4" weight="regular" />
              追加
            </Button>
          </div>

          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <Tabs
              className="w-full sm:w-auto"
              onValueChange={handleCategoryChange}
              value={currentCategory}
            >
              <TabsList className="grid w-full grid-cols-3 sm:w-auto">
                <TabsTrigger className="flex items-center gap-2" value="all">
                  すべて
                </TabsTrigger>
                <TabsTrigger className="flex items-center gap-2" value="ski">
                  スキー
                </TabsTrigger>
                <TabsTrigger
                  className="flex items-center gap-2"
                  value="snowboard"
                >
                  スノーボード
                </TabsTrigger>
              </TabsList>
            </Tabs>

            <div className="hidden items-center space-x-2 sm:flex">
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
              <TableHead className="w-12">資格</TableHead>
              <TableHead className="min-w-[120px]">氏名</TableHead>
              <TableHead className="min-w-[120px]">フリガナ</TableHead>
              <TableHead className="min-w-[200px]">保有資格</TableHead>
              <TableHead className="hidden min-w-[200px] md:table-cell">
                備考
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredInstructors.length === 0 ? (
              <TableRow>
                <TableCell
                  className="py-8 text-center text-muted-foreground"
                  colSpan={5}
                >
                  {currentCategory === "all" && !showActiveOnly
                    ? "インストラクターが登録されていません"
                    : showActiveOnly
                      ? "有効なインストラクターがいません"
                      : "フィルター条件に一致するインストラクターがいません"}
                </TableCell>
              </TableRow>
            ) : (
              filteredInstructors.map((instructor) => {
                const statusStyles = {
                  ACTIVE: {
                    row: "bg-green-50/30 hover:bg-green-50/50 dark:bg-green-900/5 dark:hover:bg-green-900/10",
                    text: "text-foreground",
                  },
                  INACTIVE: {
                    row: "bg-yellow-50/30 hover:bg-yellow-50/50 dark:bg-yellow-900/5 dark:hover:bg-yellow-900/10",
                    text: "text-foreground",
                  },
                  RETIRED: {
                    row: "bg-gray-50/30 hover:bg-gray-50/50 dark:bg-gray-900/5 dark:hover:bg-gray-900/10",
                    text: "text-foreground",
                  },
                }[instructor.status];

                const skiCertified = hasSkiCertification(instructor);
                const snowboardCertified =
                  hasSnowboardCertification(instructor);

                return (
                  <TableRow
                    className={`cursor-pointer transition-colors ${statusStyles?.row} ${
                      instructor.status !== "ACTIVE" ? "opacity-60" : ""
                    }`}
                    key={instructor.id}
                    onClick={() => handleOpenModal(instructor)}
                  >
                    <TableCell>
                      <div className="flex items-center gap-1">
                        {skiCertified ? (
                          <PersonSimpleSki
                            className="h-4 w-4 text-ski-600 dark:text-ski-400"
                            weight="regular"
                          />
                        ) : null}
                        {snowboardCertified ? (
                          <PersonSimpleSnowboard
                            className="h-4 w-4 text-snowboard-600 dark:text-snowboard-400"
                            weight="regular"
                          />
                        ) : null}
                        {skiCertified || snowboardCertified ? null : (
                          <div className="h-4 w-4" />
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <span
                        className={`whitespace-nowrap font-medium md:whitespace-normal ${
                          statusStyles?.text
                        } ${instructor.status !== "ACTIVE" ? "line-through" : ""}`}
                      >
                        {instructor.lastName} {instructor.firstName}
                      </span>
                    </TableCell>
                    <TableCell
                      className={`whitespace-nowrap md:whitespace-normal ${statusStyles?.text} ${
                        instructor.status !== "ACTIVE" ? "line-through" : ""
                      }`}
                    >
                      {instructor.lastNameKana && instructor.firstNameKana
                        ? `${instructor.lastNameKana} ${instructor.firstNameKana}`
                        : "-"}
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-1">
                        {instructor.certifications.length > 0 ? (
                          instructor.certifications.map((cert) => (
                            <CertificationBadge
                              departmentName={cert.department.name || ""}
                              key={cert.id}
                              shortName={cert.shortName || cert.name}
                            />
                          ))
                        ) : (
                          <span className="text-muted-foreground text-sm">
                            なし
                          </span>
                        )}
                      </div>
                    </TableCell>
                    <TableCell
                      className={`hidden max-w-xs md:table-cell ${
                        instructor.status !== "ACTIVE" ? "line-through" : ""
                      }`}
                    >
                      <p
                        className={`line-clamp-2 text-sm ${statusStyles?.text} opacity-70`}
                      >
                        {instructor.notes || "備考なし"}
                      </p>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>

      <InstructorModal
        instructor={editingInstructor}
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onSave={handleSave}
      />
    </div>
  );
}
