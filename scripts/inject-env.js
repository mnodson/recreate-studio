#!/usr/bin/env node

/**
 * Injects environment variables into the production environment file
 * This script replaces placeholders with actual values from environment variables
 * Usage: GITHUB_UPLOAD_TOKEN=your_token node scripts/inject-env.js
 */

const fs = require('fs');
const path = require('path');

const ENV_FILE = path.join(__dirname, '..', 'src', 'environments', 'environment.production.ts');

// Read the environment file
let content = fs.readFileSync(ENV_FILE, 'utf8');

// Get the GitHub token from environment variable
const githubToken = process.env.GITHUB_UPLOAD_TOKEN;

if (!githubToken) {
  console.error('Error: GITHUB_UPLOAD_TOKEN environment variable is not set');
  process.exit(1);
}

// Replace the placeholder with the actual token
content = content.replace('${GITHUB_UPLOAD_TOKEN}', githubToken);

// Write the updated content back to the file
fs.writeFileSync(ENV_FILE, content, 'utf8');

console.log('✓ Environment variables injected successfully');
