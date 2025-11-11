# Firebase Setup for Personal Gallery Service

This guide will help you set up Firebase Firestore for the Personal Gallery feature.

## Prerequisites

- A Google account
- Node.js and npm installed

## Step 1: Create a Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click "Add Project"
3. Enter your project name (e.g., "recreate-studio")
4. Disable Google Analytics (optional)
5. Click "Create Project"

## Step 2: Enable Firestore Database

1. In your Firebase project, click "Firestore Database" in the left menu
2. Click "Create database"
3. Choose "Start in production mode" (we'll set up rules next)
4. Select your preferred region (choose closest to your users)
5. Click "Enable"

## Step 3: Set Up Firestore Security Rules

In the Firestore console, go to the "Rules" tab and replace the default rules with:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Personal galleries collection
    match /personal-galleries/{galleryId} {
      // Allow public read access via share token
      allow read: if resource.data.isActive == true
                  && resource.data.expiresAt.toMillis() > request.time.toMillis();

      // Only authenticated admin users can create/update/delete
      // Replace with your actual auth logic
      allow create, update, delete: if request.auth != null
                                    && request.auth.token.admin == true;
    }
  }
}
```

For development/testing, you can use more permissive rules:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /personal-galleries/{galleryId} {
      allow read, write: if true; // WARNING: Only for development!
    }
  }
}
```

## Step 4: Get Firebase Configuration

1. In Firebase Console, click the gear icon next to "Project Overview"
2. Select "Project settings"
3. Scroll down to "Your apps" section
4. Click the web icon (`</>`) to add a web app
5. Register your app with a nickname (e.g., "recreate-studio-web")
6. Copy the Firebase configuration object

## Step 5: Install Firebase Dependencies

```bash
npm install @angular/fire firebase
```

## Step 6: Update Environment Files

Update `src/environments/environment.ts` and `src/environments/environment.prod.ts` with your Firebase configuration:

```typescript
export const environment = {
  production: false,
  imageBaseUrl: 'your-image-base-url',
  firebase: {
    apiKey: "YOUR_API_KEY",
    authDomain: "your-project.firebaseapp.com",
    projectId: "your-project-id",
    storageBucket: "your-project.appspot.com",
    messagingSenderId: "YOUR_SENDER_ID",
    appId: "YOUR_APP_ID"
  }
};
```

## Step 7: Update App Configuration

Update `src/app/app.config.ts` to include Firebase providers:

```typescript
import { ApplicationConfig } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideFirebaseApp, initializeApp } from '@angular/fire/app';
import { provideFirestore, getFirestore } from '@angular/fire/firestore';
import { environment } from '../environments/environment';
import { routes } from './app.routes';

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes),
    provideFirebaseApp(() => initializeApp(environment.firebase)),
    provideFirestore(() => getFirestore())
  ]
};
```

## Step 8: Create Firestore Indexes (Optional but Recommended)

For better query performance, create composite indexes in Firestore:

1. Go to Firestore Console > Indexes tab
2. Click "Create Index"
3. Create the following indexes:

**Index 1:** For querying active galleries by creation date
- Collection: `personal-galleries`
- Fields:
  - `isActive` (Ascending)
  - `createdAt` (Descending)

**Index 2:** For querying by client name
- Collection: `personal-galleries`
- Fields:
  - `clientName` (Ascending)
  - `createdAt` (Descending)

## Step 9: Test the Setup

Create a test component or use the provided example to verify the setup:

```typescript
import { PersonalGalleryService } from './services/personal-gallery.service';

// In your component
constructor(private galleryService: PersonalGalleryService) {}

ngOnInit() {
  this.galleryService.createGallery({
    title: 'Test Gallery',
    clientName: 'Test Client',
    imageUrls: ['image1.jpg', 'image2.jpg'],
    expirationDays: 30
  }).subscribe({
    next: (response) => {
      console.log('Gallery created:', response.shareUrl);
    },
    error: (error) => {
      console.error('Error creating gallery:', error);
    }
  });
}
```

## Security Best Practices

1. **Never commit Firebase credentials** to version control
   - Add environment files to `.gitignore`
   - Use environment variables for sensitive data

2. **Set up proper authentication** for admin functions
   - Implement Firebase Authentication
   - Restrict gallery creation to authenticated admins

3. **Use Firebase Functions** for server-side operations
   - Generate share tokens server-side
   - Send email notifications
   - Schedule cleanup tasks

4. **Monitor usage** in Firebase Console
   - Set up billing alerts
   - Monitor Firestore reads/writes
   - Track storage usage

## Troubleshooting

### Error: Missing or insufficient permissions
- Check Firestore security rules
- Ensure Firebase is properly initialized
- Verify you're using the correct Firebase project

### Error: Firebase not initialized
- Verify `app.config.ts` includes Firebase providers
- Check that environment.firebase configuration is correct
- Ensure @angular/fire is installed

### Queries not returning results
- Check Firestore console to verify data exists
- Verify indexes are created for complex queries
- Check security rules allow read access

## Next Steps

- Set up Firebase Authentication for admin users
- Create admin dashboard for managing galleries
- Implement email notifications using Firebase Functions
- Set up scheduled cleanup of expired galleries
- Add Firebase Analytics for tracking gallery views
