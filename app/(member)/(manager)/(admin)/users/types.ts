/**
 * ユーザー管理画面の型定義
 */

export type UserWithDetails = {
  id: string;
  lineUserId: string;
  displayName: string;
  role: "ADMIN" | "MANAGER" | "MEMBER";
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  lastLoginAt: Date | null;
};

export type UpdateUserRequest = {
  displayName?: string;
  role?: "ADMIN" | "MANAGER" | "MEMBER";
  isActive?: boolean;
};

export type UserFormData = {
  displayName: string;
  role: "ADMIN" | "MANAGER" | "MEMBER";
  isActive: boolean;
};

export type UserStats = {
  total: number;
  active: number;
  admins: number;
  managers: number;
  members: number;
};

export type UserApiResponse<T> = {
  success: boolean;
  data?: T;
  error?: string;
};

export type UserRole = "ADMIN" | "MANAGER" | "MEMBER";

export type UserFilters = {
  role: "all" | UserRole;
  status: "all" | "active" | "inactive";
};
