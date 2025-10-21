/**
 * 法務ドキュメント（利用規約、プライバシーポリシーなど）の型定義
 */
export type LegalDocument = {
  /** ドキュメントのタイトル */
  readonly title: string;
  /** メタデータ（制定日、最終更新日など） */
  readonly metadata: Record<string, string>;
  /** Markdownフォーマットのドキュメント本文 */
  readonly content: string;
};
