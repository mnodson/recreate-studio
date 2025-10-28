# GitHub Pages Deployment Troubleshooting

## 🔧 "The site configured at this address does not contain the requested file" Error

This error typically occurs due to Angular SPA routing issues with GitHub Pages. Here are the solutions I've implemented:

### ✅ **Solutions Applied**

#### 1. **Hash Location Strategy**
- **File**: `src/app/app.config.ts`
- **Fix**: Added `withHashLocation()` to router configuration
- **Result**: URLs now use hash routing (e.g., `/#/about` instead of `/about`)

#### 2. **GitHub Pages SPA Support**
- **Files**: `src/index.html` and `public/404.html`
- **Fix**: Added redirect scripts to handle direct URL access
- **Result**: Direct links to pages now work correctly

#### 3. **Base Href Configuration**
- **File**: `package.json`
- **Fix**: Set to `/[YOUR-ACTUAL-REPO-NAME]/`
- **Important**: Must match your GitHub repository name exactly

### 🛠️ **Steps to Fix Your Deployment**

#### Step 1: Update Repository Name in Build Command
Replace `[YOUR-ACTUAL-REPO-NAME]` in `package.json`:

```json
"build:gh-pages": "ng build --base-href /your-actual-repo-name/"
```

Examples:
- If repo is `recreate-studio`: `--base-href /recreate-studio/`
- If repo is `photography-portfolio`: `--base-href /photography-portfolio/`

#### Step 2: Rebuild and Deploy
```bash
npm run build:gh-pages
git add .
git commit -m "Fix GitHub Pages routing"
git push origin main
```

#### Step 3: Verify GitHub Pages Settings
1. Go to repository Settings → Pages
2. Ensure Source is set to "GitHub Actions"
3. Wait 2-5 minutes for deployment

### 🔍 **How to Check Your Repository Name**
1. Look at your GitHub repository URL: `github.com/username/REPO-NAME`
2. The `REPO-NAME` part should match your base-href exactly

### 🌐 **Expected URLs After Fix**
- **Homepage**: `https://username.github.io/repo-name/#/home`
- **About**: `https://username.github.io/repo-name/#/about`
- **Gallery**: `https://username.github.io/repo-name/#/gallery`
- **Packages**: `https://username.github.io/repo-name/#/packages`

### 📋 **Other Common Issues**

#### Build Fails in GitHub Actions
- Check Actions tab for error details
- Ensure Node.js version compatibility
- Verify all dependencies are in package.json

#### "Browser" Folder Issue (Fixed)
- **Problem**: Angular builds to `dist/project-name/browser/` 
- **Solution**: GitHub Actions uploads from `./dist/recreate-studio-website/browser`
- **Result**: GitHub Pages gets files in the correct root structure

#### Asset Path Issue (Fixed)
- **Problem**: Assets (JS, CSS, images) requested from root instead of subdirectory
- **Solution**: Added `--deploy-url /recreate-studio/` to build command
- **Result**: All bundled assets now correctly prefixed with repository path

#### Component Image Paths (Fixed)
- **Problem**: Images in components used absolute paths (`/images/`) bypassing base href
- **Solution**: Changed to relative paths (`images/`) in component templates
- **Result**: Images now respect base href and load from correct subdirectory

#### Images Not Loading (All Fixed)
- ✅ Image paths changed to relative (`images/`) to respect base href
- ✅ Images are in `public/images/` directory 
- ✅ Build process includes assets with correct prefixes

#### Custom Domain Issues
- Add CNAME file to `public/` directory
- Update base-href to `/` for custom domains

### ✅ **What's Fixed**
- ✅ Hash location strategy for SPA compatibility
- ✅ 404.html redirect handling
- ✅ Index.html SPA support script
- ✅ Build configuration for GitHub Pages
- ✅ Asset path handling

Your RecreateStudio website should now deploy successfully to GitHub Pages! 🎉