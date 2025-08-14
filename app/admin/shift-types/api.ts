import type { ShiftType, ShiftTypeFormData } from './types';

const API_BASE = '/api/shift-types';

export async function fetchShiftTypes(): Promise<ShiftType[]> {
  const response = await fetch(API_BASE);

  if (!response.ok) {
    throw new Error('シフト種類の取得に失敗しました');
  }

  const result = await response.json();

  if (result.success === false) {
    throw new Error(result.error || 'シフト種類の取得に失敗しました');
  }

  return result.data || result;
}

export async function createShiftType(data: ShiftTypeFormData): Promise<ShiftType> {
  const response = await fetch(API_BASE, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    throw new Error('シフト種類の作成に失敗しました');
  }

  const result = await response.json();

  if (result.success === false) {
    throw new Error(result.error || 'シフト種類の作成に失敗しました');
  }

  return result.data || result;
}

export async function updateShiftType(id: number, data: ShiftTypeFormData): Promise<ShiftType> {
  const response = await fetch(`${API_BASE}/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    throw new Error('シフト種類の更新に失敗しました');
  }

  const result = await response.json();

  if (result.success === false) {
    throw new Error(result.error || 'シフト種類の更新に失敗しました');
  }

  return result.data || result;
}
