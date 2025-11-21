import { Component, OnInit, OnDestroy, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { PersonalGalleryService } from '../../services/personal-gallery.service';
import { ImageService } from '../../services/image.service';
import { AnalyticsService } from '../../services/analytics.service';
import { PersonalGallery } from '../../models/gallery.model';

@Component({
  selector: 'app-shared-gallery',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="shared-gallery-container">
      <!-- Password Prompt -->
      @if (showPasswordPrompt()) {
        <div class="password-prompt">
          <div class="password-card">
            <img src="images/Logo_Transparent.png" alt="RecreateStudio - Professional Photography" class="hero-logo-image">
            <h2>Protected Gallery</h2>
            <p>This gallery is password protected. Please enter the password to continue.</p>
            <form (submit)="submitPassword($event)">
              <input
                type="password"
                [(ngModel)]="password"
                name="password"
                placeholder="Enter password"
                class="password-input"
                autofocus
                autocomplete="off">
              <div class="button-group">
                <button type="submit" class="btn-primary">Access Gallery</button>
              </div>
            </form>
              <p class="error-message">{{ passwordError() }}</p>
          </div>
        </div>
      }

      <!-- Loading State -->
      @if (loading()) {
        <div class="loading-container">
          <div class="loading-spinner"></div>
          <p>Loading gallery...</p>
        </div>
      }


      <!-- Gallery Content -->
      @if (gallery() && !showPasswordPrompt()) {
        <!-- Hero Section with Cover Image -->
        @if (heroImageUrl()) {
          <div class="hero-section">
            <img
              [src]="imageService.getImageUrl(heroImageUrl()!)"
              [alt]="gallery()!.title"
              class="hero-image">
            <div class="hero-overlay">
              <div class="hero-content">
                <h1>{{ gallery()!.title }}</h1>
                @if (gallery()!.description) {
                  <p class="description">
                    {{ gallery()!.description }}
                  </p>
                }
                <div class="gallery-meta">
                  <p class="client-name">For: {{ gallery()!.clientName }}</p>
                  <p class="expiration">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <circle cx="12" cy="12" r="10"></circle>
                      <polyline points="12 6 12 12 16 14"></polyline>
                    </svg>
                    Available until {{ gallery()!.expiresAt | date:'fullDate' }}
                  </p>
                  <p class="image-count">{{ gallery()!.imageUrls.length }} images</p>
                </div>
                <button class="btn-view-gallery" (click)="scrollToGallery()">
                  View Gallery
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <polyline points="6 9 12 15 18 9"></polyline>
                  </svg>
                </button>
              </div>
            </div>
          </div>
        }

        <div class="gallery-content" id="masonry-gallery">

          <!-- Thumbnail Loading State -->
          @if (generatingThumbnails()) {
            <div class="thumbnail-loading">
              <div class="loading-spinner"></div>
              <p>Preparing gallery...</p>
            </div>
          }

          <!-- Masonry Grid -->
          @if (galleryImagesForMasonry().length > 0 && !generatingThumbnails()) {
            <div class="masonry-grid">
              @for (imageUrl of galleryImagesForMasonry(); track imageUrl; let i = $index) {
                <div
                  class="masonry-item"
                  [class.loaded]="isImageLoaded(i)"
                  [class.is-favorite]="isFavorite(imageUrl)"
                  [class.in-cart]="isInCart(imageUrl)"
                  (click)="openLightbox(i, $event)">
                  <img
                    [src]="getImageSrc(i, imageUrl)"
                    [alt]="gallery()!.title + ' - Image ' + (i + 1)"
                    loading="lazy"
                    decoding="async"
                    (load)="onImageLoad(i)"
                    (error)="onImageError($event, imageUrl)">
                  <div class="image-actions">
                    <button
                      class="action-btn favorite-btn"
                      [class.active]="isFavorite(imageUrl)"
                      (click)="toggleFavorite(imageUrl, $event)"
                      title="Add to favorites">
                      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" [attr.fill]="isFavorite(imageUrl) ? 'currentColor' : 'none'" stroke="currentColor" stroke-width="2">
                        <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
                      </svg>
                    </button>
                    <button
                      class="action-btn cart-btn"
                      [class.active]="isInCart(imageUrl)"
                      (click)="toggleCart(imageUrl, $event)"
                      [title]="isInCart(imageUrl) ? 'Remove from cart' : 'Add to cart'">
                      @if (isInCart(imageUrl)) {
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                          <polyline points="20 6 9 17 4 12"></polyline>
                        </svg>
                      } @else {
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                          <line x1="12" y1="5" x2="12" y2="19"></line>
                          <line x1="5" y1="12" x2="19" y2="12"></line>
                        </svg>
                      }
                    </button>
                  </div>
                  <div class="image-overlay">
                    <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2">
                      <circle cx="11" cy="11" r="8"></circle>
                      <path d="m21 21-4.35-4.35"></path>
                      <line x1="11" y1="8" x2="11" y2="14"></line>
                      <line x1="8" y1="11" x2="14" y2="11"></line>
                    </svg>
                  </div>
                </div>
              }
            </div>
          }

          <!-- Lightbox -->
          @if (showLightbox()) {
            <div class="lightbox" (click)="closeLightbox()">
              <button class="lightbox-close" (click)="closeLightbox()">
                <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2">
                  <line x1="18" y1="6" x2="6" y2="18"></line>
                  <line x1="6" y1="6" x2="18" y2="18"></line>
                </svg>
              </button>

              <div class="lightbox-content" (click)="$event.stopPropagation()">
                <!-- Image Section -->
                <div class="lightbox-image-section">
                  @if (currentImageIndex() > 0) {
                    <button class="lightbox-prev" (click)="previousImage($event)">
                      <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2">
                        <polyline points="15 18 9 12 15 6"></polyline>
                      </svg>
                    </button>
                  }
                  @if (currentImageIndex() < gallery()!.imageUrls.length - 1) {
                    <button class="lightbox-next" (click)="nextImage($event)">
                      <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2">
                        <polyline points="9 18 15 12 9 6"></polyline>
                      </svg>
                    </button>
                  }
                  <img
                    [src]="imageService.getImageUrl(gallery()!.imageUrls[currentImageIndex()])"
                    [alt]="gallery()!.title"
                    class="lightbox-image">
                </div>

                <!-- Side Panel -->
                <div class="lightbox-sidebar">
                  <!-- Gallery Info -->
                  <div class="sidebar-header">
                    <div class="gallery-info">
                      <h3>{{ gallery()!.title }}</h3>
                      <p class="client-name">{{ gallery()!.clientName }}</p>
                    </div>
                  </div>

                  <!-- Image Counter -->
                  <div class="sidebar-counter">
                    <span class="counter-text">{{ currentImageIndex() + 1 }} / {{ gallery()!.imageUrls.length }}</span>
                  </div>

                  <!-- Actions -->
                  <div class="sidebar-actions">
                    <button
                      class="action-btn-large favorite-btn"
                      [class.active]="isFavorite(gallery()!.imageUrls[currentImageIndex()])"
                      (click)="toggleFavorite(gallery()!.imageUrls[currentImageIndex()])">
                      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" [attr.fill]="isFavorite(gallery()!.imageUrls[currentImageIndex()]) ? 'currentColor' : 'none'" stroke="currentColor" stroke-width="2">
                        <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
                      </svg>
                      <span>{{ isFavorite(gallery()!.imageUrls[currentImageIndex()]) ? 'Favorited' : 'Add to Favorites' }}</span>
                    </button>
                    <button
                      class="action-btn-large cart-btn"
                      [class.active]="isInCart(gallery()!.imageUrls[currentImageIndex()])"
                      (click)="toggleCart(gallery()!.imageUrls[currentImageIndex()])">
                      @if (isInCart(gallery()!.imageUrls[currentImageIndex()])) {
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                          <polyline points="20 6 9 17 4 12"></polyline>
                        </svg>
                        <span>Selected for Delivery</span>
                      } @else {
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                          <circle cx="9" cy="21" r="1"></circle>
                          <circle cx="20" cy="21" r="1"></circle>
                          <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path>
                        </svg>
                        <span>Add to Cart</span>
                      }
                    </button>
                  </div>

                  <!-- Info Section -->
                  <div class="sidebar-info">
                    <p class="info-text">Use the arrows to navigate through images</p>
                    @if (cart().size > 0 || favorites().size > 0) {
                      <div class="selection-summary">
                        @if (cart().size > 0) {
                          <div class="summary-section">
                            <div class="summary-header">
                              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <polyline points="20 6 9 17 4 12"></polyline>
                              </svg>
                              <span>{{ cart().size }} selected for delivery</span>
                            </div>
                            <div class="selection-thumbnails">
                              @for (imageUrl of Array.from(cart()); track imageUrl) {
                                <div class="thumbnail-item">
                                  <img [src]="imageService.getImageUrl(imageUrl)" [alt]="'Selected image'">
                                </div>
                              }
                            </div>
                          </div>
                        }
                        @if (favorites().size > 0) {
                          <div class="summary-section">
                            <div class="summary-header">
                              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" stroke-width="2">
                                <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
                              </svg>
                              <span>{{ favorites().size }} favorites</span>
                            </div>
                            <div class="selection-thumbnails">
                              @for (imageUrl of Array.from(favorites()); track imageUrl) {
                                <div class="thumbnail-item">
                                  <img [src]="imageService.getImageUrl(imageUrl)" [alt]="'Favorite image'">
                                </div>
                              }
                            </div>
                          </div>
                        }
                      </div>
                    }
                  </div>
                </div>
              </div>
            </div>
          }

          <!-- Floating Cart Button -->
          @if (cart().size > 0 || favorites().size > 0) {
            <button class="floating-cart-btn" (click)="openCartModal()">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <circle cx="9" cy="21" r="1"></circle>
                <circle cx="20" cy="21" r="1"></circle>
                <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path>
              </svg>
              <span class="cart-badge">{{ cart().size }}</span>
              <span class="cart-label">Review & Submit</span>
            </button>
          }

          <footer class="gallery-footer">
            <img src="images/Logo_Transparent.png" alt="RecreateStudio - Professional Photography" class="hero-logo-image">
          </footer>
        </div>
      }

      <!-- Cart Modal -->
      @if (showCartModal()) {
        <div class="cart-modal-overlay" (click)="closeCartModal()">
          <div class="cart-modal" (click)="$event.stopPropagation()">
            <div class="cart-modal-header">
              <h2>Your Selections</h2>
              <button class="close-btn" (click)="closeCartModal()">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <line x1="18" y1="6" x2="6" y2="18"></line>
                  <line x1="6" y1="6" x2="18" y2="18"></line>
                </svg>
              </button>
            </div>

            <div class="cart-modal-body">
              <!-- Summary Stats -->
              <div class="selection-stats">
                <div class="stat-item">
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" stroke-width="2">
                    <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
                  </svg>
                  <span>{{ favorites().size }} favorites</span>
                </div>
                <div class="stat-item">
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <polyline points="20 6 9 17 4 12"></polyline>
                  </svg>
                  <span>{{ cart().size }} selected for delivery</span>
                </div>
              </div>

              <!-- Cart Images Grid -->
              <div class="cart-section">
                <h3>Selected for Delivery ({{ cart().size }})</h3>
                @if (cart().size > 0) {
                  <div class="cart-images-grid">
                    @for (imageUrl of Array.from(cart()); track imageUrl) {
                      <div class="cart-image-item">
                        <img [src]="imageService.getImageUrl(imageUrl)" [alt]="'Selected image'">
                        <button class="remove-from-cart-btn" (click)="toggleCart(imageUrl)" title="Remove from cart">
                          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <line x1="18" y1="6" x2="6" y2="18"></line>
                            <line x1="6" y1="6" x2="18" y2="18"></line>
                          </svg>
                        </button>
                      </div>
                    }
                  </div>
                } @else {
                  <p class="empty-message">No images selected yet. Click the + button on images to add them to your cart.</p>
                }
              </div>

              <!-- Favorites Images Grid -->
              @if (favorites().size > 0) {
                <div class="cart-section">
                  <h3>Favorites ({{ favorites().size }})</h3>
                  <div class="cart-images-grid">
                    @for (imageUrl of Array.from(favorites()); track imageUrl) {
                      <div class="cart-image-item">
                        <img [src]="imageService.getImageUrl(imageUrl)" [alt]="'Favorite image'">
                        <button class="remove-from-cart-btn" (click)="toggleFavorite(imageUrl)" title="Remove from favorites">
                          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <line x1="18" y1="6" x2="6" y2="18"></line>
                            <line x1="6" y1="6" x2="18" y2="18"></line>
                          </svg>
                        </button>
                      </div>
                    }
                  </div>
                </div>
              }

              <!-- Notes -->
              <div class="cart-section">
                <label for="clientNotes">Optional Notes for Laura</label>
                <textarea
                  id="clientNotes"
                  [(ngModel)]="clientNotes"
                  placeholder="Any special requests or notes about your selections..."
                  rows="3"></textarea>
              </div>

              @if (gallery()?.clientSelections?.isSubmitted) {
                <div class="submitted-notice">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                    <polyline points="22 4 12 14.01 9 11.01"></polyline>
                  </svg>
                  <div>
                    <strong>Selections submitted!</strong>
                    <p>You can still make changes. Just click "Submit Selections" again when you're ready.</p>
                  </div>
                </div>
              }
            </div>

            <div class="cart-modal-footer">
              <button class="btn-secondary" (click)="closeCartModal()">Continue Browsing</button>
              <button
                class="btn-primary"
                (click)="submitSelections()"
                [disabled]="submitting() || cart().size === 0">
                @if (submitting()) {
                  <span>Submitting...</span>
                } @else {
                  <span>{{ gallery()?.clientSelections?.isSubmitted ? 'Update' : 'Submit' }} Selections</span>
                }
              </button>
            </div>
          </div>
        </div>
      }

      <!-- Error State -->
      @if (!gallery() && !loading() && !showPasswordPrompt()) {
        <div class="error-container">
          <div class="error-card">
            <svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="12" cy="12" r="10"></circle>
              <line x1="12" y1="8" x2="12" y2="12"></line>
              <line x1="12" y1="16" x2="12.01" y2="16"></line>
            </svg>
            <h2>Gallery Not Found</h2>
            <p>This gallery may have expired or the link is invalid.</p>
            <p class="error-help">Please contact Laura Hoffman if you believe this is an error.</p>
          </div>
        </div>
      }

      <!-- Toast Notification -->
      @if (showToast()) {
        <div class="toast-notification" [class.toast-success]="toastType() === 'success'" [class.toast-error]="toastType() === 'error'" [class.toast-info]="toastType() === 'info'">
          <div class="toast-content">
            @if (toastType() === 'success') {
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                <polyline points="22 4 12 14.01 9 11.01"></polyline>
              </svg>
            }
            @if (toastType() === 'error') {
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <circle cx="12" cy="12" r="10"></circle>
                <line x1="12" y1="8" x2="12" y2="12"></line>
                <line x1="12" y1="16" x2="12.01" y2="16"></line>
              </svg>
            }
            @if (toastType() === 'info') {
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <circle cx="12" cy="12" r="10"></circle>
                <line x1="12" y1="12" x2="12" y2="16"></line>
                <line x1="12" y1="8" x2="12.01" y2="8"></line>
              </svg>
            }
            <span>{{ toastMessage() }}</span>
          </div>
        </div>
      }
    </div>
  `,
  styleUrls: ['./shared-gallery.component.scss']
})
export class SharedGalleryComponent implements OnInit, OnDestroy {
  gallery = signal<PersonalGallery | null>(null);
  loading = signal(true);
  showPasswordPrompt = signal(false);
  showLightbox = signal(false);
  currentImageIndex = signal(0);
  password = '';
  passwordError = signal('');

  // Client selections state
  favorites = signal<Set<string>>(new Set());
  cart = signal<Set<string>>(new Set());
  showCartModal = signal(false);
  submitting = signal(false);
  clientNotes = '';

  // Toast notification state
  showToast = signal(false);
  toastMessage = signal('');
  toastType = signal<'success' | 'error' | 'info'>('success');

  // Thumbnail state
  thumbnails = signal<string[]>([]);
  generatingThumbnails = signal(false);

  // Track loaded images to prevent layout shift
  loadedImages = signal<Set<number>>(new Set());

  // Computed thumbnail size based on image count and viewport
  // For masonry layout, we want smaller thumbnails for better performance
  thumbnailSize = () => {
    const count = this.gallery()?.imageUrls.length || 0;
    // Masonry columns are ~400px wide on desktop, so 400px thumbnails are perfect
    if (count <= 14) return 400;
    if (count <= 21) return 350;
    if (count <= 35) return 300;
    return 250;
  };

  // Hero image (first landscape image)
  heroImageUrl = signal<string | null>(null);

  // Gallery images (all images for masonry grid)
  galleryImagesForMasonry = signal<string[]>([]);

  // Expose Array for template use
  Array = Array;

  constructor(
    private route: ActivatedRoute,
    private galleryService: PersonalGalleryService,
    public imageService: ImageService,
    private analytics: AnalyticsService
  ) { }

  ngOnInit() {
    const shareToken = this.route.snapshot.paramMap.get('token');
    if (shareToken) {
      this.loadGallery(shareToken);
    } else {
      this.loading.set(false);
    }
  }

  ngOnDestroy() {
    // Clean up thumbnail object URLs
    this.thumbnails().forEach(url => URL.revokeObjectURL(url));

    // Clear loaded images set
    this.loadedImages.set(new Set());
  }

  loadGallery(shareToken: string, password?: string) {
    this.loading.set(true);
    this.passwordError.set('');

    this.galleryService.getGalleryByShareToken(shareToken, password).subscribe({
      next: (gallery) => {
        this.loading.set(false);
        if (gallery) {
          this.gallery.set(gallery);
          this.showPasswordPrompt.set(false);

          // Track successful password if one was provided
          if (password !== undefined) {
            this.analytics.trackGalleryPasswordAttempt(shareToken, true);
          }

          // Track gallery view
          this.analytics.trackGalleryView(
            gallery.id || shareToken,
            gallery.title,
            gallery.imageUrls.length
          );

          // Load existing selections if any
          if (gallery.clientSelections) {
            this.favorites.set(new Set(gallery.clientSelections.favorites));
            this.cart.set(new Set(gallery.clientSelections.cart));
          }

          // Find first landscape image for hero and set up gallery images
          this.setupGalleryImages();
        } else {
          this.gallery.set(null);
        }
      },
      error: (error) => {
        this.loading.set(false);
        if (error.message === 'Invalid password') {
          this.showPasswordPrompt.set(true);
          if (password !== undefined) {
            this.passwordError.set('Incorrect password. Please try again.');
            // Track failed password attempt
            this.analytics.trackGalleryPasswordAttempt(shareToken, false);
          }
        } else {
          console.error('Error loading gallery:', error);
          this.analytics.trackError(error.message, 'gallery_load');
          this.gallery.set(null);
        }
      }
    });
  }

  private async setupGalleryImages() {
    const gallery = this.gallery();
    if (!gallery || gallery.imageUrls.length === 0) return;

    // Reset loaded images state
    this.loadedImages.set(new Set());

    // Use custom hero image if available, otherwise find first landscape image
    if (gallery.heroImageUrl) {
      this.heroImageUrl.set(gallery.heroImageUrl);
    } else {
      // Find first landscape image for hero
      let heroIndex = 0;
      for (let i = 0; i < gallery.imageUrls.length; i++) {
        const imageUrl = this.imageService.getImageUrl(gallery.imageUrls[i]);
        const isLandscape = await this.isImageLandscape(imageUrl);
        if (isLandscape) {
          heroIndex = i;
          break;
        }
      }
      this.heroImageUrl.set(gallery.imageUrls[heroIndex]);
    }

    // Set remaining images for masonry grid (all images, hero will be in the grid too for simplicity)
    this.galleryImagesForMasonry.set(gallery.imageUrls);

    // Generate thumbnails for masonry grid
    this.generateThumbnails();
  }

  private isImageLandscape(imageUrl: string): Promise<boolean> {
    return new Promise((resolve) => {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => {
        resolve(img.width > img.height);
      };
      img.onerror = () => {
        resolve(true); // Default to landscape if error
      };
      img.src = imageUrl;
    });
  }

  submitPassword(event: Event) {
    event.preventDefault();
    const shareToken = this.route.snapshot.paramMap.get('token');
    if (shareToken && this.password) {
      this.loadGallery(shareToken, this.password);
    }
  }

  private generateThumbnails() {
    const gallery = this.gallery();
    if (!gallery) return;

    this.generatingThumbnails.set(true);
    const startTime = performance.now();

    const thumbnailPromises = gallery.imageUrls.map(imageUrl =>
      this.createThumbnail(this.imageService.getImageUrl(imageUrl))
    );

    Promise.all(thumbnailPromises).then(thumbs => {
      const duration = performance.now() - startTime;
      this.thumbnails.set(thumbs);
      this.generatingThumbnails.set(false);

      // Track thumbnail generation performance
      this.analytics.trackThumbnailGeneration(gallery.imageUrls.length, duration);
    }).catch(error => {
      console.error('Error generating thumbnails:', error);
      this.analytics.trackError(error.message, 'thumbnail_generation');
      this.generatingThumbnails.set(false);
    });
  }

  private async createThumbnail(imageUrl: string): Promise<string> {
    return new Promise((resolve) => {
      const img = new Image();

      // Enable CORS to avoid tainted canvas errors
      img.crossOrigin = 'anonymous';

      img.onload = () => {
        try {
          const canvas = document.createElement('canvas');
          const ctx = canvas.getContext('2d');

          if (!ctx) {
            console.warn('Could not get canvas context, using original image');
            resolve(imageUrl);
            return;
          }

          // Dynamic thumbnail size based on image count
          const maxSize = this.thumbnailSize();
          let width = img.width;
          let height = img.height;

          if (width > height) {
            if (width > maxSize) {
              height = (height * maxSize) / width;
              width = maxSize;
            }
          } else {
            if (height > maxSize) {
              width = (width * maxSize) / height;
              height = maxSize;
            }
          }

          canvas.width = width;
          canvas.height = height;

          // Draw scaled image
          ctx.drawImage(img, 0, 0, width, height);

          // Convert to blob URL with quality based on count
          const count = this.gallery()?.imageUrls.length || 0;
          const quality = count > 35 ? 0.75 : 0.85;

          canvas.toBlob((blob) => {
            if (blob) {
              const blobUrl = URL.createObjectURL(blob);
              resolve(blobUrl);
            } else {
              // Fallback to original URL if blob creation fails
              console.warn('Blob creation failed, using original image:', imageUrl);
              resolve(imageUrl);
            }
          }, 'image/jpeg', quality);
        } catch (error) {
          // If canvas operations fail (e.g., due to CORS), use original image
          console.warn('Canvas operation failed, using original image:', error);
          resolve(imageUrl);
        }
      };

      img.onerror = (error) => {
        // Fallback to original on error
        console.error('Image load failed:', imageUrl, error);
        resolve(imageUrl);
      };

      img.src = imageUrl;
    });
  }

  openLightbox(index: number, event?: Event) {
    this.currentImageIndex.set(index);
    this.showLightbox.set(true);
    document.body.style.overflow = 'hidden';

    // Track lightbox open
    const gallery = this.gallery();
    if (gallery) {
      this.analytics.trackImageLightboxOpen(index, gallery.imageUrls.length);
    }
  }

  closeLightbox() {
    this.showLightbox.set(false);
    document.body.style.overflow = '';
  }

  nextImage(event: Event) {
    event.stopPropagation();
    if (this.gallery() && this.currentImageIndex() < this.gallery()!.imageUrls.length - 1) {
      const newIndex = this.currentImageIndex() + 1;
      this.currentImageIndex.set(newIndex);
      this.analytics.trackImageNavigation('next', newIndex);
    }
  }

  previousImage(event: Event) {
    event.stopPropagation();
    if (this.currentImageIndex() > 0) {
      const newIndex = this.currentImageIndex() - 1;
      this.currentImageIndex.set(newIndex);
      this.analytics.trackImageNavigation('previous', newIndex);
    }
  }

  scrollToGallery() {
    const galleryElement = document.getElementById('masonry-gallery');
    if (galleryElement) {
      galleryElement.scrollIntoView({ behavior: 'smooth', block: 'start' });

      // Track scroll to gallery
      const gallery = this.gallery();
      if (gallery) {
        this.analytics.trackGalleryScrollToImages(gallery.id || 'unknown');
      }
    }
  }

  getImageSrc(index: number, relativeUrl: string): string {
    // Use thumbnail if available, otherwise use full image
    const thumbnail = this.thumbnails()[index];
    if (thumbnail && thumbnail.length > 0) {
      return thumbnail;
    }
    return this.imageService.getImageUrl(relativeUrl);
  }

  onImageLoad(index: number): void {
    // Mark image as loaded to trigger fade-in animation
    const loaded = new Set(this.loadedImages());
    loaded.add(index);
    this.loadedImages.set(loaded);
  }

  isImageLoaded(index: number): boolean {
    return this.loadedImages().has(index);
  }

  onImageError(event: Event, relativeUrl: string): void {
    // If thumbnail fails, try loading the original image
    const img = event.target as HTMLImageElement;
    const originalUrl = this.imageService.getImageUrl(relativeUrl);

    if (img.src !== originalUrl) {
      console.warn('Thumbnail failed to load, falling back to original:', img.src);
      this.analytics.trackImageError(relativeUrl, 'thumbnail_load_failed');
      img.src = originalUrl;
    } else {
      console.error('Original image also failed to load:', originalUrl);
      this.analytics.trackImageError(relativeUrl, 'image_load_failed');
    }
  }

  // Client selection methods
  toggleFavorite(imageUrl: string, event?: Event): void {
    if (event) {
      event.stopPropagation();
    }

    const currentFavorites = new Set(this.favorites());
    if (currentFavorites.has(imageUrl)) {
      currentFavorites.delete(imageUrl);
    } else {
      currentFavorites.add(imageUrl);
    }
    this.favorites.set(currentFavorites);

    // Auto-save selections
    this.saveSelections();
  }

  toggleCart(imageUrl: string, event?: Event): void {
    if (event) {
      event.stopPropagation();
    }

    const currentCart = new Set(this.cart());
    if (currentCart.has(imageUrl)) {
      currentCart.delete(imageUrl);
    } else {
      currentCart.add(imageUrl);
    }
    this.cart.set(currentCart);

    // Auto-save selections
    this.saveSelections();
  }

  isFavorite(imageUrl: string): boolean {
    return this.favorites().has(imageUrl);
  }

  isInCart(imageUrl: string): boolean {
    return this.cart().has(imageUrl);
  }

  private saveSelections(): void {
    const gallery = this.gallery();
    if (!gallery || !gallery.id) return;

    this.galleryService.updateClientSelections(
      gallery.id,
      Array.from(this.favorites()),
      Array.from(this.cart()),
      false
    ).subscribe({
      next: () => {
        console.log('Selections saved');
      },
      error: (error) => {
        console.error('Error saving selections:', error);
      }
    });
  }

  openCartModal(): void {
    this.showCartModal.set(true);
    document.body.style.overflow = 'hidden';
  }

  closeCartModal(): void {
    this.showCartModal.set(false);
    document.body.style.overflow = '';
  }

  submitSelections(): void {
    const gallery = this.gallery();
    if (!gallery || !gallery.id) return;

    if (this.cart().size === 0) {
      this.showToastMessage('Please add at least one image to your cart before submitting.', 'error');
      return;
    }

    this.submitting.set(true);

    this.galleryService.updateClientSelections(
      gallery.id,
      Array.from(this.favorites()),
      Array.from(this.cart()),
      true,
      this.clientNotes
    ).subscribe({
      next: () => {
        this.submitting.set(false);
        this.showToastMessage('Your selections have been submitted successfully!', 'success');
        this.analytics.trackCustomEvent('gallery_selections_submitted', {
          galleryId: gallery.id,
          favoritesCount: this.favorites().size,
          cartCount: this.cart().size
        });

        // Update local gallery data
        const updatedGallery = { ...gallery };
        if (!updatedGallery.clientSelections) {
          updatedGallery.clientSelections = {
            favorites: [],
            cart: [],
            isSubmitted: false
          };
        }
        updatedGallery.clientSelections.isSubmitted = true;
        updatedGallery.clientSelections.submittedAt = new Date();
        this.gallery.set(updatedGallery);

        this.closeCartModal();
      },
      error: (error) => {
        console.error('Error submitting selections:', error);
        this.submitting.set(false);
        this.showToastMessage('Failed to submit selections. Please try again.', 'error');
      }
    });
  }

  showToastMessage(message: string, type: 'success' | 'error' | 'info' = 'success'): void {
    this.toastMessage.set(message);
    this.toastType.set(type);
    this.showToast.set(true);

    // Auto-hide after 4 seconds
    setTimeout(() => {
      this.showToast.set(false);
    }, 4000);
  }
}
