'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';

export default function LandingPage() {
  const { user, loading } = useAuth();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Get brand name from environment
  const appName = process.env.NEXT_PUBLIC_APP_NAME || 'Mine17 Pets';

  // Prevent hydration mismatch
  if (!mounted || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  // Conditional CTAs based on user state
  const primaryCTA = user ? '/dashboard/profile' : '/register';
  const primaryCTAText = user ? 'Go to Dashboard' : 'Get Started Free';

  // Features data
  const features = [
    {
      icon: '📝',
      title: 'Complete Digital Profiles',
      description: 'Store comprehensive information about your pet including breed, age, medical history, and personality traits'
    },
    {
      icon: '🔗',
      title: 'QR Code Sharing',
      description: 'Generate shareable QR codes for your pet&apos;s profile to quickly share information with vets or pet sitters'
    },
    {
      icon: '🔒',
      title: 'Secure & Private',
      description: 'Your pet&apos;s data is protected with device fingerprinting and OTP-based authentication for maximum security'
    },
    {
      icon: '📸',
      title: 'Photo Gallery',
      description: 'Upload and manage pet photos with automatic compression for optimal storage and quick loading'
    },
    {
      icon: '✉️',
      title: 'OTP-Based Access',
      description: 'Passwordless login option with one-time codes sent to your email for seamless and secure access'
    },
    {
      icon: '❤️',
      title: 'Dedicated Pet Care',
      description: 'Focus on what matters most - one comprehensive profile to give your pet the attention they deserve'
    }
  ];

  // Workflow data
  const workflows = [
    {
      title: 'Quick & Secure Setup',
      icon: (
        <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
        </svg>
      ),
      steps: [
        'Create account with email verification',
        'Receive OTP code instantly',
        'Set up secure password',
        'Device fingerprint registered'
      ]
    },
    {
      title: 'Build Your Pet&apos;s Profile',
      icon: (
        <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
        </svg>
      ),
      steps: [
        'Add pet details and photos',
        'Automatic image compression',
        'Generate unique QR code',
        'Share profile instantly'
      ]
    },
    {
      title: 'Easy Profile Updates',
      icon: (
        <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4" />
        </svg>
      ),
      steps: [
        'Edit pet information anytime',
        'Upload new photos',
        'View and share QR code',
        'Manage account settings'
      ]
    }
  ];

  // Pricing tiers
  const pricingTiers = [
    {
      name: 'Pet Friend',
      price: '$0',
      period: 'month',
      badge: null,
      features: [
        '1 Pet Profile',
        'Photo Gallery (up to 3 images)',
        'QR Code Generation',
        'Basic Profile Information',
        'Email Support'
      ],
      cta: 'Get Started Free',
      ctaLink: '/register',
      featured: false
    },
    {
      name: 'Pet Families',
      price: '$4.99',
      period: 'month',
      badge: 'Most Popular',
      features: [
        'Unlimited Pet Profiles',
        'Priority Support'
      ],
      cta: 'Start Free Trial',
      ctaLink: '/register',
      featured: true
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50">
      {/* ==================== NAVIGATION ==================== */}
      <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-md shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16 sm:h-20">
            <div className="font-bold text-xl text-indigo-600">{appName}</div>
            <div className="flex gap-3">
              {user ? (
                <Link
                  href="/dashboard/profile"
                  className="inline-flex items-center px-6 py-2.5 text-sm font-semibold text-white bg-gradient-to-r from-indigo-600 to-indigo-700 rounded-lg hover:from-indigo-700 hover:to-indigo-800 hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200"
                >
                  Go to Dashboard
                </Link>
              ) : (
                <>
                  <Link
                    href="/login"
                    className="inline-flex items-center px-6 py-2.5 text-sm font-semibold text-indigo-600 bg-white border-2 border-indigo-600 rounded-lg hover:bg-indigo-50 transition-all duration-200"
                  >
                    Login
                  </Link>
                  <Link
                    href="/register"
                    className="inline-flex items-center px-6 py-2.5 text-sm font-semibold text-white bg-gradient-to-r from-indigo-600 to-indigo-700 rounded-lg hover:from-indigo-700 hover:to-indigo-800 hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200"
                  >
                    Sign Up
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* ==================== HERO SECTION ==================== */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24 lg:py-32">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Text Content */}
          <div>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 mb-6">
              Manage Your Pet's Life with Confidence
            </h1>
            <p className="text-lg sm:text-xl text-gray-600 mb-8">
              Secure digital profiles, QR code sharing, and comprehensive pet management all in one place
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Link
                href={primaryCTA}
                className="inline-flex items-center justify-center px-8 py-4 text-lg font-semibold text-white bg-gradient-to-r from-indigo-600 to-indigo-700 rounded-lg shadow-md hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200"
              >
                {primaryCTAText}
                <svg className="ml-2 w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </Link>
              <a
                href="#dashboard-tour"
                className="inline-flex items-center justify-center px-8 py-4 text-lg font-semibold text-indigo-600 bg-white border-2 border-indigo-600 rounded-lg hover:bg-indigo-50 transition-all duration-200"
              >
                See How It Works
              </a>
            </div>
          </div>

          {/* Visual Element */}
          <div className="flex justify-center lg:justify-end">
            <div className="relative bg-white rounded-2xl p-6 shadow-2xl animate-float">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-16 h-16 bg-gradient-to-br from-indigo-100 to-purple-100 rounded-full flex items-center justify-center">
                  <span className="text-3xl">🐾</span>
                </div>
                <div>
                  <h4 className="font-bold text-gray-900">Your Pet Profile</h4>
                  <p className="text-sm text-gray-600">Managed with Care</p>
                </div>
              </div>
              <div className="h-2 bg-gray-200 rounded-full">
                <div className="h-2 bg-indigo-600 rounded-full w-3/4"></div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ==================== FEATURES GRID ==================== */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24">
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
            Everything You Need for Pet Care
          </h2>
          <p className="text-lg text-gray-600">
            Powerful features designed to keep your pet's information safe and accessible
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <div
              key={index}
              className="bg-white rounded-2xl p-6 shadow-md hover:shadow-xl hover:-translate-y-1 transition-all duration-300"
            >
              <div className="w-12 h-12 bg-gradient-to-br from-indigo-100 to-purple-100 rounded-xl flex items-center justify-center mb-4">
                <span className="text-2xl">{feature.icon}</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">{feature.title}</h3>
              <p className="text-gray-600 text-sm leading-relaxed">{feature.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ==================== DASHBOARD TOUR ==================== */}
      <section id="dashboard-tour" className="bg-gray-50 py-16 sm:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
              How It Works
            </h2>
            <p className="text-lg text-gray-600">
              Simple steps to get started with managing your pet's information
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {workflows.map((workflow, index) => (
              <div key={index} className="bg-white rounded-2xl p-8 shadow-lg">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 bg-indigo-600 rounded-lg flex items-center justify-center">
                    {workflow.icon}
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900">{workflow.title}</h3>
                </div>
                <ul className="space-y-3">
                  {workflow.steps.map((step, stepIndex) => (
                    <li key={stepIndex} className="flex items-start gap-2">
                      <svg className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                      <span className="text-gray-600">{step}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ==================== PRICING SECTION ==================== */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24">
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
            Choose Your Plan
          </h2>
          <p className="text-lg text-gray-600">
            Select the perfect plan for your pet care needs
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {pricingTiers.map((tier, index) => (
            <div
              key={index}
              className={`relative bg-white rounded-2xl p-8 shadow-lg ${
                tier.featured ? 'border-2 border-indigo-600 md:scale-105' : ''
              }`}
            >
              {tier.badge && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-indigo-600 text-white px-4 py-1 rounded-full text-sm font-semibold">
                  {tier.badge}
                </div>
              )}

              <div className="text-center mb-6">
                <h3 className="text-2xl font-bold text-gray-900">{tier.name}</h3>
                <div className="mt-4">
                  <span className="text-5xl font-bold text-gray-900">{tier.price}</span>
                  <span className="text-gray-600">/{tier.period}</span>
                </div>
              </div>

              <ul className="space-y-3 mb-8">
                {tier.features.map((feature, featureIndex) => (
                  <li key={featureIndex} className="flex items-center gap-2">
                    <svg className="w-5 h-5 text-green-500 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    <span className="text-gray-700">{feature}</span>
                  </li>
                ))}
              </ul>

              <Link
                href={tier.ctaLink}
                className={`block w-full text-center py-3 rounded-lg font-semibold transition-shadow ${
                  tier.featured
                    ? 'bg-gradient-to-r from-indigo-600 to-indigo-700 text-white hover:shadow-lg'
                    : 'bg-white text-indigo-600 border-2 border-indigo-600 hover:bg-indigo-50'
                }`}
              >
                {tier.cta}
              </Link>
            </div>
          ))}
        </div>
      </section>

      {/* ==================== FOOTER ==================== */}
      <footer className="bg-gray-900 text-gray-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {/* Brand Column */}
            <div>
              <h3 className="text-white font-bold text-xl mb-4">{appName}</h3>
              <p className="text-sm mb-4">Your pet&apos;s digital home</p>
              <div className="flex gap-4">
                {/* Social icons placeholders */}
                <a href="#" className="text-gray-400 hover:text-white transition-colors">
                  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                  </svg>
                </a>
                <a href="#" className="text-gray-400 hover:text-white transition-colors">
                  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/>
                  </svg>
                </a>
                <a href="#" className="text-gray-400 hover:text-white transition-colors">
                  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.894 8.221l-1.97 9.28c-.145.658-.537.818-1.084.508l-3-2.21-1.446 1.394c-.14.18-.357.223-.548.223l.188-2.85 5.18-4.68c.223-.2-.054-.312-.346-.112l-6.4 4.02-2.76-.918c-.6-.187-.612-.6.125-.89l10.782-4.156c.5-.18.943.112.78.89z"/>
                  </svg>
                </a>
              </div>
            </div>

            {/* Product Column */}
            <div>
              <h4 className="text-white font-semibold mb-4">Product</h4>
              <ul className="space-y-2">
                <li><a href="#" className="text-sm hover:text-white transition-colors">Features</a></li>
                <li><a href="#" className="text-sm hover:text-white transition-colors">Pricing</a></li>
                <li><a href="#" className="text-sm hover:text-white transition-colors">Security</a></li>
                <li><a href="#" className="text-sm hover:text-white transition-colors">Updates</a></li>
              </ul>
            </div>

            {/* Company Column */}
            <div>
              <h4 className="text-white font-semibold mb-4">Company</h4>
              <ul className="space-y-2">
                <li><a href="#" className="text-sm hover:text-white transition-colors">About Us</a></li>
                <li><a href="#" className="text-sm hover:text-white transition-colors">Contact</a></li>
                <li><a href="#" className="text-sm hover:text-white transition-colors">Careers</a></li>
                <li><a href="#" className="text-sm hover:text-white transition-colors">Press Kit</a></li>
              </ul>
            </div>

            {/* Legal Column */}
            <div>
              <h4 className="text-white font-semibold mb-4">Legal</h4>
              <ul className="space-y-2">
                <li><a href="#" className="text-sm hover:text-white transition-colors">Privacy Policy</a></li>
                <li><a href="#" className="text-sm hover:text-white transition-colors">Terms of Service</a></li>
                <li><a href="#" className="text-sm hover:text-white transition-colors">Cookie Policy</a></li>
                <li><a href="#" className="text-sm hover:text-white transition-colors">GDPR Compliance</a></li>
              </ul>
            </div>
          </div>

          {/* Bottom Bar */}
          <div className="border-t border-gray-800 mt-12 pt-8 text-center text-sm">
            <p>&copy; 2025 {appName}. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
