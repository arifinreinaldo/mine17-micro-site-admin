import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/appwrite-server';
import { Query } from 'node-appwrite';
import { cookies } from 'next/headers';

export async function GET(request: NextRequest) {
  try {
    // Get session from cookies to verify admin role
    const cookieStore = await cookies();
    const session = cookieStore.get('a_session_' + process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID);
    
    if (!session) {
      return NextResponse.json(
        { error: 'Unauthorized - No session found' },
        { status: 401 }
      );
    }

    // Check if API key is configured
    if (!process.env.APPWRITE_API_KEY_READ_ONLY) {
      console.error('APPWRITE_API_KEY_READ_ONLY is not configured');
      return NextResponse.json(
        { error: 'Server configuration error' },
        { status: 500 }
      );
    }

    const { users } = createAdminClient();
    
    // Fetch all users (with pagination support)
    const allUsers = await users.list([
      Query.limit(5000) // Adjust based on your needs
    ]);

    // Extract and aggregate location data
    const usersWithLocation = allUsers.users.map(user => ({
      id: user.$id,
      name: user.name || 'N/A',
      email: user.email,
      phone: user.prefs?.phone || 'N/A',
      registrationLocation: user.prefs?.registrationLocation || null,
      lastLoginLocation: user.prefs?.lastLoginLocation || null,
      registeredAt: user.prefs?.registeredAt || user.$createdAt,
    }));

    // Calculate statistics
    const totalUsers = usersWithLocation.length;
    
    // Count unique countries from registration
    const countriesMap = new Map<string, number>();
    const citiesMap = new Map<string, { city: string; country: string; count: number }>();
    
    usersWithLocation.forEach(user => {
      if (user.registrationLocation?.country) {
        const country = user.registrationLocation.country;
        countriesMap.set(country, (countriesMap.get(country) || 0) + 1);
        
        if (user.registrationLocation.city) {
          const cityKey = `${user.registrationLocation.city}, ${country}`;
          const existing = citiesMap.get(cityKey);
          if (existing) {
            existing.count++;
          } else {
            citiesMap.set(cityKey, {
              city: user.registrationLocation.city,
              country: country,
              count: 1
            });
          }
        }
      }
    });

    // Convert to arrays and sort
    const countries = Array.from(countriesMap.entries())
      .map(([country, count]) => ({
        country,
        userCount: count,
        percentage: ((count / totalUsers) * 100).toFixed(1)
      }))
      .sort((a, b) => b.userCount - a.userCount);

    const cities = Array.from(citiesMap.values())
      .sort((a, b) => b.count - a.count)
      .slice(0, 10); // Top 10 cities

    // Get recent registrations (last 10)
    const recentUsers = usersWithLocation
      .sort((a, b) => new Date(b.registeredAt).getTime() - new Date(a.registeredAt).getTime())
      .slice(0, 10);

    return NextResponse.json({
      summary: {
        totalUsers,
        totalCountries: countries.length,
        totalCities: citiesMap.size,
      },
      countries,
      cities,
      recentUsers,
      allUsers: usersWithLocation, // Full user list for table
    });

  } catch (error: any) {
    console.error('Error fetching admin user data:', error);
    return NextResponse.json(
      { error: 'Failed to fetch user data' },
      { status: 500 }
    );
  }
}
