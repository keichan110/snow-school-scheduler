import { Suspense } from 'react';

import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import CertificationsPageClient from './CertificationsPageClient';
import Loading from './loading';

export const dynamic = 'force-dynamic';
export default function CertificationsPage() {
  return (
    <ProtectedRoute requiredRole="MANAGER">
      <Suspense fallback={<Loading />}>
        <CertificationsPageClient />
      </Suspense>
    </ProtectedRoute>
  );
}
