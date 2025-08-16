/**
 * Shifts API バリデーションスキーマ
 */

import { z } from 'zod';
import {
  shiftSchema,
  shiftTypeSchema,
  positiveIntSchema,
  createDateRangeSchema,
} from '@/shared/utils/validation';

/**
 * シフト作成バリデーションスキーマ
 */
export const createShiftSchema = shiftSchema.extend({
  // 過去の日付は作成不可
  date: createDateRangeSchema(new Date()),
  // 重複シフトの強制作成フラグ（オプション）
  force: z.boolean().optional().default(false),
});

/**
 * シフト更新バリデーションスキーマ
 */
export const updateShiftSchema = shiftSchema.partial().extend({
  id: positiveIntSchema,
});

/**
 * シフト削除バリデーションスキーマ
 */
export const deleteShiftSchema = z.object({
  id: positiveIntSchema,
});

/**
 * シフト種別作成バリデーションスキーマ
 */
export const createShiftTypeSchema = shiftTypeSchema;

/**
 * シフト種別更新バリデーションスキーマ
 */
export const updateShiftTypeSchema = shiftTypeSchema.partial().extend({
  id: positiveIntSchema,
});

/**
 * シフト検索クエリパラメータバリデーションスキーマ
 */
export const shiftQuerySchema = z
  .object({
    // 基本パラメータ
    page: z.coerce.number().int().positive().optional().default(1),
    perPage: z.coerce.number().int().min(1).max(100).optional().default(20),
    sortBy: z.enum(['date', 'createdAt', 'updatedAt']).optional().default('date'),
    sortOrder: z.enum(['asc', 'desc']).optional().default('asc'),

    // 日付範囲
    startDate: z.coerce.date().optional(),
    endDate: z.coerce.date().optional(),

    // フィルター
    departmentId: z.coerce.number().int().positive().optional(),
    shiftTypeId: z.coerce.number().int().positive().optional(),
    instructorId: z.coerce.number().int().positive().optional(),
    includeAssignments: z.coerce.boolean().optional().default(false),
    includeInactive: z.coerce.boolean().optional().default(false),
  })
  .refine((data) => !data.startDate || !data.endDate || data.startDate <= data.endDate, {
    message: '終了日は開始日以降である必要があります',
    path: ['endDate'],
  })
  .refine(
    (data) => {
      if (data.startDate && data.endDate) {
        const diffTime = data.endDate.getTime() - data.startDate.getTime();
        const diffDays = diffTime / (1000 * 60 * 60 * 24);
        return diffDays <= 366; // 1年以内
      }
      return true;
    },
    {
      message: '検索期間は1年以内に設定してください',
      path: ['endDate'],
    }
  );

/**
 * カレンダー表示クエリパラメータバリデーションスキーマ
 */
export const calendarQuerySchema = z.object({
  year: z.coerce.number().int().min(2020).max(2030),
  month: z.coerce.number().int().min(1).max(12),
  departmentId: z.coerce.number().int().positive().optional(),
  view: z.enum(['month', 'week', 'day']).optional().default('month'),
});

/**
 * 週表示クエリパラメータバリデーションスキーマ
 */
export const weeklyQuerySchema = z
  .object({
    startDate: z.coerce.date(),
    departmentId: z.coerce.number().int().positive().optional(),
  })
  .refine(
    (data) => {
      // 月曜日であることを確認
      const dayOfWeek = data.startDate.getDay();
      return dayOfWeek === 1; // 月曜日 = 1
    },
    {
      message: '開始日は月曜日である必要があります',
      path: ['startDate'],
    }
  );

/**
 * シフト割り当てバリデーションスキーマ
 */
export const shiftAssignmentSchema = z.object({
  shiftId: positiveIntSchema,
  instructorId: positiveIntSchema,
});

/**
 * 一括シフト割り当てバリデーションスキーマ
 */
export const bulkShiftAssignmentSchema = z.object({
  shiftId: positiveIntSchema,
  instructorIds: z
    .array(positiveIntSchema)
    .min(1, '最低1人のインストラクターを選択してください')
    .max(10, 'インストラクターは最大10人まで選択できます'),
});

/**
 * シフト割り当て解除バリデーションスキーマ
 */
export const unassignShiftSchema = z.object({
  shiftId: positiveIntSchema,
  instructorId: positiveIntSchema,
});

/**
 * URL パラメータバリデーションスキーマ
 */
export const shiftIdParamSchema = z.object({
  id: z.coerce.number().int().positive(),
});

export const instructorIdParamSchema = z.object({
  instructorId: z.coerce.number().int().positive(),
});
