import { Environment } from './environment.d';

// This file is for development environment
export const environment: Environment = {
  production: false,
  // Local development: serve images from local HTTP server
  // Run: python3 -m http.server 8080 in your images directory
  imageBaseUrl: 'http://localhost:8080',

  // Firebase configuration for development
  // Replace these values with your Firebase project credentials
  firebase: {
    apiKey: 'AIzaSyCanHNk_UA53UirZqON3uhB1BiIIfB54mE',
    authDomain: 'recreate-1eaa9.firebaseapp.com',
    projectId: 'recreate-1eaa9',
    storageBucket: 'recreate-1eaa9.firebasestorage.app',
    messagingSenderId: '948065494837',
    appId: '1:948065494837:web:ce2128571f5f12dee6ce7c',
    measurementId: "G-PQZX43E27N"
  },

  // GitHub configuration for image uploads
  // Generate a Personal Access Token at: https://github.com/settings/tokens
  // Required permissions: Contents (Read and Write)
  // IMPORTANT: For local development, replace 'YOUR_GITHUB_PAT_HERE' with your actual PAT
  // Never commit your actual token to the repository
  github: {
    owner: 'mnodson',
    repo: 'recreate-studio-images',
    branch: 'main',
    token: '' // Replace with your GitHub PAT for local development
  },

  // Admin access control - only these email addresses can access the admin panel
  allowedAdminEmails: [
    'mark.nodson@gmail.com' // Mark
    ,'barnthson@gmail.com' // Laura
  ]
};
