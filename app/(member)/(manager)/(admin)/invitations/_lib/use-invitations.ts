"use client";
import { useMutation } from "@tanstack/react-query";
import {
  acceptInvitationAction,
  createInvitationAction,
  deleteInvitationAction,
} from "./actions";
import type { AcceptInvitationInput, CreateInvitationInput } from "./schemas";

/**
 * 招待作成ミューテーションフック
 *
 * 管理者・マネージャー専用の機能です。
 * 新規ユーザーを招待するためのトークンとURLを生成します。
 *
 * @returns 招待作成ミューテーション
 *
 * @example
 * ```typescript
 * function CreateInvitationForm() {
 *   const createInvitation = useCreateInvitation();
 *
 *   const handleSubmit = async (data: CreateInvitationInput) => {
 *     const result = await createInvitation.mutateAsync(data);
 *     if (result.success) {
 *       console.log("招待URL:", result.data.url);
 *       // URLをコピーしてユーザーに共有
 *     } else {
 *       console.error("エラー:", result.error);
 *     }
 *   };
 *
 *   return <form onSubmit={handleSubmit}>...</form>;
 * }
 * ```
 */
export function useCreateInvitation() {
  return useMutation({
    mutationFn: (vars: CreateInvitationInput) => createInvitationAction(vars),
  });
}

/**
 * 招待受諾ミューテーションフック
 *
 * 認証不要の機能です。
 * ユーザーが招待URLから登録する際に使用します。
 *
 * @returns 招待受諾ミューテーション
 *
 * @example
 * ```typescript
 * function SignupForm({ inviteToken }: { inviteToken: string }) {
 *   const acceptInvitation = useAcceptInvitation();
 *
 *   const handleSubmit = async (lineData: {
 *     lineUserId: string;
 *     displayName: string;
 *     pictureUrl?: string;
 *   }) => {
 *     const result = await acceptInvitation.mutateAsync({
 *       token: inviteToken,
 *       ...lineData,
 *     });
 *
 *     if (result.success) {
 *       console.log("ユーザー登録成功");
 *       // ログインページにリダイレクト
 *     }
 *   };
 *
 *   return <form onSubmit={handleSubmit}>...</form>;
 * }
 * ```
 */
export function useAcceptInvitation() {
  return useMutation({
    mutationFn: (vars: AcceptInvitationInput) => acceptInvitationAction(vars),
    // 認証不要のため、queryClient 無効化なし
    // ユーザー登録後は別途ログインフローに移行する
  });
}

/**
 * 招待削除ミューテーションフック
 *
 * 管理者・マネージャー専用の機能です。
 * 招待トークンを無効化します。
 *
 * @returns 招待削除ミューテーション
 *
 * @example
 * ```typescript
 * function InvitationListItem({ token }: { token: string }) {
 *   const deleteInvitation = useDeleteInvitation();
 *
 *   const handleDelete = async () => {
 *     if (confirm("招待を無効化しますか?")) {
 *       const result = await deleteInvitation.mutateAsync(token);
 *       if (result.success) {
 *         console.log("招待を無効化しました");
 *       }
 *     }
 *   };
 *
 *   return <button onClick={handleDelete}>削除</button>;
 * }
 * ```
 */
export function useDeleteInvitation() {
  return useMutation({
    mutationFn: (token: string) => deleteInvitationAction(token),
  });
}
