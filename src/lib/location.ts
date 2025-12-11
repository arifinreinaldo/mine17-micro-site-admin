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
 * This function calls ipapi.co directly from the client to get accurate location
 */
export async function getUserLocation(): Promise<LocationData | null> {
  try {
    // Call ipapi.co directly from client browser to get accurate IP
    const response = await fetch('https://ipapi.co/json/', {
      headers: {
        'User-Agent': 'Mine17-Pet-Manager/1.0'
      }
    });
    
    if (!response.ok) {
      throw new Error('Failed to fetch location');
    }

    const data = await response.json();
    
    // Format the data to match our interface
    const locationData: LocationData = {
      country: data.country_name || 'Unknown',
      countryCode: data.country_code || '',
      region: data.region || 'Unknown',
      city: data.city || 'Unknown',
      ip: data.ip || 'unknown',
      timezone: data.timezone || Intl.DateTimeFormat().resolvedOptions().timeZone,
      latitude: data.latitude || null,
      longitude: data.longitude || null,
      timestamp: new Date().toISOString(),
    };
    
    console.log('Client location detected:', locationData);
    return locationData;
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
