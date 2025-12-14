'use client';

import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';

export default function MissingPage() {
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50">
      {/* Navigation Bar */}
      <nav className="sticky top-0 z-50 px-4 pt-4">
        <div className="max-w-7xl mx-auto bg-white/70 backdrop-blur-lg rounded-2xl shadow-md border border-white/20">
          <div className="px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between h-16 items-center">
              {/* Logo */}
              <div className="flex items-center">
                <div className="w-10 h-10 bg-gradient-to-br from-indigo-600 to-indigo-700 rounded-xl flex items-center justify-center shadow-md">
                  <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" />
                    <circle cx="5" cy="5" r="1.5" />
                    <circle cx="15" cy="5" r="1.5" />
                    <circle cx="10" cy="3" r="1.5" />
                  </svg>
                </div>
                <h1 className="ml-3 text-xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                  Admin Panel
                </h1>
              </div>

              {/* Navigation Links */}
              <div className="flex items-center gap-4">
                <Link
                  href="/admin/analytics"
                  className="text-gray-700 hover:bg-white/50 hover:text-gray-900 inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold transition-all duration-200 rounded-full"
                >
                  Analytics
                </Link>
                <Link
                  href="/admin/missing"
                  className="bg-white text-indigo-600 shadow-sm inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold transition-all duration-200 rounded-full"
                >
                  Missing Pet
                </Link>

                {/* User Avatar & Logout */}
                <div className="flex items-center gap-3 pl-4 border-l border-gray-200">
                  <div className="group relative">
                    <div className="w-8 h-8 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold text-sm shadow-md">
                      {user?.name?.charAt(0).toUpperCase() || 'A'}
                    </div>
                    <div className="absolute right-0 top-10 bg-gray-900 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
                      {user?.email}
                    </div>
                  </div>
                  <button
                    onClick={handleLogout}
                    className="text-gray-700 hover:text-red-600 font-medium text-sm transition-colors"
                  >
                    Logout
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white/70 backdrop-blur-lg rounded-2xl shadow-md border border-white/20 p-8">
          <div className="text-center max-w-2xl mx-auto">
            {/* Icon */}
            <div className="mx-auto w-20 h-20 bg-gradient-to-br from-amber-100 to-orange-100 rounded-full flex items-center justify-center mb-6">
              <svg 
                className="w-10 h-10 text-amber-600" 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth={2} 
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" 
                />
              </svg>
            </div>

            {/* Title */}
            <h1 className="text-3xl font-bold text-gray-900 mb-4">
              Missing Pet
            </h1>

            {/* Description */}
            <p className="text-gray-600 mb-8">
              This is a placeholder page for the Missing Pet feature. Content coming soon!
            </p>

            {/* Placeholder Content */}
            <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl p-8 mb-6">
              <div className="space-y-4">
                <div className="h-4 bg-gray-300 rounded w-3/4 mx-auto animate-pulse"></div>
                <div className="h-4 bg-gray-300 rounded w-1/2 mx-auto animate-pulse"></div>
                <div className="h-4 bg-gray-300 rounded w-2/3 mx-auto animate-pulse"></div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-4 justify-center">
              <Link
                href="/admin/analytics"
                className="px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-semibold rounded-xl hover:shadow-lg transition-all duration-200"
              >
                Go to Analytics
              </Link>
              <Link
                href="/dashboard/pets"
                className="px-6 py-3 bg-white text-gray-700 font-semibold rounded-xl border border-gray-300 hover:border-indigo-600 hover:text-indigo-600 transition-all duration-200"
              >
                Back to Dashboard
              </Link>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
