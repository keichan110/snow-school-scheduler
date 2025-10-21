import { LegalDocumentPage } from "../_lib/legal/legal-document-page";
import { termsDocument } from "../_lib/legal/terms";

export default function TermsPage() {
  return <LegalDocumentPage document={termsDocument} />;
}
