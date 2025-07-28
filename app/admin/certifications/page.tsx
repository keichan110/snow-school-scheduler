"use client";

import { useState, useEffect, useCallback } from "react";
import { Plus, PersonSimpleSki, PersonSimpleSnowboard } from "@phosphor-icons/react";
import CertificationCard from "./CertificationCard";
import CertificationModal from "./CertificationModal";
import { fetchCertifications, createCertification, updateCertification } from "./api";
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
            <p className="text-gray-600">データを読み込んでいます...</p>
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
            <p className="text-red-600 mb-4">{error}</p>
            <button
              onClick={loadCertifications}
              className="px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors"
            >
              再試行
            </button>
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
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">資格管理</h1>
            <p className="text-sm md:text-base text-gray-600">
              スキー・スノーボード資格の登録・管理を行います
            </p>
          </div>
        </div>
      </div>

      {/* 統計情報 */}
      <div className="mb-6 md:mb-8">
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
          <div className="bg-white border border-gray-200 rounded-xl p-5 text-center transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg">
            <div className="text-2xl md:text-3xl font-bold text-green-600 mb-1">{stats.active}</div>
            <div className="text-sm text-gray-600">有効な資格</div>
          </div>
          <div className="bg-white border border-gray-200 rounded-xl p-5 text-center transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg">
            <div className="text-2xl md:text-3xl font-bold text-blue-600 mb-1">{stats.ski}</div>
            <div className="text-sm text-gray-600">スキー資格</div>
          </div>
          <div className="bg-white border border-gray-200 rounded-xl p-5 text-center transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg col-span-2 lg:col-span-1">
            <div className="text-2xl md:text-3xl font-bold text-amber-600 mb-1">
              {stats.snowboard}
            </div>
            <div className="text-sm text-gray-600">スノーボード資格</div>
          </div>
        </div>
      </div>

      {/* フィルター */}
      <div className="mb-6 md:mb-8">
        <div className="flex flex-wrap gap-2 justify-center md:justify-start">
          {filters.map((filter) => (
            <button
              key={filter.key}
              onClick={() => handleFilterChange(filter.key)}
              className={`px-3 py-1.5 rounded-full border text-sm transition-all duration-200 flex items-center gap-1.5 ${
                currentFilter === filter.key
                  ? "bg-blue-600 text-white border-blue-600"
                  : "bg-white text-gray-700 border-gray-200 hover:border-blue-600 hover:bg-blue-50"
              }`}
            >
              {filter.icon && <filter.icon className="w-4 h-4" weight="regular" />}
              {filter.label}
            </button>
          ))}
        </div>
      </div>

      {/* 資格一覧 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
        {filteredCertifications.map((certification, index) => (
          <div
            key={certification.id}
            style={{ animationDelay: `${index * 0.1}s` }}
            className="fade-in-animation"
          >
            <CertificationCard certification={certification} onEdit={handleOpenModal} />
          </div>
        ))}

        {filteredCertifications.length === 0 && (
          <div className="col-span-full text-center py-12">
            <p className="text-gray-500">
              {currentFilter === "all"
                ? "資格が登録されていません"
                : "フィルター条件に一致する資格がありません"}
            </p>
          </div>
        )}
      </div>

      {/* フローティングアクションボタン */}
      <button
        onClick={() => handleOpenModal()}
        className="fixed bottom-24 right-6 md:bottom-4 md:right-4 w-14 h-14 md:w-12 md:h-12 btn-gradient rounded-full flex items-center justify-center shadow-lg z-[60] border-none cursor-pointer"
        style={{ boxShadow: "0 4px 20px rgba(73, 81, 94, 0.3)" }}
        title="新しい資格を追加"
      >
        <Plus className="w-6 h-6 md:w-5 md:h-5 text-white" weight="regular" />
      </button>

      {/* モーダル */}
      <CertificationModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        certification={editingCertification}
        onSave={handleSave}
      />

      <style jsx>{`
        .fade-in-animation {
          animation: fadeIn 0.2s ease-out forwards;
          opacity: 0;
        }

        @keyframes fadeIn {
          0% {
            opacity: 0;
            transform: translateY(10px);
          }
          100% {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  );
}
