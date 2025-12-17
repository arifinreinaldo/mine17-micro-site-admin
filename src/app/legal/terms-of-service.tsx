'use client';

import Link from 'next/link';

export default function TermsOfServicePage() {
  const appName = process.env.NEXT_PUBLIC_APP_NAME || 'Mine17 Pets';

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-white to-orange-50">
      {/* Navigation */}
      <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-md shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16 sm:h-20">
            <Link href="/" className="font-bold text-xl text-amber-600">
              {appName}
            </Link>
            <Link
              href="/"
              className="inline-flex items-center px-6 py-2.5 text-sm font-semibold text-amber-600 hover:text-amber-700"
            >
              Back to Home
            </Link>
          </div>
        </div>
      </nav>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
        {/* Header */}
        <div className="mb-12">
          <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-4">Terms of Service</h1>
          <p className="text-lg text-gray-600">Last updated: December 2025</p>
        </div>

        {/* Table of Contents */}
        <div className="bg-amber-50 rounded-lg p-6 mb-12">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Table of Contents</h2>
          <ul className="space-y-2">
            <li><a href="#introduction" className="text-amber-600 hover:text-amber-700">1. Introduction</a></li>
            <li><a href="#acceptance" className="text-amber-600 hover:text-amber-700">2. Acceptance of Terms</a></li>
            <li><a href="#user-accounts" className="text-amber-600 hover:text-amber-700">3. User Accounts</a></li>
            <li><a href="#user-conduct" className="text-amber-600 hover:text-amber-700">4. User Conduct</a></li>
            <li><a href="#pet-limit" className="text-amber-600 hover:text-amber-700">5. Pet Profile Limit</a></li>
            <li><a href="#intellectual-property" className="text-amber-600 hover:text-amber-700">6. Intellectual Property</a></li>
            <li><a href="#disclaimers" className="text-amber-600 hover:text-amber-700">7. Disclaimers</a></li>
            <li><a href="#limitation" className="text-amber-600 hover:text-amber-700">8. Limitation of Liability</a></li>
            <li><a href="#changes" className="text-amber-600 hover:text-amber-700">9. Changes to Service</a></li>
            <li><a href="#termination" className="text-amber-600 hover:text-amber-700">10. Termination</a></li>
            <li><a href="#contact" className="text-amber-600 hover:text-amber-700">11. Contact Us</a></li>
          </ul>
        </div>

        {/* Content Sections */}
        <div className="space-y-8">
          <section id="introduction">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">1. Introduction</h2>
            <p className="text-gray-700">
              These Terms of Service (&quot;Terms&quot;) govern your use of the Mine17 Pets platform, website, and services (collectively, the &quot;Service&quot;). By accessing or using our Service, you agree to be bound by these Terms. If you do not agree with any part of these Terms, you may not use our Service.
            </p>
          </section>

          <section id="acceptance">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">2. Acceptance of Terms</h2>
            <p className="text-gray-700 mb-4">
              By using Mine17 Pets, you represent and warrant that:
            </p>
            <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4">
              <li>You are at least 18 years of age or have parental consent</li>
              <li>You have the authority to enter into these Terms</li>
              <li>You will comply with all applicable laws and regulations</li>
              <li>You will not use the Service for any unlawful purposes</li>
            </ul>
          </section>

          <section id="user-accounts">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">3. User Accounts</h2>
            <div className="space-y-4">
              <div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Account Registration</h3>
                <p className="text-gray-700">
                  You are responsible for providing accurate, complete, and current information during registration. You must keep your login credentials secure and notify us immediately of any unauthorized access.
                </p>
              </div>

              <div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Account Security</h3>
                <p className="text-gray-700">
                  You agree to maintain the confidentiality of your account credentials. You are responsible for all activities conducted through your account. We use device fingerprinting and OTP authentication for security.
                </p>
              </div>

              <div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Account Deletion</h3>
                <p className="text-gray-700">
                  You may request account deletion at any time. Upon deletion, your pet profiles and associated data will be permanently removed from our servers.
                </p>
              </div>
            </div>
          </section>

          <section id="user-conduct">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">4. User Conduct</h2>
            <p className="text-gray-700 mb-4">You agree NOT to:</p>
            <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4">
              <li>Violate any laws, regulations, or third-party rights</li>
              <li>Harass, threaten, or defame any person or entity</li>
              <li>Share explicit, offensive, or illegal content</li>
              <li>Attempt to gain unauthorized access to the Service</li>
              <li>Disrupt the normal operation of the platform</li>
              <li>Collect or track personal information without consent</li>
              <li>Engage in automated scraping or data harvesting</li>
              <li>Use the Service for commercial purposes without permission</li>
              <li>Reverse engineer or modify the Service code</li>
            </ul>
          </section>

          <section id="pet-limit">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">5. Pet Profile Limit</h2>
            <p className="text-gray-700 mb-4">
              <strong>Core Feature Limitation:</strong> Each user account is limited to managing one (1) pet profile. This is a fundamental feature of the Mine17 Pets platform designed to ensure focused and comprehensive pet care management.
            </p>
            <div className="bg-gray-50 p-4 rounded-lg">
              <ul className="list-disc list-inside text-gray-700 space-y-2 ml-2">
                <li>Free tier: 1 pet profile maximum</li>
                <li>Premium tier: Multiple pet profiles may be available</li>
                <li>Creating a new pet profile when at limit will be restricted in the UI</li>
                <li>Exceeding this limit may result in account suspension</li>
              </ul>
            </div>
          </section>

          <section id="intellectual-property">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">6. Intellectual Property Rights</h2>
            <div className="space-y-4">
              <div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Our Content</h3>
                <p className="text-gray-700">
                  Mine17 Pets owns all intellectual property rights to the Service, including software, designs, logos, and content. You may not reproduce, distribute, or modify our content without permission.
                </p>
              </div>

              <div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Your Content</h3>
                <p className="text-gray-700">
                  You retain ownership of pet information and photos you upload. By uploading content, you grant us a license to store, display, and use your content to provide the Service, including QR code generation and sharing features.
                </p>
              </div>

              <div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">QR Code Sharing</h3>
                <p className="text-gray-700">
                  QR codes generated for pet sharing are controlled by you. You may share or remove sharing access at any time through your account settings.
                </p>
              </div>
            </div>
          </section>

          <section id="disclaimers">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">7. Disclaimers</h2>
            <div className="space-y-4">
              <p className="text-gray-700">
                <strong>THE SERVICE IS PROVIDED ON AN &quot;AS-IS&quot; BASIS.</strong> We disclaim all warranties, express or implied, including merchantability, fitness for a particular purpose, and non-infringement.
              </p>
              <p className="text-gray-700">
                We do not guarantee:
              </p>
              <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4">
                <li>Uninterrupted or error-free service</li>
                <li>Accuracy or completeness of pet information</li>
                <li>Security against all potential threats</li>
                <li>Data availability in case of system failure</li>
              </ul>
            </div>
          </section>

          <section id="limitation">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">8. Limitation of Liability</h2>
            <p className="text-gray-700 mb-4">
              TO THE MAXIMUM EXTENT PERMITTED BY LAW, MINE17 PETS SHALL NOT BE LIABLE FOR:
            </p>
            <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4">
              <li>Loss of data, profits, or business opportunities</li>
              <li>Indirect, incidental, or consequential damages</li>
              <li>Third-party actions or claims</li>
              <li>Service interruptions or unavailability</li>
            </ul>
            <p className="text-gray-700 mt-4">
              Our total liability shall not exceed the amount you paid for the Service in the past 12 months.
            </p>
          </section>

          <section id="changes">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">9. Changes to Service</h2>
            <p className="text-gray-700">
              We reserve the right to modify, suspend, or discontinue the Service at any time with or without notice. We will not be liable for any changes, suspension, or discontinuation of the Service.
            </p>
          </section>

          <section id="termination">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">10. Termination</h2>
            <p className="text-gray-700 mb-4">
              We may terminate or suspend your account immediately without notice if:
            </p>
            <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4">
              <li>You violate these Terms</li>
              <li>You engage in illegal or harmful activity</li>
              <li>You violate any applicable laws</li>
              <li>We determine continuing the account poses a risk</li>
            </ul>
            <p className="text-gray-700 mt-4">
              Upon termination, your right to use the Service immediately ceases.
            </p>
          </section>

          <section id="contact">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">11. Contact Us</h2>
            <p className="text-gray-700 mb-4">
              If you have questions about these Terms, please contact us:
            </p>
            <div className="bg-amber-50 p-6 rounded-lg">
              <p className="text-gray-700 mb-2"><strong>Mine17 Pets Legal Team</strong></p>
              <p className="text-gray-700">Email: legal@mine17.com</p>
            </div>
          </section>

          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 mt-12">
            <p className="text-gray-700 text-sm">
              <strong>Note:</strong> These Terms may be updated periodically. Significant changes will be communicated to you. Your continued use of the Service constitutes acceptance of the updated Terms.
            </p>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-300 mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center text-sm">
            <p>&copy; 2025 {appName}. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
