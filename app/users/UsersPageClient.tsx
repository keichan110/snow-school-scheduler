'use client';

import { useCallback, useMemo, useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Crown, Eye, EyeSlash, Star, User, UserCheck } from '@phosphor-icons/react';
import { format } from 'date-fns';
import { ja } from 'date-fns/locale';

import { usersQueryKeys, useUsersQuery } from '@/features/users';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

import UserModal from './UserModal';
import { deactivateUser, getRoleColor, getRoleDisplayName, updateUser } from './api';
import type { UserFilters, UserFormData, UserRole, UserStats, UserWithDetails } from './types';

const ROLE_ORDER: Record<UserRole, number> = {
  ADMIN: 0,
  MANAGER: 1,
  MEMBER: 2,
};

function sortUsers(users: UserWithDetails[]): UserWithDetails[] {
  return [...users].sort((a, b) => {
    const roleDiff = ROLE_ORDER[a.role] - ROLE_ORDER[b.role];

    if (roleDiff !== 0) {
      return roleDiff;
    }

    const aLogin = a.lastLoginAt ? new Date(a.lastLoginAt).getTime() : 0;
    const bLogin = b.lastLoginAt ? new Date(b.lastLoginAt).getTime() : 0;

    return bLogin - aLogin;
  });
}

function calculateStats(users: UserWithDetails[]): UserStats {
  return {
    total: users.length,
    active: users.filter((user) => user.isActive).length,
    admins: users.filter((user) => user.role === 'ADMIN').length,
    managers: users.filter((user) => user.role === 'MANAGER').length,
    members: users.filter((user) => user.role === 'MEMBER').length,
  };
}

function matchesFilters(user: UserWithDetails, filters: UserFilters): boolean {
  const matchesRole = filters.role === 'all' ? true : user.role === filters.role;

  const matchesStatus =
    filters.status === 'all' ? true : filters.status === 'active' ? user.isActive : !user.isActive;

  return matchesRole && matchesStatus;
}

function getEmptyStateMessage(filters: UserFilters): string {
  if (filters.status === 'active') {
    return 'アクティブなユーザーがいません';
  }

  if (filters.status === 'inactive') {
    return '無効化されたユーザーがいません';
  }

  return 'ユーザーが登録されていません';
}

export default function UsersPageClient() {
  const [filters, setFilters] = useState<UserFilters>({ role: 'all', status: 'active' });
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<UserWithDetails | null>(null);

  const queryClient = useQueryClient();

  const { data: users } = useUsersQuery(filters, {
    select: (data) => sortUsers(data),
  });

  const stats = useMemo<UserStats>(() => calculateStats(users), [users]);
  const emptyStateMessage = useMemo(() => getEmptyStateMessage(filters), [filters]);

  const { mutateAsync: updateUserMutateAsync } = useMutation({
    mutationFn: ({ id, data }: { id: string; data: UserFormData }) => updateUser(id, data),
  });

  const { mutateAsync: deactivateUserMutateAsync } = useMutation({
    mutationFn: (id: string) => deactivateUser(id),
  });

  const handleRoleFilterChange = useCallback((role: string) => {
    setFilters((prev) => {
      if (prev.role === role) {
        return prev;
      }

      return { ...prev, role: role as 'all' | UserRole };
    });
  }, []);

  const handleStatusFilterChange = useCallback((checked: boolean) => {
    setFilters((prev) => {
      const nextStatus: UserFilters['status'] = checked ? 'active' : 'all';

      if (prev.status === nextStatus) {
        return prev;
      }

      return { ...prev, status: nextStatus };
    });
  }, []);

  const handleOpenModal = useCallback((user?: UserWithDetails) => {
    setEditingUser(user ?? null);
    setIsModalOpen(true);
  }, []);

  const handleCloseModal = useCallback(() => {
    setIsModalOpen(false);
    setEditingUser(null);
  }, []);

  const handleSave = useCallback(
    async (formData: UserFormData) => {
      if (!editingUser) {
        throw new Error('編集対象のユーザーが設定されていません');
      }

      const updated = await updateUserMutateAsync({
        id: editingUser.id,
        data: formData,
      });

      queryClient.setQueryData<UserWithDetails[]>(usersQueryKeys.list(filters), (previous) => {
        const snapshot = previous ? [...previous] : [];
        const withoutUpdated = snapshot.filter((user) => user.id !== updated.id);

        if (matchesFilters(updated, filters)) {
          withoutUpdated.push(updated);
        }

        return sortUsers(withoutUpdated);
      });

      await queryClient.invalidateQueries({ queryKey: usersQueryKeys.all });
      handleCloseModal();
    },
    [editingUser, updateUserMutateAsync, queryClient, filters, handleCloseModal]
  );

  const handleDeactivate = useCallback(
    async (user: UserWithDetails) => {
      await deactivateUserMutateAsync(user.id);

      const deactivatedUser: UserWithDetails = { ...user, isActive: false };

      queryClient.setQueryData<UserWithDetails[]>(usersQueryKeys.list(filters), (previous) => {
        const snapshot = previous ? [...previous] : [];
        const withoutTarget = snapshot.filter((item) => item.id !== user.id);

        if (matchesFilters(deactivatedUser, filters)) {
          withoutTarget.push(deactivatedUser);
        }

        return sortUsers(withoutTarget);
      });

      await queryClient.invalidateQueries({ queryKey: usersQueryKeys.all });
    },
    [deactivateUserMutateAsync, queryClient, filters]
  );

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
            {users.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="py-8 text-center text-muted-foreground">
                  {emptyStateMessage}
                </TableCell>
              </TableRow>
            ) : (
              users.map((user) => {
                let statusStyles: {
                  row: string;
                  icon: string;
                  text: string;
                };
                let StatusIcon: typeof User;

                if (!user.isActive) {
                  statusStyles = {
                    row: 'bg-gray-50/30 hover:bg-gray-50/50 dark:bg-gray-900/5 dark:hover:bg-gray-900/10',
                    icon: 'text-gray-600 dark:text-gray-400',
                    text: 'text-foreground',
                  };
                  StatusIcon = EyeSlash;
                } else {
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
