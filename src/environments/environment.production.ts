import { Environment } from './environment.d';

// This file is for production environment
export const environment: Environment = {
  production: true,
  // Production: Replace [YOUR_USERNAME] with your GitHub username
  // Replace [REPO_NAME] with your images repository name (e.g., 'recreate-studio-images')
  imageBaseUrl: 'https://mnodson.github.io/recreate-studio-images',

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
  // Token will be injected during build from environment variable
  github: {
    owner: 'mnodson',
    repo: 'recreate-studio-images',
    branch: 'main',
    token: '${GITHUB_UPLOAD_TOKEN}' // Will be replaced during build
  }
};
