interface MarkdownContentProps {
  content: string;
  metadata?: Record<string, string>;
}

export function MarkdownContent({ content, metadata }: MarkdownContentProps) {
  // Markdownを簡易的にHTMLに変換
  const formatContent = (text: string) => {
    return text
      .split('\n')
      .map((line, index) => {
        // h1要素はスキップ（タイトルとして別途処理される）
        if (line.startsWith('# ')) {
          return null;
        }

        // 見出し
        if (line.startsWith('## ')) {
          return (
            <h2 key={index} className="mb-3 text-xl font-semibold">
              {line.replace('## ', '')}
            </h2>
          );
        }

        // リスト項目
        if (line.match(/^\d+\.\s/)) {
          return (
            <li key={index} className="ml-4">
              {line.replace(/^\d+\.\s/, '')}
            </li>
          );
        }

        // サブリスト項目
        if (line.match(/^\s+-\s/)) {
          return (
            <li key={index} className="ml-8 list-disc">
              {line.replace(/^\s+-\s/, '')}
            </li>
          );
        }

        // 空行
        if (line.trim() === '') {
          return <br key={index} />;
        }

        // 通常のテキスト
        return (
          <p key={index} className="mb-2">
            {line}
          </p>
        );
      })
      .filter(Boolean);
  };

  return (
    <div className="space-y-6">
      <div className="prose prose-slate dark:prose-invert max-w-none">{formatContent(content)}</div>

      {metadata && Object.keys(metadata).length > 0 && (
        <footer className="mt-8 border-t border-border pt-8">
          <div className="text-center text-sm text-muted-foreground">
            {Object.entries(metadata).map(([key, value], index) => (
              <div key={key}>
                <strong>{key}</strong>: {value}
                {index < Object.entries(metadata).length - 1 && <br />}
              </div>
            ))}
          </div>
        </footer>
      )}
    </div>
  );
}
