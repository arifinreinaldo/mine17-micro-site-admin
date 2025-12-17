'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAdminGuard } from '@/hooks/useAdminGuard';
import { useAuth } from '@/context/AuthContext';
import AdminTabs from '@/components/AdminTabs';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { isAdmin, isLoading } = useAdminGuard();
  const { user, logout } = useAuth();
  const router = useRouter();

  const handleLogout = async () => {
    try {
      await logout();
      router.push('/login');
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-amber-50 via-white to-orange-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Verifying admin access...</p>
        </div>
      </div>
    );
  }

  if (!isAdmin) {
    return null; // Will be redirected by useAdminGuard
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-white to-orange-50">
      {/* Navigation Bar */}
      <nav className="sticky top-0 z-50 px-4 pt-4">
        <div className="max-w-7xl mx-auto bg-white/70 backdrop-blur-lg rounded-2xl shadow-md border border-white/20">
          <div className="px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between h-16 items-center">
              {/* Left: Logo and Title */}
              <div className="flex items-center">
                <Link href="/dashboard/pets" className="flex items-center group">
                  <div className="w-10 h-10 bg-gradient-to-br from-amber-500 to-orange-600 rounded-xl flex items-center justify-center shadow-md">
                    <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" />
                      <circle cx="5" cy="5" r="1.5" />
                      <circle cx="15" cy="5" r="1.5" />
                      <circle cx="10" cy="3" r="1.5" />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <h1 className="text-xl font-bold bg-gradient-to-r from-amber-600 to-orange-600 bg-clip-text text-transparent">
                      Admin Panel
                    </h1>
                  </div>
                </Link>
              </div>

              {/* Right: Back to Dashboard, User Avatar, Logout */}
              <div className="flex items-center gap-4">
                <Link
                  href="/dashboard/pets"
                  className="inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-white/50 hover:text-amber-600 rounded-full transition-all duration-200"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                  </svg>
                  Dashboard
                </Link>

                <div className="flex items-center gap-3 pl-4 border-l border-gray-200">
                  {/* User Avatar with Tooltip */}
                  <Link href="/dashboard/profile" className="group relative">
                    <div className="w-9 h-9 bg-gradient-to-br from-amber-500 to-orange-600 rounded-full flex items-center justify-center text-white font-semibold text-sm cursor-pointer hover:shadow-md transition-shadow">
                      {user?.email?.charAt(0).toUpperCase() || 'A'}
                    </div>
                    <div className="absolute top-full right-0 mt-2 px-3 py-2 bg-gray-900 text-white text-xs rounded-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-10">
                      <div className="whitespace-nowrap">{user?.email}</div>
                      {user?.name && <div className="whitespace-nowrap">{user.name}</div>}
                      <div className="absolute -top-1 right-4 w-2 h-2 bg-gray-900 transform rotate-45"></div>
                    </div>
                  </Link>

                  {/* Logout Button */}
                  <button
                    onClick={handleLogout}
                    className="inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold rounded-full text-gray-700 hover:bg-white/50 hover:text-red-600 transition-all duration-200"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                    </svg>
                    <span className="hidden sm:inline">Logout</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </nav>

      {/* Admin Tabs */}
      <AdminTabs />

      {/* Page Content */}
      {children}
    </div>
  );
}
