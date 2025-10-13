/**
 * Invitations Feature Module
 *
 * このモジュールは、招待システム機能を提供します。
 * 管理者・マネージャーが新規ユーザーを招待し、招待URLを生成します。
 *
 * @module features/invitations
 */

// Write API (POST/DELETE) - Server Actions
export {
  acceptInvitationAction,
  createInvitationAction,
  deleteInvitationAction,
} from "./actions";
// Read API (GET) - 既存の実装
export {
  type InvitationsQueryKey,
  invitationsQueryKeys,
  useInvitationsQuery,
} from "./api/queries";

// TanStack Query Hooks for Mutations
export {
  invitationKeys,
  useAcceptInvitation,
  useCreateInvitation,
  useDeleteInvitation,
} from "./queries/use-invitations";
export type { AcceptInvitationInput, CreateInvitationInput } from "./schemas";
// Zod Schemas & Types
export { acceptInvitationSchema, createInvitationSchema } from "./schemas";
