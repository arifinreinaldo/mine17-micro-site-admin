import { NextRequest } from 'next/server';
import { Client, Account, Models } from 'node-appwrite';
import { cookies } from 'next/headers';

export interface AdminVerificationResult {
  user: Models.User<Models.Preferences>;
  sessionValue?: string | null;
  jwtValue?: string | null;
}

/**
 * Verifies that the request has a valid session and the user has admin privileges
 * @returns User object if authorized, null if unauthorized
 */
export async function verifyAdminSession(request?: NextRequest): Promise<AdminVerificationResult | null> {
  try {
    let sessionValue: string | null = null;
    let sessionName: string | null = null;
    let jwtValue: string | null = null;

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

    // Try method 2: Read from custom header (passed from client)
    if (!sessionValue && request) {
      const customSessionHeader = request.headers.get('X-Appwrite-Session');
      console.log('[Admin Auth] Custom session header:', customSessionHeader ? 'Found' : 'Not found');

      if (customSessionHeader) {
        sessionValue = customSessionHeader;
        sessionName = 'a_session_custom';
        console.log('[Admin Auth] Found via custom header');
      }
    }

    // Try method 3: Read JWT header fallback (for browsers blocking cookies)
    if (!sessionValue && request) {
      const jwtHeader = request.headers.get('X-Appwrite-JWT');
      console.log('[Admin Auth] JWT header:', jwtHeader ? 'Found' : 'Not found');

      if (jwtHeader) {
        jwtValue = jwtHeader;
        console.log('[Admin Auth] Using JWT header fallback');
      }
    }

    // Try method 3: Read from cookie header (fallback)
    if (!sessionValue && !jwtValue && request) {
      const cookieHeader = request.headers.get('cookie');
      console.log('[Admin Auth] Cookie header:', cookieHeader?.substring(0, 100) + '...');

      if (cookieHeader) {
        const cookies = cookieHeader.split(';').map(c => c.trim());
        const sessionCookie = cookies.find(c => c.startsWith('a_session_'));

        if (sessionCookie) {
          const [name, value] = sessionCookie.split('=');
          sessionValue = value;
          sessionName = name;
          console.log('[Admin Auth] Found via cookie header:', name);
        }
      }
    }

    if (!sessionValue && !jwtValue) {
      console.warn('[Admin Auth] No session or JWT found in either method');
      return null;
    }

    if (sessionValue) {
      console.log('[Admin Auth] Using session:', sessionName);
    }
    if (jwtValue) {
      console.log('[Admin Auth] Using JWT fallback');
    }

    // Create client with user's session
    const client = new Client()
      .setEndpoint(process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT || 'https://cloud.appwrite.io/v1')
      .setProject(process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID || '');

    if (sessionValue) {
      client.setSession(sessionValue);
    } else if (jwtValue) {
      client.setJWT(jwtValue);
    }

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
    return { user, sessionValue, jwtValue };
  } catch (error: any) {
    console.error('Admin session verification failed:', error.message);
    return null;
  }
}
