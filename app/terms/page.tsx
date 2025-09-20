import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { MarkdownContent } from '@/components/markdown-content';
import { TERMS_CONTENT, TERMS_TITLE, TERMS_METADATA } from './content';

export default function TermsPage() {

  return (
    <div className="container mx-auto max-w-4xl px-4 py-8">
      <Card>
        <CardHeader>
          <CardTitle className="text-center text-3xl font-bold">{TERMS_TITLE}</CardTitle>
        </CardHeader>
        <CardContent>
          <MarkdownContent content={TERMS_CONTENT} metadata={TERMS_METADATA} />
        </CardContent>
      </Card>
    </div>
  );
}
