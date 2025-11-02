# GitHub Pages Image Hosting Strategy

## Overview
This guide explains how to host photography images separately using GitHub Pages while keeping the main application repository lean.

## Recommended Approach: Separate Images Repository

### Why This Approach?
- Keeps main application repository small and fast
- Independent version control for images
- Easy to manage large image files
- Can update images without redeploying the application
- Free hosting via GitHub Pages

## Setup Instructions

### Step 1: Create a New GitHub Repository for Images

1. Go to GitHub and create a new repository:
   - Name: `recreate-studio-images` (or any name you prefer)
   - Visibility: Public (required for free GitHub Pages)
   - Initialize with README: Yes

2. Clone the repository locally:
```bash
cd /home/mnodson/development/recreate-studio
git clone https://github.com/[YOUR_USERNAME]/recreate-studio-images.git
cd recreate-studio-images
```

### Step 2: Set Up Directory Structure

Create organized folders for your photography categories:

```
recreate-studio-images/
├── README.md
├── index.html (optional - directory listing)
├── weddings/
│   ├── wedding-1/
│   │   ├── hero.jpg
│   │   ├── ceremony-1.jpg
│   │   └── reception-1.jpg
│   └── wedding-2/
│       └── ...
├── portraits/
│   ├── family-1/
│   └── individual-1/
├── fashion/
│   ├── editorial-1/
│   └── commercial-1/
└── thumbnails/
    ├── weddings/
    ├── portraits/
    └── fashion/
```

### Step 3: Enable GitHub Pages

1. Go to repository Settings → Pages
2. Under "Source", select:
   - Branch: `main` (or `master`)
   - Folder: `/ (root)`
3. Click "Save"
4. Your images will be available at:
   ```
   https://[YOUR_USERNAME].github.io/recreate-studio-images/
   ```

### Step 4: Configure Application to Use GitHub Pages Images

In your Angular application, create an environment configuration:

**File: `src/environments/environment.ts`**
```typescript
export const environment = {
  production: false,
  imageBaseUrl: 'http://localhost:8000' // Local development
};
```

**File: `src/environments/environment.production.ts`**
```typescript
export const environment = {
  production: true,
  imageBaseUrl: 'https://[YOUR_USERNAME].github.io/recreate-studio-images'
};
```

### Step 5: Create Image Service

Create a service to manage image URLs:

```bash
cd /home/mnodson/development/recreate-studio/recreate-studio-website
ng generate service services/image
```

### Step 6: Update Components

Update your components to use the image service for loading photography images.

## Image Optimization Tips

### Before Uploading to GitHub:
1. **Optimize file sizes**: Use tools like ImageOptim, TinyPNG, or Squoosh
2. **Create thumbnails**: Generate smaller versions for grid views
3. **Use WebP format**: Better compression than JPG/PNG
4. **Recommended sizes**:
   - Thumbnails: 400x400px (50-100KB)
   - Grid images: 800x600px (100-200KB)
   - Full size: 1920x1280px (200-500KB)
   - Hero images: 2560x1440px (300-800KB)

### Responsive Images:
Create multiple sizes for responsive loading:
```
weddings/
  wedding-1/
    hero-400w.jpg
    hero-800w.jpg
    hero-1200w.jpg
    hero-1920w.jpg
```

## Local Development Workflow

### Serve Images Locally During Development:

1. Navigate to your images repository:
```bash
cd /home/mnodson/development/recreate-studio/recreate-studio-images
```

2. Start a simple HTTP server:
```bash
# Using Python 3
python3 -m http.server 8000

# Or using Node.js http-server (npm install -g http-server)
http-server -p 8000 --cors
```

3. Images will be available at: `http://localhost:8000/`

### Adding New Images:

```bash
cd /home/mnodson/development/recreate-studio/recreate-studio-images

# Add your images to appropriate folders
cp ~/Photos/wedding-ceremony.jpg weddings/wedding-1/

# Commit and push
git add .
git commit -m "Add wedding ceremony photos"
git push origin main
```

GitHub Pages will automatically update (takes 1-2 minutes).

## Alternative: Using GitHub Releases

For very large image sets, you can also use GitHub Releases to host image archives:
1. Create a release with a ZIP file of images
2. Reference the release asset URL in your application
3. Users download/cache the archive

## Example URLs

Once set up, your image URLs will look like:
```
https://[YOUR_USERNAME].github.io/recreate-studio-images/weddings/wedding-1/hero.jpg
https://[YOUR_USERNAME].github.io/recreate-studio-images/portraits/family-1/thumbnail.jpg
```

## Security & Privacy Considerations

- GitHub Pages repositories must be public (images are publicly accessible)
- Don't upload client photos without permission
- Consider watermarking portfolio images
- For private client galleries, use a different solution (password-protected hosting)

## Migration Path

When you need to scale beyond GitHub Pages:
1. Update `environment.production.ts` with new CDN URL
2. Keep the same directory structure
3. No code changes needed - just environment configuration

## Next Steps

1. Create the `recreate-studio-images` repository
2. Organize and upload your photography images
3. Enable GitHub Pages on that repository
4. Configure environment files in this project
5. Create and implement the image service
6. Update components to use the image service
