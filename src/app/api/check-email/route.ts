import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/appwrite-server';
import { Query } from 'node-appwrite';

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json();

    if (!email) {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: 'Invalid email format' },
        { status: 400 }
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

    // Search for users with this email
    const existingUsers = await users.list([
      Query.equal('email', email)
    ]);

    if (existingUsers.total > 0) {
      const user = existingUsers.users[0];

      return NextResponse.json({
        exists: true,
        verified: user.emailVerification,
      });
    }

    return NextResponse.json({
      exists: false,
      verified: false,
    });

  } catch (error: any) {
    console.error('Error checking email:', error);

    return NextResponse.json(
      { error: 'Failed to check email availability' },
      { status: 500 }
    );
  }
}
