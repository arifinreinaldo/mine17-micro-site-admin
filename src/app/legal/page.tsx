'use client';

import Link from 'next/link';
import { useSearchParams } from 'next/navigation';

export default function LegalPage() {
  const appName = process.env.NEXT_PUBLIC_APP_NAME || 'Mine17 Pets';

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-white to-orange-50">
      <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-md shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16 sm:h-20">
            <Link href="/" className="font-bold text-xl text-amber-600">{appName}</Link>
            <Link href="/" className="px-6 py-2.5 text-sm font-semibold text-amber-600">Back to Home</Link>
          </div>
        </div>
      </nav>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
        <h1 className="text-5xl font-bold text-gray-900 mb-8">Our Policies</h1>
        
        <div className="grid gap-6">
          <Link href="https://docs.mine17.com/privacy" target="_blank" className="p-6 bg-white rounded-lg hover:shadow-lg transition-shadow">
            <h2 className="text-2xl font-bold text-amber-600 mb-2">Privacy Policy</h2>
            <p className="text-gray-600">Learn how {appName} collects and protects your data</p>
          </Link>

          <Link href="https://docs.mine17.com/terms" target="_blank" className="p-6 bg-white rounded-lg hover:shadow-lg transition-shadow">
            <h2 className="text-2xl font-bold text-amber-600 mb-2">Terms of Service</h2>
            <p className="text-gray-600">Understand {appName} service terms and conditions</p>
          </Link>

          <Link href="https://docs.mine17.com/cookies" target="_blank" className="p-6 bg-white rounded-lg hover:shadow-lg transition-shadow">
            <h2 className="text-2xl font-bold text-amber-600 mb-2">Cookie Policy</h2>
            <p className="text-gray-600">Learn about {appName} cookie usage and tracking</p>
          </Link>
        </div>

        <p className="text-gray-600 mt-8">For full policy details, please visit our documentation site or contact legal@{appName.toLowerCase().replace(/\s+/g, '')}.com</p>
      </div>

      <footer className="bg-gray-900 text-gray-300 mt-16">
        <p className="text-center text-sm py-12">&copy; 2025 {appName}. All rights reserved.</p>
      </footer>
    </div>
  );
}
