import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { ImageService } from '../../services/image.service';
import { AnalyticsService } from '../../services/analytics.service';

interface GalleryImage {
  id: number;
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
            <button 
              class="filter-btn" 
              [class.active]="selectedCategory === 'all'"
              (click)="filterGallery('all')">
              All Work
            </button>
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
                    [src]="imageService.getImageUrl(image.imageUrl)"
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
            [src]="imageService.getImageUrl(getCurrentLightboxImage()!.imageUrl)"
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
  selectedCategory = 'all';
  categories = [
    'Babies & Children',
    'Events',
    'Family Portraits',
    'Headshots',
    'Holiday Mini Sessions',
    'Newborns',
    'Portraits',
    'Seniors',
    'Sports'
  ];

  // Mapping of display categories to folder names
  private categoryFolderMap: { [key: string]: string } = {
    'Babies & Children': 'BabiesChildren',
    'Events': 'Events',
    'Family Portraits': 'FamilyPortraits',
    'Headshots': 'Headshots',
    'Holiday Mini Sessions': 'HolidayMiniSessions',
    'Newborns': 'Newborns',
    'Portraits': 'Portraits',
    'Seniors': 'Seniors',
    'Sports': 'Sports'
  };

  constructor(
    public imageService: ImageService,
    private analytics: AnalyticsService
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
    this.generateGalleryImages();
    this.filterGallery('all');
  }

  trackNavigation(destination: string) {
    this.analytics.trackNavigation(destination);
  }

  /**
   * Dynamically generate gallery images based on category folder structure
   * Creates 20 images per category using the naming pattern: FolderName001.jpg
   */
  private generateGalleryImages(): void {
    let imageId = 1;

    this.categories.forEach(category => {
      const folderName = this.categoryFolderMap[category];

      // Generate 20 images per category
      for (let i = 1; i <= 20; i++) {
        const imageIndex = String(i).padStart(3, '0'); // Pads to 3 digits: 001, 002, etc.
        const imageUrl = `portfolio/${folderName}/${folderName}${imageIndex}.jpg`;

        this.allImages.push({
          id: imageId++,
          title: `${category} ${i}`,
          category: category,
          description: `${category} photography`,
          imageUrl: imageUrl,
          featured: i === 1 // Mark first image of each category as featured
        });
      }
    });
  }

  filterGallery(category: string) {
    this.selectedCategory = category;
    this.currentLoadIndex = 0;

    if (category === 'all') {
      this._filteredImages = [...this.allImages];
    } else {
      this._filteredImages = this.allImages.filter(image => image.category === category);
    }

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

  trackByImageId(_index: number, image: GalleryImage): number {
    return image.id;
  }

  onImageError(event: Event): void {
    const img = event.target as HTMLImageElement;
    img.style.display = 'none';
    console.warn('Failed to load gallery image:', img.src);
    this.analytics.trackImageError(img.src, 'gallery_image_load_failed');
  }

  onImageLoad(event: Event): void {
    const img = event.target as HTMLImageElement;
    img.classList.add('loaded');
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