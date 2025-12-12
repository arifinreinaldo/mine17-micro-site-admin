# Quick Setup: Location API Route

## ⚠️ MANUAL STEP REQUIRED

To complete the location tracking implementation, you need to create the API route file manually.

## Steps:

### Option 1: Using File Explorer (Windows)
1. Navigate to: `src\app\api\`
2. Create new folder named: `get-location`
3. Inside `get-location` folder, create file: `route.ts`
4. Open `src\lib\get-location-api.ts` in a text editor
5. Copy ALL content from that file
6. Paste into the new `route.ts` file
7. Save the file

### Option 2: Using PowerShell (Windows)
```powershell
# Run in project root directory
New-Item -ItemType Directory -Path "src\app\api\get-location" -Force
Copy-Item "src\lib\get-location-api.ts" "src\app\api\get-location\route.ts"
```

### Option 3: Using Terminal (Mac/Linux)
```bash
# Run in project root directory
mkdir -p src/app/api/get-location
cp src/lib/get-location-api.ts src/app/api/get-location/route.ts
```

## Verify Setup:

After creating the file, your directory structure should look like:
```
src/
  app/
    api/
      check-email/
        route.ts
      get-location/         ← NEW
        route.ts            ← NEW (contains the API handler)
```

## Test:

1. Run the development server: `npm run dev`
2. Visit: http://localhost:3000/api/get-location
3. You should see JSON with location data
4. Register a new user to test location capture

## That's it!

Once this file is created, the location tracking will work automatically for:
- ✅ New user registrations
- ✅ Password-based logins  
- ✅ OTP-based logins
- ✅ Profile page displays registration & last login locations
