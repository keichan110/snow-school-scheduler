import { Suspense } from 'react';

import { ProtectedRoute } from '@/components/auth/ProtectedRoute';

import InstructorsPageClient from './InstructorsPageClient';
import Loading from './loading';

export default function InstructorsPage() {
  return (
    <ProtectedRoute requiredRole="MANAGER">
      <Suspense fallback={<Loading />}>
        <InstructorsPageClient />
      </Suspense>
    </ProtectedRoute>
  );
}
