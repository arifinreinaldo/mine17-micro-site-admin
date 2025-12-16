'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { MessageWithOwner, MessageStatus } from '@/types/message';

export default function MissingPetPage() {
  const { user, logout } = useAuth();
  const router = useRouter();
  const [messages, setMessages] = useState<MessageWithOwner[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<MessageStatus | 'all'>('all');
  const [selectedMessage, setSelectedMessage] = useState<MessageWithOwner | null>(null);

  useEffect(() => {
    console.log('[Missing Page] Current user:', user);
    console.log('[Missing Page] User labels:', user?.labels);
    fetchMessages();
  }, []);

  const fetchMessages = async () => {
    try {
      setLoading(true);

      // Get session token from cookies to pass in header
      const sessionCookie = document.cookie
        .split('; ')
        .find(row => row.startsWith('a_session_'));
      const sessionToken = sessionCookie?.split('=')[1];

      console.log('[fetchMessages] Session token:', sessionToken ? 'Found' : 'Not found');

      const response = await fetch('/api/admin/messages', {
        credentials: 'include', // Explicitly include cookies
        headers: sessionToken ? {
          'X-Appwrite-Session': sessionToken
        } : {}
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || 'Failed to fetch messages');
      }
      
      const data = await response.json();
      setMessages(data.messages || []);
    } catch (err: any) {
      setError(err.message || 'Failed to load messages');
      console.error('Error fetching messages:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (messageId: string, newStatus: MessageStatus) => {
    try {
      const response = await fetch('/api/admin/messages', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messageId, status: newStatus }),
        credentials: 'include' // Explicitly include cookies
      });

      if (!response.ok) {
        throw new Error('Failed to update status');
      }

      // Refresh messages
      await fetchMessages();
    } catch (err: any) {
      console.error('Error updating status:', err);
      alert('Failed to update status');
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
      router.push('/login');
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  const getStatusColor = (status: MessageStatus) => {
    switch (status) {
      case 'pending':
        return 'bg-amber-100 text-amber-800 border-amber-300';
      case 'contacted':
        return 'bg-blue-100 text-blue-800 border-blue-300';
      case 'resolved':
        return 'bg-green-100 text-green-800 border-green-300';
      case 'closed':
        return 'bg-gray-100 text-gray-800 border-gray-300';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  const formatRelativeTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
  };

  // Filter messages
  const filteredMessages = messages.filter(msg => {
    const matchesSearch = searchTerm === '' || 
      msg.petName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      msg.finderName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (msg.petOwner?.name || '').toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || msg.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-50 via-white to-purple-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading messages...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50">
      {/* Navigation Bar */}
      <nav className="sticky top-0 z-50 px-4 pt-4">
        <div className="max-w-7xl mx-auto bg-white/70 backdrop-blur-lg rounded-2xl shadow-md border border-white/20">
          <div className="px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between h-16 items-center">
              <div className="flex items-center">
                <div className="w-10 h-10 bg-gradient-to-br from-indigo-600 to-indigo-700 rounded-xl flex items-center justify-center shadow-md">
                  <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" />
                    <circle cx="5" cy="5" r="1.5" />
                    <circle cx="15" cy="5" r="1.5" />
                    <circle cx="10" cy="3" r="1.5" />
                  </svg>
                </div>
                <h1 className="ml-3 text-xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                  Admin Panel
                </h1>
              </div>

              <div className="flex items-center gap-4">
                <Link
                  href="/admin/analytics"
                  className="text-gray-700 hover:bg-white/50 hover:text-gray-900 inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold transition-all duration-200 rounded-full"
                >
                  Analytics
                </Link>
                <Link
                  href="/admin/missing"
                  className="bg-white text-indigo-600 shadow-sm inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold transition-all duration-200 rounded-full"
                >
                  Missing Pet
                </Link>

                <div className="flex items-center gap-3 pl-4 border-l border-gray-200">
                  <div className="group relative">
                    <div className="w-8 h-8 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold text-sm shadow-md">
                      {user?.name?.charAt(0).toUpperCase() || 'A'}
                    </div>
                    <div className="absolute right-0 top-10 bg-gray-900 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
                      {user?.email}
                    </div>
                  </div>
                  <button
                    onClick={handleLogout}
                    className="text-gray-700 hover:text-red-600 font-medium text-sm transition-colors"
                  >
                    Logout
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-6">
          <h2 className="text-3xl font-bold text-gray-900">Missing Pet Reports</h2>
          <p className="text-gray-600 mt-1">Manage reports from people who found missing pets</p>
        </div>

        {/* Filters */}
        <div className="bg-white/70 backdrop-blur-lg rounded-2xl shadow-md border border-white/20 p-4 mb-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <input
                type="text"
                placeholder="Search by pet name, finder, or owner..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-600 focus:border-transparent"
              />
            </div>
            <div className="sm:w-48">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as any)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-600 focus:border-transparent"
              >
                <option value="all">All Status</option>
                <option value="pending">Pending</option>
                <option value="contacted">Contacted</option>
                <option value="resolved">Resolved</option>
                <option value="closed">Closed</option>
              </select>
            </div>
            <button
              onClick={fetchMessages}
              className="px-6 py-2 bg-indigo-600 text-white font-semibold rounded-lg hover:bg-indigo-700 transition-colors"
            >
              Refresh
            </button>
          </div>
        </div>

        {/* Error State */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-6">
            <p className="text-red-800">{error}</p>
          </div>
        )}

        {/* Empty State */}
        {!loading && filteredMessages.length === 0 && (
          <div className="bg-white/70 backdrop-blur-lg rounded-2xl shadow-md border border-white/20 p-12 text-center">
            <div className="mx-auto w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mb-4">
              <svg className="w-10 h-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No Reports Found</h3>
            <p className="text-gray-600">
              {searchTerm || statusFilter !== 'all' ? 'Try adjusting your filters' : 'No missing pet reports yet'}
            </p>
          </div>
        )}

        {/* Messages List */}
        {filteredMessages.length > 0 && (
          <div className="space-y-4">
            {filteredMessages.map((msg) => (
              <div key={msg.$id} className="bg-white/70 backdrop-blur-lg rounded-2xl shadow-md border border-white/20 p-6 hover:shadow-lg transition-shadow">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                  {/* Pet Image */}
                  <div className="lg:col-span-2">
                    {msg.petDetails?.imageUrl ? (
                      <img
                        src={msg.petDetails.imageUrl}
                        alt={msg.petName}
                        className="w-full h-32 object-cover rounded-lg"
                      />
                    ) : (
                      <div className="w-full h-32 bg-gray-200 rounded-lg flex items-center justify-center">
                        <svg className="w-12 h-12 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" />
                        </svg>
                      </div>
                    )}
                  </div>

                  {/* Pet & Message Info */}
                  <div className="lg:col-span-4">
                    <h3 className="text-lg font-bold text-gray-900 mb-1">{msg.petName}</h3>
                    {msg.petDetails && (
                      <p className="text-sm text-gray-600 mb-3">
                        {msg.petDetails.breed} • {msg.petDetails.petType}
                      </p>
                    )}
                    <p className="text-sm text-gray-700 line-clamp-2 mb-2">{msg.message}</p>
                    <button
                      onClick={() => setSelectedMessage(msg)}
                      className="text-sm text-indigo-600 hover:text-indigo-800 font-medium"
                    >
                      Read full message →
                    </button>
                  </div>

                  {/* Owner Info */}
                  <div className="lg:col-span-3">
                    <p className="text-xs font-semibold text-gray-500 uppercase mb-2">Pet Owner</p>
                    {msg.petOwner ? (
                      <div className="space-y-1">
                        <p className="font-semibold text-gray-900">{msg.petOwner.name}</p>
                        <a href={`mailto:${msg.petOwner.email}`} className="text-sm text-blue-600 hover:underline block">
                          {msg.petOwner.email}
                        </a>
                        <a href={`tel:${msg.petOwner.phone}`} className="text-sm text-blue-600 hover:underline block">
                          📞 {msg.petOwner.phone}
                        </a>
                      </div>
                    ) : (
                      <p className="text-sm text-gray-500">Owner not found</p>
                    )}
                  </div>

                  {/* Finder Info & Status */}
                  <div className="lg:col-span-3">
                    <p className="text-xs font-semibold text-gray-500 uppercase mb-2">Finder</p>
                    <div className="space-y-1 mb-3">
                      <p className="font-semibold text-gray-900">{msg.finderName}</p>
                      <a href={`tel:${msg.finderPhone}`} className="text-sm text-blue-600 hover:underline block">
                        📞 {msg.finderPhone}
                      </a>
                    </div>
                    
                    <div className="space-y-2">
                      <select
                        value={msg.status}
                        onChange={(e) => handleStatusUpdate(msg.$id!, e.target.value as MessageStatus)}
                        className={`w-full px-3 py-1.5 text-sm font-semibold rounded-lg border ${getStatusColor(msg.status)}`}
                      >
                        <option value="pending">Pending</option>
                        <option value="contacted">Contacted</option>
                        <option value="resolved">Resolved</option>
                        <option value="closed">Closed</option>
                      </select>
                      <p className="text-xs text-gray-500">
                        {formatRelativeTime(msg.reportedAt)}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* Message Detail Modal */}
      {selectedMessage && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={() => setSelectedMessage(null)}>
          <div className="bg-white rounded-2xl p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="flex justify-between items-start mb-4">
              <h3 className="text-2xl font-bold text-gray-900">{selectedMessage.petName}</h3>
              <button
                onClick={() => setSelectedMessage(null)}
                className="text-gray-400 hover:text-gray-600"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {selectedMessage.petDetails?.imageUrl && (
              <img
                src={selectedMessage.petDetails.imageUrl}
                alt={selectedMessage.petName}
                className="w-full h-64 object-cover rounded-lg mb-4"
              />
            )}

            <div className="space-y-4">
              <div>
                <p className="text-sm font-semibold text-gray-500 uppercase mb-1">Full Message</p>
                <p className="text-gray-800">{selectedMessage.message}</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-semibold text-gray-500 uppercase mb-1">Pet Owner</p>
                  {selectedMessage.petOwner ? (
                    <div>
                      <p className="font-semibold">{selectedMessage.petOwner.name}</p>
                      <a href={`mailto:${selectedMessage.petOwner.email}`} className="text-sm text-blue-600 hover:underline">
                        {selectedMessage.petOwner.email}
                      </a>
                      <br />
                      <a href={`tel:${selectedMessage.petOwner.phone}`} className="text-sm text-blue-600 hover:underline">
                        {selectedMessage.petOwner.phone}
                      </a>
                    </div>
                  ) : (
                    <p className="text-sm text-gray-500">Not found</p>
                  )}
                </div>

                <div>
                  <p className="text-sm font-semibold text-gray-500 uppercase mb-1">Finder</p>
                  <p className="font-semibold">{selectedMessage.finderName}</p>
                  <a href={`tel:${selectedMessage.finderPhone}`} className="text-sm text-blue-600 hover:underline">
                    {selectedMessage.finderPhone}
                  </a>
                </div>
              </div>

              <div>
                <p className="text-sm font-semibold text-gray-500 uppercase mb-1">Status</p>
                <span className={`inline-block px-3 py-1 text-sm font-semibold rounded-lg border ${getStatusColor(selectedMessage.status)}`}>
                  {selectedMessage.status.charAt(0).toUpperCase() + selectedMessage.status.slice(1)}
                </span>
              </div>

              <div>
                <p className="text-sm font-semibold text-gray-500 uppercase mb-1">Reported</p>
                <p className="text-gray-800">
                  {new Date(selectedMessage.reportedAt).toLocaleString()}
                </p>
              </div>
            </div>

            <button
              onClick={() => setSelectedMessage(null)}
              className="w-full mt-6 px-6 py-3 bg-indigo-600 text-white font-semibold rounded-xl hover:bg-indigo-700 transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
