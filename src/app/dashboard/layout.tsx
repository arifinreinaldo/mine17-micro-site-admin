'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, loading, logout } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
  }, [user, loading, router]);

  const handleLogout = async () => {
    try {
      await logout();
      router.push('/login');
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50">
      {/* Navigation Bar */}
      <nav className="sticky top-0 z-50 px-4 pt-4">
        <div className="max-w-7xl mx-auto bg-white/70 backdrop-blur-lg rounded-2xl shadow-md border border-white/20">
          <div className="px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between h-16">
            {/* Logo and Desktop Navigation */}
            <div className="flex items-center">
              {/* Logo */}
              <div className="flex-shrink-0 flex items-center">
                <div className="w-10 h-10 bg-gradient-to-br from-indigo-600 to-indigo-700 rounded-xl flex items-center justify-center shadow-md">
                  <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M4.5 12c0-.866.7-1.575 1.575-1.575a1.575 1.575 0 110 3.15A1.575 1.575 0 014.5 12zm13.425 0c0-.866.709-1.575 1.575-1.575a1.575 1.575 0 110 3.15 1.575 1.575 0 01-1.575-1.575zM12 5.25c-1.125 0-2.044.909-2.044 2.034 0 1.125.92 2.034 2.044 2.034 1.125 0 2.044-.909 2.044-2.034 0-1.125-.92-2.034-2.044-2.034zM8.294 13.5c-.9 0-1.669.506-2.063 1.237-.215.403-.356.856-.356 1.35 0 2.062 2.475 3.413 6.125 3.413s6.125-1.35 6.125-3.412c0-.495-.14-.948-.356-1.351-.394-.731-1.163-1.237-2.063-1.237H8.294z"/>
                  </svg>
                </div>
                <h1 className="ml-3 text-xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                  Pet Manager
                </h1>
              </div>

              {/* Desktop Navigation Links */}
              <div className="hidden md:ml-10 md:flex md:items-center md:gap-2">
                <Link
                  href="/dashboard/pets"
                  className={`${
                    pathname?.startsWith('/dashboard/pets')
                      ? 'bg-white text-indigo-600 shadow-sm'
                      : 'text-gray-700 hover:bg-white/50 hover:text-gray-900'
                  } inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold transition-all duration-200 rounded-full`}
                >
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M4.5 12c0-.866.7-1.575 1.575-1.575a1.575 1.575 0 110 3.15A1.575 1.575 0 014.5 12zm13.425 0c0-.866.709-1.575 1.575-1.575a1.575 1.575 0 110 3.15 1.575 1.575 0 01-1.575-1.575zM12 5.25c-1.125 0-2.044.909-2.044 2.034 0 1.125.92 2.034 2.044 2.034 1.125 0 2.044-.909 2.044-2.034 0-1.125-.92-2.034-2.044-2.034zM8.294 13.5c-.9 0-1.669.506-2.063 1.237-.215.403-.356.856-.356 1.35 0 2.062 2.475 3.413 6.125 3.413s6.125-1.35 6.125-3.412c0-.495-.14-.948-.356-1.351-.394-.731-1.163-1.237-2.063-1.237H8.294z"/>
                  </svg>
                  Pets
                </Link>
                <Link
                  href="/dashboard/profile"
                  className={`${
                    pathname === '/dashboard/profile'
                      ? 'bg-white text-indigo-600 shadow-sm'
                      : 'text-gray-700 hover:bg-white/50 hover:text-gray-900'
                  } inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold transition-all duration-200 rounded-full`}
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                  Profile
                </Link>
              </div>
            </div>

            {/* Right Side - User Info and Logout (Desktop) */}
            <div className="hidden md:flex items-center gap-3">
              {/* User Avatar with Tooltip */}
              <div className="group relative">
                <div className="w-9 h-9 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold text-sm cursor-pointer hover:shadow-md transition-shadow">
                  {user.email?.charAt(0).toUpperCase() || 'U'}
                </div>
                {/* Tooltip */}
                <div className="absolute top-full right-0 mt-2 px-3 py-2 bg-gray-900 text-white text-xs rounded-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 whitespace-nowrap z-10">
                  {user.email}
                  <div className="absolute -top-1 right-4 w-2 h-2 bg-gray-900 transform rotate-45"></div>
                </div>
              </div>

              {/* Logout Button */}
              <button
                onClick={handleLogout}
                className="inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold rounded-full text-gray-700 hover:bg-white/50 hover:text-indigo-600 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all duration-200"
                title="Logout"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
                <span className="hidden lg:inline">Logout</span>
              </button>
            </div>

            {/* Mobile Menu Button */}
            <div className="flex items-center md:hidden">
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="inline-flex items-center justify-center p-2 rounded-lg text-gray-600 hover:text-gray-900 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-indigo-500 transition-colors"
                aria-expanded="false"
              >
                <span className="sr-only">Open main menu</span>
                {mobileMenuOpen ? (
                  <svg className="block h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                ) : (
                  <svg className="block h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                  </svg>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden mt-2 mx-4 mobile-menu-enter">
            <div className="bg-white/70 backdrop-blur-lg rounded-2xl shadow-md border border-white/20 px-4 py-3 space-y-1">
              {/* User Info */}
              <div className="flex items-center gap-3 px-3 py-3 bg-white/50 rounded-xl mb-3">
                <div className="w-10 h-10 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold">
                  {user.email?.charAt(0).toUpperCase() || 'U'}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium text-gray-500">Logged in as</p>
                  <p className="text-sm font-semibold text-gray-900 truncate">
                    {user.email}
                  </p>
                </div>
              </div>

              {/* Navigation Links */}
              <Link
                href="/dashboard/pets"
                onClick={() => setMobileMenuOpen(false)}
                className={`${
                  pathname?.startsWith('/dashboard/pets')
                    ? 'bg-white text-indigo-600 shadow-sm'
                    : 'text-gray-700 hover:bg-white/50'
                } flex items-center gap-3 px-4 py-3 text-base font-semibold rounded-xl transition-all`}
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M4.5 12c0-.866.7-1.575 1.575-1.575a1.575 1.575 0 110 3.15A1.575 1.575 0 014.5 12zm13.425 0c0-.866.709-1.575 1.575-1.575a1.575 1.575 0 110 3.15 1.575 1.575 0 01-1.575-1.575zM12 5.25c-1.125 0-2.044.909-2.044 2.034 0 1.125.92 2.034 2.044 2.034 1.125 0 2.044-.909 2.044-2.034 0-1.125-.92-2.034-2.044-2.034zM8.294 13.5c-.9 0-1.669.506-2.063 1.237-.215.403-.356.856-.356 1.35 0 2.062 2.475 3.413 6.125 3.413s6.125-1.35 6.125-3.412c0-.495-.14-.948-.356-1.351-.394-.731-1.163-1.237-2.063-1.237H8.294z"/>
                </svg>
                Pets
              </Link>
              <Link
                href="/dashboard/profile"
                onClick={() => setMobileMenuOpen(false)}
                className={`${
                  pathname === '/dashboard/profile'
                    ? 'bg-white text-indigo-600 shadow-sm'
                    : 'text-gray-700 hover:bg-white/50'
                } flex items-center gap-3 px-4 py-3 text-base font-semibold rounded-xl transition-all`}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
                Profile
              </Link>

              {/* Divider */}
              <div className="border-t border-gray-200/50 my-2"></div>

              {/* Logout Button */}
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  handleLogout();
                }}
                className="w-full flex items-center justify-center gap-2 px-4 py-3 text-base font-semibold text-gray-700 hover:bg-white/50 hover:text-red-600 rounded-xl transition-all"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
                Logout
              </button>
            </div>
          </div>
        )}
      </nav>

      {/* Close mobile menu when clicking outside */}
      {mobileMenuOpen && (
        <div 
          className="fixed inset-0 z-40 md:hidden" 
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      {/* Main Content */}
      <main>
        {children}
      </main>
    </div>
  );
}
