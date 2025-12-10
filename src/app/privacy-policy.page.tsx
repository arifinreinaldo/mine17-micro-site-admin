'use client';

import Link from 'next/link';

export default function PrivacyPolicy() {
  const appName = process.env.NEXT_PUBLIC_APP_NAME || 'Mine17 Pets';

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50">
      <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-md shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16 sm:h-20">
            <Link href="/" className="font-bold text-xl text-indigo-600">{appName}</Link>
            <Link href="/" className="inline-flex items-center px-6 py-2.5 text-sm font-semibold text-indigo-600 hover:text-indigo-700">
              Back to Home
            </Link>
          </div>
        </div>
      </nav>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
        <h1 className="text-5xl font-bold text-gray-900 mb-4">Privacy Policy</h1>
        <p className="text-lg text-gray-600 mb-12">Last updated: December 2025</p>

        <div className="prose prose-invert max-w-none">
          <h2 className="text-2xl font-bold text-gray-900 mt-6">Your Privacy Matters</h2>
          <p className="text-gray-700">We are committed to protecting your privacy and ensuring transparency about how we collect, use, and protect your data.</p>

          <h2 className="text-2xl font-bold text-gray-900 mt-6">Information We Collect</h2>
          <p className="text-gray-700">Personal information, device data, and pet information you provide to us.</p>

          <h2 className="text-2xl font-bold text-gray-900 mt-6">Your Rights</h2>
          <p className="text-gray-700">You have the right to access, correct, delete, and export your personal data. Contact us at privacy@mine17.com.</p>

          <h2 className="text-2xl font-bold text-gray-900 mt-6">Security</h2>
          <p className="text-gray-700">We use encryption, secure storage, and device fingerprinting to protect your information.</p>

          <h2 className="text-2xl font-bold text-gray-900 mt-6">Contact Us</h2>
          <p className="text-gray-700">Privacy Team: privacy@mine17.com</p>
        </div>

        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 mt-12">
          <p className="text-gray-700 text-sm"><strong>Note:</strong> This policy may be updated. Your continued use constitutes acceptance.</p>
        </div>
      </div>

      <footer className="bg-gray-900 text-gray-300 mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <p className="text-center text-sm">&copy; 2025 {appName}. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
