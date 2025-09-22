import { Suspense } from 'react';

import { ProtectedRoute } from '@/components/auth/ProtectedRoute';

import InvitationsPageClient from './InvitationsPageClient';
import Loading from './loading';

export default function InvitationsPage() {
  return (
    <ProtectedRoute requiredRole="ADMIN">
      <Suspense fallback={<Loading />}>
        <InvitationsPageClient />
      </Suspense>
    </ProtectedRoute>
  );
}
