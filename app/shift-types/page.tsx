import { Suspense } from 'react';

import { ProtectedRoute } from '@/components/auth/ProtectedRoute';

import ShiftTypesPageClient from './ShiftTypesPageClient';
import Loading from './loading';

export const dynamic = 'force-dynamic';
export default function ShiftTypesPage() {
  return (
    <ProtectedRoute requiredRole="MANAGER">
      <Suspense fallback={<Loading />}>
        <ShiftTypesPageClient />
      </Suspense>
    </ProtectedRoute>
  );
}
