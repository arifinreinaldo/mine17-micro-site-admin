'use client';

import Link from 'next/link';

export default function PrivacyPolicyPage() {
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
          <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-4">Privacy Policy</h1>
          <p className="text-lg text-gray-600">Last updated: December 2025</p>
        </div>

        {/* Table of Contents */}
        <div className="bg-indigo-50 rounded-lg p-6 mb-12">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Table of Contents</h2>
          <ul className="space-y-2">
            <li><a href="#introduction" className="text-indigo-600 hover:text-indigo-700">1. Introduction</a></li>
            <li><a href="#information-we-collect" className="text-indigo-600 hover:text-indigo-700">2. Information We Collect</a></li>
            <li><a href="#how-we-use" className="text-indigo-600 hover:text-indigo-700">3. How We Use Your Information</a></li>
            <li><a href="#data-security" className="text-indigo-600 hover:text-indigo-700">4. Data Security</a></li>
            <li><a href="#your-rights" className="text-indigo-600 hover:text-indigo-700">5. Your Rights</a></li>
            <li><a href="#cookies" className="text-indigo-600 hover:text-indigo-700">6. Cookies</a></li>
            <li><a href="#third-party" className="text-indigo-600 hover:text-indigo-700">7. Third-Party Services</a></li>
            <li><a href="#contact" className="text-indigo-600 hover:text-indigo-700">8. Contact Us</a></li>
          </ul>
        </div>

        {/* Content Sections */}
        <div className="space-y-8">
          <section id="introduction">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">1. Introduction</h2>
            <p className="text-gray-700 mb-4">
              Welcome to Mine17 Pets (&quot;we,&quot; &quot;our,&quot; or &quot;us&quot;). We are committed to protecting your privacy and ensuring you have a positive experience on our platform. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you visit our website and use our services.
            </p>
          </section>

          <section id="information-we-collect">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">2. Information We Collect</h2>
            <div className="space-y-4">
              <div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Personal Information</h3>
                <p className="text-gray-700 mb-2">We collect information you provide directly:</p>
                <ul className="list-disc list-inside text-gray-700 space-y-2 ml-2">
                  <li>Email address</li>
                  <li>Name and contact information</li>
                  <li>Password and authentication credentials</li>
                  <li>Pet information (name, breed, age, medical history, photos)</li>
                  <li>Phone number (optional)</li>
                </ul>
              </div>

              <div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Automatic Information</h3>
                <p className="text-gray-700 mb-2">We automatically collect:</p>
                <ul className="list-disc list-inside text-gray-700 space-y-2 ml-2">
                  <li>Device fingerprint for security purposes</li>
                  <li>IP address and browser information</li>
                  <li>Usage data and interaction patterns</li>
                  <li>Cookies and tracking technologies</li>
                  <li>Log files from server access</li>
                </ul>
              </div>

              <div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Pet Images and Media</h3>
                <p className="text-gray-700">
                  When you upload pet photos, we store the compressed images on our secure servers. You retain full ownership of your pet media.
                </p>
              </div>
            </div>
          </section>

          <section id="how-we-use">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">3. How We Use Your Information</h2>
            <p className="text-gray-700 mb-4">We use collected information for:</p>
            <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4">
              <li>Account creation and authentication</li>
              <li>Delivering and maintaining our services</li>
              <li>Personalizing your experience</li>
              <li>Generating and managing QR codes for pet sharing</li>
              <li>Compressing and storing pet images</li>
              <li>Security, fraud prevention, and device tracking</li>
              <li>Sending important notifications and updates</li>
              <li>Improving our platform and features</li>
              <li>Complying with legal obligations</li>
            </ul>
          </section>

          <section id="data-security">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">4. Data Security</h2>
            <div className="space-y-4">
              <p className="text-gray-700">
                We implement comprehensive security measures to protect your personal information:
              </p>
              <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4">
                <li><strong>Device Fingerprinting:</strong> Unique device identifiers track and secure your account</li>
                <li><strong>OTP Authentication:</strong> One-time passwords provide passwordless secure access</li>
                <li><strong>Encryption:</strong> Data transmitted using HTTPS/SSL encryption</li>
                <li><strong>Secure Storage:</strong> Passwords and sensitive data encrypted at rest</li>
                <li><strong>Access Controls:</strong> Limited access based on user roles and permissions</li>
                <li><strong>Regular Audits:</strong> Security assessments and vulnerability testing</li>
              </ul>
              <p className="text-gray-700 mt-4">
                While we strive to protect your data, no method of transmission over the internet is 100% secure. We cannot guarantee absolute security.
              </p>
            </div>
          </section>

          <section id="your-rights">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">5. Your Privacy Rights</h2>
            <div className="space-y-4">
              <p className="text-gray-700">
                Depending on your location, you may have the following rights regarding your personal data:
              </p>
              <div className="bg-gray-50 p-4 rounded-lg">
                <ul className="list-disc list-inside text-gray-700 space-y-2 ml-2">
                  <li><strong>Right to Access:</strong> Request a copy of your personal data</li>
                  <li><strong>Right to Correction:</strong> Request corrections to inaccurate information</li>
                  <li><strong>Right to Deletion:</strong> Request deletion of your account and data</li>
                  <li><strong>Right to Portability:</strong> Export your data in a machine-readable format</li>
                  <li><strong>Right to Object:</strong> Object to processing of your data</li>
                  <li><strong>Right to Withdraw Consent:</strong> Withdraw previously given consent</li>
                </ul>
              </div>
              <p className="text-gray-700">
                To exercise these rights, please contact us using the information provided in the Contact Us section.
              </p>
            </div>
          </section>

          <section id="cookies">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">6. Cookies and Tracking</h2>
            <div className="space-y-4">
              <p className="text-gray-700">
                We use cookies and similar tracking technologies to enhance your experience. See our <Link href="/legal/cookie-policy" className="text-indigo-600 hover:text-indigo-700 underline">Cookie Policy</Link> for detailed information.
              </p>
              <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4">
                <li><strong>Essential Cookies:</strong> Required for platform functionality</li>
                <li><strong>Analytics Cookies:</strong> Help us understand user behavior</li>
                <li><strong>Preference Cookies:</strong> Remember your settings and preferences</li>
                <li><strong>Marketing Cookies:</strong> Used for targeted content (with consent)</li>
              </ul>
            </div>
          </section>

          <section id="third-party">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">7. Third-Party Services</h2>
            <div className="space-y-4">
              <p className="text-gray-700">
                We use the following third-party services that may collect information:
              </p>
              <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4">
                <li><strong>Appwrite:</strong> Backend service for data storage and authentication</li>
                <li><strong>FingerprintJS:</strong> Device fingerprinting for security</li>
              </ul>
              <p className="text-gray-700">
                These services have their own privacy policies. We encourage you to review them.
              </p>
            </div>
          </section>

          <section id="contact">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">8. Contact Us</h2>
            <p className="text-gray-700 mb-4">
              If you have questions about this Privacy Policy or our privacy practices, please contact us:
            </p>
            <div className="bg-indigo-50 p-6 rounded-lg">
              <p className="text-gray-700 mb-2"><strong>Mine17 Pets Privacy Team</strong></p>
              <p className="text-gray-700">Email: privacy@mine17.com</p>
              <p className="text-gray-700 mt-4">
                We will respond to your inquiry within 30 days.
              </p>
            </div>
          </section>

          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 mt-12">
            <p className="text-gray-700 text-sm">
              <strong>Note:</strong> This Privacy Policy may be updated periodically. We will notify you of significant changes via email or through our platform. Your continued use constitutes acceptance of the updated policy.
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
