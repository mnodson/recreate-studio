# Admin Authentication Setup

This application uses Firebase Authentication with Google Sign-In, restricted to specific email addresses.

## Email Whitelist Configuration

Only Google accounts with whitelisted email addresses can access the admin panel (`/gallery-admin`).

### For Local Development

Edit `src/environments/environment.ts`:

```typescript
allowedAdminEmails: [
  'your-email@gmail.com',
  'another-admin@gmail.com'
]
```

### For Production Deployment

Edit **both** files with your authorized email addresses:

1. `src/environments/environment.production.ts`
2. `src/environments/environment.prod.ts`

```typescript
allowedAdminEmails: [
  'your-email@gmail.com',
  'another-admin@gmail.com'
]
```

## How It Works

1. **Sign In Attempt**: User clicks "Sign in with Google" on `/login`
2. **Email Check**: After successful Google authentication, the system checks if the user's email is in the `allowedAdminEmails` array
3. **Authorization**:
   - ✅ **Authorized**: User can access the admin panel
   - ❌ **Unauthorized**: User is signed out immediately with error message "This account is not authorized to access the admin panel"

## Firebase Console Setup

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project (`recreate-1eaa9`)
3. Navigate to **Authentication** → **Sign-in method**
4. Enable **Google** sign-in provider
5. Add authorized domains:
   - `localhost` (for local development)
   - `mnodson.github.io` (for production)

## Security Notes

- Email comparison is **case-insensitive** (emails are converted to lowercase)
- Unauthorized users are automatically signed out
- Auth state is checked on every page load
- The whitelist is compiled into the application bundle (client-side only)

## Testing

1. **Test with authorized account**:
   - Add your Gmail address to `allowedAdminEmails`
   - Navigate to `/login`
   - Sign in with Google
   - Should redirect to `/gallery-admin`

2. **Test with unauthorized account**:
   - Sign in with a Google account NOT in the whitelist
   - Should see error: "This account is not authorized to access the admin panel"
   - Should be signed out automatically

## Adding/Removing Admin Users

To add or remove admin access:

1. Update the `allowedAdminEmails` array in the environment files
2. Rebuild the application: `npm run build`
3. Deploy the updated build

**Note**: Changes only take effect after rebuilding and redeploying the application.
