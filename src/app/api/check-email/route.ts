import { NextRequest, NextResponse } from 'next/server';
import { checkEmailExists, checkPhoneExists } from '@/lib/validation';

export async function POST(request: NextRequest) {
  try {
    const { email, phone } = await request.json();

    // Check email if provided
    if (email) {
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

      const emailResult = await checkEmailExists(email);

      return NextResponse.json({
        exists: emailResult.exists,
        verified: emailResult.verified,
      });
    }

    // Check phone if provided
    if (phone) {
      // Check if API key is configured
      if (!process.env.APPWRITE_API_KEY_READ_ONLY) {
        console.error('APPWRITE_API_KEY_READ_ONLY is not configured');
        return NextResponse.json(
          { error: 'Server configuration error' },
          { status: 500 }
        );
      }

      const phoneExists = await checkPhoneExists(phone);

      return NextResponse.json({
        exists: phoneExists,
      });
    }

    // Neither email nor phone provided
    return NextResponse.json(
      { error: 'Email or phone is required' },
      { status: 400 }
    );

  } catch (error: any) {
    console.error('Error checking email/phone:', error);

    return NextResponse.json(
      { error: 'Failed to check availability' },
      { status: 500 }
    );
  }
}
