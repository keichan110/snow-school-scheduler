/**
 * PDF印刷用のインラインCSSスタイル定義
 *
 * @description
 * A4縦向きレイアウトに最適化された印刷用スタイル。
 * モノクロ/グレースケール基調で印刷コストを考慮。
 */
export function getInlineStyles(): string {
  return `
    @page {
      size: A4 portrait;
      margin: 15mm;
    }

    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }

    body {
      font-family: 'Noto Sans JP', 'Yu Gothic', 'Hiragino Kaku Gothic ProN', sans-serif;
      font-size: 9pt;
      color: #000;
      line-height: 1.4;
    }

    header {
      border-bottom: 2px solid #333;
      padding-bottom: 10px;
      margin-bottom: 20px;
    }

    h1 {
      font-size: 16pt;
      font-weight: bold;
      margin-bottom: 8px;
    }

    .meta {
      display: flex;
      gap: 20px;
      font-size: 8pt;
      color: #666;
    }

    .meta p {
      margin: 0;
    }

    /* メインテーブル */
    .shift-table {
      width: 100%;
      border-collapse: collapse;
      font-size: 8pt;
      margin-bottom: 20px;
    }

    /* ヘッダー行 */
    .shift-table thead th {
      background-color: #d0d0d0;
      padding: 8px 6px;
      text-align: center;
      border: 1px solid #999;
      font-weight: bold;
      font-size: 9pt;
    }

    .shift-table thead th.date-col {
      width: 80px;
    }

    .shift-table thead th.dept-col {
      /* 残りの幅を均等に分配 */
    }

    /* データ行 */
    .shift-table tbody tr {
      page-break-inside: avoid;
    }

    /* 偶数日の背景色 */
    .shift-table tbody tr.even-day {
      background-color: #f5f5f5;
    }

    /* 日付セル */
    .date-cell {
      border: 1px solid #999;
      padding: 6px 4px;
      text-align: center;
      vertical-align: top;
      font-weight: bold;
    }

    .date-cell .date-main {
      font-size: 9pt;
      margin-bottom: 2px;
    }

    /* 日曜日・祝日は赤色 */
    .date-cell.sunday .date-main,
    .date-cell.holiday .date-main {
      color: #c00;
    }

    /* 土曜日は青色 */
    .date-cell.saturday .date-main {
      color: #00c;
    }

    .date-cell .holiday-label {
      font-size: 7pt;
      color: #c00;
      font-weight: normal;
    }

    /* 部門セル */
    .dept-cell {
      border: 1px solid #ccc;
      padding: 6px 4px;
      vertical-align: top;
    }

    .dept-cell.empty {
      text-align: center;
      color: #999;
      font-size: 7pt;
    }

    /* シフトグループ */
    .shift-group {
      margin-bottom: 8px;
    }

    .shift-group:last-child {
      margin-bottom: 0;
    }

    .shift-type {
      font-weight: bold;
      font-size: 8pt;
      margin-bottom: 2px;
      color: #333;
    }

    .instructor {
      font-size: 7pt;
      padding-left: 8px;
      line-height: 1.3;
    }

    /* フッター */
    footer {
      margin-top: 20px;
      padding-top: 10px;
      border-top: 1px solid #999;
      text-align: center;
      font-size: 7pt;
      color: #666;
    }

    footer p {
      margin: 0;
    }
  `;
}
