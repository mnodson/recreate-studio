export interface Environment {
  production: boolean;
  imageBaseUrl: string;
  firebase: {
    apiKey: string;
    authDomain: string;
    projectId: string;
    storageBucket: string;
    messagingSenderId: string;
    appId: string;
    measurementId: string;
  };
  github?: {
    owner: string;
    repo: string;
    branch: string;
    token: string;
  };
  allowedAdminEmails: string[];
}
