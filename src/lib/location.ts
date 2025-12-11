/**
 * Location data interface
 */
export interface LocationData {
  country: string;
  countryCode: string;
  region: string;
  city: string;
  ip: string;
  timezone: string;
  latitude: number | null;
  longitude: number | null;
  timestamp: string;
}

/**
 * Fetch user's location based on IP address
 * This function calls our API endpoint which uses ipapi.co for geolocation
 */
export async function getUserLocation(): Promise<LocationData | null> {
  try {
    const response = await fetch('/api/get-location');
    
    if (!response.ok) {
      throw new Error('Failed to fetch location');
    }

    const data: LocationData = await response.json();
    return data;
  } catch (error) {
    console.error('Error getting user location:', error);
    
    // Return fallback location data
    return {
      country: 'Unknown',
      countryCode: '',
      region: 'Unknown',
      city: 'Unknown',
      ip: 'unknown',
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      latitude: null,
      longitude: null,
      timestamp: new Date().toISOString(),
    };
  }
}
