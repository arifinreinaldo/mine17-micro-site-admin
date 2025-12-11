/**
 * API Route: /api/get-location
 * 
 * This file should be manually copied to:
 * src/app/api/get-location/route.ts
 * 
 * To create the directory and file:
 * 1. Create folder: src/app/api/get-location/
 * 2. Create file: route.ts in that folder
 * 3. Copy the content below into that file
 */

import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    // Get client IP address
    const forwardedFor = request.headers.get('x-forwarded-for');
    const realIp = request.headers.get('x-real-ip');
    const clientIp = forwardedFor?.split(',')[0] || realIp || 'unknown';

    console.log('Detected client IP:', clientIp);

    // For local development, use ipapi.co's automatic IP detection
    const ipToCheck = clientIp === '::1' || clientIp === '127.0.0.1' || clientIp === 'unknown' || clientIp.includes('::')
      ? '' // Empty string makes ipapi.co detect the server's public IP automatically
      : clientIp;

    // Fetch location data from ipapi.co (free tier: 1000 requests/day)
    // If ipToCheck is empty, ipapi.co will detect the public IP automatically
    const apiUrl = ipToCheck 
      ? `https://ipapi.co/${ipToCheck}/json/`
      : `https://ipapi.co/json/`;
    
    console.log('Fetching location from:', apiUrl);
    
    const response = await fetch(apiUrl, {
      headers: {
        'User-Agent': 'Mine17-Pet-Manager/1.0'
      }
    });

    if (!response.ok) {
      console.error('ipapi.co response not OK:', response.status, response.statusText);
      throw new Error('Failed to fetch location data');
    }

    const data = await response.json();
    console.log('Location data received:', data);

    // Return formatted location data
    return NextResponse.json({
      country: data.country_name || 'Unknown',
      countryCode: data.country_code || '',
      region: data.region || 'Unknown',
      city: data.city || 'Unknown',
      ip: data.ip || clientIp, // Use IP from API response or fallback to detected IP
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
