/**
 * ユーザー管理画面の型定義
 */

export interface UserWithDetails {
  id: string;
  lineUserId: string;
  displayName: string;
  role: 'ADMIN' | 'MANAGER' | 'MEMBER';
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  lastLoginAt: Date | null;
}

export interface UpdateUserRequest {
  displayName?: string;
  role?: 'ADMIN' | 'MANAGER' | 'MEMBER';
  isActive?: boolean;
}

export interface UserFormData {
  displayName: string;
  role: 'ADMIN' | 'MANAGER' | 'MEMBER';
  isActive: boolean;
}

export interface UserStats {
  total: number;
  active: number;
  admins: number;
  managers: number;
  members: number;
}

export interface UserApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

export type UserRole = 'ADMIN' | 'MANAGER' | 'MEMBER';

export interface UserFilters {
  role: 'all' | UserRole;
  status: 'all' | 'active' | 'inactive';
}
