// Department name から部門タイプを判定
export function getDepartmentType(departmentName: string): 'ski' | 'snowboard' {
  const name = departmentName.toLowerCase();
  if (name.includes('スキー') || name.includes('ski')) {
    return 'ski';
  }
  if (name.includes('スノーボード') || name.includes('snowboard')) {
    return 'snowboard';
  }
  // デフォルトはスキー
  return 'ski';
}
