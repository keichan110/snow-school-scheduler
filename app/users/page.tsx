import { Suspense } from 'react';

import { ProtectedRoute } from '@/components/auth/ProtectedRoute';

import UsersPageClient from './UsersPageClient';
import Loading from './loading';

export const dynamic = 'force-dynamic';
export default function UsersPage() {
  return (
    <ProtectedRoute requiredRole="ADMIN">
      <Suspense fallback={<Loading />}>
        <UsersPageClient />
      </Suspense>
    </ProtectedRoute>
  );
}
