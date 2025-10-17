/**
 * Users Feature Module
 *
 * このモジュールは、ユーザー管理機能を提供します。
 * 管理者専用の機能であり、通常のユーザー登録は招待システム経由で行われます。
 *
 * @module features/users
 */

// Write API (POST/PUT/DELETE) - Server Actions
export {
  createUserAction,
  deleteUserAction,
  updateUserAction,
} from "./actions";
// Read API (GET) - 既存の実装
export {
  type UsersQueryKey,
  usersQueryKeys,
  useUsersQuery,
} from "./api/queries";

// TanStack Query Hooks for Mutations
export {
  useCreateUser,
  useDeleteUser,
  userKeys,
  useUpdateUser,
} from "./queries/use-users";
export type { CreateUserInput, UpdateUserInput } from "./schemas";
// Zod Schemas & Types
export { createUserSchema, updateUserSchema } from "./schemas";
