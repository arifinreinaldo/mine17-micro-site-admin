'use client';

import Link from 'next/link';

export default function CookiePolicyPage() {
  const appName = process.env.NEXT_PUBLIC_APP_NAME || 'Mine17 Pets';

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50">
      {/* Navigation */}
      <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-md shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16 sm:h-20">
            <Link href="/" className="font-bold text-xl text-indigo-600">
              {appName}
            </Link>
            <Link
              href="/"
              className="inline-flex items-center px-6 py-2.5 text-sm font-semibold text-indigo-600 hover:text-indigo-700"
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
          <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-4">Cookie Policy</h1>
          <p className="text-lg text-gray-600">Last updated: December 2025</p>
        </div>

        {/* Table of Contents */}
        <div className="bg-indigo-50 rounded-lg p-6 mb-12">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Table of Contents</h2>
          <ul className="space-y-2">
            <li><a href="#what-are-cookies" className="text-indigo-600 hover:text-indigo-700">1. What Are Cookies?</a></li>
            <li><a href="#types-of-cookies" className="text-indigo-600 hover:text-indigo-700">2. Types of Cookies We Use</a></li>
            <li><a href="#cookie-categories" className="text-indigo-600 hover:text-indigo-700">3. Cookie Categories</a></li>
            <li><a href="#third-party-cookies" className="text-indigo-600 hover:text-indigo-700">4. Third-Party Cookies</a></li>
            <li><a href="#device-fingerprinting" className="text-indigo-600 hover:text-indigo-700">5. Device Fingerprinting</a></li>
            <li><a href="#tracking-technologies" className="text-indigo-600 hover:text-indigo-700">6. Other Tracking Technologies</a></li>
            <li><a href="#your-choices" className="text-indigo-600 hover:text-indigo-700">7. Your Cookie Choices</a></li>
            <li><a href="#contact" className="text-indigo-600 hover:text-indigo-700">8. Contact Us</a></li>
          </ul>
        </div>

        {/* Content Sections */}
        <div className="space-y-8">
          <section id="what-are-cookies">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">1. What Are Cookies?</h2>
            <p className="text-gray-700 mb-4">
              Cookies are small text files placed on your device when you visit our website. They contain information that your browser sends back to our servers on subsequent visits. Cookies help us remember your preferences and enhance your experience on Mine17 Pets.
            </p>
            <p className="text-gray-700">
              <strong>Types of cookies:</strong>
            </p>
            <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4 mt-2">
              <li><strong>Session Cookies:</strong> Temporary cookies deleted when you close your browser</li>
              <li><strong>Persistent Cookies:</strong> Remain on your device until expiration or manual deletion</li>
              <li><strong>First-Party Cookies:</strong> Set by mine17.com directly</li>
              <li><strong>Third-Party Cookies:</strong> Set by external services and partners</li>
            </ul>
          </section>

          <section id="types-of-cookies">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">2. Types of Cookies We Use</h2>
            <div className="space-y-6">
              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="text-xl font-semibold text-gray-900 mb-3">Essential Cookies (Required)</h3>
                <p className="text-gray-700 mb-3">
                  These cookies are necessary for the platform to function correctly:
                </p>
                <ul className="list-disc list-inside text-gray-700 space-y-2 ml-2">
                  <li>Authentication and login session management</li>
                  <li>Account security and fraud prevention</li>
                  <li>User preferences and settings storage</li>
                  <li>CSRF protection and security tokens</li>
                  <li>Service stability and performance</li>
                </ul>
                <p className="text-gray-600 text-sm mt-3">
                  <strong>Status:</strong> Always enabled (required for functionality)
                </p>
              </div>

              <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                <h3 className="text-xl font-semibold text-gray-900 mb-3">Analytics Cookies (Optional)</h3>
                <p className="text-gray-700 mb-3">
                  Help us understand how you use our platform:
                </p>
                <ul className="list-disc list-inside text-gray-700 space-y-2 ml-2">
                  <li>Page views and user interactions</li>
                  <li>Time spent on different sections</li>
                  <li>Device and browser information</li>
                  <li>Feature usage patterns</li>
                  <li>Error and performance tracking</li>
                </ul>
                <p className="text-gray-600 text-sm mt-3">
                  <strong>Status:</strong> Requires explicit consent
                </p>
              </div>

              <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                <h3 className="text-xl font-semibold text-gray-900 mb-3">Preference Cookies (Optional)</h3>
                <p className="text-gray-700 mb-3">
                  Remember your choices and preferences:
                </p>
                <ul className="list-disc list-inside text-gray-700 space-y-2 ml-2">
                  <li>Language and theme preferences</li>
                  <li>Dashboard layout and settings</li>
                  <li>Notification preferences</li>
                  <li>Accessibility options</li>
                  <li>Saved form data (non-sensitive)</li>
                </ul>
                <p className="text-gray-600 text-sm mt-3">
                  <strong>Status:</strong> Requires explicit consent
                </p>
              </div>

              <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
                <h3 className="text-xl font-semibold text-gray-900 mb-3">Marketing Cookies (Optional)</h3>
                <p className="text-gray-700 mb-3">
                  Used to deliver personalized content and advertisements:
                </p>
                <ul className="list-disc list-inside text-gray-700 space-y-2 ml-2">
                  <li>Personalized feature recommendations</li>
                  <li>Targeted promotional content</li>
                  <li>Social media integration</li>
                  <li>Conversion tracking</li>
                  <li>Retargeting campaigns</li>
                </ul>
                <p className="text-gray-600 text-sm mt-3">
                  <strong>Status:</strong> Requires explicit consent
                </p>
              </div>
            </div>
          </section>

          <section id="cookie-categories">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">3. Cookie Categories and Duration</h2>
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-gray-700 border-collapse">
                <thead>
                  <tr className="bg-indigo-100">
                    <th className="border border-gray-300 p-3 text-left">Cookie Name</th>
                    <th className="border border-gray-300 p-3 text-left">Purpose</th>
                    <th className="border border-gray-300 p-3 text-left">Duration</th>
                    <th className="border border-gray-300 p-3 text-left">Type</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td className="border border-gray-300 p-3">session_id</td>
                    <td className="border border-gray-300 p-3">User authentication</td>
                    <td className="border border-gray-300 p-3">Session</td>
                    <td className="border border-gray-300 p-3">Essential</td>
                  </tr>
                  <tr className="bg-gray-50">
                    <td className="border border-gray-300 p-3">auth_token</td>
                    <td className="border border-gray-300 p-3">Secure authentication</td>
                    <td className="border border-gray-300 p-3">7 days</td>
                    <td className="border border-gray-300 p-3">Essential</td>
                  </tr>
                  <tr>
                    <td className="border border-gray-300 p-3">user_preferences</td>
                    <td className="border border-gray-300 p-3">Store user settings</td>
                    <td className="border border-gray-300 p-3">1 year</td>
                    <td className="border border-gray-300 p-3">Preference</td>
                  </tr>
                  <tr className="bg-gray-50">
                    <td className="border border-gray-300 p-3">analytics_id</td>
                    <td className="border border-gray-300 p-3">Track user behavior</td>
                    <td className="border border-gray-300 p-3">2 years</td>
                    <td className="border border-gray-300 p-3">Analytics</td>
                  </tr>
                  <tr>
                    <td className="border border-gray-300 p-3">csrf_token</td>
                    <td className="border border-gray-300 p-3">Security protection</td>
                    <td className="border border-gray-300 p-3">Session</td>
                    <td className="border border-gray-300 p-3">Essential</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </section>

          <section id="third-party-cookies">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">4. Third-Party Cookies</h2>
            <p className="text-gray-700 mb-4">
              We work with external service providers who may set cookies:
            </p>
            <div className="space-y-4">
              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Appwrite</h3>
                <p className="text-gray-700">Backend service for authentication and data storage. Sets cookies for session management.</p>
              </div>
              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">FingerprintJS</h3>
                <p className="text-gray-700">Device fingerprinting for security. Stores device identification information.</p>
              </div>
              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Analytics Services</h3>
                <p className="text-gray-700">Third-party analytics to measure platform usage and performance.</p>
              </div>
            </div>
          </section>

          <section id="device-fingerprinting">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">5. Device Fingerprinting</h2>
            <p className="text-gray-700 mb-4">
              In addition to cookies, we use device fingerprinting technology for enhanced security:
            </p>
            <div className="bg-indigo-50 p-4 rounded-lg">
              <ul className="list-disc list-inside text-gray-700 space-y-2 ml-2">
                <li>Creates unique device identifier during account creation</li>
                <li>Tracks authorized devices for account security</li>
                <li>Uses browser and hardware characteristics (non-PII)</li>
                <li>Helps prevent unauthorized access and multi-account abuse</li>
                <li>Stored in user preferences with explicit consent</li>
              </ul>
            </div>
          </section>

          <section id="tracking-technologies">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">6. Other Tracking Technologies</h2>
            <p className="text-gray-700 mb-4">
              Beyond cookies, we may use:
            </p>
            <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4">
              <li><strong>Web Beacons:</strong> Transparent pixels tracking page views</li>
              <li><strong>Log Files:</strong> Server logs containing IP, user agent, and access times</li>
              <li><strong>LocalStorage:</strong> Browser storage for app data persistence</li>
              <li><strong>Session Storage:</strong> Temporary storage during active sessions</li>
              <li><strong>Pixel Tags:</strong> Tracking email opens and link clicks</li>
            </ul>
          </section>

          <section id="your-choices">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">7. Your Cookie Choices</h2>
            <div className="space-y-4">
              <div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Browser Settings</h3>
                <p className="text-gray-700 mb-2">
                  You can control cookies through your browser settings:
                </p>
                <ul className="list-disc list-inside text-gray-700 space-y-1 ml-4">
                  <li>Accept all, reject all, or manage by type</li>
                  <li>Delete existing cookies and browsing data</li>
                  <li>Enable private/incognito browsing</li>
                  <li>Set cookie acceptance preferences</li>
                </ul>
              </div>

              <div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Cookie Consent Management</h3>
                <p className="text-gray-700">
                  We provide a cookie preference center on our website where you can manage your choices for non-essential cookies at any time.
                </p>
              </div>

              <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Important Note</h3>
                <p className="text-gray-700">
                  Disabling essential cookies may prevent proper functionality of Mine17 Pets. Optional cookies can be safely disabled without affecting core features.
                </p>
              </div>
            </div>
          </section>

          <section id="contact">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">8. Contact Us</h2>
            <p className="text-gray-700 mb-4">
              Questions about our cookie practices? Contact us:
            </p>
            <div className="bg-indigo-50 p-6 rounded-lg">
              <p className="text-gray-700 mb-2"><strong>Mine17 Pets Privacy Team</strong></p>
              <p className="text-gray-700">Email: privacy@mine17.com</p>
              <p className="text-gray-700 mt-4">
                We are available to answer questions about this Cookie Policy.
              </p>
            </div>
          </section>

          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 mt-12">
            <p className="text-gray-700 text-sm">
              <strong>Cookie Policy Updates:</strong> This policy is effective as of December 2025 and may be updated to reflect changes in cookie technology and regulations. We recommend reviewing this policy periodically for updates.
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
