"use client";

import {
  PersonSimpleSki,
  PersonSimpleSnowboard,
  Plus,
  SealCheck,
} from "@phosphor-icons/react";
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
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  useCertificationsQuery,
  useCreateCertification,
  useUpdateCertification,
} from "./_lib/use-certifications";
import { getDepartmentIdByType } from "./api";
import CertificationModal from "./certification-modal";
import type {
  CertificationFormData,
  CertificationStats,
  CertificationWithDepartment,
} from "./types";
import { getDepartmentType } from "./utils";

type CertificationRowProps = {
  certification: CertificationWithDepartment;
  onOpenModal: (cert: CertificationWithDepartment) => void;
};

function CertificationRow({
  certification,
  onOpenModal,
}: CertificationRowProps) {
  const deptType = getDepartmentType(certification.department.name);
  const DeptIcon = deptType === "ski" ? PersonSimpleSki : PersonSimpleSnowboard;

  const departmentStyles = {
    ski: {
      row: "bg-ski-50/30 hover:bg-ski-50/50 dark:bg-ski-900/5 dark:hover:bg-ski-900/10",
      icon: "text-ski-600 dark:text-ski-400",
      text: "text-foreground",
    },
    snowboard: {
      row: "bg-snowboard-50/30 hover:bg-snowboard-50/50 dark:bg-snowboard-900/5 dark:hover:bg-snowboard-900/10",
      icon: "text-snowboard-600 dark:text-snowboard-400",
      text: "text-foreground",
    },
  }[deptType];

  return (
    <TableRow
      className={`cursor-pointer transition-colors ${departmentStyles.row} ${
        certification.isActive ? "" : "opacity-60"
      }`}
      key={certification.id}
      onClick={() => onOpenModal(certification)}
    >
      <TableCell>
        <DeptIcon
          className={`h-5 w-5 ${departmentStyles.icon}`}
          weight="regular"
        />
      </TableCell>
      <TableCell>
        <span
          className={`whitespace-nowrap font-mono text-xs md:whitespace-normal ${
            departmentStyles.text
          } ${certification.isActive ? "" : "line-through"}`}
        >
          {certification.shortName || "-"}
        </span>
      </TableCell>
      <TableCell
        className={`whitespace-nowrap font-medium md:whitespace-normal ${
          departmentStyles.text
        } ${certification.isActive ? "" : "line-through"}`}
      >
        <div className="flex items-center gap-2">
          <span
            className={`inline-flex items-center rounded px-2 py-1 font-medium text-xs ${deptType === "ski" ? "badge-ski" : "badge-snowboard"}`}
          >
            {certification.organization}
          </span>
          <span>{certification.name}</span>
        </div>
      </TableCell>
      <TableCell
        className={`hidden max-w-xs md:table-cell ${
          certification.isActive ? "" : "line-through"
        }`}
      >
        <p
          className={`line-clamp-2 text-sm ${departmentStyles.text} opacity-70`}
        >
          {certification.description || "説明なし"}
        </p>
      </TableCell>
    </TableRow>
  );
}

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
  currentDepartment: "all" | "ski" | "snowboard",
  showActiveOnly: boolean
): CertificationWithDepartment[] {
  let filtered = [...certifications];

  switch (currentDepartment) {
    case "ski":
      filtered = filtered.filter(
        (cert) => getDepartmentType(cert.department.name) === "ski"
      );
      break;
    case "snowboard":
      filtered = filtered.filter(
        (cert) => getDepartmentType(cert.department.name) === "snowboard"
      );
      break;
    default:
      break;
  }

  if (showActiveOnly) {
    filtered = filtered.filter((cert) => cert.isActive);
  }

  return sortCertifications(filtered);
}

function calculateStats(
  certifications: CertificationWithDepartment[]
): CertificationStats {
  const total = certifications.length;
  const active = certifications.filter((cert) => cert.isActive).length;
  const ski = certifications.filter(
    (cert) => getDepartmentType(cert.department.name) === "ski"
  ).length;
  const snowboard = certifications.filter(
    (cert) => getDepartmentType(cert.department.name) === "snowboard"
  ).length;

  return {
    total,
    active,
    ski,
    snowboard,
  };
}

