'use client';

import { useState, useEffect, useCallback } from 'react';
import { UserCheck, Crown, Star, User, Eye, EyeSlash } from '@phosphor-icons/react';
import UserModal from './UserModal';
import { fetchUsers, updateUser, deactivateUser, getRoleDisplayName, getRoleColor } from './api';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
import { ja } from 'date-fns/locale';
import type { UserWithDetails, UserFormData, UserStats, UserFilters, UserRole } from './types';

export default function UsersPage() {
  const [users, setUsers] = useState<UserWithDetails[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<UserWithDetails[]>([]);
  const [filters, setFilters] = useState<UserFilters>({
    role: 'all',
    status: 'active',
  });
  const [stats, setStats] = useState<UserStats>({
    total: 0,
    active: 0,
    admins: 0,
    managers: 0,
    members: 0,
  });
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<UserWithDetails | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadUsers = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await fetchUsers(filters);
      setUsers(data);
    } catch (error) {
      console.error('Failed to load users:', error);
      setError(error instanceof Error ? error.message : 'データの取得に失敗しました');
    } finally {
      setIsLoading(false);
    }
  };

  const applyFilter = useCallback(() => {
    // usersが配列でない場合のガード処理
    if (!Array.isArray(users)) {
      setFilteredUsers([]);
      return;
    }

    let filtered = [...users];

    // ロールフィルター
    if (filters.role !== 'all') {
      filtered = filtered.filter((user) => user.role === filters.role);
    }

    // ステータスフィルター
    if (filters.status === 'active') {
      filtered = filtered.filter((user) => user.isActive);
    } else if (filters.status === 'inactive') {
      filtered = filtered.filter((user) => !user.isActive);
    }

    // ロール順、最終ログイン順でソート
    filtered.sort((a, b) => {
      // ロール優先順位
      const roleOrder = { ADMIN: 0, MANAGER: 1, MEMBER: 2 };
      const roleDiff = roleOrder[a.role] - roleOrder[b.role];
      if (roleDiff !== 0) return roleDiff;

      // 最終ログイン順（新しい順）
      const aLogin = a.lastLoginAt ? new Date(a.lastLoginAt).getTime() : 0;
      const bLogin = b.lastLoginAt ? new Date(b.lastLoginAt).getTime() : 0;
      return bLogin - aLogin;
    });

    setFilteredUsers(filtered);
  }, [users, filters]);

  const updateStats = useCallback(() => {
    // usersが配列でない場合のガード処理
    if (!Array.isArray(users)) {
      setStats({ total: 0, active: 0, admins: 0, managers: 0, members: 0 });
      return;
    }

    const total = users.length;
    const active = users.filter((user) => user.isActive).length;
    const admins = users.filter((user) => user.role === 'ADMIN').length;
    const managers = users.filter((user) => user.role === 'MANAGER').length;
    const members = users.filter((user) => user.role === 'MEMBER').length;

    setStats({ total, active, admins, managers, members });
  }, [users]);

  useEffect(() => {
    loadUsers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters]);

  useEffect(() => {
    applyFilter();
  }, [applyFilter]);

  useEffect(() => {
    updateStats();
  }, [updateStats]);

  const handleRoleFilterChange = (role: string) => {
    setFilters({ ...filters, role: role as 'all' | UserRole });
  };

  const handleStatusFilterChange = (checked: boolean) => {
    setFilters({ ...filters, status: checked ? 'active' : 'all' });
  };

  const handleOpenModal = (user?: UserWithDetails) => {
    setEditingUser(user || null);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingUser(null);
  };

  const handleSave = async (data: UserFormData) => {
    if (!editingUser) {
      throw new Error('編集対象のユーザーが設定されていません');
    }

    try {
      const updated = await updateUser(editingUser.id, {
        displayName: data.displayName,
        role: data.role,
        isActive: data.isActive,
      });

      setUsers((prev) => prev.map((user) => (user.id === editingUser.id ? updated : user)));

      handleCloseModal();
    } catch (error) {
      throw error;
    }
  };

  const handleDeactivate = async (user: UserWithDetails) => {
    try {
      await deactivateUser(user.id);
      setUsers((prev) => prev.map((u) => (u.id === user.id ? { ...u, isActive: false } : u)));
    } catch {
      console.error('ユーザーの無効化に失敗しました');
    }
  };

  const getRoleIcon = (role: UserRole) => {
    switch (role) {
      case 'ADMIN':
        return <Crown className="h-4 w-4" />;
      case 'MANAGER':
        return <Star className="h-4 w-4" />;
      case 'MEMBER':
        return <User className="h-4 w-4" />;
    }
  };

  if (isLoading) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6 md:py-8 lg:px-8">
        <div className="flex h-64 items-center justify-center">
          <div className="text-center">
            <div className="mx-auto mb-4 h-8 w-8 animate-spin rounded-full border-4 border-primary-500 border-t-transparent"></div>
            <p className="text-muted-foreground">データを読み込んでいます...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6 md:py-8 lg:px-8">
        <div className="flex h-64 items-center justify-center">
          <div className="text-center">
            <p className="mb-4 text-destructive">{error}</p>
            <Button onClick={loadUsers}>再試行</Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6 md:py-8 lg:px-8">
      <div className="mb-6 md:mb-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="mb-2 text-2xl font-bold text-foreground md:text-3xl">ユーザー管理</h1>
            <p className="text-sm text-muted-foreground md:text-base">
              システムユーザーの権限・状態管理を行います
            </p>
          </div>
        </div>
      </div>

      {/* 統計情報 */}
      <div className="mb-4 md:mb-6">
        <Card className="mx-auto w-full max-w-md md:mx-0">
          <CardContent className="px-3 py-2">
            <div className="flex items-center justify-center divide-x divide-border">
              <div className="flex items-center gap-2 px-4 py-1">
                <UserCheck
                  className="h-4 w-4 text-green-600 dark:text-green-400"
                  weight="regular"
                />
                <div className="text-base font-bold text-green-600 dark:text-green-400">
                  {stats.active}
                </div>
              </div>

              <div className="flex items-center gap-2 px-4 py-1">
                <Crown className="h-4 w-4 text-red-600 dark:text-red-400" weight="regular" />
                <div className="text-base font-bold text-red-600 dark:text-red-400">
                  {stats.admins}
                </div>
              </div>

              <div className="flex items-center gap-2 px-4 py-1">
                <Star className="h-4 w-4 text-blue-600 dark:text-blue-400" weight="regular" />
                <div className="text-base font-bold text-blue-600 dark:text-blue-400">
                  {stats.managers}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="overflow-x-auto rounded-lg border bg-white shadow-lg dark:bg-gray-900">
        <div className="space-y-4 border-b p-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">ユーザー一覧</h2>
          </div>

          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <Tabs
              value={filters.role}
              onValueChange={handleRoleFilterChange}
              className="w-full sm:w-auto"
            >
              <TabsList className="grid w-full grid-cols-4 sm:w-auto">
                <TabsTrigger value="all">すべて</TabsTrigger>
                <TabsTrigger value="ADMIN" className="flex items-center gap-1">
                  <Crown className="h-3 w-3" />
                  管理者
                </TabsTrigger>
                <TabsTrigger value="MANAGER" className="flex items-center gap-1">
                  <Star className="h-3 w-3" />
                  マネージャー
                </TabsTrigger>
                <TabsTrigger value="MEMBER" className="flex items-center gap-1">
                  <User className="h-3 w-3" />
                  メンバー
                </TabsTrigger>
              </TabsList>
            </Tabs>

            <div className="flex items-center space-x-2">
              <Switch
                id="active-only"
                checked={filters.status === 'active'}
                onCheckedChange={handleStatusFilterChange}
              />
              <Label htmlFor="active-only" className="flex cursor-pointer items-center gap-1">
                {filters.status === 'active' ? (
                  <Eye className="h-4 w-4 text-green-600 dark:text-green-400" />
                ) : (
                  <EyeSlash className="h-4 w-4 text-gray-500" />
                )}
                アクティブのみ
              </Label>
            </div>
          </div>
        </div>

        <Table>
          <TableHeader>
            <TableRow className="bg-white dark:bg-gray-900">
              <TableHead className="w-12"></TableHead>
              <TableHead className="min-w-[120px]">ユーザー名</TableHead>
              <TableHead className="min-w-[100px]">権限</TableHead>
              <TableHead className="min-w-[120px]">最終ログイン</TableHead>
              <TableHead className="min-w-[120px]">登録日</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredUsers.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="py-8 text-center text-muted-foreground">
                  {filters.status === 'active'
                    ? 'アクティブなユーザーがいません'
                    : 'ユーザーが登録されていません'}
                </TableCell>
              </TableRow>
            ) : (
              filteredUsers.map((user) => {
                // ステータス別の背景色とアイコンの設定
                let statusStyles;
                let StatusIcon;
                if (!user.isActive) {
                  statusStyles = {
                    row: 'bg-gray-50/30 hover:bg-gray-50/50 dark:bg-gray-900/5 dark:hover:bg-gray-900/10',
                    icon: 'text-gray-600 dark:text-gray-400',
                    text: 'text-foreground',
                  };
                  StatusIcon = EyeSlash;
                } else {
                  // ロール別のスタイル
                  switch (user.role) {
                    case 'ADMIN':
                      statusStyles = {
                        row: 'bg-red-50/30 hover:bg-red-50/50 dark:bg-red-900/5 dark:hover:bg-red-900/10',
                        icon: 'text-red-600 dark:text-red-400',
                        text: 'text-foreground',
                      };
                      StatusIcon = Crown;
                      break;
                    case 'MANAGER':
                      statusStyles = {
                        row: 'bg-blue-50/30 hover:bg-blue-50/50 dark:bg-blue-900/5 dark:hover:bg-blue-900/10',
                        icon: 'text-blue-600 dark:text-blue-400',
                        text: 'text-foreground',
                      };
                      StatusIcon = Star;
                      break;
                    case 'MEMBER':
                    default:
                      statusStyles = {
                        row: 'bg-green-50/30 hover:bg-green-50/50 dark:bg-green-900/5 dark:hover:bg-green-900/10',
                        icon: 'text-green-600 dark:text-green-400',
                        text: 'text-foreground',
                      };
                      StatusIcon = User;
                      break;
                  }
                }

                return (
                  <TableRow
                    key={user.id}
                    className={`cursor-pointer transition-colors ${statusStyles.row} ${
                      !user.isActive ? 'opacity-60' : ''
                    }`}
                    onClick={() => handleOpenModal(user)}
                  >
                    <TableCell>
                      <StatusIcon className={`h-5 w-5 ${statusStyles.icon}`} weight="regular" />
                    </TableCell>
                    <TableCell>
                      <div>
                        <p
                          className={`font-medium ${statusStyles.text} ${
                            !user.isActive ? 'line-through' : ''
                          }`}
                        >
                          {user.displayName}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          ID: {user.id.substring(0, 8)}...
                        </p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className={`${getRoleColor(user.role)} font-medium`}>
                        {getRoleDisplayName(user.role)}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {user.lastLoginAt ? (
                        <span
                          className={`text-sm ${statusStyles.text} ${
                            !user.isActive ? 'line-through' : ''
                          }`}
                        >
                          {format(new Date(user.lastLoginAt), 'MM/dd HH:mm', { locale: ja })}
                        </span>
                      ) : (
                        <span className="text-sm text-muted-foreground">未ログイン</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <span
                        className={`text-sm text-muted-foreground ${
                          !user.isActive ? 'line-through' : ''
                        }`}
                      >
                        {format(new Date(user.createdAt), 'MM/dd', { locale: ja })}
                      </span>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>

      <UserModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        user={editingUser}
        onSave={handleSave}
        onDeactivate={handleDeactivate}
      />
    </div>
  );
}
