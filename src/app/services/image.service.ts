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
}
