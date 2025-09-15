'use client';

import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

const Page = () => {
  const { user, status } = useAuth();
  const router = useRouter();

  // 認証済みユーザーは/shiftsにリダイレクト
  useEffect(() => {
    if (status === 'authenticated' && user) {
      router.push('/shifts');
    }
  }, [status, user, router]);

  // ローディング中または認証済みの場合は何も表示しない
  if (status === 'loading' || (status === 'authenticated' && user)) {
    return null;
  }

  return <div></div>;
};

export default Page;
