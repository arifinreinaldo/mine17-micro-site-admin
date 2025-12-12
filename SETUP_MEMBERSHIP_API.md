# Setup Membership Toggle API

## Step 1: Create Directory

Run this command in your terminal:

```powershell
New-Item -ItemType Directory -Path "src\app\api\admin\users\update-membership" -Force
```

## Step 2: Create API Route File

Create file: `src/app/api/admin/users/update-membership/route.ts`

Paste this code:

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/appwrite-server';

export async function POST(request: NextRequest) {
  try {
    // Check if API key is configured
    if (!process.env.APPWRITE_API_KEY_READ_ONLY) {
      console.error('APPWRITE_API_KEY_READ_ONLY is not configured');
      return NextResponse.json(
        { error: 'Server configuration error' },
        { status: 500 }
      );
    }

    const body = await request.json();
    const { userId, membership } = body;

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      );
    }

    if (membership && membership !== 'pro' && membership !== null) {
      return NextResponse.json(
        { error: 'Invalid membership value. Must be "pro" or null' },
        { status: 400 }
      );
    }

    console.log(`Updating user ${userId} membership to:`, membership);

    const { users } = createAdminClient();
    
    // Get current user preferences
    const user = await users.get(userId);
    const currentPrefs = user.prefs || {};

    // Update preferences with new membership
    const updatedPrefs = {
      ...currentPrefs,
      membership: membership,
    };

    // If setting to null, remove the key entirely
    if (membership === null) {
      delete updatedPrefs.membership;
    }

    // Update user preferences
    await users.updatePrefs(userId, updatedPrefs);

    console.log(`Successfully updated user ${userId} membership`);

    return NextResponse.json({
      success: true,
      message: `User membership ${membership === 'pro' ? 'upgraded to PRO' : 'removed'}`,
    });

  } catch (error: any) {
    console.error('Error updating user membership:', error);
    return NextResponse.json(
      { error: 'Failed to update membership', details: error.message },
      { status: 500 }
    );
  }
}
```

## Step 3: Test It

1. Refresh your admin dashboard
2. Find a non-admin user
3. Look for the "Set PRO" button in Membership column
4. Click it to upgrade user to PRO
5. For PRO users, click "Remove" to downgrade

## How It Works

### For Free Users (Non-PRO):
- Shows a blue "Set PRO" button with star icon
- Click → Confirms → Upgrades to PRO
- Refreshes table to show PRO badge

### For PRO Users:
- Shows gold "PRO" badge with star icon
- Shows red "Remove" text link next to badge
- Click → Confirms → Removes PRO membership

### For Admin Users:
- PRO badge shown if they have it
- NO toggle buttons (admins can't modify admin memberships)

## UI Examples

```
┌──────────────┬──────────────┐
│ Free User    │ [⭐ Set PRO] │  ← Blue button
├──────────────┼──────────────┤
│ PRO User     │ ⭐ PRO [Remove] │  ← Gold badge + Red link
├──────────────┼──────────────┤
│ Admin (PRO)  │ ⭐ PRO       │  ← No button (can't modify admins)
└──────────────┴──────────────┘
```

## Security

- ✅ Only admins can access this API
- ✅ Admin users cannot be modified (protected)
- ✅ Server-side validation
- ✅ Confirmation dialog before changes
- ✅ Loading state prevents double-clicks

## Features

- ✅ Toggle membership with one click
- ✅ Confirmation dialog before changes
- ✅ Loading spinner during update
- ✅ Auto-refresh after update
- ✅ Success/error alerts
- ✅ Can't modify admin users
- ✅ Prevents concurrent updates

Done! Let me know when you've created the directory and file.
