import { Environment } from './environment.d';

export const environment: Environment = {
  production: true,
  imageBaseUrl: 'https://raw.githubusercontent.com/mnodson/recreate-studio-images/main',

  // Firebase configuration for production
  firebase: {
    apiKey: 'AIzaSyCanHNk_UA53UirZqON3uhB1BiIIfB54mE',
    authDomain: 'recreate-1eaa9.firebaseapp.com',
    projectId: 'recreate-1eaa9',
    storageBucket: 'recreate-1eaa9.firebasestorage.app',
    messagingSenderId: '948065494837',
    appId: '1:948065494837:web:ce2128571f5f12dee6ce7c',
    measurementId: "G-PQZX43E27N"
  },

  // GitHub configuration for production
  github: {
    owner: 'mnodson',
    repo: 'recreate-studio-images',
    branch: 'main',
    token: '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' // Use environment variable in production
  }
};
