import { Suspense } from 'react';

import { SkeletonTable } from '@/components/skeletons';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';

import InstructorsPageClient from './InstructorsPageClient';

function InstructorsPageFallback() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6 md:py-8 lg:px-8">
      <SkeletonTable rows={6} columns={5} />
    </div>
  );
}

export default function InstructorsPage() {
  return (
    <ProtectedRoute requiredRole="MANAGER">
      <Suspense fallback={<InstructorsPageFallback />}>
        <InstructorsPageClient />
      </Suspense>
    </ProtectedRoute>
  );
}
