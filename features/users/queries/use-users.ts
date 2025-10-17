"use client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  createUserAction,
  deleteUserAction,
  updateUserAction,
} from "../actions";
import type { CreateUserInput, UpdateUserInput } from "../schemas";

/**
 * ユーザークエリキー定義
 *
 * TanStack Query のクエリキャッシュ管理に使用します。
 * 階層的なキー構造により、効率的なキャッシュ無効化が可能です。
 *
 * @example
 * ```typescript
 * // 全ユーザーデータを無効化
 * queryClient.invalidateQueries({ queryKey: userKeys.all });
 *
 * // 特定ユーザーの詳細のみ無効化
 * queryClient.invalidateQueries({ queryKey: userKeys.detail("user_123") });
 * ```
 */
export const userKeys = {
  all: ["users"] as const,
  lists: () => [...userKeys.all, "list"] as const,
  list: () => [...userKeys.lists()] as const,
  details: () => [...userKeys.all, "detail"] as const,
  detail: (id: string) => [...userKeys.details(), id] as const,
};

/**
 * ユーザー作成ミューテーションフック
 *
 * 管理者専用の機能です。通常のユーザー登録は招待システム経由で行われます。
 *
 * @returns ユーザー作成ミューテーション
 *
 * @example
 * ```typescript
 * function CreateUserForm() {
 *   const createUser = useCreateUser();
 *
 *   const handleSubmit = async (data: CreateUserInput) => {
 *     const result = await createUser.mutateAsync(data);
 *     if (result.success) {
 *       console.log("ユーザー作成成功");
 *     } else {
 *       console.error("エラー:", result.error);
 *     }
 *   };
 *
 *   return <form onSubmit={handleSubmit}>...</form>;
 * }
 * ```
 */
export function useCreateUser() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (vars: CreateUserInput) => createUserAction(vars),
    onSuccess: () => {
      // 全ユーザーリストのキャッシュを無効化
      qc.invalidateQueries({ queryKey: userKeys.all });
    },
  });
}

/**
 * ユーザー更新ミューテーションフック
 *
 * 管理者専用の機能です。
 *
 * 制限:
 * - 自分自身のアカウントは編集できません
 *
 * @returns ユーザー更新ミューテーション
 *
 * @example
 * ```typescript
 * function EditUserForm({ userId }: { userId: string }) {
 *   const updateUser = useUpdateUser();
 *
 *   const handleSubmit = async (data: UpdateUserInput) => {
 *     const result = await updateUser.mutateAsync({ id: userId, data });
 *     if (result.success) {
 *       console.log("ユーザー更新成功");
 *     }
 *   };
 *
 *   return <form onSubmit={handleSubmit}>...</form>;
 * }
 * ```
 */
export function useUpdateUser() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateUserInput }) =>
      updateUserAction(id, data),
    onSuccess: (_, { id }) => {
      // 全ユーザーリストと該当ユーザーの詳細キャッシュを無効化
      qc.invalidateQueries({ queryKey: userKeys.all });
      qc.invalidateQueries({ queryKey: userKeys.detail(id) });
    },
  });
}

/**
 * ユーザー削除ミューテーションフック
 *
 * 管理者専用の機能です。
 * 注意: 物理削除ではなく、論理削除（isActive を false に設定）です。
 *
 * 制限:
 * - 自分自身のアカウントは削除できません
 *
 * @returns ユーザー削除ミューテーション
 *
 * @example
 * ```typescript
 * function UserListItem({ userId }: { userId: string }) {
 *   const deleteUser = useDeleteUser();
 *
 *   const handleDelete = async () => {
 *     if (confirm("本当に削除しますか?")) {
 *       const result = await deleteUser.mutateAsync(userId);
 *       if (result.success) {
 *         console.log("ユーザーを無効化しました");
 *       }
 *     }
 *   };
 *
 *   return <button onClick={handleDelete}>削除</button>;
 * }
 * ```
 */
export function useDeleteUser() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteUserAction(id),
    onSuccess: () => {
      // 全ユーザーリストのキャッシュを無効化
      qc.invalidateQueries({ queryKey: userKeys.all });
    },
  });
}
