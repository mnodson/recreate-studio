# GitHub Pages Deployment Guide

This guide will help you set up automatic deployment of your RecreateStudio website to GitHub Pages.

## 📋 Prerequisites

1. A GitHub account
2. A GitHub repository for this project
3. The repository should be public (or GitHub Pro for private repos)

## 🚀 Setup Instructions

### 1. Push Your Code to GitHub

```bash
# Initialize git repository (if not already done)
git init

# Add all files
git add .

# Create initial commit
git commit -m "Initial commit: RecreateStudio photography portfolio"

# Add your GitHub repository as origin
git remote add origin https://github.com/[YOUR_USERNAME]/recreate-studio-website.git

# Push to GitHub
git push -u origin main
```

### 2. Enable GitHub Pages

1. Go to your repository on GitHub
2. Click on **Settings** tab
3. Scroll down to **Pages** section in the left sidebar
4. Under **Source**, select **GitHub Actions**
5. GitHub will automatically detect the workflow file and start building

### 3. Repository Settings

Make sure your repository name matches the base href in the build command:
- If your repo is named `recreate-studio-website`, the workflow is ready to use
- If you use a different name, update the `base-href` in `package.json`:
  ```json
  "build:gh-pages": "ng build --base-href /YOUR-REPO-NAME/"
  ```

### 4. Automatic Deployment

Once set up, the website will automatically deploy when you:
- Push commits to the `main` branch
- Merge pull requests into `main`

## 🌐 Access Your Website

After successful deployment, your website will be available at:
```
https://[YOUR_USERNAME].github.io/recreate-studio-website/
```

## 🔧 Troubleshooting

### Common Issues:

1. **404 Page Not Found**: Check that the base-href matches your repository name
2. **Images Not Loading**: Ensure image paths start with `/` and are in the `public/` directory
3. **Build Failures**: Check the Actions tab in your GitHub repository for error details

### Manual Build Test:

Test the build locally before pushing:
```bash
npm run build:gh-pages
```

## 📝 Workflow Details

The GitHub Actions workflow (`/.github/workflows/deploy.yml`) will:
1. Install Node.js and dependencies
2. Build the Angular application with the correct base href
3. Deploy to GitHub Pages
4. Make the site available at your GitHub Pages URL

## 🔄 Updates

To update your live website:
1. Make changes to your code
2. Commit and push to the `main` branch
3. GitHub Actions will automatically rebuild and redeploy

The deployment typically takes 2-5 minutes to complete.