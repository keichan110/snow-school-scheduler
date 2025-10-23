import { LegalDocumentPage } from "../_lib/legal/legal-document-page";
import { privacyDocument } from "../_lib/legal/privacy";

export default function PrivacyPage() {
  return <LegalDocumentPage document={privacyDocument} />;
}
