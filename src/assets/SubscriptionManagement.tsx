'use client';

import { useState } from 'react';
import { useAuth } from '@/context/AuthContext';

export default function SubscriptionManagement() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const handleCancelSubscription = async () => {
    if (
      !confirm(
        'Are you sure? Your subscription will be cancelled at the end of the billing period.'
      )
    ) {
      return;
    }

    setLoading(true);
    setError('');
    setMessage('');

    try {
      const response = await fetch('/api/cancel-subscription', {
        method: 'POST',
      });

      if (!response.ok) {
        throw new Error('Failed to cancel subscription');
      }

      setMessage(
        'Subscription cancelled. You will lose access at the end of the billing period.'
      );
    } catch (err: any) {
      setError(err.message || 'Failed to cancel subscription');
    } finally {
      setLoading(false);
    }
  };

  if (user?.prefs?.membership !== 'pro') {
    return null;
  }

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">
        Subscription Management
      </h3>

      {error && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded">
          <p className="text-sm text-red-800">{error}</p>
        </div>
      )}

      {message && (
        <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded">
          <p className="text-sm text-green-800">{message}</p>
        </div>
      )}

      <p className="text-gray-600 mb-4">
        You are currently on the <strong>Pro Plan</strong>
      </p>

      <button
        onClick={handleCancelSubscription}
        disabled={loading}
        className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 disabled:opacity-50"
      >
        {loading ? 'Processing...' : 'Cancel Subscription'}
      </button>
    </div>
  );
}
