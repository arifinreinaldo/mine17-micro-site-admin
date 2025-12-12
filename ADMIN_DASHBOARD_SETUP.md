# Admin Dashboard Setup Instructions

## Step 1: Create Required Directories

Run these commands in your terminal (from project root):

```powershell
# Windows PowerShell
New-Item -ItemType Directory -Path "src\hooks" -Force
New-Item -ItemType Directory -Path "src\app\admin\analytics" -Force
New-Item -ItemType Directory -Path "src\app\api\admin\users" -Force
```

OR

```bash
# Mac/Linux
mkdir -p src/hooks
mkdir -p src/app/admin/analytics
mkdir -p src/app/api/admin/users
```

## Step 2: Create Files

I've prepared 4 files that need to be created. After creating directories, I'll provide the file contents.

### Files to Create:
1. `src/hooks/useAdminGuard.ts` - Admin access control hook
2. `src/app/admin/layout.tsx` - Admin layout with protection
3. `src/app/api/admin/users/route.ts` - API to fetch user analytics
4. `src/app/admin/analytics/page.tsx` - Main admin dashboard page

## Step 3: Set Your Account as Admin

1. Go to **Appwrite Console**
2. Navigate to **Auth → Users**
3. Find your user account
4. Click **"Update Prefs"** or **"Preferences"**
5. Add this JSON:
   ```json
   {
     "role": "admin"
   }
   ```
6. Save changes

## Step 4: Test Admin Access

1. Log out from your app
2. Log back in
3. You should now see **"Admin"** menu item in navigation
4. Click it to access `/admin/analytics`

---

## What You'll See:

### Admin Dashboard Features:
- ✅ Total Users count
- ✅ Total Countries count
- ✅ Total Cities count
- ✅ Top 5 Countries bar chart
- ✅ Top 5 Cities list
- ✅ User table with:
  - Name & Email
  - Phone
  - Registration Location (city, country, date)
  - Last Login Location (city, country, timestamp)
  - Registration date
- ✅ Search by name/email
- ✅ Filter by country
- ✅ Responsive design

---

## Security Features:
- ✅ Protected routes (non-admins redirected)
- ✅ Server-side data fetching with API key
- ✅ Client-side role verification
- ✅ Hidden from regular users

---

**Ready for file contents?** Let me know when directories are created and I'll provide the file code!
