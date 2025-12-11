# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Mine17 Admin Panel is a Next.js 15 application for pet management with Appwrite backend. Users register with OTP-based email verification and device fingerprinting, manage pet profiles with image compression, and generate QR codes for external pet sharing. The application enforces a strict 1-pet-per-user limit for free tier.

## Development Commands

```bash
# Development server
npm run dev

# Production build
npm run build

# Start production server
npm start

# Lint code
npm run lint
```

## Environment Configuration

Required environment variables (see `.env.example`):

```env
NEXT_PUBLIC_APP_NAME=Mine17 Pets
NEXT_PUBLIC_APPWRITE_ENDPOINT=https://cloud.appwrite.io/v1
NEXT_PUBLIC_APPWRITE_PROJECT_ID=your-project-id
NEXT_PUBLIC_APPWRITE_DATABASE_ID=your-database-id
NEXT_PUBLIC_APPWRITE_PETS_COLLECTION_ID=pets
NEXT_PUBLIC_APPWRITE_STORAGE_BUCKET_ID=pet-images
NEXT_PUBLIC_EXTERNAL_URL=https://aibo-pets.vercel.app/?param=
APPWRITE_API_KEY_READ_ONLY=your-api-key-here
```

Copy `.env.example` to `.env.local` and configure with your Appwrite project details.

**Note**: `APPWRITE_API_KEY_READ_ONLY` is used for server-side API routes (e.g., `/api/check-email`, `/api/admin/users`).

## Architecture

### Authentication Flow

The application supports both OTP-based and traditional password authentication:

1. **OTP Login**: Users enter email → receive OTP → verify OTP → session created
2. **Password Login**: Users enter email + password → session created
3. **Registration**: Email submission → OTP sent → verify OTP → complete profile (name, password, device fingerprint) → session created
4. **Security**: Device fingerprinting (`@fingerprintjs/fingerprintjs`) tracks user devices in preferences
5. **Location Tracking**: Registration and login locations are captured using ipapi.co and stored in user preferences for admin analytics
6. **Session Management**: Appwrite handles sessions; existing sessions are cleared before new registration to prevent multi-account issues

**Key Implementation Details** (`src/context/AuthContext.tsx`):
- `sendOTP(email)` / `verifyOTP(userId, otp)` for OTP login flow
- `login(email, password)` for password-based login
- `registerWithOTP(email)` / `completeRegistration(userId, otp, data)` for registration flow
- Registration stores: name, password, device fingerprint, T&C acceptance timestamp, registration location
- Login updates: last login location (for analytics, not shown in user profile)
- **Critical**: Use `token.userId` from OTP response for verification, not the generated ID

### Appwrite Services

Centralized configuration in `src/lib/appwrite.ts` (client-side) and `src/lib/appwrite-server.ts` (server-side):

- `account` - Authentication and user management
- `databases` - Pet data storage (CRUD operations)
- `storage` - Pet image storage with compression
- Environment-based IDs for database, collection, and storage bucket

**Server-side Admin Client** (`src/lib/appwrite-server.ts`):
- Uses `node-appwrite` SDK with API key authentication
- Only for API routes, never in client components
- Provides admin access to Users API

### Pet Management System

**Business Rules**:
- **Hard limit**: 1 pet per user for free tier (enforced in UI at `src/app/dashboard/pets/page.tsx:172`)
- Images compressed to max 500KB using `browser-image-compression`
- QR codes generated for external pet sharing (links to separate public site)

**Pet Data Model** (`src/types/pet.ts`):
```typescript
interface Pet {
  $id?: string;
  petName: string;
  breed: string;
  age?: number;
  gender?: string;
  color?: string;
  weight?: string;
  description?: string;
  personality?: string[];
  medicalInfo?: string;
  petType: 'cat' | 'dog' | 'bird' | 'other';
  userId: string;
  imageUrls?: string[];
  microchip?: string;
}
```

**Image Handling** (`src/lib/imageCompression.ts`):
- Max file size before compression: 10MB
- Target compression: 500KB, 1920x1920px, JPEG format
- Files under 500KB skip compression
- Uses Web Workers for performance

**Storage Management**:
- Images stored in Appwrite Storage
- Deletion: Pet document deletion triggers cascade deletion of associated images from storage
- File ID extraction from Appwrite URLs: `/files/{fileId}/view` pattern

### Admin Panel System

**Admin Access Control** (`src/hooks/useAdminGuard.ts`):
- Users with `admin` label in Appwrite can access admin routes
- Non-admin users are redirected to `/dashboard/pets`
- Unauthenticated users are redirected to `/login`

**Admin Features** (`/admin/analytics`):
- View all registered users with location data
- Analytics: total users, countries, cities
- User table with search functionality
- Display registration and last login locations
- Membership status indicators (free vs pro)

**Admin API Routes**:
- `/api/admin/users` - Fetch all users with analytics data
- `/api/admin/users/update-membership` - Update user membership tier

### Routing Structure

