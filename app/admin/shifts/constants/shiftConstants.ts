// 曜日の配列
export const WEEKDAYS = ['日', '月', '火', '水', '木', '金', '土'] as const

// 祝日の定義
export const HOLIDAYS: Record<string, boolean> = {
  '2024-01-01': true, // 元日
  '2024-01-08': true, // 成人の日
  '2024-02-11': true, // 建国記念の日
  '2024-02-12': true, // 振替休日
  '2024-02-23': true, // 天皇誕生日
  '2023-12-29': true, // 年末休業
  '2023-12-31': true, // 大晦日
} as const

// サンプルインストラクター名（モーダルでの表示用）
export const SAMPLE_INSTRUCTOR_NAMES = [
  '田中太郎',
  '佐藤花子',
  '鈴木次郎',
  '高橋美咲',
  '木村健太',
  '中村優子',
  '山田一郎',
  '伊藤智子',
  '小林直美',
  '渡辺大介',
] as const

// 部門スタイルマッピング
export const DEPARTMENT_STYLES = {
  ski: {
    chipClass: 'bg-blue-50 text-blue-700 hover:bg-blue-100 dark:bg-blue-950 dark:text-blue-300 dark:hover:bg-blue-900',
    sectionBgClass: 'bg-ski-50/50 dark:bg-ski-950/20',
    sectionBorderClass: 'border-ski-200 dark:border-ski-800',
    sectionTextClass: 'text-ski-900 dark:text-ski-100',
    iconColor: 'text-ski-600',
    label: 'Ski',
  },
  snowboard: {
    chipClass: 'bg-amber-50 text-amber-700 hover:bg-amber-100 dark:bg-amber-950 dark:text-amber-300 dark:hover:bg-amber-900',
    sectionBgClass: 'bg-snowboard-50/50 dark:bg-snowboard-950/20',
    sectionBorderClass: 'border-snowboard-200 dark:border-snowboard-800',
    sectionTextClass: 'text-snowboard-900 dark:text-snowboard-100',
    iconColor: 'text-snowboard-600',
    label: 'Snowboard',
  },
  mixed: {
    chipClass: 'bg-muted text-muted-foreground hover:bg-muted/80',
    sectionBgClass: 'bg-card',
    sectionBorderClass: 'border-border',
    sectionTextClass: 'text-foreground',
    iconColor: 'text-muted-foreground',
    label: 'Common',
  },
} as const

// 部門名のマッピング
export const DEPARTMENT_NAMES = {
  ski: 'スキー',
  snowboard: 'スノーボード',
  mixed: '共通',
} as const