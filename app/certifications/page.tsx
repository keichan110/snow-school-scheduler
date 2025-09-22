import { Suspense } from 'react';

import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { SkeletonTable } from '@/components/skeletons';

import CertificationsPageClient from './CertificationsPageClient';

function CertificationsPageFallback() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6 md:py-8 lg:px-8">
      <div className="mb-6 md:mb-8 space-y-3">
        <div className="h-8 w-48 rounded-md bg-muted/70" />
        <div className="h-4 w-64 rounded-md bg-muted/50" />
      </div>
      <div className="mb-4 md:mb-6">
        <div className="flex items-center justify-center divide-x divide-border rounded-lg border border-border/40 bg-card/60 p-4 shadow-sm">
          <div className="flex items-center gap-2 px-4">
            <div className="h-6 w-6 rounded-full bg-muted/60" />
            <div className="h-5 w-8 rounded-md bg-muted/40" />
          </div>
          <div className="flex items-center gap-2 px-4">
            <div className="h-6 w-6 rounded-full bg-muted/60" />
            <div className="h-5 w-8 rounded-md bg-muted/40" />
          </div>
          <div className="hidden items-center gap-2 px-4 md:flex">
            <div className="h-6 w-6 rounded-full bg-muted/60" />
            <div className="h-5 w-8 rounded-md bg-muted/40" />
          </div>
        </div>
      </div>
      <SkeletonTable rows={6} columns={4} />
    </div>
  );
}

export default function CertificationsPage() {
  return (
    <ProtectedRoute requiredRole="MANAGER">
      <Suspense fallback={<CertificationsPageFallback />}>
        <CertificationsPageClient />
      </Suspense>
    </ProtectedRoute>
  );
}
