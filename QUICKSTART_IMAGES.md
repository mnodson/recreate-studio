# Quick Start: GitHub Pages Image Hosting

## What I've Set Up For You

✅ Environment configuration (`src/environments/`)
✅ Image service (`src/app/services/image.service.ts`)
✅ Updated home component to use the image service
✅ Angular build configuration for environment switching

## Next Steps to Get Images Working

### 1. Create Your Images Repository

```bash
# On GitHub, create a new repository:
# Name: recreate-studio-images
# Visibility: Public
# Initialize with README: Yes

# Then clone it locally:
cd /home/mnodson/development/recreate-studio
git clone https://github.com/mnodson/recreate-studio-images.git
cd recreate-studio-images
```

### 2. Create Directory Structure

```bash
# Create the folder structure for your images
mkdir -p featured weddings portraits fashion thumbnails/{weddings,portraits,fashion}

# Example structure:
# featured/
#   hero.jpg              (Your main hero image)
# weddings/
#   sunset-wedding/
#     highlight.jpg
# portraits/
#   family-portrait/
#     highlight.jpg
# fashion/
#   editorial/
#     highlight.jpg
# thumbnails/
#   weddings/sunset-wedding/highlight.jpg
#   portraits/family-portrait/highlight.jpg
#   fashion/editorial/highlight.jpg
```

### 3. Add Your Images

```bash
# Copy your photography images to the appropriate folders
# Make sure to create both full-size and thumbnail versions

# For example:
cp ~/Photos/wedding-hero.jpg featured/hero.jpg
cp ~/Photos/wedding-thumb.jpg thumbnails/weddings/sunset-wedding/highlight.jpg
# ... add more images

# Commit and push
git add .
git commit -m "Add initial photography images"
git push origin main
```

### 4. Enable GitHub Pages

1. Go to: https://github.com/mnodson/recreate-studio-images
2. Click **Settings** → **Pages**
3. Under **Source**, select:
   - Branch: `main`
   - Folder: `/ (root)`
4. Click **Save**

Your images will be available at:
`https://mnodson.github.io/recreate-studio-images/`

### 5. Update Environment Configuration

Edit the production environment file:

```bash
# File: src/environments/environment.production.ts
```

Update the `imageBaseUrl`:

```typescript
export const environment = {
  production: true,
  imageBaseUrl: 'https://mnodson.github.io/recreate-studio-images'
};
```

### 6. Test Locally

For local development, serve your images locally:

```bash
# In your images repository:
cd /home/mnodson/development/recreate-studio/recreate-studio-images
python3 -m http.server 8000
```

Then run your Angular app:

```bash
# In your website repository:
cd /home/mnodson/development/recreate-studio/recreate-studio-website
npm start
```

Visit http://localhost:4200 and you should see your images!

### 7. Deploy to Production

When you're ready to deploy with production images:

```bash
cd /home/mnodson/development/recreate-studio/recreate-studio-website

# Build with production configuration
npm run build:gh-pages

# The build will use the GitHub Pages image URLs
# Deploy according to your deployment process
```

## Image Path Examples

Based on the current home component setup:

| Component | Expected Path | Full URL (Production) |
|-----------|--------------|----------------------|
| Hero Image | `featured/hero.jpg` | `https://mnodson.github.io/recreate-studio-images/featured/hero.jpg` |
| Wedding Thumbnail | `thumbnails/weddings/sunset-wedding/highlight.jpg` | `https://mnodson.github.io/recreate-studio-images/thumbnails/weddings/sunset-wedding/highlight.jpg` |
| Portrait Thumbnail | `thumbnails/portraits/family-portrait/highlight.jpg` | `https://mnodson.github.io/recreate-studio-images/thumbnails/portraits/family-portrait/highlight.jpg` |
| Fashion Thumbnail | `thumbnails/fashion/editorial/highlight.jpg` | `https://mnodson.github.io/recreate-studio-images/thumbnails/fashion/editorial/highlight.jpg` |

## Using the Image Service in Other Components

You can now use the `ImageService` anywhere in your application:

```typescript
import { ImageService } from '../../services/image.service';

export class MyComponent {
  constructor(public imageService: ImageService) {}

  // In your template:
  // <img [src]="imageService.getImageUrl('path/to/image.jpg')">

  // Or for thumbnails:
  // <img [src]="imageService.getThumbnailUrl('path/to/image.jpg')">

  // Or for responsive images:
  // <img [srcset]="imageService.getResponsiveImageSrcset('path/to/image')">
}
```

## Troubleshooting

### Images not loading locally?
- Make sure Python HTTP server is running: `python3 -m http.server 8000`
- Check console for CORS errors
- Verify image paths match the directory structure

### Images not loading in production?
- Wait 1-2 minutes after pushing to GitHub (Pages needs to rebuild)
- Check that GitHub Pages is enabled and deployed
- Verify the `imageBaseUrl` in `environment.production.ts` is correct
- Check browser console for 404 errors (indicates wrong paths)

### Images load but look broken?
- Verify image files aren't corrupted
- Check file extensions match (jpg vs jpeg)
- Ensure images are optimized and not too large

## Image Optimization Tips

Before uploading images to GitHub:

1. **Resize images** appropriately:
   - Thumbnails: 400x400px, 50-100KB
   - Full images: 1920x1280px, 200-500KB
   - Hero: 2560x1440px, 300-800KB

2. **Use compression tools**:
   - [Squoosh](https://squoosh.app/) - Web-based
   - ImageOptim (Mac)
   - TinyPNG/TinyJPG - API available

3. **Consider WebP format** for better compression

4. **Generate thumbnails** - Don't use full-size images as thumbnails

## Need Help?

See the full documentation in `IMAGE_HOSTING_SETUP.md` for more details.
