'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  Users,
  UserCheck,
  Crown,
  Star,
  User,
  PencilSimple,
  Trash,
  Eye,
  EyeSlash,
} from '@phosphor-icons/react';
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
    if (!window.confirm(`${user.displayName}を無効化しますか？\nこの操作は取り消せません。`)) {
      return;
    }

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

      <div className="mb-4 md:mb-6">
        <Card className="mx-auto w-full max-w-3xl md:mx-0">
          <CardContent className="px-4 py-3">
            <div className="grid grid-cols-5 divide-x divide-border">
              <div className="flex flex-col items-center gap-1 px-2">
                <Users className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                <div className="text-lg font-bold text-blue-600 dark:text-blue-400">
                  {stats.total}
                </div>
                <div className="text-xs text-muted-foreground">総数</div>
              </div>

              <div className="flex flex-col items-center gap-1 px-2">
                <UserCheck className="h-5 w-5 text-green-600 dark:text-green-400" />
                <div className="text-lg font-bold text-green-600 dark:text-green-400">
                  {stats.active}
                </div>
                <div className="text-xs text-muted-foreground">アクティブ</div>
              </div>

              <div className="flex flex-col items-center gap-1 px-2">
                <Crown className="h-5 w-5 text-red-600 dark:text-red-400" />
                <div className="text-lg font-bold text-red-600 dark:text-red-400">
                  {stats.admins}
                </div>
                <div className="text-xs text-muted-foreground">管理者</div>
              </div>

              <div className="flex flex-col items-center gap-1 px-2">
                <Star className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                <div className="text-lg font-bold text-blue-600 dark:text-blue-400">
                  {stats.managers}
                </div>
                <div className="text-xs text-muted-foreground">マネージャー</div>
              </div>

              <div className="flex flex-col items-center gap-1 px-2">
                <User className="h-5 w-5 text-green-600 dark:text-green-400" />
                <div className="text-lg font-bold text-green-600 dark:text-green-400">
                  {stats.members}
                </div>
                <div className="text-xs text-muted-foreground">メンバー</div>
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
              <TableHead className="min-w-[120px]">ユーザー名</TableHead>
              <TableHead className="min-w-[100px]">権限</TableHead>
              <TableHead className="min-w-[80px]">状態</TableHead>
              <TableHead className="min-w-[120px]">最終ログイン</TableHead>
              <TableHead className="min-w-[120px]">登録日</TableHead>
              <TableHead className="min-w-[80px]">操作</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredUsers.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="py-8 text-center text-muted-foreground">
                  {filters.status === 'active'
                    ? 'アクティブなユーザーがいません'
                    : 'ユーザーが登録されていません'}
                </TableCell>
              </TableRow>
            ) : (
              filteredUsers.map((user) => (
                <TableRow
                  key={user.id}
                  className={`hover:bg-muted/50 ${!user.isActive ? 'opacity-60' : ''}`}
                >
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <div className={`rounded-full bg-muted p-2 ${getRoleColor(user.role)}`}>
                        {getRoleIcon(user.role)}
                      </div>
                      <div>
                        <p className={`font-medium ${!user.isActive ? 'line-through' : ''}`}>
                          {user.displayName}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          ID: {user.id.substring(0, 8)}...
                        </p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className={`${getRoleColor(user.role)} font-medium`}>
                      {getRoleDisplayName(user.role)}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      {user.isActive ? (
                        <>
                          <UserCheck className="h-4 w-4 text-green-600" />
                          <span className="text-sm text-green-600">アクティブ</span>
                        </>
                      ) : (
                        <>
                          <User className="h-4 w-4 text-red-600" />
                          <span className="text-sm text-red-600">無効</span>
                        </>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    {user.lastLoginAt ? (
                      <span className="text-sm">
                        {format(new Date(user.lastLoginAt), 'MM/dd HH:mm', { locale: ja })}
                      </span>
                    ) : (
                      <span className="text-sm text-muted-foreground">未ログイン</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <span className="text-sm text-muted-foreground">
                      {format(new Date(user.createdAt), 'MM/dd', { locale: ja })}
                    </span>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleOpenModal(user)}
                        className="h-8 w-8 p-0"
                        title="編集"
                      >
                        <PencilSimple className="h-4 w-4" />
                      </Button>

                      {user.isActive && user.role !== 'ADMIN' && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeactivate(user)}
                          className="h-8 w-8 p-0 text-red-600 hover:bg-red-100 hover:text-red-700 dark:text-red-400"
                          title="無効化"
                        >
                          <Trash className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <UserModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        user={editingUser}
        onSave={handleSave}
      />
    </div>
  );
}
