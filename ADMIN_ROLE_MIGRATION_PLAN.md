# Admin Role Migration Plan

## Current State (Using `prefs.role`)

### Where Admin Role is Currently Used:

1. **Admin Guard Hook** (`src/hooks/useAdminGuard.ts`)
   - Checks: `user.prefs?.role === 'admin'`
   - Redirects non-admins to `/dashboard/pets`

2. **Admin Analytics Page** (`src/app/admin/analytics/page.tsx`)
   - Displays admin badge if `user.prefs?.role === 'admin'`

3. **Dashboard Layout** (`src/app/dashboard/layout.tsx`)
   - Shows "Admin" menu item if `user.prefs?.role === 'admin'`

4. **Admin API Route** (`src/app/api/admin/users/route.ts`)
   - Checks `user.prefs?.role === 'admin'` in backend

---

## Problem with Current Approach

### Why `prefs.role` is Not Ideal:

❌ **User-Editable**: Users can modify their own preferences via API  
❌ **Not Secure**: No server-side enforcement at Appwrite level  
❌ **No Built-in Permissions**: Can't use Appwrite's role-based access control  
❌ **Manual Checking**: Every route needs custom validation  

---

## Proposed Solution: Use Appwrite Labels

### ✅ Better Approach: `labels` Array

Appwrite provides a `labels` field for users that is:
- ✅ **Admin-only editable** (users can't change their own labels)
- ✅ **Built-in feature** (no custom implementation needed)
- ✅ **Secure** (only API keys with proper permissions can modify)
- ✅ **Scalable** (can add multiple roles/tags)

### How It Works:

```typescript
// Current (prefs)
user.prefs = { role: 'admin' }

// Proposed (labels)
user.labels = ['admin']
```

---

## Migration Strategy

### Phase 1: Update Backend Code ✅

#### Files to Update:

1. **`src/hooks/useAdminGuard.ts`**
   ```typescript
   // Before
   const isAdmin = user.prefs?.role === 'admin';
   
   // After
   const isAdmin = user.labels?.includes('admin');
   ```

2. **`src/app/admin/analytics/page.tsx`**
   ```typescript
   // Before
   isAdmin: user.prefs?.role === 'admin',
   
   // After
   isAdmin: user.labels?.includes('admin'),
   ```

3. **`src/app/dashboard/layout.tsx`**
   ```typescript
   // Before
   const isAdmin = user?.prefs?.role === 'admin';
   
   // After
   const isAdmin = user?.labels?.includes('admin');
   ```

4. **`src/app/api/admin/users/route.ts`**
   ```typescript
   // Before
   isAdmin: user.prefs?.role === 'admin',
   
   // After
   isAdmin: user.labels?.includes('admin'),
   ```

### Phase 2: Update Existing Admin Users 🔧

#### Option A: Via Appwrite Console (Manual)
1. Go to **Appwrite Console** → **Auth** → **Users**
2. Select admin user
3. Scroll to **"Labels"** section
4. Click **"Add Label"**
5. Enter: `admin`
6. Remove old `prefs.role` if desired

#### Option B: Via Migration Script (Automated)
Create a one-time migration script:

```typescript
// scripts/migrate-admin-role.ts
import { Client, Users } from 'node-appwrite';

const client = new Client()
  .setEndpoint(process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT!)
  .setProject(process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID!)
  .setKey(process.env.APPWRITE_API_KEY_READ_ONLY!);

const users = new Users(client);

async function migrateAdminRoles() {
  try {
    // Get all users
    const allUsers = await users.list();
    
    let migrated = 0;
    
    for (const user of allUsers.users) {
      // Check if user has old admin role in prefs
      if (user.prefs?.role === 'admin') {
        // Add 'admin' label
        const currentLabels = user.labels || [];
        if (!currentLabels.includes('admin')) {
          await users.updateLabels(user.$id, [...currentLabels, 'admin']);
          console.log(`✅ Migrated user: ${user.email}`);
          migrated++;
        }
      }
    }
    
    console.log(`\n✅ Migration complete! ${migrated} users updated.`);
  } catch (error) {
    console.error('❌ Migration failed:', error);
  }
}

migrateAdminRoles();
```

Run with:
```bash
npx ts-node scripts/migrate-admin-role.ts
```

### Phase 3: Testing 🧪

#### Test Checklist:

- [ ] Admin user can access `/admin/analytics`
- [ ] Non-admin redirected from admin routes
- [ ] "Admin" menu shows for admins only
- [ ] Admin badge shows in analytics table
- [ ] API routes validate admin properly
- [ ] Free users cannot access admin features

### Phase 4: Cleanup (Optional) 🧹

After confirming labels work:

1. Remove old `prefs.role` from all users (optional)
2. Update documentation
3. Remove migration script

---

## Implementation Steps

### Step 1: Code Changes (5 minutes)

I'll update these 4 files:
1. `src/hooks/useAdminGuard.ts`
2. `src/app/admin/analytics/page.tsx`
3. `src/app/dashboard/layout.tsx`
4. `src/app/api/admin/users/route.ts`

### Step 2: Set Admin Label (2 minutes)

**Via Appwrite Console:**
1. Go to your Appwrite Console
2. Auth → Users → Select your admin user
3. Add label: `admin`

**Or use API:**
```bash
curl -X PATCH \
  'https://cloud.appwrite.io/v1/users/YOUR_USER_ID/labels' \
  -H 'X-Appwrite-Project: YOUR_PROJECT_ID' \
  -H 'X-Appwrite-Key: YOUR_API_KEY' \
  -H 'Content-Type: application/json' \
  -d '{"labels": ["admin"]}'
```

### Step 3: Test (3 minutes)

1. Logout and login again
2. Check admin menu appears
3. Access `/admin/analytics`
4. Test with non-admin account

### Step 4: Verify (2 minutes)

Check browser console:
```javascript
console.log(user.labels); // Should show ['admin']
```

---

## Benefits After Migration

✅ **Security**: Users can't promote themselves  
✅ **Scalability**: Can add more roles (e.g., `moderator`, `editor`)  
✅ **Cleaner**: Using Appwrite's built-in feature  
✅ **Future-proof**: Compatible with Appwrite RBAC  

---

## Backward Compatibility (During Transition)

To support both old and new systems temporarily:

```typescript
const isAdmin = user.labels?.includes('admin') || user.prefs?.role === 'admin';
```

This allows gradual migration without breaking existing admin access.

---

## Timeline

| Phase | Duration | Action |
|-------|----------|--------|
| 1. Code Update | 5 min | Update 4 files |
| 2. Set Admin Label | 2 min | Add label via console |
| 3. Test | 3 min | Verify functionality |
| 4. Deploy | 1 min | Push to production |
| **Total** | **~15 min** | Complete migration |

---

## Rollback Plan

If issues occur:

1. Revert code changes (git revert)
2. Admin labels remain (harmless)
3. Old `prefs.role` still works as fallback

---

## Decision Required

**Should I proceed with the migration?**

- ✅ **Yes** → I'll update the code now (takes 5 minutes)
- ⏸️ **Not Yet** → We can keep using `prefs.role` for now
- 📋 **Let me decide** → Review the plan and tell me when ready

**What would you like to do?**
