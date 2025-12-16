'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';

export function useAdminGuard() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    console.log('[useAdminGuard] Loading:', loading, 'User:', user, 'Labels:', user?.labels);

    if (!loading) {
      if (!user) {
        // Not logged in, redirect to login
        console.log('[useAdminGuard] No user, redirecting to /login');
        router.push('/login');
      } else if (!user.labels?.includes('admin')) {
        // Logged in but not admin, redirect to dashboard
        console.log('[useAdminGuard] Not admin, redirecting to /dashboard/pets');
        router.push('/dashboard/pets');
      } else {
        console.log('[useAdminGuard] ✅ Admin verified');
      }
    }
  }, [user, loading, router]);

  const isAdmin = user?.labels?.includes('admin');
  const isLoading = loading || (!isAdmin && !!user);

  return { isAdmin, isLoading, user };
}
