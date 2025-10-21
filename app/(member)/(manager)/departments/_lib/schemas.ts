import { z } from "zod";
import {
  isActiveSchema,
  optionalStringSchema,
} from "@/features/shared/schemas/common";

/**
 * 部門作成スキーマ
 */
export const createDepartmentSchema = z.object({
  code: z.string().min(1, "Code is required"),
  name: z.string().min(1, "Name is required"),
  description: optionalStringSchema,
  isActive: isActiveSchema,
});

/**
 * 部門更新スキーマ
 */
export const updateDepartmentSchema = createDepartmentSchema;

export type CreateDepartmentInput = z.infer<typeof createDepartmentSchema>;
export type UpdateDepartmentInput = z.infer<typeof updateDepartmentSchema>;
