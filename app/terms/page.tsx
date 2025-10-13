import { MarkdownContent } from "@/components/markdown-content";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TERMS_CONTENT, TERMS_METADATA, TERMS_TITLE } from "./content";

export default function TermsPage() {
  return (
    <div className="container mx-auto max-w-4xl px-4 py-8">
      <Card>
        <CardHeader>
          <CardTitle className="text-center font-bold text-3xl">
            {TERMS_TITLE}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <MarkdownContent content={TERMS_CONTENT} metadata={TERMS_METADATA} />
        </CardContent>
      </Card>
    </div>
  );
}
