import { MarkdownContent } from "@/components/markdown-content";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PRIVACY_CONTENT, PRIVACY_METADATA, PRIVACY_TITLE } from "./content";

export default function PrivacyPage() {
  return (
    <div className="container mx-auto max-w-4xl px-4 py-8">
      <Card>
        <CardHeader>
          <CardTitle className="text-center font-bold text-3xl">
            {PRIVACY_TITLE}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <MarkdownContent
            content={PRIVACY_CONTENT}
            metadata={PRIVACY_METADATA}
          />
        </CardContent>
      </Card>
    </div>
  );
}
