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
  github: {
    owner: 'mnodson',
    repo: 'recreate-studio-images',
    branch: 'main',
    token: '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' // Replace with your GitHub PAT
  }
};
