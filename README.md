# Mine17 Admin Panel - NextJS + Appwrite Integration

A modern admin panel built with Next.js 15, TypeScript, Tailwind CSS, and Appwrite for authentication and user management.

## Features

- ✅ Email/Password authentication with Appwrite
- ✅ Protected dashboard routes with auth guards
- ✅ User profile management
- ✅ Email update functionality
- ✅ Phone number update functionality
- ✅ Session management
- ✅ Responsive design with Tailwind CSS

## Prerequisites

- Node.js 18+ and npm
- Appwrite account (cloud or self-hosted)
- Appwrite project with Auth enabled

## Setup

### 1. Clone and Install

```bash
npm install
```

### 2. Configure Appwrite

1. Create an Appwrite project at [cloud.appwrite.io](https://cloud.appwrite.io)
2. Enable Email/Password authentication in your Appwrite project
3. Add your domain to the Appwrite platform settings
4. Copy your project details

### 3. Environment Variables

Update the `.env.local` file with your Appwrite credentials:

```env
NEXT_PUBLIC_APPWRITE_ENDPOINT=https://cloud.appwrite.io/v1
NEXT_PUBLIC_APPWRITE_PROJECT_ID=your-project-id
```

### 4. Create Test User

In your Appwrite console:
1. Go to Auth → Users
2. Create a new user with email and password
3. Use these credentials to test the application

## Development

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## File Structure

```
/src
  /lib/appwrite.ts              # Appwrite client configuration
  /context/AuthContext.tsx      # Authentication context provider
  /app
    /page.tsx                   # Home page (redirects based on auth)
    /login/page.tsx             # Login page
    /dashboard
      /layout.tsx               # Dashboard layout with auth guard
      /profile/page.tsx         # User profile page
```

## Testing Checklist

### Manual Test Flow

1. **Initial State**
   - [ ] Open app → should redirect to `/login`

2. **Login Tests**
   - [ ] Enter invalid credentials → should show error message
   - [ ] Enter valid credentials → should redirect to `/dashboard/profile`
   - [ ] Verify user email is displayed in navigation

3. **Auth Guard Tests**
   - [ ] Try accessing `/dashboard` without session → should redirect to `/login`
   - [ ] After login, accessing `/` should redirect to `/dashboard/profile`

4. **Profile Management**
   - [ ] Update email → verify success message
   - [ ] Check email in Appwrite console → should be updated
   - [ ] Update phone → verify success message
   - [ ] Check phone in Appwrite console → should be updated
   - [ ] Try updating with wrong password → should show error

5. **Logout**
   - [ ] Click logout button → should redirect to `/login`
   - [ ] Try accessing `/dashboard` → should redirect to `/login`
   - [ ] Session should be cleared

### Expected Results

| Feature | Action | Expected Result |
|---------|--------|----------------|
| Login success | Enter valid credentials | Redirect to `/dashboard/profile` |
| Login fail | Enter invalid credentials | Show error message |
| Auth guard | Access `/dashboard` without session | Redirect to `/login` |
| Update email | Submit new email + password | Email updated in Appwrite |
| Update phone | Submit new phone + password | Phone updated in Appwrite |
| Logout | Click logout button | Session cleared, redirect to `/login` |

## Build

```bash
npm run build
```

## Deployment

### Vercel (Recommended)

1. Push your code to GitHub
2. Import project to Vercel
3. Add environment variables in Vercel dashboard
4. Deploy

### Other Platforms

1. Build the project: `npm run build`
2. Configure environment variables on your platform
3. Deploy the `.next` folder

### Important: Update Appwrite Settings

After deployment, add your production domain to:
- Appwrite Console → Your Project → Settings → Platforms

## Technologies Used

- **Next.js 15** - React framework with App Router
- **TypeScript** - Type safety
- **Tailwind CSS** - Utility-first CSS framework
- **Appwrite** - Backend as a Service for authentication
- **React Context** - State management for authentication

## Security Notes

- All dashboard routes are protected with authentication guards
- Passwords are required for sensitive operations (email/phone updates)
- Sessions are managed securely through Appwrite
- Environment variables keep sensitive data secure

## Troubleshooting

### "Invalid credentials" error
- Verify your Appwrite project ID is correct
- Check that the user exists in Appwrite console
- Ensure Email/Password auth is enabled in Appwrite

### "Failed to update email/phone"
- Verify the current password is correct
- Check that the new email/phone format is valid
- Ensure the user has permission to update their profile

### Build errors
- Run `npm install` to ensure all dependencies are installed
- Check that all environment variables are set
- Verify TypeScript types are correct

## License

MIT
