# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Mine17 Admin Panel is a Next.js 15 application for pet management with Appwrite backend. Users register with OTP-based email verification and device fingerprinting, manage pet profiles with image compression, and generate QR codes for external pet sharing. The application enforces a strict 1-pet-per-user limit.

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

**Note**: `APPWRITE_API_KEY_READ_ONLY` is used for server-side API routes (e.g., `/api/check-email`).

## Architecture

### Authentication Flow

The application supports both OTP-based and traditional password authentication:

1. **OTP Login**: Users enter email → receive OTP → verify OTP → session created
2. **Password Login**: Users enter email + password → session created
3. **Registration**: Email submission → OTP sent → verify OTP → complete profile (name, password, device fingerprint) → session created
4. **Security**: Device fingerprinting (`@fingerprintjs/fingerprintjs`) tracks user devices in preferences
5. **Session Management**: Appwrite handles sessions; existing sessions are cleared before new registration to prevent multi-account issues

**Key Implementation Details** (`src/context/AuthContext.tsx`):
- `sendOTP(email)` / `verifyOTP(userId, otp)` for OTP login flow
- `login(email, password)` for password-based login
- `registerWithOTP(email)` / `completeRegistration(userId, otp, data)` for registration flow
- Registration stores: name, password, device fingerprint, T&C acceptance timestamp
- **Critical**: Use `token.userId` from OTP response for verification, not the generated ID

### Appwrite Services

Centralized configuration in `src/lib/appwrite.ts`:

- `account` - Authentication and user management
- `databases` - Pet data storage (CRUD operations)
- `storage` - Pet image storage with compression
- Environment-based IDs for database, collection, and storage bucket

### Pet Management System

**Business Rules**:
- **Hard limit**: 1 pet per user (enforced in UI at `src/app/dashboard/pets/page.tsx:150`)
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
/dashboard                  → Protected layout with auth guard
  /profile                  → User profile management (email/phone updates)
  /pets                     → Pet list view with QR code generation
  /pets/add                 → Add new pet (disabled if limit reached)
  /pets/edit/[id]           → Edit existing pet
```

### Protected Routes

Dashboard layout (`src/app/dashboard/layout.tsx`) implements client-side auth guard:
- Redirects unauthenticated users to `/login`
- Shows loading state during auth check (uses `RouteLoading` component from `src/app/RouteLoading.tsx`)
- Responsive navigation bar with:
  - Logo and app name
  - Navigation links (Pets, Profile)
  - User avatar with tooltip showing email
  - Logout button
  - Mobile menu support

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

## Appwrite Setup Requirements

1. **Authentication**: Enable Email/Password provider
2. **Database**: Create database with:
   - Collection for pets with schema matching `Pet` interface
   - User permissions: CRUD on own documents (userId-based)
3. **Storage**: Create bucket for pet images
   - Max file size: 500KB (enforced client-side)
   - Permissions: User can upload/delete own images
4. **Platform Settings**: Add frontend domain to allowed platforms

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

Change `MAX_PETS` constant at `src/app/dashboard/pets/page.tsx:150` (currently set to 1)

### Changing Image Compression Settings

Modify `compressionOptions` in `src/lib/imageCompression.ts`:
- `maxSizeMB`: Target file size
- `maxWidthOrHeight`: Max dimension
- `fileType`: Output format

## Security Considerations

- Device fingerprinting tracks registration devices (stored in user preferences)
- OTP verification prevents unauthorized access
- T&C acceptance timestamp logged during registration
- Session cleanup prevents multi-account issues
- Image validation before upload (type, size checks)
- User can only access own pets (userId-based queries)
- Storage cascade deletion prevents orphaned files
