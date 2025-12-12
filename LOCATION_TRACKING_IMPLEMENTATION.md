# Location Tracking Implementation

## Overview
IP-based geolocation tracking has been implemented to capture user registration and login locations.

## What Was Implemented

### 1. Location Data Collection
- **Registration Location**: Captured once during user registration
- **Last Login Location**: Updated on every successful login (both password and OTP)

### 2. Data Stored in User Preferences
```typescript
{
  registrationLocation: {
    country: "Singapore",
    countryCode: "SG",
    region: "Central Singapore",
    city: "Singapore",
    ip: "103.x.x.x",
    timezone: "Asia/Singapore",
    latitude: 1.2897,
    longitude: 103.8501,
    timestamp: "2024-12-11T03:41:03.655Z"
  },
  lastLoginLocation: {
    country: "Singapore",
    countryCode: "SG",
    region: "Central Singapore",
    city: "Singapore",
    ip: "103.x.x.x",
    timezone: "Asia/Singapore",
    latitude: 1.2897,
    longitude: 103.8501,
    timestamp: "2024-12-11T10:30:00.000Z"
  }
}
```

### 3. Files Modified

#### Created:
- `src/lib/location.ts` - Location fetching utility
- `src/lib/get-location-api.ts` - API route template (needs manual setup)

#### Modified:
- `src/context/AuthContext.tsx` - Added location tracking to login, OTP verification, and registration
- `src/app/register/page.tsx` - Captures location during registration
- `src/app/dashboard/profile/page.tsx` - Displays registration and last login locations
- `src/lib/validation.ts` - Added location API handler

### 4. Geolocation Service
- **Provider**: ipapi.co (free tier)
- **Limit**: 1,000 requests/day
- **Fallback**: Returns "Unknown" if API fails
- **Local Development**: Uses fallback IP (8.8.8.8) for testing

## Manual Setup Required

### ⚠️ IMPORTANT: Create API Route File

You need to manually create the get-location API route:

1. **Create directory**: `src/app/api/get-location/`
2. **Create file**: `route.ts` in that directory
3. **Copy content from**: `src/lib/get-location-api.ts`

**Full path**: `src/app/api/get-location/route.ts`

**Or run this command in terminal:**
```powershell
# Windows PowerShell
New-Item -ItemType Directory -Path "src\app\api\get-location" -Force
Copy-Item "src\lib\get-location-api.ts" "src\app\api\get-location\route.ts"
```

```bash
# Linux/Mac
mkdir -p src/app/api/get-location
cp src/lib/get-location-api.ts src/app/api/get-location/route.ts
```

## Features

### Registration
- ✅ Captures location when user completes registration (after OTP verification)
- ✅ Stores in `registrationLocation` field in user preferences
- ✅ Also sets `lastLoginLocation` to registration location

### Login
- ✅ Updates `lastLoginLocation` on password-based login
- ✅ Updates `lastLoginLocation` on OTP-based login
- ✅ Non-blocking: Login succeeds even if location fetch fails

### Profile Display
- ✅ Shows registration location with date
- ✅ Shows last login location with date and time
- ✅ Beautiful card-based UI with icons
- ✅ Formatted timestamps (localized)

## Privacy & Compliance

### Data Collected:
- Country, Region, City
- IP Address
- Timezone
- Geographic coordinates (latitude/longitude)
- Timestamp

### Recommendations:
1. ✅ Update Terms & Conditions to mention location collection
2. ✅ Update Privacy Policy to explain data usage
3. ✅ Add notice during registration about location tracking
4. ✅ Consider adding option to view/clear location history

### Sample Privacy Notice:
```
"We collect your IP address and approximate location (country, city) 
during registration and login for security and analytics purposes. 
This information is stored in your account preferences."
```

## API Usage & Limits

### ipapi.co Free Tier:
- **Requests**: 1,000/day
- **Rate Limit**: 45 requests/minute
- **HTTPS**: Supported
- **Fallback**: Built-in for failures

### Monitoring Usage:
Check API status at: https://ipapi.co/api/

### Alternative Providers (if needed):
- **ip-api.com**: 45 requests/minute, free
- **ipgeolocation.io**: 1,000 requests/day, free tier
- **ipstack.com**: 100 requests/month, free tier

## Testing

### Local Development:
- Uses fallback IP (8.8.8.8) since localhost IPs are not geolocatable
- Change fallback in `src/lib/get-location-api.ts` for different test locations

### Production:
- Will use actual client IP from headers
- Supports both `x-forwarded-for` and `x-real-ip` headers

## Viewing Location Data

### User Profile:
Navigate to `/dashboard/profile` to see:
- Registration location card
- Last login location card
- Formatted dates and times

### Admin Access (Future Enhancement):
Consider adding admin dashboard to view all users' locations for:
- Geographic distribution analysis
- Security monitoring (unusual login locations)
- Regional user statistics

## Error Handling

### Graceful Degradation:
- If ipapi.co is down → Returns "Unknown" location
- If fetch fails → Login/registration still succeeds
- All errors logged to console for debugging

### Fallback Data:
```typescript
{
  country: 'Unknown',
  city: 'Unknown',
  region: 'Unknown',
  ip: 'unknown',
  timezone: 'Browser timezone',
  timestamp: 'Current time'
}
```

## Future Enhancements

### Potential Additions:
1. **Login History**: Store array of all login locations
2. **Security Alerts**: Notify user of login from new location
3. **Location Analytics**: Dashboard showing user distribution map
4. **IP Blocking**: Block specific IPs or countries
5. **Device Tracking**: Combine with fingerprint for full audit trail

## Troubleshooting

### Location Not Captured:
1. Check if `/api/get-location` route exists
2. Verify ipapi.co is accessible (not blocked by firewall)
3. Check browser console for errors
4. Verify user preferences are being saved

### Wrong Location Displayed:
1. Verify IP address detection is working
2. Check if VPN/proxy is affecting IP
3. Test with different network connection
4. Validate ipapi.co response in browser

### API Rate Limit Hit:
1. Monitor usage at ipapi.co dashboard
2. Implement caching for repeated requests
3. Consider upgrading to paid plan
4. Switch to alternative provider

## Support

For issues or questions:
1. Check browser console for errors
2. Verify API route is properly created
3. Test API endpoint directly: `GET /api/get-location`
4. Review Appwrite user preferences structure
