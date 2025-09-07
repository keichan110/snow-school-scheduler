// シフト作成API クライアント関数

import { ExistingShiftData, NewShiftData } from './DuplicateShiftDialog';

// 統合API用の型定義
export interface PrepareShiftResponse {
  success: boolean;
  data?: {
    mode: 'create' | 'edit';
    shift: ExistingShiftData | null;
    formData: {
      date: string;
      departmentId: number;
      shiftTypeId: number;
      description: string;
      selectedInstructorIds: number[];
    };
  };
  error?: string;
}

// API レスポンスの型定義
export interface ShiftApiResponse {
  success: boolean;
  data?: unknown;
  message?: string;
  error?: string;
}

// 重複エラーレスポンスの型定義
export interface DuplicateShiftError extends ShiftApiResponse {
  success: false;
  error: 'DUPLICATE_SHIFT';
  data: {
    existing: ExistingShiftData;
    canForce: boolean;
    options: string[];
  };
  message: string;
}

// シフト作成パラメータ
export interface CreateShiftParams {
  date: string;
  departmentId: number;
  shiftTypeId: number;
  description?: string | undefined;
  assignedInstructorIds: number[];
  force?: boolean;
}

// シフト作成API関数
export async function createShift(params: CreateShiftParams): Promise<ShiftApiResponse> {
  try {
    const response = await fetch('/api/shifts', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(params),
    });

    const result = await response.json();

    // HTTPステータスが成功でない場合の処理
    if (!response.ok) {
      if (response.status === 409 && result.error === 'DUPLICATE_SHIFT') {
        // 重複エラーの場合、そのまま返す
        return result as DuplicateShiftError;
      }

      // その他のエラーの場合
      return {
        success: false,
        error: result.error || `HTTP Error: ${response.status}`,
        message: result.message,
      };
    }

    return result;
  } catch (error) {
    console.error('Shift creation API error:', error);
    return {
      success: false,
      error: 'ネットワークエラーが発生しました',
    };
  }
}

// 重複エラーかどうかを判定するヘルパー関数
export function isDuplicateShiftError(response: ShiftApiResponse): response is DuplicateShiftError {
  return !response.success && response.error === 'DUPLICATE_SHIFT';
}

// シフト作成処理のメインロジック
export async function handleShiftCreation(
  shiftData: NewShiftData,
  onDuplicateFound: (
    existingShift: ExistingShiftData,
    newShiftData: NewShiftData
  ) => Promise<'merge' | 'replace' | 'cancel'>,
  onSuccess: (message: string) => void,
  onError: (error: string) => void
): Promise<void> {
  try {
    // 最初の作成試行（force=false）
    const response = await createShift({
      date: shiftData.date,
      departmentId: shiftData.departmentId,
      shiftTypeId: shiftData.shiftTypeId,
      description: shiftData.description,
      assignedInstructorIds: shiftData.assignedInstructorIds,
      force: false,
    });

    if (response.success) {
      // 成功
      onSuccess(response.message || 'シフトが正常に作成されました');
      return;
    }

    if (isDuplicateShiftError(response)) {
      // 重複検出 - ユーザーに選択を求める
      const userAction = await onDuplicateFound(response.data.existing, shiftData);

      if (userAction === 'cancel') {
        // キャンセルの場合は何もしない
        return;
      }

      if (userAction === 'replace') {
        // 置換の場合は force=true で再実行
        const forceResponse = await createShift({
          date: shiftData.date,
          departmentId: shiftData.departmentId,
          shiftTypeId: shiftData.shiftTypeId,
          description: shiftData.description,
          assignedInstructorIds: shiftData.assignedInstructorIds,
          force: true,
        });

        if (forceResponse.success) {
          onSuccess(forceResponse.message || 'シフトが正常に更新されました');
        } else {
          onError(forceResponse.error || 'シフトの更新に失敗しました');
        }
        return;
      }

      if (userAction === 'merge') {
        // マージの場合は既存のインストラクターと新しいインストラクターを結合
        const existingInstructorIds = response.data.existing.assignments.map(
          (assignment: { instructor: { id: number } }) => assignment.instructor.id
        );

        // 重複を除いて結合
        const mergedInstructorIds = [
          ...existingInstructorIds,
          ...shiftData.assignedInstructorIds.filter(
            (id: number) => !existingInstructorIds.includes(id)
          ),
        ];

        const mergeResponse = await createShift({
          date: shiftData.date,
          departmentId: shiftData.departmentId,
          shiftTypeId: shiftData.shiftTypeId,
          description: shiftData.description || response.data.existing.description || undefined,
          assignedInstructorIds: mergedInstructorIds,
          force: true,
        });

        if (mergeResponse.success) {
          onSuccess(mergeResponse.message || 'シフトが正常にマージされました');
        } else {
          onError(mergeResponse.error || 'シフトのマージに失敗しました');
        }
        return;
      }
    }

    // その他のエラー
    onError(response.error || 'シフトの作成に失敗しました');
  } catch (error) {
    console.error('Shift creation handler error:', error);
    onError('予期しないエラーが発生しました');
  }
}

// 統合API: シフト準備（重複チェック・編集準備）
export async function prepareShift(params: {
  date: string;
  departmentId: number;
  shiftTypeId: number;
}): Promise<PrepareShiftResponse> {
  try {
    const response = await fetch(
      `/api/shifts/prepare?date=${encodeURIComponent(params.date)}&departmentId=${params.departmentId}&shiftTypeId=${params.shiftTypeId}`
    );

    const result = await response.json();

    // HTTPステータスが成功でない場合の処理
    if (!response.ok) {
      return {
        success: false,
        error: result.error || `HTTP Error: ${response.status}`,
      };
    }

    return result;
  } catch (error) {
    console.error('Prepare shift API error:', error);
    return {
      success: false,
      error: 'ネットワークエラーが発生しました',
    };
  }
}