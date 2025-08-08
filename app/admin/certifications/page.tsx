"use client";

import { useState, useEffect, useCallback } from "react";
import { Plus, PersonSimpleSki, PersonSimpleSnowboard, SealCheck } from "@phosphor-icons/react";
import CertificationModal from "./CertificationModal";
import { fetchCertifications, createCertification, updateCertification } from "./api";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
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
  CertificationStats,
} from "./types";
import { getDepartmentType } from "./utils";

export default function CertificationsPage() {
  const [certifications, setCertifications] = useState<CertificationWithDepartment[]>([]);
  const [filteredCertifications, setFilteredCertifications] = useState<
    CertificationWithDepartment[]
  >([]);
  const [currentDepartment, setCurrentDepartment] = useState<"all" | "ski" | "snowboard">("all");
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
      console.error("Failed to load certifications:", error);
      setError(error instanceof Error ? error.message : "データの取得に失敗しました");
    } finally {
      setIsLoading(false);
    }
  };

  const applyFilter = useCallback(() => {
    let filtered = [...certifications];

    // 部門フィルター
    switch (currentDepartment) {
      case "ski":
        filtered = filtered.filter((cert) => getDepartmentType(cert.department.name) === "ski");
        break;
      case "snowboard":
        filtered = filtered.filter(
          (cert) => getDepartmentType(cert.department.name) === "snowboard"
        );
        break;
      case "all":
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

  const handleDepartmentChange = (department: string) => {
    setCurrentDepartment(department as "all" | "ski" | "snowboard");
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
      <div className="mb-4 md:mb-6">
        <Card className="w-full max-w-md mx-auto md:mx-0">
          <CardContent className="px-3 py-2">
            <div className="flex items-center justify-center divide-x divide-border">
              <div className="flex items-center gap-2 px-4 py-1">
                <SealCheck className="w-4 h-4 text-green-600 dark:text-green-400" weight="regular" />
                <div className="text-base font-bold text-green-600 dark:text-green-400">
                  {stats.active}
                </div>
              </div>
              
              <div className="flex items-center gap-2 px-4 py-1">
                <PersonSimpleSki className="w-4 h-4 text-blue-600 dark:text-blue-400" weight="regular" />
                <div className="text-base font-bold text-blue-600 dark:text-blue-400">
                  {stats.ski}
                </div>
              </div>
              
              <div className="flex items-center gap-2 px-4 py-1">
                <PersonSimpleSnowboard className="w-4 h-4 text-amber-600 dark:text-amber-400" weight="regular" />
                <div className="text-base font-bold text-amber-600 dark:text-amber-400">
                  {stats.snowboard}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>


      {/* 資格一覧テーブル */}
      <div className="rounded-lg border overflow-x-auto bg-white dark:bg-gray-900 shadow-lg">
        <div className="p-4 border-b space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-lg font-semibold">資格一覧</h2>
            <Button
              onClick={() => handleOpenModal()}
              className="flex items-center gap-2 bg-gradient-to-r from-blue-600 via-blue-500 to-cyan-400 hover:shadow-lg hover:scale-105 transition-all duration-300"
            >
              <Plus className="w-4 h-4" weight="regular" />
              追加
            </Button>
          </div>
          
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
            {/* タブフィルター */}
            <Tabs value={currentDepartment} onValueChange={handleDepartmentChange} className="w-full sm:w-auto">
              <TabsList className="grid w-full grid-cols-3 sm:w-auto">
                <TabsTrigger value="all" className="flex items-center gap-2">
                  すべて
                </TabsTrigger>
                <TabsTrigger value="ski" className="flex items-center gap-2">
                  <PersonSimpleSki className="w-4 h-4" weight="regular" />
                  スキー
                </TabsTrigger>
                <TabsTrigger value="snowboard" className="flex items-center gap-2">
                  <PersonSimpleSnowboard className="w-4 h-4" weight="regular" />
                  スノーボード
                </TabsTrigger>
              </TabsList>
            </Tabs>
            
            {/* 有効のみスイッチ - モバイルでは非表示 */}
            <div className="hidden sm:flex items-center space-x-2">
              <Switch
                id="active-only"
                checked={showActiveOnly}
                onCheckedChange={handleActiveFilterChange}
              />
              <Label htmlFor="active-only" className="cursor-pointer flex items-center gap-1">
                <SealCheck className="w-4 h-4 text-green-600 dark:text-green-400" weight="regular" />
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
              <TableHead className="hidden md:table-cell min-w-[300px]">説明</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredCertifications.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} className="text-center py-8 text-muted-foreground">
                  {currentDepartment === "all" && !showActiveOnly
                    ? "資格が登録されていません"
                    : showActiveOnly 
                      ? "有効な資格がありません"
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
                      className={`font-medium whitespace-nowrap md:whitespace-normal ${
                        departmentStyles.text
                      } ${!certification.isActive ? "line-through" : ""}`}
                    >
                      <div className="flex items-center gap-2">
                        <span className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-muted text-muted-foreground">
                          {certification.organization}
                        </span>
                        <span>{certification.name}</span>
                      </div>
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
