import { createAdminClient } from './appwrite-server';
import { Query } from 'node-appwrite';
import { NextRequest, NextResponse } from 'next/server';

/**
 * Check if a phone number already exists in user preferences
 * This is a server-side only function
 */
export async function checkPhoneExists(phone: string): Promise<boolean> {
  try {
    if (!phone) {
      return false;
    }

    const { users } = createAdminClient();

    // Search for users with this phone number in preferences
    // Since phone is stored in preferences, we need to fetch users and check
    const allUsers = await users.list([
      Query.limit(5000) // Check a large number of users
    ]);

    // Check if any user has this phone number in their preferences
    const userWithPhone = allUsers.users.find(
      (user) => user.prefs?.phone === phone
    );

    return !!userWithPhone;
  } catch (error) {
    console.error('Error checking phone existence:', error);
    throw error;
  }
}

/**
 * Check if an email already exists
 * This is a server-side only function
 */
export async function checkEmailExists(email: string): Promise<{ exists: boolean; verified: boolean }> {
  try {
    if (!email) {
      return { exists: false, verified: false };
    }

    const { users } = createAdminClient();

    // Search for users with this email
    const existingUsers = await users.list([
      Query.equal('email', email)
    ]);

    if (existingUsers.total > 0) {
      const user = existingUsers.users[0];
      return {
        exists: true,
        verified: user.emailVerification,
      };
    }

    return { exists: false, verified: false };
  } catch (error) {
    console.error('Error checking email existence:', error);
    throw error;
  }
}

/**
 * API Route handler for getting user location based on IP
 * This should be placed in src/app/api/get-location/route.ts
 */
export async function handleGetLocation(request: NextRequest) {
  try {
    // Get client IP address
    const forwardedFor = request.headers.get('x-forwarded-for');
    const realIp = request.headers.get('x-real-ip');
    const clientIp = forwardedFor?.split(',')[0] || realIp || 'unknown';

    // For local development, use a fallback IP (Singapore IP for testing)
    const ipToCheck = clientIp === '::1' || clientIp === '127.0.0.1' || clientIp === 'unknown'
      ? '8.8.8.8' // Fallback for local development
      : clientIp;

    // Fetch location data from ipapi.co (free tier: 1000 requests/day)
    const response = await fetch(`https://ipapi.co/${ipToCheck}/json/`, {
      headers: {
        'User-Agent': 'Mine17-Pet-Manager/1.0'
      }
    });

    if (!response.ok) {
      throw new Error('Failed to fetch location data');
    }

    const data = await response.json();

    // Return formatted location data
    return NextResponse.json({
      country: data.country_name || 'Unknown',
      countryCode: data.country_code || '',
      region: data.region || 'Unknown',
      city: data.city || 'Unknown',
      ip: clientIp,
      timezone: data.timezone || Intl.DateTimeFormat().resolvedOptions().timeZone,
      latitude: data.latitude || null,
      longitude: data.longitude || null,
      timestamp: new Date().toISOString(),
    });

  } catch (error: any) {
    console.error('Error fetching location:', error);

    // Return fallback data if API fails
    return NextResponse.json({
      country: 'Unknown',
      countryCode: '',
      region: 'Unknown',
      city: 'Unknown',
      ip: 'unknown',
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      latitude: null,
      longitude: null,
      timestamp: new Date().toISOString(),
    });
  }
}
