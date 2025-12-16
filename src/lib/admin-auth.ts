import { NextRequest } from 'next/server';
import { Client, Account } from 'node-appwrite';
import { cookies } from 'next/headers';

/**
 * Verifies that the request has a valid session and the user has admin privileges
 * @returns User object if authorized, null if unauthorized
 */
export async function verifyAdminSession(request?: NextRequest) {
  try {
    let sessionValue: string | null = null;
    let sessionName: string | null = null;

    // Try method 1: Read from cookies() helper
    const cookieStore = await cookies();
    const allCookies = cookieStore.getAll();

    console.log('[Admin Auth] All cookies from cookies():', allCookies.map(c => c.name));

    const cookieFromStore = allCookies.find(cookie =>
      cookie.name.startsWith('a_session_')
    );

    if (cookieFromStore) {
      sessionValue = cookieFromStore.value;
      sessionName = cookieFromStore.name;
      console.log('[Admin Auth] Found via cookies():', sessionName);
    }

    // Try method 2: Read from request headers (fallback)
    if (!sessionValue && request) {
      const cookieHeader = request.headers.get('cookie');
      console.log('[Admin Auth] Cookie header:', cookieHeader?.substring(0, 100) + '...');

      if (cookieHeader) {
        const cookies = cookieHeader.split(';').map(c => c.trim());
        const sessionCookie = cookies.find(c => c.startsWith('a_session_'));

        if (sessionCookie) {
          const [name, value] = sessionCookie.split('=');
          sessionValue = value;
          sessionName = name;
          console.log('[Admin Auth] Found via header:', name);
        }
      }
    }

    if (!sessionValue) {
      console.warn('[Admin Auth] No session cookie found in either method');
      return null;
    }

    console.log('[Admin Auth] Using session:', sessionName);

    // Create client with user's session
    const client = new Client()
      .setEndpoint(process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT || 'https://cloud.appwrite.io/v1')
      .setProject(process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID || '');

    // Set the session from cookie
    client.setSession(sessionValue);

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