export default function CertificationsPageClient() {
  const [currentDepartment, setCurrentDepartment] = useState<
    "all" | "ski" | "snowboard"
  >("all");
  const [showActiveOnly, setShowActiveOnly] = useState<boolean>(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCertification, setEditingCertification] =
    useState<CertificationWithDepartment | null>(null);

  const { data: certifications } = useCertificationsQuery();

  const filteredCertifications = useMemo(
    () =>
      filterCertifications(
        certifications ?? [],
        currentDepartment,
        showActiveOnly
      ),
    [certifications, currentDepartment, showActiveOnly]
  );

  const stats = useMemo<CertificationStats>(
    () => calculateStats(certifications ?? []),
    [certifications]
  );

  const createCertificationMutation = useCreateCertification();
  const updateCertificationMutation = useUpdateCertification();

  const handleDepartmentChange = useCallback((department: string) => {
    setCurrentDepartment(department as "all" | "ski" | "snowboard");
  }, []);

  const handleActiveFilterChange = useCallback((checked: boolean) => {
    setShowActiveOnly(checked);
  }, []);

  const handleOpenModal = useCallback(
    (certification?: CertificationWithDepartment) => {
      setEditingCertification(certification ?? null);
      setIsModalOpen(true);
    },
    []
  );

  const handleCloseModal = useCallback(() => {
    setIsModalOpen(false);
    setEditingCertification(null);
  }, []);

  const handleSave = useCallback(
    async (data: CertificationFormData) => {
      // CertificationFormDataをServer Actionsの入力形式に変換
      const departmentId = await getDepartmentIdByType(data.department);
      const input = {
        departmentId,
        name: data.name,
        shortName: data.shortName,
        organization: data.organization,
        description: data.description || null,
        isActive: data.status === "active",
      };

      if (editingCertification) {
        await updateCertificationMutation.mutateAsync({
          id: editingCertification.id,
          data: input,
        });
      } else {
        await createCertificationMutation.mutateAsync(input);
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
            <h1 className="mb-2 font-bold text-2xl text-foreground md:text-3xl">
              資格管理
            </h1>
            <p className="text-muted-foreground text-sm md:text-base">
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
                <div className="font-bold text-base text-green-600 dark:text-green-400">
                  {stats.active}
                </div>
              </div>

              <div className="flex items-center gap-2 px-4 py-1">
                <PersonSimpleSki
                  className="h-4 w-4 text-blue-600 dark:text-blue-400"
                  weight="regular"
                />
                <div className="font-bold text-base text-blue-600 dark:text-blue-400">
                  {stats.ski}
                </div>
              </div>

              <div className="flex items-center gap-2 px-4 py-1">
                <PersonSimpleSnowboard
                  className="h-4 w-4 text-amber-600 dark:text-amber-400"
                  weight="regular"
                />
                <div className="font-bold text-amber-600 text-base dark:text-amber-400">
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
            <h2 className="font-semibold text-lg">資格一覧</h2>
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
              onValueChange={handleDepartmentChange}
              value={currentDepartment}
            >
              <TabsList className="grid w-full grid-cols-3 sm:w-auto">
                <TabsTrigger className="flex items-center gap-2" value="all">
                  すべて
                </TabsTrigger>
                <TabsTrigger className="flex items-center gap-2" value="ski">
                  <PersonSimpleSki className="h-4 w-4" weight="regular" />
                  スキー
                </TabsTrigger>
                <TabsTrigger
                  className="flex items-center gap-2"
                  value="snowboard"
                >
                  <PersonSimpleSnowboard className="h-4 w-4" weight="regular" />
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
              <TableHead className="w-12" />
              <TableHead className="min-w-[80px]">資格名</TableHead>
              <TableHead className="min-w-[200px]">正式名称</TableHead>
              <TableHead className="hidden min-w-[300px] md:table-cell">
                説明
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredCertifications.length === 0 ? (
              <TableRow>
                <TableCell
                  className="py-8 text-center text-muted-foreground"
                  colSpan={4}
                >
                  {(() => {
                    if (currentDepartment === "all" && !showActiveOnly) {
                      return "資格が登録されていません";
                    }
                    if (showActiveOnly) {
                      return "有効な資格がありません";
                    }
                    return "フィルター条件に一致する資格がありません";
                  })()}
                </TableCell>
              </TableRow>
            ) : (
              filteredCertifications.map((certification) => (
                <CertificationRow
                  certification={certification}
                  key={certification.id}
                  onOpenModal={handleOpenModal}
                />
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <CertificationModal
        certification={editingCertification}
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onSave={handleSave}
      />
    </div>
  );
}
