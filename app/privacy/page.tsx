import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { MarkdownContent } from '@/components/markdown-content';
import { getPrivacyPolicy, extractMetadata } from '@/lib/legal-content';

export default async function PrivacyPage() {
  const rawContent = await getPrivacyPolicy();
  const { title, content, metadata } = extractMetadata(rawContent);

  return (
    <div className="container mx-auto max-w-4xl px-4 py-8">
      <Card>
        <CardHeader>
          <CardTitle className="text-center text-3xl font-bold">{title}</CardTitle>
        </CardHeader>
        <CardContent>
          <MarkdownContent content={content} metadata={metadata} />
        </CardContent>
      </Card>
    </div>
  );
}
