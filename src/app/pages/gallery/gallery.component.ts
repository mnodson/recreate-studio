import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { ImageService } from '../../services/image.service';
import { AnalyticsService } from '../../services/analytics.service';
import { PortfolioAdminService } from '../../services/portfolio-admin.service';
import { PortfolioImage, PortfolioCategory } from '../../models/gallery.model';

interface GalleryImage {
  id: string;
  title: string;
  category: string;
  description: string;
  imageUrl: string;
  featured: boolean;
}

@Component({
  selector: 'app-gallery',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="gallery-container">
      <section class="gallery-header">
        <div class="container">
          <h1>Portfolio Gallery</h1>
          <p>Explore my collection of captured moments across different photography styles</p>
        </div>
      </section>

      <section class="gallery-filters">
        <div class="container">
          <div class="filter-buttons">
            @for (category of categories; track category) {
              <button 
                class="filter-btn" 
                [class.active]="selectedCategory === category"
                (click)="filterGallery(category)">
                {{ category }}
              </button>
            }
          </div>
        </div>
      </section>

      <section class="gallery-grid">
        <div class="container">
          <div class="grid">
            @for (image of filteredImages; track trackByImageId($index, image); let i = $index) {
              <div
                class="gallery-item"
                [class.featured]="image.featured"
                (click)="openLightbox(i)">
                <div class="image-container">
                  <img
                    [src]="image.imageUrl"
                    [alt]="image.title"
                    class="gallery-image"
                    loading="lazy"
                    decoding="async"
                    (error)="onImageError($event)"
                    (load)="onImageLoad($event)">
                  <div class="image-overlay">
                    <h3>{{ image.title }}</h3>
                    <p>{{ image.description }}</p>
                    <div class="zoom-icon">
                      <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <circle cx="11" cy="11" r="8"></circle>
                        <path d="m21 21-4.35-4.35"></path>
                        <line x1="11" y1="8" x2="11" y2="14"></line>
                        <line x1="8" y1="11" x2="14" y2="11"></line>
                      </svg>
                    </div>
                  </div>
                </div>
              </div>
            }
          </div>
          
          @if (hasMoreImages) {
            <div class="load-more">
              <button class="btn-outline" (click)="loadMore()">Load More Images</button>
            </div>
          }
        </div>
      </section>

      <section class="gallery-cta">
        <div class="container">
          <h2>Like What You See?</h2>
          <p>Let's discuss your photography needs and create something beautiful together.</p>
          <button class="btn-primary" routerLink="/packages" (click)="trackNavigation('packages')">Book a Session</button>
        </div>
      </section>

      <!-- Lightbox -->
      @if (showLightbox && getCurrentLightboxImage()) {
        <div class="lightbox" (click)="closeLightbox()">
          <button class="lightbox-close" (click)="closeLightbox()" aria-label="Close lightbox">
            <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>

          @if (currentLightboxIndex > 0) {
            <button class="lightbox-prev" (click)="previousImage($event)" aria-label="Previous image">
              <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2">
                <polyline points="15 18 9 12 15 6"></polyline>
              </svg>
            </button>
          }

          @if (currentLightboxIndex < displayedImages.length - 1) {
            <button class="lightbox-next" (click)="nextImage($event)" aria-label="Next image">
              <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2">
                <polyline points="9 18 15 12 9 6"></polyline>
              </svg>
            </button>
          }

          <img
            [src]="getCurrentLightboxImage()!.imageUrl"
            [alt]="getCurrentLightboxImage()!.title"
            class="lightbox-image"
            (click)="$event.stopPropagation()">

          <div class="lightbox-info">
            <h3>{{ getCurrentLightboxImage()!.title }}</h3>
            <p>{{ getCurrentLightboxImage()!.description }}</p>
          </div>

          <div class="lightbox-counter">
            {{ currentLightboxIndex + 1 }} / {{ displayedImages.length }}
          </div>
        </div>
      }
    </div>
  `,
  styleUrls: ['./gallery.component.scss']
})
export class GalleryComponent implements OnInit {
  selectedCategory = 'Events';
  categories = [
    'Events',
    'Family Portraits',
    'Headshots',
    'Holiday Mini Sessions',
    'Newborns',
    'Seniors',
    'Sports',
    'Babies & Children'
  ];

  // Mapping of display categories to folder names
  private categoryFolderMap: { [key: string]: string } = {
    'Babies & Children': 'BabiesChildren',
    'Events': 'Events',
    'Family Portraits': 'FamilyPortraits',
    'Headshots': 'Headshots',
    'Holiday Mini Sessions': 'HolidayMiniSessions',
    'Newborns': 'Newborns',
    'Seniors': 'Seniors',
    'Sports': 'Sports'
  };

  constructor(
    public imageService: ImageService,
    private analytics: AnalyticsService,
    private portfolioService: PortfolioAdminService
  ) {}

  allImages: GalleryImage[] = [];

  private _filteredImages: GalleryImage[] = [];
  displayedImages: GalleryImage[] = [];
  imagesPerLoad = 12; // Show 12 images initially for better grid layout (3x4 or 4x3)
  currentLoadIndex = 0;
  hasMoreImages = true;

  // Lightbox state
  showLightbox = false;
  currentLightboxIndex = 0;

  ngOnInit() {
    this.analytics.trackPageView('gallery');
    this.loadGalleryImagesFromFirestore();
  }

  trackNavigation(destination: string) {
    this.analytics.trackNavigation(destination);
  }

  /**
   * Load gallery images from Firestore
   * Fetches only visible images from the portfolio-images collection
   */
  private loadGalleryImagesFromFirestore(): void {
    // Query all visible images
    this.portfolioService.queryImages({
      visibleOnly: true,
      orderBy: 'order',
      orderDirection: 'asc'
    }).subscribe({
      next: (portfolioImages: PortfolioImage[]) => {
        // Convert PortfolioImage to GalleryImage format
        this.allImages = portfolioImages.map((img, index) => ({
          id: img.id,
          title: img.caption || `${this.getCategoryDisplayName(img.category)} ${index + 1}`,
          category: this.getCategoryDisplayName(img.category),
          description: img.caption || `${this.getCategoryDisplayName(img.category)} photography`,
          imageUrl: img.url, // Using the full URL from Firestore
          featured: index === 0 // Mark first image as featured
        }));

        // Initialize with first category that has images
        if (this.allImages.length > 0) {
          const firstCategory = this.allImages[0].category;
          this.filterGallery(firstCategory);
        } else {
          // If no images in Firestore, default to Events
          this.filterGallery('Events');
        }
      },
      error: (error) => {
        console.error('Error loading portfolio images:', error);
        // Fall back to empty array if there's an error
        this.allImages = [];
        this.filterGallery('Events');
      }
    });
  }

  /**
   * Convert category folder name to display name
   */
  private getCategoryDisplayName(category: PortfolioCategory): string {
    const reverseMap: { [key: string]: string } = {
      'BabiesChildren': 'Babies & Children',
      'Events': 'Events',
      'FamilyPortraits': 'Family Portraits',
      'Headshots': 'Headshots',
      'HolidayMiniSessions': 'Holiday Mini Sessions',
      'Newborns': 'Newborns',
      'Seniors': 'Seniors',
      'Sports': 'Sports'
    };
    return reverseMap[category] || category;
  }

  filterGallery(category: string) {
    this.selectedCategory = category;
    this.currentLoadIndex = 0;

    this._filteredImages = this.allImages.filter(image => image.category === category);

    // Track category filter
    this.analytics.trackCustomEvent('gallery_filter', { category });

    this.loadInitialImages();
  }

  loadInitialImages() {
    this.displayedImages = this._filteredImages.slice(0, this.imagesPerLoad);
    this.currentLoadIndex = this.imagesPerLoad;
    this.updateHasMoreImages();
  }

  loadMore() {
    const nextImages = this._filteredImages.slice(
      this.currentLoadIndex,
      this.currentLoadIndex + this.imagesPerLoad
    );
    this.displayedImages = [...this.displayedImages, ...nextImages];
    this.currentLoadIndex += this.imagesPerLoad;
    this.updateHasMoreImages();

    // Track load more action
    this.analytics.trackCustomEvent('gallery_load_more', {
      category: this.selectedCategory,
      total_loaded: this.displayedImages.length
    });
  }

  updateHasMoreImages() {
    this.hasMoreImages = this.currentLoadIndex < this._filteredImages.length;
  }

  trackByImageId(_index: number, image: GalleryImage): string {
    return image.id;
  }

  onImageError(event: Event): void {
    const img = event.target as HTMLImageElement;
    // Hide the entire gallery item, not just the image
    const galleryItem = img.closest('.gallery-item') as HTMLElement;
    if (galleryItem) {
      galleryItem.style.display = 'none';
    }
    console.warn('Failed to load gallery image:', img.src);
    this.analytics.trackImageError(img.src, 'gallery_image_load_failed');
  }

  onImageLoad(event: Event): void {
    const img = event.target as HTMLImageElement;
    img.classList.add('loaded');
    // Remove loading state from container
    const imageContainer = img.closest('.image-container') as HTMLElement;
    if (imageContainer) {
      imageContainer.classList.add('image-loaded');
    }
  }

  get filteredImages() {
    return this.displayedImages;
  }

  // Lightbox methods
  openLightbox(index: number): void {
    this.currentLightboxIndex = index;
    this.showLightbox = true;
    document.body.style.overflow = 'hidden';

    // Track lightbox open
    this.analytics.trackImageLightboxOpen(index, this.displayedImages.length);
  }

  closeLightbox(): void {
    this.showLightbox = false;
    document.body.style.overflow = '';
  }

  nextImage(event: Event): void {
    event.stopPropagation();
    if (this.currentLightboxIndex < this.displayedImages.length - 1) {
      this.currentLightboxIndex++;
      this.analytics.trackImageNavigation('next', this.currentLightboxIndex);
    }
  }

  previousImage(event: Event): void {
    event.stopPropagation();
    if (this.currentLightboxIndex > 0) {
      this.currentLightboxIndex--;
      this.analytics.trackImageNavigation('previous', this.currentLightboxIndex);
    }
  }

  getCurrentLightboxImage(): GalleryImage | null {
    return this.displayedImages[this.currentLightboxIndex] || null;
  }
}