```
/                           → Landing page with features/pricing (or redirects to /dashboard if authenticated)
/login                      → OTP or password-based login page
/register                   → OTP-based registration with device fingerprinting
/legal                      → Legal pages directory
  /privacy                  → Privacy policy
  /terms                    → Terms of service
  /cookies                  → Cookie policy
/api/check-email            → Server-side email verification endpoint
/api/admin/users            → Admin-only: fetch all users with analytics
/api/admin/users/update-membership → Admin-only: update user membership
/dashboard                  → Protected layout with auth guard
  /profile                  → User profile management (email/phone updates)
  /pets                     → Pet list view with QR code generation
  /pets/add                 → Add new pet (disabled if limit reached)
  /pets/edit/[id]           → Edit existing pet
/admin                      → Admin-only layout with admin guard
  /analytics                → Admin analytics dashboard
```

### Protected Routes

**Dashboard Layout** (`src/app/dashboard/layout.tsx`):
- Implements client-side auth guard
- Redirects unauthenticated users to `/login`
- Shows loading state during auth check
- Responsive navigation bar with:
  - Logo and app name
  - Navigation links (Pets, Profile, Admin)
  - User avatar with tooltip showing email
  - Logout button
  - Mobile menu support
  - Admin link visible only to users with `admin` label

**Admin Layout** (`src/app/admin/layout.tsx`):
- Uses `useAdminGuard` hook for access control
- Redirects non-admin users to `/dashboard/pets`
- Shows loading state during admin verification

## Key Components

### AuthContext (`src/context/AuthContext.tsx`)

Global authentication state provider:
- `user`: Current user object or null
- `loading`: Initial auth check status
- `login(email, password)`: Traditional email/password login
- `sendOTP(email)`: Send OTP for login (returns userId)
- `verifyOTP(userId, otp)`: Verify OTP and create session
- `registerWithOTP(email)`: Initiate registration with OTP
- `completeRegistration(userId, otp, data)`: Complete registration after OTP verification
- `logout()`: Clear session and redirect
- `getUser()`: Fetch current user data

### Fingerprinting (`src/lib/fingerprint.ts`)

Generates unique device identifiers for security tracking:
- Uses FingerprintJS library
- Fallback to timestamp+random if fingerprinting fails
- Stored in user preferences during registration

### Location Tracking

**Registration Location** (`src/context/AuthContext.tsx:completeRegistration`):
- Captured during registration and stored in user preferences
- Used for admin analytics only

**Login Location** (`src/context/AuthContext.tsx:login`, `verifyOTP`):
- Updated on every login (both password and OTP)
- Stored in `lastLoginLocation` preference
- Not displayed in user profile (admin analytics only)

**Location API** (`src/app/api/get-location/route.ts`):
- Server-side endpoint using ipapi.co
- Returns country, city, region, IP, timezone, coordinates

## Appwrite Setup Requirements

1. **Authentication**: Enable Email/Password provider
2. **Database**: Create database with:
   - Collection for pets with schema matching `Pet` interface
   - User permissions: CRUD on own documents (userId-based)
3. **Storage**: Create bucket for pet images
   - Max file size: 500KB (enforced client-side)
   - Permissions: User can upload/delete own images
4. **Platform Settings**: Add frontend domain to allowed platforms
5. **Admin Users**: Add `admin` label to users who need admin access

## Development Notes

- **App Router**: Uses Next.js 15 App Router (not Pages Router)
- **React Version**: Uses React 19 with latest features
- **Client Components**: Most components use `'use client'` directive for interactivity
- **TypeScript**: Strict typing throughout, especially for Appwrite models
- **Tailwind CSS**: Utility-first styling with custom color variables
- **Error Handling**: User-facing errors with detailed console logging
- **Server/Client Split**: Uses both client-side (`src/lib/appwrite.ts`) and server-side (`src/lib/appwrite-server.ts`) Appwrite configurations

## Common Tasks

### Adding a New Pet Field

1. Update `Pet` and `PetFormData` interfaces in `src/types/pet.ts`
2. Add form field in `src/app/dashboard/pets/add/page.tsx`
3. Update edit page: `src/app/dashboard/pets/edit/[id]/page.tsx`
4. Display in list view: `src/app/dashboard/pets/page.tsx`
5. Update Appwrite collection schema to match

### Modifying Pet Limit

Change `MAX_PETS` constant at `src/app/dashboard/pets/page.tsx:172` (currently set to 1)

### Changing Image Compression Settings

Modify `compressionOptions` in `src/lib/imageCompression.ts`:
- `maxSizeMB`: Target file size
- `maxWidthOrHeight`: Max dimension
- `fileType`: Output format

### Adding Admin Features

1. Add `admin` label to users in Appwrite console
2. Admin routes automatically visible in navigation (`src/app/dashboard/layout.tsx:105`)
3. Use `useAdminGuard` hook for new admin pages
4. Create API routes in `/api/admin/` for admin operations

## Security Considerations

- Device fingerprinting tracks registration devices (stored in user preferences)
- OTP verification prevents unauthorized access
- T&C acceptance timestamp logged during registration
- Session cleanup prevents multi-account issues
- Image validation before upload (type, size checks)
- User can only access own pets (userId-based queries)
- Storage cascade deletion prevents orphaned files
- Admin routes protected by label-based access control
- Location data collected for analytics (admin-only visibility)
