import fs from 'fs';
import path from 'path';

/**
 * 法的文書のMarkdownファイルを読み込む
 */
export async function readLegalContent(filename: string): Promise<string> {
  try {
    const filePath = path.join(process.cwd(), 'docs', 'legal', filename);
    const content = await fs.promises.readFile(filePath, 'utf8');
    return content;
  } catch (error) {
    console.error(`Failed to read legal content: ${filename}`, error);
    throw new Error(`Legal content not found: ${filename}`);
  }
}

/**
 * プライバシーポリシーを取得
 */
export async function getPrivacyPolicy(): Promise<string> {
  return readLegalContent('privacy-policy.md');
}

/**
 * 利用規約を取得
 */
export async function getTermsOfService(): Promise<string> {
  return readLegalContent('terms-of-service.md');
}

/**
 * Markdownからタイトルとメタデータを抽出
 */
export function extractMetadata(content: string) {
  const lines = content.split('\n');
  const metadata: Record<string, string> = {};
  let title = '';
  let contentStartIndex = 0;

  // h1要素（タイトル）を検索
  const titleMatch = lines.find((line) => line.startsWith('# '));
  if (titleMatch) {
    title = titleMatch.replace('# ', '');
    contentStartIndex = lines.findIndex((line) => line.startsWith('# ')) + 1;
  }

  // 最後のセパレーター以降の行からメタデータを取得
  const separatorIndex = lines.lastIndexOf('---');
  let contentEndIndex = lines.length;

  if (separatorIndex !== -1) {
    const metadataLines = lines.slice(separatorIndex + 1);

    metadataLines.forEach((line) => {
      const match = line.match(/\*\*(.*?)\*\*:\s*(.*)/);
      if (match && match[1] && match[2]) {
        const key = match[1];
        const value = match[2];
        metadata[key] = value;
      }
    });

    contentEndIndex = separatorIndex;
  }

  // タイトルとメタデータを除いたコンテンツ
  const contentWithoutTitleAndMetadata = lines.slice(contentStartIndex, contentEndIndex).join('\n');

  return {
    title,
    content: contentWithoutTitleAndMetadata.trim(),
    metadata,
  };
}
