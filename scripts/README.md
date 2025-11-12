# Build Scripts

## inject-env.js

Injects environment variables into the production environment file during build time.

### Purpose

This script replaces placeholder tokens in `src/environments/environment.production.ts` with actual values from environment variables. This allows sensitive credentials (like GitHub Personal Access Tokens) to be stored as GitHub secrets instead of being hardcoded in the repository.

### Usage

The script is automatically run during GitHub Actions deployment:

```bash
GITHUB_UPLOAD_TOKEN=your_token node scripts/inject-env.js
```

### How it works

1. The production environment file contains a placeholder: `'${GITHUB_UPLOAD_TOKEN}'`
2. During GitHub Actions build, the UPLOAD_PAT secret is passed as an environment variable
3. The script replaces the placeholder with the actual token value
4. The Angular app is built with the injected token

### GitHub Secret Setup

1. Go to your repository Settings → Secrets and variables → Actions
2. Create a new repository secret named `UPLOAD_PAT`
3. Set the value to your GitHub Personal Access Token
4. The token is automatically injected during deployment

### Local Development

For local development, manually replace `'YOUR_GITHUB_PAT_HERE'` in `src/environments/environment.ts` with your actual GitHub PAT. Never commit your real token to the repository.
