'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';

export function useAdminGuard() {
  const { user, loading } = useAuth();
  const router = useRouter();
  
  useEffect(() => {
    if (!loading) {
      if (!user) {
        // Not logged in, redirect to login
        router.push('/login');
      } else if (user.prefs?.role !== 'admin') {
        // Logged in but not admin, redirect to dashboard
        router.push('/dashboard/pets');
      }
    }
  }, [user, loading, router]);
  
  const isAdmin = user?.prefs?.role === 'admin';
  const isLoading = loading || (!isAdmin && !!user);
  
  return { isAdmin, isLoading, user };
}
