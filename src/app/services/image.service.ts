import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';

/**
 * Service for managing image URLs from GitHub Pages
 * Centralizes image path configuration and makes it easy to switch between
 * local development and production hosting
 */
@Injectable({
  providedIn: 'root'
})
export class ImageService {
  private baseUrl = environment.imageBaseUrl;

  constructor() { }

  /**
   * Get the full URL for an image
   * @param path - Relative path to the image (e.g., 'portraits/portrait-1/hero.jpg')
   * @returns Full URL to the image
   */
  getImageUrl(path: string): string {
    // Remove leading slash if present to avoid double slashes
    const cleanPath = path.startsWith('/') ? path.substring(1) : path;
    return `${this.baseUrl}/${cleanPath}`;
  }

  /**
   * Get thumbnail URL for an image
   * Assumes thumbnails are stored in a 'thumbnails' folder with the same structure
   * @param path - Relative path to the original image
   * @returns URL to the thumbnail version
   */
  getThumbnailUrl(path: string): string {
    const cleanPath = path.startsWith('/') ? path.substring(1) : path;
    return `${this.baseUrl}/_thumbnails/${cleanPath}`;
  }

  /**
   * Get responsive image URLs for srcset
   * @param path - Base path without size suffix (e.g., 'portraits/portrait-1/hero')
   * @param extension - File extension (default: 'jpg')
   * @param sizes - Array of widths available (default: [400, 800, 1200, 1920])
   * @returns srcset string for responsive images
   */
  getResponsiveImageSrcset(
    path: string,
    extension: string = 'jpg',
    sizes: number[] = [400, 800, 1200, 1920]
  ): string {
    const cleanPath = path.startsWith('/') ? path.substring(1) : path;
    return sizes
      .map(size => `${this.baseUrl}/${cleanPath}-${size}w.${extension} ${size}w`)
      .join(', ');
  }

  /**
   * Get URLs for a gallery category
   * @param category - Category name (e.g., 'senior', 'portraits', 'family')
   * @param album - Album name within the category
   * @param filename - Image filename
   * @returns Full URL to the image
   */
  getGalleryImageUrl(category: string, album: string, filename: string): string {
    return `${this.baseUrl}/${category}/${album}/${filename}`;
  }

  /**
   * Helper to check if we're in development mode
   */
  isDevelopment(): boolean {
    return !environment.production;
  }

  /**
   * Get the base URL (useful for debugging)
   */
  getBaseUrl(): string {
    return this.baseUrl;
  }

  /**
   * Convert an image file to WebP format
   * @param file - Original image file (JPEG, PNG, etc.)
   * @param quality - WebP quality (0-1, default: 0.85)
   * @returns Promise that resolves to WebP File
   */
  async convertToWebP(file: File, quality: number = 0.85): Promise<File> {
    return new Promise((resolve, reject) => {
      // Create an image element to load the file
      const img = new Image();
      const reader = new FileReader();

      reader.onload = (e) => {
        img.onload = () => {
          // Create canvas and draw image
          const canvas = document.createElement('canvas');
          canvas.width = img.width;
          canvas.height = img.height;

          const ctx = canvas.getContext('2d');
          if (!ctx) {
            reject(new Error('Failed to get canvas context'));
            return;
          }

          ctx.drawImage(img, 0, 0);

          // Convert to WebP blob
          canvas.toBlob(
            (blob) => {
              if (!blob) {
                reject(new Error('Failed to convert image to WebP'));
                return;
              }

              // Create new filename with .webp extension
              const originalName = file.name.replace(/\.[^/.]+$/, '');
              const webpFile = new File([blob], `${originalName}.webp`, {
                type: 'image/webp',
                lastModified: Date.now()
              });

              resolve(webpFile);
            },
            'image/webp',
            quality
          );
        };

        img.onerror = () => {
          reject(new Error('Failed to load image'));
        };

        img.src = e.target!.result as string;
      };

      reader.onerror = () => {
        reject(new Error('Failed to read file'));
      };

      reader.readAsDataURL(file);
    });
  }

  /**
   * Convert multiple image files to WebP format
   * @param files - Array of image files
   * @param quality - WebP quality (0-1, default: 0.85)
   * @param onProgress - Optional callback for progress updates
   * @returns Promise that resolves to array of WebP files
   */
  async convertMultipleToWebP(
    files: File[],
    quality: number = 0.85,
    onProgress?: (current: number, total: number) => void
  ): Promise<File[]> {
    const converted: File[] = [];

    for (let i = 0; i < files.length; i++) {
      try {
        const webpFile = await this.convertToWebP(files[i], quality);
        converted.push(webpFile);

        if (onProgress) {
          onProgress(i + 1, files.length);
        }
      } catch (error) {
        console.error(`Failed to convert ${files[i].name}:`, error);
        // If conversion fails, use original file
        converted.push(files[i]);
      }
    }

    return converted;
  }
}
