'use client';

import { useState, FormEvent } from 'react';
import { useAuth } from '@/context/AuthContext';
import { account } from '@/lib/appwrite';
import PhoneInput, { isValidPhoneNumber } from 'react-phone-number-input';
import 'react-phone-number-input/style.css';
import '../../../app/register/phone-input.css';

export default function ProfilePage() {
  const { user, getUser } = useAuth();
  const [newName, setNewName] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [emailPassword, setEmailPassword] = useState('');
  const [newPhone, setNewPhone] = useState('');
  const [phonePassword, setPhonePassword] = useState('');
  const [nameError, setNameError] = useState('');
  const [emailError, setEmailError] = useState('');
  const [phoneError, setPhoneError] = useState('');
  const [nameSuccess, setNameSuccess] = useState('');
  const [emailSuccess, setEmailSuccess] = useState('');
  const [phoneSuccess, setPhoneSuccess] = useState('');
  const [isNameLoading, setIsNameLoading] = useState(false);
  const [isEmailLoading, setIsEmailLoading] = useState(false);
  const [isPhoneLoading, setIsPhoneLoading] = useState(false);
  const [showContact, setShowContact] = useState(user?.prefs?.showContact === 1 || user?.prefs?.showContact === undefined);
  const [isUpdatingContactVisibility, setIsUpdatingContactVisibility] = useState(false);

  const handleNameUpdate = async (e: FormEvent) => {
    e.preventDefault();
    setNameError('');
    setNameSuccess('');
    setIsNameLoading(true);

    try {
      await account.updateName(newName);
      setNameSuccess('Name updated successfully!');
      setNewName('');
      await getUser();
    } catch (err: any) {
      setNameError(err.message || 'Failed to update name');
    } finally {
      setIsNameLoading(false);
    }
  };

  const handleEmailUpdate = async (e: FormEvent) => {
    e.preventDefault();
    setEmailError('');
    setEmailSuccess('');
    setIsEmailLoading(true);

    try {
      await account.updateEmail(newEmail, emailPassword);
      setEmailSuccess('Email updated successfully!');
      setNewEmail('');
      setEmailPassword('');
      await getUser();
    } catch (err: any) {
      setEmailError(err.message || 'Failed to update email');
    } finally {
      setIsEmailLoading(false);
    }
  };

  const handlePhoneUpdate = async (e: FormEvent) => {
    e.preventDefault();
    setPhoneError('');
    setPhoneSuccess('');
    setIsPhoneLoading(true);

    try {
      // Validate phone format
      if (!isValidPhoneNumber(newPhone)) {
        setPhoneError('Please enter a valid phone number');
        setIsPhoneLoading(false);
        return;
      }

      // Check if phone number already exists (except for current user)
      const checkPhoneResponse = await fetch('/api/check-email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ phone: newPhone }),
      });

      const phoneData = await checkPhoneResponse.json();

      // Only show error if phone exists and it's not the current user's phone
      if (phoneData.exists && user?.prefs?.phone !== newPhone) {
        setPhoneError('This phone number is already registered to another account');
        setIsPhoneLoading(false);
        return;
      }

      // Update phone in user preferences
      const currentPrefs = user?.prefs || {};
      await account.updatePrefs({
        ...currentPrefs,
        phone: newPhone,
      });

      setPhoneSuccess('Phone number updated successfully!');
      setNewPhone('');
      setPhonePassword('');
      await getUser();
    } catch (err: any) {
      setPhoneError(err.message || 'Failed to update phone');
    } finally {
      setIsPhoneLoading(false);
    }
  };

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-50 via-white to-purple-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl w-full space-y-6">
        {/* Header with gradient background and PRO badge */}
        <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-2xl shadow-xl p-8 text-white relative overflow-hidden">
          {/* Subtle PRO badge for premium members */}
          {user?.prefs?.membership === 'pro' && (
            <div className="absolute top-6 right-6">
              <div className="flex items-center gap-1.5 px-3 py-1.5 bg-white/20 backdrop-blur-sm rounded-full border border-white/30">
                <svg className="w-4 h-4 text-yellow-300" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
                <span className="text-xs font-semibold text-white tracking-wide">PRO</span>
              </div>
            </div>
          )}
          
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center shadow-lg border border-white/30">
              <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </div>
            <div>
              <h2 className="text-3xl font-bold">
                {user.name || 'User Profile'}
              </h2>
              <p className="mt-1 text-sm text-indigo-100">
                Manage your account information and settings
              </p>
            </div>
          </div>
        </div>

        {/* Main Card */}
        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
          <div className="px-8 pb-8 pt-6">
            {/* User Info Display Section */}
            <div className="space-y-4 mb-8">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Account Information</h3>

              {/* Email Display */}
              <div className="bg-gray-50 rounded-lg p-4 flex items-center gap-3">
                <div className="flex-shrink-0">
                  <svg className="w-5 h-5 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Email</p>
                  <p className="text-sm font-medium text-gray-900 truncate">{user.email}</p>
                </div>
              </div>

              {/* Phone Display */}
              {user.prefs?.phone && (
                <div className="bg-gray-50 rounded-lg p-4 flex items-center gap-3">
                  <div className="flex-shrink-0">
                    <svg className="w-5 h-5 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                    </svg>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Phone</p>
                    <p className="text-sm font-medium text-gray-900 truncate">{user.prefs.phone}</p>
                  </div>
                </div>
              )}

              {/* Contact Visibility Toggle */}
              <div className="bg-indigo-50 rounded-lg p-4 border border-indigo-100">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex-shrink-0">
                      <svg className="w-5 h-5 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-gray-900">Show Contact Information</p>
                      <p className="text-xs text-gray-600 mt-0.5">
                        Make your email and phone visible to others
                      </p>
                    </div>
                  </div>
                  
                  <button
                    type="button"
                    onClick={async () => {
                      if (isUpdatingContactVisibility) return;
                      
                      setIsUpdatingContactVisibility(true);
                      try {
                        const newValue = showContact ? 0 : 1; // Toggle between 1 and 0
                        const currentPrefs = user.prefs || {};
                        
                        await account.updatePrefs({
                          ...currentPrefs,
                          showContact: newValue,
                        });
                        
                        setShowContact(newValue === 1);
                        await getUser();
                      } catch (error) {
                        console.error('Failed to update contact visibility:', error);
                        alert('Failed to update settings');
                      } finally {
                        setIsUpdatingContactVisibility(false);
                      }
                    }}
                    disabled={isUpdatingContactVisibility}
                    className={`${
                      showContact ? 'bg-indigo-600' : 'bg-gray-300'
                    } relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed`}
                  >
                    <span
                      className={`${
                        showContact ? 'translate-x-5' : 'translate-x-0'
                      } pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out`}
                    />
                  </button>
                </div>
              </div>

            </div>

            {/* Divider */}
            <div className="border-t border-gray-200 my-8"></div>

            {/* Update Name Form */}
            <div className="mb-8">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Update Name</h3>
              <form onSubmit={handleNameUpdate} className="space-y-5">
                {/* Name Success Message */}
                {nameSuccess && (
                  <div className="rounded-lg bg-green-50 border border-green-200 p-4">
                    <div className="flex">
                      <svg className="h-5 w-5 text-green-400 mt-0.5" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                      <div className="ml-3">
                        <p className="text-sm font-medium text-green-800">{nameSuccess}</p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Name Error Message */}
                {nameError && (
                  <div className="rounded-lg bg-red-50 border border-red-200 p-4">
                    <div className="flex">
                      <svg className="h-5 w-5 text-red-400 mt-0.5" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                      </svg>
                      <div className="ml-3">
                        <p className="text-sm font-medium text-red-800">{nameError}</p>
                      </div>
                    </div>
                  </div>
                )}

                {/* New Name Input */}
                <div>
                  <label htmlFor="new-name" className="block text-sm font-semibold text-gray-700 mb-2">
                    New Name
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                    </div>
                    <input
                      type="text"
                      id="new-name"
                      name="new-name"
                      required
                      className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all sm:text-sm disabled:bg-gray-50 disabled:text-gray-500"
                      placeholder="Your full name"
                      value={newName}
                      onChange={(e) => setNewName(e.target.value)}
                      disabled={isNameLoading}
                    />
                  </div>
                </div>

                {/* Submit Button */}
                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={isNameLoading}
                    className="w-full flex justify-center items-center gap-2 py-3 px-4 border border-transparent text-sm font-semibold rounded-lg text-white bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-700 hover:to-indigo-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-sm hover:shadow-md"
                  >
                    {isNameLoading ? (
                      <>
                        <svg className="animate-spin h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Updating...
                      </>
                    ) : (
                      <>
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        Update Name
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>

            {/* Divider */}
            <div className="border-t border-gray-200 my-8"></div>

            {/* Update Email Form */}
            <div className="mb-8">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Update Email Address</h3>
              <form onSubmit={handleEmailUpdate} className="space-y-5">
                {/* Email Success Message */}
                {emailSuccess && (
                  <div className="rounded-lg bg-green-50 border border-green-200 p-4">
                    <div className="flex">
                      <svg className="h-5 w-5 text-green-400 mt-0.5" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                      <div className="ml-3">
                        <p className="text-sm font-medium text-green-800">{emailSuccess}</p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Email Error Message */}
                {emailError && (
                  <div className="rounded-lg bg-red-50 border border-red-200 p-4">
                    <div className="flex">
                      <svg className="h-5 w-5 text-red-400 mt-0.5" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                      </svg>
                      <div className="ml-3">
                        <p className="text-sm font-medium text-red-800">{emailError}</p>
                      </div>
                    </div>
                  </div>
                )}

                {/* New Email Input */}
                <div>
                  <label htmlFor="new-email" className="block text-sm font-semibold text-gray-700 mb-2">
                    New Email Address
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                      </svg>
                    </div>
                    <input
                      type="email"
                      id="new-email"
                      name="new-email"
                      required
                      className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all sm:text-sm disabled:bg-gray-50 disabled:text-gray-500"
                      placeholder="you@example.com"
                      value={newEmail}
                      onChange={(e) => setNewEmail(e.target.value)}
                      disabled={isEmailLoading}
                    />
                  </div>
                </div>

                {/* Current Password Input */}
                <div>
                  <label htmlFor="email-password" className="block text-sm font-semibold text-gray-700 mb-2">
                    Current Password
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                      </svg>
                    </div>
                    <input
                      type="password"
                      id="email-password"
                      name="email-password"
                      required
                      className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all sm:text-sm disabled:bg-gray-50"
                      placeholder="Enter your password"
                      value={emailPassword}
                      onChange={(e) => setEmailPassword(e.target.value)}
                      disabled={isEmailLoading}
                    />
                  </div>
                </div>

                {/* Submit Button */}
                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={isEmailLoading}
                    className="w-full flex justify-center items-center gap-2 py-3 px-4 border border-transparent text-sm font-semibold rounded-lg text-white bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-700 hover:to-indigo-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-sm hover:shadow-md"
                  >
                    {isEmailLoading ? (
                      <>
                        <svg className="animate-spin h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Updating...
                      </>
                    ) : (
                      <>
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        Update Email
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>

            {/* Divider */}
            <div className="border-t border-gray-200 my-8"></div>

            {/* Update Phone Form */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Update Phone Number</h3>
              <form onSubmit={handlePhoneUpdate} className="space-y-5">
                {/* Phone Success Message */}
                {phoneSuccess && (
                  <div className="rounded-lg bg-green-50 border border-green-200 p-4">
                    <div className="flex">
                      <svg className="h-5 w-5 text-green-400 mt-0.5" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                      <div className="ml-3">
                        <p className="text-sm font-medium text-green-800">{phoneSuccess}</p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Phone Error Message */}
                {phoneError && (
                  <div className="rounded-lg bg-red-50 border border-red-200 p-4">
                    <div className="flex">
                      <svg className="h-5 w-5 text-red-400 mt-0.5" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                      </svg>
                      <div className="ml-3">
                        <p className="text-sm font-medium text-red-800">{phoneError}</p>
                      </div>
                    </div>
                  </div>
                )}

                {/* New Phone Input */}
                <div>
                  <label htmlFor="new-phone" className="block text-sm font-semibold text-gray-700 mb-2">
                    New Phone Number
                  </label>
                  <PhoneInput
                    id="new-phone"
                    defaultCountry="SG"
                    countries={['SG', 'MY']}
                    value={newPhone}
                    onChange={(value) => setNewPhone(value || '')}
                    disabled={isPhoneLoading}
                    className="phone-input-custom"
                    placeholder="Enter phone number"
                  />
                </div>

                {/* Submit Button */}
                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={isPhoneLoading}
                    className="w-full flex justify-center items-center gap-2 py-3 px-4 border border-transparent text-sm font-semibold rounded-lg text-white bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-700 hover:to-indigo-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-sm hover:shadow-md"
                  >
                    {isPhoneLoading ? (
                      <>
                        <svg className="animate-spin h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Updating...
                      </>
                    ) : (
                      <>
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        Update Phone
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
