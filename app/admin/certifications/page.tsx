"use client";

import { useState, useEffect, useCallback } from "react";
import { Plus, PersonSimpleSki, PersonSimpleSnowboard } from "@phosphor-icons/react";
import CertificationModal from "./CertificationModal";
import { fetchCertifications, createCertification, updateCertification } from "./api";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type {
  CertificationWithDepartment,
  CertificationFormData,
  FilterType,
  CertificationStats,
} from "./types";
import { getDepartmentType } from "./utils";

export default function CertificationsPage() {
  const [certifications, setCertifications] = useState<CertificationWithDepartment[]>([]);
  const [filteredCertifications, setFilteredCertifications] = useState<
    CertificationWithDepartment[]
  >([]);
  const [currentFilter, setCurrentFilter] = useState<FilterType>("all");
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
      console.error("Failed to load certifications:", error);
      setError(error instanceof Error ? error.message : "データの取得に失敗しました");
    } finally {
      setIsLoading(false);
    }
  };

  const applyFilter = useCallback(() => {
    let filtered = [...certifications];

    switch (currentFilter) {
      case "ski":
        filtered = filtered.filter((cert) => getDepartmentType(cert.department.name) === "ski");
        break;
      case "snowboard":
        filtered = filtered.filter(
          (cert) => getDepartmentType(cert.department.name) === "snowboard"
        );
        break;
      case "active":
        filtered = filtered.filter((cert) => cert.isActive);
        break;
      case "all":
      default:
        break;
    }

    // ステータス順でソート（有効なものが先）
    filtered.sort((a, b) => {
      if (a.isActive && !b.isActive) return -1;
      if (!a.isActive && b.isActive) return 1;
      return 0;
    });

    setFilteredCertifications(filtered);
  }, [certifications, currentFilter]);

  const updateStats = useCallback(() => {
    const total = filteredCertifications.length;
    const active = filteredCertifications.filter((cert) => cert.isActive).length;
    const ski = filteredCertifications.filter(
      (cert) => getDepartmentType(cert.department.name) === "ski"
    ).length;
    const snowboard = filteredCertifications.filter(
      (cert) => getDepartmentType(cert.department.name) === "snowboard"
    ).length;

    setStats({ total, active, ski, snowboard });
  }, [filteredCertifications]);

  // データ取得
  useEffect(() => {
    loadCertifications();
  }, []);

  // フィルター適用
  useEffect(() => {
    applyFilter();
  }, [applyFilter]);

  // 統計更新
  useEffect(() => {
    updateStats();
  }, [updateStats]);

  const handleFilterChange = (filter: FilterType) => {
    setCurrentFilter(filter);
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

  const filters = [
    { key: "all" as const, label: "すべて", icon: null },
    { key: "ski" as const, label: "スキー", icon: PersonSimpleSki },
    { key: "snowboard" as const, label: "スノーボード", icon: PersonSimpleSnowboard },
    { key: "active" as const, label: "有効のみ", icon: null },
  ];

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 md:py-8">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin w-8 h-8 border-4 border-primary-500 border-t-transparent rounded-full mx-auto mb-4"></div>
            <p className="text-muted-foreground">データを読み込んでいます...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 md:py-8">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <p className="text-destructive mb-4">{error}</p>
            <Button onClick={loadCertifications}>再試行</Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 md:py-8">
      {/* ページタイトル */}
      <div className="mb-6 md:mb-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-foreground mb-2">資格管理</h1>
            <p className="text-sm md:text-base text-muted-foreground">
              スキー・スノーボード資格の登録・管理を行います
            </p>
          </div>
        </div>
      </div>

      {/* 統計情報 */}
      <div className="mb-6 md:mb-8">
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
          <Card className="transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg">
            <CardContent className="p-5 text-center">
              <div className="text-2xl md:text-3xl font-bold text-green-600 mb-1">
                {stats.active}
              </div>
              <div className="text-sm text-muted-foreground">有効な資格</div>
            </CardContent>
          </Card>
          <Card className="transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg">
            <CardContent className="p-5 text-center">
              <div className="text-2xl md:text-3xl font-bold text-blue-600 mb-1">{stats.ski}</div>
              <div className="text-sm text-muted-foreground">スキー資格</div>
            </CardContent>
          </Card>
          <Card className="transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg col-span-2 lg:col-span-1">
            <CardContent className="p-5 text-center">
              <div className="text-2xl md:text-3xl font-bold text-amber-600 mb-1">
                {stats.snowboard}
              </div>
              <div className="text-sm text-muted-foreground">スノーボード資格</div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* フィルター */}
      <div className="mb-6 md:mb-8">
        <div className="flex flex-wrap gap-2 justify-center md:justify-start">
          {filters.map((filter) => (
            <Badge
              key={filter.key}
              variant={currentFilter === filter.key ? "default" : "outline"}
              className="px-3 py-1.5 cursor-pointer transition-all duration-200 flex items-center gap-1.5 hover:bg-primary/90"
              onClick={() => handleFilterChange(filter.key)}
            >
              {filter.icon && <filter.icon className="w-4 h-4" weight="regular" />}
              {filter.label}
            </Badge>
          ))}
        </div>
      </div>

      {/* 資格一覧テーブル */}
      <div className="rounded-lg border overflow-x-auto bg-white dark:bg-gray-900 shadow-lg">
        <Table>
          <TableHeader>
            <TableRow className="bg-white dark:bg-gray-900">
              <TableHead className="w-12"></TableHead>
              <TableHead className="min-w-[80px]">資格名</TableHead>
              <TableHead className="min-w-[120px]">主催団体</TableHead>
              <TableHead className="min-w-[150px]">正式名称</TableHead>
              <TableHead className="hidden md:table-cell">説明</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredCertifications.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                  {currentFilter === "all"
                    ? "資格が登録されていません"
                    : "フィルター条件に一致する資格がありません"}
                </TableCell>
              </TableRow>
            ) : (
              filteredCertifications.map((certification) => {
                const deptType = getDepartmentType(certification.department.name);
                const DeptIcon = deptType === "ski" ? PersonSimpleSki : PersonSimpleSnowboard;

                // 部門別の背景色とテキスト色を設定（微細な色味で控えめに）
                const departmentStyles = {
                  ski: {
                    row: `bg-ski-50/30 hover:bg-ski-50/50 dark:bg-ski-900/5 dark:hover:bg-ski-900/10`,
                    icon: "text-ski-600 dark:text-ski-400",
                    text: "text-foreground",
                  },
                  snowboard: {
                    row: `bg-snowboard-50/30 hover:bg-snowboard-50/50 dark:bg-snowboard-900/5 dark:hover:bg-snowboard-900/10`,
                    icon: "text-snowboard-600 dark:text-snowboard-400",
                    text: "text-foreground",
                  },
                }[deptType];

                return (
                  <TableRow
                    key={certification.id}
                    className={`cursor-pointer transition-colors ${departmentStyles.row} ${
                      !certification.isActive ? "opacity-60" : ""
                    }`}
                    onClick={() => handleOpenModal(certification)}
                  >
                    <TableCell>
                      <DeptIcon className={`w-5 h-5 ${departmentStyles.icon}`} weight="regular" />
                    </TableCell>
                    <TableCell>
                      <span
                        className={`text-xs font-mono whitespace-nowrap md:whitespace-normal ${
                          departmentStyles.text
                        } ${!certification.isActive ? "line-through" : ""}`}
                      >
                        {certification.shortName || "-"}
                      </span>
                    </TableCell>
                    <TableCell
                      className={`whitespace-nowrap md:whitespace-normal ${departmentStyles.text} ${
                        !certification.isActive ? "line-through" : ""
                      }`}
                    >
                      {certification.organization}
                    </TableCell>
                    <TableCell
                      className={`font-medium whitespace-nowrap md:whitespace-normal ${
                        departmentStyles.text
                      } ${!certification.isActive ? "line-through" : ""}`}
                    >
                      {certification.name}
                    </TableCell>
                    <TableCell
                      className={`hidden md:table-cell max-w-xs ${
                        !certification.isActive ? "line-through" : ""
                      }`}
                    >
                      <p className={`text-sm line-clamp-2 ${departmentStyles.text} opacity-70`}>
                        {certification.description || "説明なし"}
                      </p>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>

      {/* フローティングアクションボタン */}
      <Button
        onClick={() => handleOpenModal()}
        size="icon"
        className="fixed bottom-24 right-6 md:bottom-4 md:right-4 w-14 h-14 md:w-12 md:h-12 bg-gradient-to-r from-blue-600 via-blue-500 to-cyan-400 hover:shadow-lg hover:scale-105 transition-all duration-300 rounded-full z-[60]"
        title="新しい資格を追加"
      >
        <Plus className="w-6 h-6 md:w-5 md:h-5" weight="regular" />
      </Button>

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
