import { useQuery } from "@tanstack/react-query";
import type { ApiResponse } from "@/lib/api/types";

// 部門データの型定義
interface Department {
  id: number;
  code: string;
  name: string;
  description?: string;
  isActive: boolean;
}

// シフト種別データの型定義
interface ShiftType {
  id: number;
  name: string;
  isActive: boolean;
}

// インストラクターデータの型定義
interface Instructor {
  id: number;
  lastName: string;
  firstName: string;
  status: string;
}

// 資格データの型定義
interface Certification {
  id: number;
  name: string;
  shortName: string;
  organization: string;
  isActive: boolean;
}

// 静的データ用のクエリキー
export const staticDataQueryKeys = {
  departments: ["departments"] as const,
  shiftTypes: ["shift-types"] as const,
  instructors: ["instructors"] as const,
  certifications: ["certifications"] as const,
};

// 部門データ取得フック（設計書：長期キャッシュ対応）
export function useDepartments() {
  return useQuery({
    queryKey: staticDataQueryKeys.departments,
    queryFn: async (): Promise<Department[]> => {
      const response = await fetch("/api/departments");
      if (!response.ok) {
        throw new Error("Failed to fetch departments");
      }

      const data: ApiResponse<Department[]> = await response.json();
      if (!(data.success && data.data)) {
        throw new Error(data.error || "Failed to fetch departments");
      }

      return data.data;
    },
    // 設計書に基づく静的データの長期キャッシュ戦略
    staleTime: 30 * 60 * 1000, // 30分
    gcTime: 60 * 60 * 1000, // 1時間
    refetchOnWindowFocus: false,
    refetchOnMount: false,
  });
}

// シフト種別データ取得フック（設計書：長期キャッシュ対応）
export function useShiftTypes() {
  return useQuery({
    queryKey: staticDataQueryKeys.shiftTypes,
    queryFn: async (): Promise<ShiftType[]> => {
      const response = await fetch("/api/shift-types");
      if (!response.ok) {
        throw new Error("Failed to fetch shift types");
      }

      const data: ApiResponse<ShiftType[]> = await response.json();
      if (!(data.success && data.data)) {
        throw new Error(data.error || "Failed to fetch shift types");
      }

      return data.data;
    },
    // 静的データの長期キャッシュ
    staleTime: 30 * 60 * 1000, // 30分
    gcTime: 60 * 60 * 1000, // 1時間
    refetchOnWindowFocus: false,
    refetchOnMount: false,
  });
}

// インストラクターデータ取得フック（設計書：中期キャッシュ対応）
export function useInstructors() {
  return useQuery({
    queryKey: staticDataQueryKeys.instructors,
    queryFn: async (): Promise<Instructor[]> => {
      const response = await fetch("/api/instructors");
      if (!response.ok) {
        throw new Error("Failed to fetch instructors");
      }

      const data: ApiResponse<Instructor[]> = await response.json();
      if (!(data.success && data.data)) {
        throw new Error(data.error || "Failed to fetch instructors");
      }

      return data.data;
    },
    // インストラクターデータは中期キャッシュ（変更頻度が中程度）
    staleTime: 10 * 60 * 1000, // 10分
    gcTime: 30 * 60 * 1000, // 30分
    refetchOnWindowFocus: false,
  });
}

// 資格データ取得フック（設計書：長期キャッシュ対応）
export function useCertifications() {
  return useQuery({
    queryKey: staticDataQueryKeys.certifications,
    queryFn: async (): Promise<Certification[]> => {
      const response = await fetch("/api/certifications");
      if (!response.ok) {
        throw new Error("Failed to fetch certifications");
      }

      const data: ApiResponse<Certification[]> = await response.json();
      if (!(data.success && data.data)) {
        throw new Error(data.error || "Failed to fetch certifications");
      }

      return data.data;
    },
    // 資格データは長期キャッシュ（変更頻度が低い）
    staleTime: 30 * 60 * 1000, // 30分
    gcTime: 60 * 60 * 1000, // 1時間
    refetchOnWindowFocus: false,
    refetchOnMount: false,
  });
}

// 複合フック：すべての静的データを一度に取得
export function useAllStaticData() {
  const departments = useDepartments();
  const shiftTypes = useShiftTypes();
  const instructors = useInstructors();
  const certifications = useCertifications();

  return {
    departments,
    shiftTypes,
    instructors,
    certifications,
    // 全てのデータの読み込み状態
    isLoading:
      departments.isLoading ||
      shiftTypes.isLoading ||
      instructors.isLoading ||
      certifications.isLoading,
    // 全てのデータの成功状態
    isSuccess:
      departments.isSuccess &&
      shiftTypes.isSuccess &&
      instructors.isSuccess &&
      certifications.isSuccess,
    // いずれかのデータでエラーが発生した場合
    hasError:
      departments.isError ||
      shiftTypes.isError ||
      instructors.isError ||
      certifications.isError,
  };
}
