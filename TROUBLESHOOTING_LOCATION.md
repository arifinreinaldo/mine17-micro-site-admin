# Troubleshooting Location Tracking

## Changes Applied

### 1. Country Picker Styling Fixed ✅
- Removed visible border/background from select tag
- Now shows only the flag icon, cleaner look
- Dropdown still works when clicking on flag

### 2. Added Debug Logging for Location
- Login location updates now log to browser console
- API route logs IP detection and API calls
- Check browser console for detailed info

## Testing Steps

### Test 1: Verify API Endpoint
1. Open browser and go to: `http://localhost:3000/api/get-location`
2. You should see JSON like:
```json
{
  "country": "Singapore",
  "city": "Singapore",
  "region": "Central Singapore",
  "ip": "xxx.xxx.xxx.xxx",
  "timezone": "Asia/Singapore",
  "timestamp": "2024-12-11T04:10:00.000Z"
}
```

**If you see "Unknown":**
- Check server console for error messages
- Verify internet connection
- Try visiting: https://ipapi.co/json/ directly in browser

### Test 2: Test Login Location Update
1. **Log out** of your account
2. **Open browser DevTools** (F12) → Console tab
3. **Log back in** (password or OTP)
4. **Watch console** for these messages:
   - "Login location data: {...}"
   - "Login location updated successfully"
5. **Go to Profile page**
6. **Check "Last Login" card** - should show current location

**If Still Showing "Unknown":**

Check browser console for errors:
- ❌ "Failed to update login location:" - API fetch failed
- ❌ "Location API response not OK: 429" - Rate limit hit
- ❌ "Location API response not OK: 500" - ipapi.co error

### Test 3: Test Registration Location
1. **Register a new test account**
2. **Open browser console** before completing registration
3. **Complete OTP verification**
4. **Check console** for location logs
5. **Go to Profile page**
6. **Verify both cards show**:
   - Registration Location (your location)
   - Last Login (same as registration for new user)

## Common Issues & Solutions

### Issue 1: Location shows "Unknown"

**Cause:** ipapi.co API request failed or returned empty data

**Solutions:**
1. Check server/browser console logs
2. Test API directly: `curl https://ipapi.co/json/`
3. Check if you hit rate limit (1000 requests/day)
4. Try different IP geolocation service

### Issue 2: Timestamp is correct but city/country is "Unknown"

**Cause:** API returned successful response but with empty location fields

**Check:**
- Browser console: Look for "Location data received:"
- If data shows `country_name: null` → IP is not geolocatable
- If on VPN → VPN IP might not be geolocatable

**Fix:**
- Disconnect VPN and retry
- Or use alternative IP detection service

### Issue 3: Location not updating on login

**Cause:** Location update code not executing

**Check:**
1. Console logs - any errors?
2. Network tab - is `/api/get-location` being called?
3. Appwrite preferences - is `lastLoginLocation` field present?

**Debug:**
```javascript
// In browser console after login:
// Check if location data exists
const user = await account.get();
console.log('User prefs:', user.prefs);
```

### Issue 4: Rate Limit (429 Error)

**Cause:** Exceeded ipapi.co free tier limit (1000 requests/day)

**Solutions:**
1. Wait 24 hours for limit reset
2. Switch to alternative service (ip-api.com)
3. Implement request caching
4. Upgrade to paid plan

## Alternative IP Geolocation Services

If ipapi.co is not working, you can switch to:

### Option 1: ip-api.com (Free)
```typescript
const response = await fetch(`http://ip-api.com/json/${ipToCheck}`);
// Fields: country, countryCode, region, city, timezone, lat, lon
```

### Option 2: ipgeolocation.io (Free tier)
```typescript
const response = await fetch(`https://api.ipgeolocation.io/ipgeo?apiKey=YOUR_KEY`);
```

## Checking Logs

### Browser Console:
- F12 → Console tab
- Look for messages starting with:
  - "Login location data:"
  - "OTP login location data:"
  - "Location data received:"

### Server Console (Terminal):
- Look for messages:
  - "Detected client IP: xxx"
  - "Fetching location from: https://..."
  - "Location data received: {...}"

## Manual Test Script

Run this in browser console after logging in:

```javascript
// Test location API
fetch('/api/get-location')
  .then(r => r.json())
  .then(data => console.log('Location test:', data))
  .catch(err => console.error('Location test failed:', err));

// Check current user preferences
account.get()
  .then(user => {
    console.log('Registration Location:', user.prefs.registrationLocation);
    console.log('Last Login Location:', user.prefs.lastLoginLocation);
  });
```

## Need More Help?

1. Share browser console logs
2. Share server console logs
3. Share response from: `http://localhost:3000/api/get-location`
4. Confirm: Are you using VPN?
