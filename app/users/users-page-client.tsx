"use client";

import {
  Crown,
  Eye,
  EyeSlash,
  Star,
  User,
  UserCheck,
} from "@phosphor-icons/react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { format } from "date-fns";
import { ja } from "date-fns/locale";
import { useCallback, useMemo, useState } from "react";
import { Badge } from "@/components/ui/badge";
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
import { usersQueryKeys, useUsersQuery } from "@/features/users";
import {
  deactivateUser,
  getRoleColor,
  getRoleDisplayName,
  updateUser,
} from "./api";
import type {
  UserFilters,
  UserFormData,
  UserRole,
  UserStats,
  UserWithDetails,
} from "./types";
import UserModal from "./user-modal";

const ROLE_ORDER: Record<UserRole, number> = {
  ADMIN: 0,
  MANAGER: 1,
  MEMBER: 2,
};

const USER_ID_PREVIEW_LENGTH = 8;

type UserStatusStyles = {
  row: string;
  icon: string;
  text: string;
};

type UserStatusInfo = {
  styles: UserStatusStyles;
  Icon: typeof User | typeof Crown | typeof Star | typeof EyeSlash;
};

function getUserStatusInfo(user: UserWithDetails): UserStatusInfo {
  if (!user.isActive) {
    return {
      styles: {
        row: "bg-gray-50/30 hover:bg-gray-50/50 dark:bg-gray-900/5 dark:hover:bg-gray-900/10",
        icon: "text-gray-600 dark:text-gray-400",
        text: "text-foreground",
      },
      Icon: EyeSlash,
    };
  }

  switch (user.role) {
    case "ADMIN":
      return {
        styles: {
          row: "bg-red-50/30 hover:bg-red-50/50 dark:bg-red-900/5 dark:hover:bg-red-900/10",
          icon: "text-red-600 dark:text-red-400",
          text: "text-foreground",
        },
        Icon: Crown,
      };
    case "MANAGER":
      return {
        styles: {
          row: "bg-blue-50/30 hover:bg-blue-50/50 dark:bg-blue-900/5 dark:hover:bg-blue-900/10",
          icon: "text-blue-600 dark:text-blue-400",
          text: "text-foreground",
        },
        Icon: Star,
      };
    default:
      return {
        styles: {
          row: "bg-green-50/30 hover:bg-green-50/50 dark:bg-green-900/5 dark:hover:bg-green-900/10",
          icon: "text-green-600 dark:text-green-400",
          text: "text-foreground",
        },
        Icon: User,
      };
  }
}

type UserRowProps = {
  user: UserWithDetails;
  onOpenModal: (user: UserWithDetails) => void;
};

function UserRow({ user, onOpenModal }: UserRowProps) {
  const { styles: statusStyles, Icon: StatusIcon } = getUserStatusInfo(user);

  return (
    <TableRow
      className={`cursor-pointer transition-colors ${statusStyles.row} ${
        user.isActive ? "" : "opacity-60"
      }`}
      key={user.id}
      onClick={() => onOpenModal(user)}
    >
      <TableCell>
        <StatusIcon
          className={`h-5 w-5 ${statusStyles.icon}`}
          weight="regular"
        />
      </TableCell>
      <TableCell>
        <div>
          <p
            className={`font-medium ${statusStyles.text} ${
              user.isActive ? "" : "line-through"
            }`}
          >
            {user.displayName}
          </p>
          <p className="text-muted-foreground text-xs">
            ID: {user.id.substring(0, USER_ID_PREVIEW_LENGTH)}...
          </p>
        </div>
      </TableCell>
      <TableCell>
        <Badge
          className={`${getRoleColor(user.role)} font-medium`}
          variant="outline"
        >
          {getRoleDisplayName(user.role)}
        </Badge>
      </TableCell>
      <TableCell>
        {user.lastLoginAt ? (
          <span
            className={`text-sm ${statusStyles.text} ${
              user.isActive ? "" : "line-through"
            }`}
          >
            {format(new Date(user.lastLoginAt), "MM/dd HH:mm", {
              locale: ja,
            })}
          </span>
        ) : (
          <span className="text-muted-foreground text-sm">未ログイン</span>
        )}
      </TableCell>
      <TableCell>
        <span
          className={`text-muted-foreground text-sm ${
            user.isActive ? "" : "line-through"
          }`}
        >
          {format(new Date(user.createdAt), "MM/dd", {
            locale: ja,
          })}
        </span>
      </TableCell>
    </TableRow>
  );
}

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
    admins: users.filter((user) => user.role === "ADMIN").length,
    managers: users.filter((user) => user.role === "MANAGER").length,
    members: users.filter((user) => user.role === "MEMBER").length,
  };
}

function matchesFilters(user: UserWithDetails, filters: UserFilters): boolean {
  const matchesRole =
    filters.role === "all" ? true : user.role === filters.role;

  let matchesStatus = true;
  if (filters.status === "active") {
    matchesStatus = user.isActive;
  } else if (filters.status === "inactive") {
    matchesStatus = !user.isActive;
  }
  // filters.status === "all" の場合は true のまま

  return matchesRole && matchesStatus;
}

function getEmptyStateMessage(filters: UserFilters): string {
  if (filters.status === "active") {
    return "アクティブなユーザーがいません";
  }

  if (filters.status === "inactive") {
    return "無効化されたユーザーがいません";
  }

  return "ユーザーが登録されていません";
}

