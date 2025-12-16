import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/appwrite-server';
import { verifyAdminSession } from '@/lib/admin-auth';

export async function POST(request: NextRequest) {
  try {
    // Verify user is authenticated and has admin privileges
    if (!(await verifyAdminSession(request))) {
      return NextResponse.json(
        { error: 'Unauthorized - Admin access required' },
        { status: 403 }
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
    const targetUser = await users.get(userId);
    const currentPrefs = targetUser.prefs || {};

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
