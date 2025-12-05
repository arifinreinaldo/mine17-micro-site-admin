'use client';

import { useState, FormEvent } from 'react';
import { useAuth } from '@/context/AuthContext';
import { account } from '@/lib/appwrite';

export default function ProfilePage() {
  const { user, getUser } = useAuth();
  const [newEmail, setNewEmail] = useState('');
  const [emailPassword, setEmailPassword] = useState('');
  const [newPhone, setNewPhone] = useState('');
  const [phonePassword, setPhonePassword] = useState('');
  const [emailError, setEmailError] = useState('');
  const [phoneError, setPhoneError] = useState('');
  const [emailSuccess, setEmailSuccess] = useState('');
  const [phoneSuccess, setPhoneSuccess] = useState('');
  const [isEmailLoading, setIsEmailLoading] = useState(false);
  const [isPhoneLoading, setIsPhoneLoading] = useState(false);

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
      await account.updatePhone(newPhone, phonePassword);
      setPhoneSuccess('Phone updated successfully!');
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
    <div className="space-y-6">
      <div className="bg-white shadow px-4 py-5 sm:rounded-lg sm:p-6">
        <div className="md:grid md:grid-cols-3 md:gap-6">
          <div className="md:col-span-1">
            <h3 className="text-lg font-medium leading-6 text-gray-900">
              User Information
            </h3>
            <p className="mt-1 text-sm text-gray-500">
              Your current account information.
            </p>
          </div>
          <div className="mt-5 md:mt-0 md:col-span-2">
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  User ID
                </label>
                <div className="mt-1 text-sm text-gray-900">{user.$id}</div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Email
                </label>
                <div className="mt-1 text-sm text-gray-900">{user.email}</div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Name
                </label>
                <div className="mt-1 text-sm text-gray-900">
                  {user.name || 'Not set'}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Phone
                </label>
                <div className="mt-1 text-sm text-gray-900">
                  {user.phone || 'Not set'}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white shadow px-4 py-5 sm:rounded-lg sm:p-6">
        <div className="md:grid md:grid-cols-3 md:gap-6">
          <div className="md:col-span-1">
            <h3 className="text-lg font-medium leading-6 text-gray-900">
              Update Email
            </h3>
            <p className="mt-1 text-sm text-gray-500">
              Change your email address.
            </p>
          </div>
          <div className="mt-5 md:mt-0 md:col-span-2">
            <form onSubmit={handleEmailUpdate} className="space-y-6">
              {emailError && (
                <div className="rounded-md bg-red-50 p-4">
                  <p className="text-sm text-red-800">{emailError}</p>
                </div>
              )}
              {emailSuccess && (
                <div className="rounded-md bg-green-50 p-4">
                  <p className="text-sm text-green-800">{emailSuccess}</p>
                </div>
              )}
              <div>
                <label
                  htmlFor="new-email"
                  className="block text-sm font-medium text-gray-700"
                >
                  New Email
                </label>
                <input
                  type="email"
                  name="new-email"
                  id="new-email"
                  required
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm text-gray-900"
                  value={newEmail}
                  onChange={(e) => setNewEmail(e.target.value)}
                  disabled={isEmailLoading}
                />
              </div>
              <div>
                <label
                  htmlFor="email-password"
                  className="block text-sm font-medium text-gray-700"
                >
                  Current Password
                </label>
                <input
                  type="password"
                  name="email-password"
                  id="email-password"
                  required
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm text-gray-900"
                  value={emailPassword}
                  onChange={(e) => setEmailPassword(e.target.value)}
                  disabled={isEmailLoading}
                />
              </div>
              <div className="flex justify-end">
                <button
                  type="submit"
                  disabled={isEmailLoading}
                  className="ml-3 inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isEmailLoading ? 'Updating...' : 'Update Email'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>

      <div className="bg-white shadow px-4 py-5 sm:rounded-lg sm:p-6">
        <div className="md:grid md:grid-cols-3 md:gap-6">
          <div className="md:col-span-1">
            <h3 className="text-lg font-medium leading-6 text-gray-900">
              Update Phone
            </h3>
            <p className="mt-1 text-sm text-gray-500">
              Change your phone number.
            </p>
          </div>
          <div className="mt-5 md:mt-0 md:col-span-2">
            <form onSubmit={handlePhoneUpdate} className="space-y-6">
              {phoneError && (
                <div className="rounded-md bg-red-50 p-4">
                  <p className="text-sm text-red-800">{phoneError}</p>
                </div>
              )}
              {phoneSuccess && (
                <div className="rounded-md bg-green-50 p-4">
                  <p className="text-sm text-green-800">{phoneSuccess}</p>
                </div>
              )}
              <div>
                <label
                  htmlFor="new-phone"
                  className="block text-sm font-medium text-gray-700"
                >
                  New Phone
                </label>
                <input
                  type="tel"
                  name="new-phone"
                  id="new-phone"
                  required
                  placeholder="+1234567890"
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm text-gray-900"
                  value={newPhone}
                  onChange={(e) => setNewPhone(e.target.value)}
                  disabled={isPhoneLoading}
                />
              </div>
              <div>
                <label
                  htmlFor="phone-password"
                  className="block text-sm font-medium text-gray-700"
                >
                  Current Password
                </label>
                <input
                  type="password"
                  name="phone-password"
                  id="phone-password"
                  required
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm text-gray-900"
                  value={phonePassword}
                  onChange={(e) => setPhonePassword(e.target.value)}
                  disabled={isPhoneLoading}
                />
              </div>
              <div className="flex justify-end">
                <button
                  type="submit"
                  disabled={isPhoneLoading}
                  className="ml-3 inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isPhoneLoading ? 'Updating...' : 'Update Phone'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