export default function UsersPageClient() {
  const [filters, setFilters] = useState<UserFilters>({
    role: "all",
    status: "active",
  });
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<UserWithDetails | null>(null);

  const queryClient = useQueryClient();

  const { data: users } = useUsersQuery(filters, {
    select: (data) => sortUsers(data),
  });

  const stats = useMemo<UserStats>(() => calculateStats(users), [users]);
  const emptyStateMessage = useMemo(
    () => getEmptyStateMessage(filters),
    [filters]
  );

  const { mutateAsync: updateUserMutateAsync } = useMutation({
    mutationFn: ({ id, data }: { id: string; data: UserFormData }) =>
      updateUser(id, data),
  });

  const { mutateAsync: deactivateUserMutateAsync } = useMutation({
    mutationFn: (id: string) => deactivateUser(id),
  });

  const handleRoleFilterChange = useCallback((role: string) => {
    setFilters((prev) => {
      if (prev.role === role) {
        return prev;
      }

      return { ...prev, role: role as "all" | UserRole };
    });
  }, []);

  const handleStatusFilterChange = useCallback((checked: boolean) => {
    setFilters((prev) => {
      const nextStatus: UserFilters["status"] = checked ? "active" : "all";

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
        throw new Error("編集対象のユーザーが設定されていません");
      }

      const updated = await updateUserMutateAsync({
        id: editingUser.id,
        data: formData,
      });

      queryClient.setQueryData<UserWithDetails[]>(
        usersQueryKeys.list(filters),
        (previous) => {
          const snapshot = previous ? [...previous] : [];
          const withoutUpdated = snapshot.filter(
            (user) => user.id !== updated.id
          );

          if (matchesFilters(updated, filters)) {
            withoutUpdated.push(updated);
          }

          return sortUsers(withoutUpdated);
        }
      );

      await queryClient.invalidateQueries({ queryKey: usersQueryKeys.all });
      handleCloseModal();
    },
    [editingUser, updateUserMutateAsync, queryClient, filters, handleCloseModal]
  );

  const handleDeactivate = useCallback(
    async (user: UserWithDetails) => {
      await deactivateUserMutateAsync(user.id);

      const deactivatedUser: UserWithDetails = { ...user, isActive: false };

      queryClient.setQueryData<UserWithDetails[]>(
        usersQueryKeys.list(filters),
        (previous) => {
          const snapshot = previous ? [...previous] : [];
          const withoutTarget = snapshot.filter((item) => item.id !== user.id);

          if (matchesFilters(deactivatedUser, filters)) {
            withoutTarget.push(deactivatedUser);
          }

          return sortUsers(withoutTarget);
        }
      );

      await queryClient.invalidateQueries({ queryKey: usersQueryKeys.all });
    },
    [deactivateUserMutateAsync, queryClient, filters]
  );

  return (
    <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6 md:py-8 lg:px-8">
      <div className="mb-6 md:mb-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="mb-2 font-bold text-2xl text-foreground md:text-3xl">
              ユーザー管理
            </h1>
            <p className="text-muted-foreground text-sm md:text-base">
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
                <div className="font-bold text-base text-green-600 dark:text-green-400">
                  {stats.active}
                </div>
              </div>

              <div className="flex items-center gap-2 px-4 py-1">
                <Crown
                  className="h-4 w-4 text-red-600 dark:text-red-400"
                  weight="regular"
                />
                <div className="font-bold text-base text-red-600 dark:text-red-400">
                  {stats.admins}
                </div>
              </div>

              <div className="flex items-center gap-2 px-4 py-1">
                <Star
                  className="h-4 w-4 text-blue-600 dark:text-blue-400"
                  weight="regular"
                />
                <div className="font-bold text-base text-blue-600 dark:text-blue-400">
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
            <h2 className="font-semibold text-lg">ユーザー一覧</h2>
          </div>

          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <Tabs
              className="w-full sm:w-auto"
              onValueChange={handleRoleFilterChange}
              value={filters.role}
            >
              <TabsList className="grid w-full grid-cols-4 sm:w-auto">
                <TabsTrigger value="all">すべて</TabsTrigger>
                <TabsTrigger className="flex items-center gap-1" value="ADMIN">
                  <Crown className="h-3 w-3" />
                  管理者
                </TabsTrigger>
                <TabsTrigger
                  className="flex items-center gap-1"
                  value="MANAGER"
                >
                  <Star className="h-3 w-3" />
                  マネージャー
                </TabsTrigger>
                <TabsTrigger className="flex items-center gap-1" value="MEMBER">
                  <User className="h-3 w-3" />
                  メンバー
                </TabsTrigger>
              </TabsList>
            </Tabs>

            <div className="flex items-center space-x-2">
              <Switch
                checked={filters.status === "active"}
                id="active-only"
                onCheckedChange={handleStatusFilterChange}
              />
              <Label
                className="flex cursor-pointer items-center gap-1"
                htmlFor="active-only"
              >
                {filters.status === "active" ? (
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
              <TableHead className="w-12" />
              <TableHead className="min-w-[120px]">ユーザー名</TableHead>
              <TableHead className="min-w-[100px]">権限</TableHead>
              <TableHead className="min-w-[120px]">最終ログイン</TableHead>
              <TableHead className="min-w-[120px]">登録日</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {users.length === 0 ? (
              <TableRow>
                <TableCell
                  className="py-8 text-center text-muted-foreground"
                  colSpan={5}
                >
                  {emptyStateMessage}
                </TableCell>
              </TableRow>
            ) : (
              users.map((user) => (
                <UserRow
                  key={user.id}
                  onOpenModal={handleOpenModal}
                  user={user}
                />
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <UserModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onDeactivate={handleDeactivate}
        onSave={handleSave}
        user={editingUser}
      />
    </div>
  );
}
