import { NextRequest } from 'next/server';
import { Client, Account } from 'node-appwrite';
import { cookies } from 'next/headers';

/**
 * Verifies that the request has a valid session and the user has admin privileges
 * @returns User object if authorized, null if unauthorized
 */
export async function verifyAdminSession(request?: NextRequest) {
  try {
    // Get session cookie - Appwrite uses pattern a_session_{PROJECT_ID}
    const cookieStore = await cookies();
    const allCookies = cookieStore.getAll();

    console.log('[Admin Auth] All cookies:', allCookies.map(c => c.name));

    // Find the Appwrite session cookie
    const sessionCookie = allCookies.find(cookie =>
      cookie.name.startsWith('a_session_')
    );

    if (!sessionCookie) {
      console.warn('[Admin Auth] No session cookie found');
      return null;
    }

    console.log('[Admin Auth] Found session cookie:', sessionCookie.name);

    // Create client with user's session
    const client = new Client()
      .setEndpoint(process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT || 'https://cloud.appwrite.io/v1')
      .setProject(process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID || '');

    // Set the session from cookie
    client.setSession(sessionCookie.value);

    // Get user account
    const account = new Account(client);
    const user = await account.get();

    console.log('[Admin Auth] User fetched:', user.email, 'Labels:', user.labels);

    // Verify user has admin label
    if (!user.labels || !user.labels.includes('admin')) {
      console.warn(`[Admin Auth] User ${user.email} attempted access without admin label. Current labels:`, user.labels);
      return null;
    }

    console.log('[Admin Auth] ✅ Admin verified:', user.email);
    return user;
  } catch (error: any) {
    console.error('Admin session verification failed:', error.message);
    return null;
  }
}
