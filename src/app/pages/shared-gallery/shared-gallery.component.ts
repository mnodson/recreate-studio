import { Component, OnInit, OnDestroy, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { PersonalGalleryService } from '../../services/personal-gallery.service';
import { ImageService } from '../../services/image.service';
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
        <div class="gallery-content">
          <header class="gallery-header">
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
          </header>

          @if (generatingThumbnails()) {
            <div class="thumbnail-loading">
              <div class="loading-spinner"></div>
              <p>Generating optimized thumbnails...</p>
            </div>
          }

          @if (!generatingThumbnails()) {
            <div class="image-grid" [style.--thumbnail-size.px]="thumbnailSize()">
              @for (imageUrl of gallery()!.imageUrls; track imageUrl; let i = $index) {
                <div
                  class="image-item"
                  (click)="openLightbox(i)">
                  <img
                    [src]="thumbnails()[i] || imageService.getImageUrl(imageUrl)"
                    [alt]="gallery()!.title + ' - Image ' + (i + 1)"
                    loading="lazy"
                    decoding="async">
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
                class="lightbox-image"
                (click)="$event.stopPropagation()">
              <div class="lightbox-counter">
                {{ currentImageIndex() + 1 }} / {{ gallery()!.imageUrls.length }}
              </div>
            </div>
          }

          <footer class="gallery-footer">
            <img src="images/Logo_Transparent.png" alt="RecreateStudio - Professional Photography" class="hero-logo-image">
          </footer>
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

  // Thumbnail state
  thumbnails = signal<string[]>([]);
  generatingThumbnails = signal(false);

  // Computed thumbnail size based on image count
  thumbnailSize = () => {
    const count = this.gallery()?.imageUrls.length || 0;
    if (count <= 14) return 300;
    if (count <= 21) return 250;
    if (count <= 35) return 200;
    return 180;
  };

  constructor(
    private route: ActivatedRoute,
    private galleryService: PersonalGalleryService,
    public imageService: ImageService
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
          // Generate thumbnails after gallery loads
          this.generateThumbnails();
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
          }
        } else {
          console.error('Error loading gallery:', error);
          this.gallery.set(null);
        }
      }
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

    const thumbnailPromises = gallery.imageUrls.map(imageUrl =>
      this.createThumbnail(this.imageService.getImageUrl(imageUrl))
    );

    Promise.all(thumbnailPromises).then(thumbs => {
      this.thumbnails.set(thumbs);
      this.generatingThumbnails.set(false);
    }).catch(error => {
      console.error('Error generating thumbnails:', error);
      this.generatingThumbnails.set(false);
    });
  }

  private async createThumbnail(imageUrl: string): Promise<string> {
    return new Promise((resolve) => {
      const img = new Image();
      img.crossOrigin = 'anonymous';

      img.onload = () => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d')!;

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
            resolve(URL.createObjectURL(blob));
          } else {
            // Fallback to original URL
            resolve(imageUrl);
          }
        }, 'image/jpeg', quality);
      };

      img.onerror = () => {
        // Fallback to original on error
        resolve(imageUrl);
      };

      img.src = imageUrl;
    });
  }

  openLightbox(index: number) {
    this.currentImageIndex.set(index);
    this.showLightbox.set(true);
    document.body.style.overflow = 'hidden';
  }

  closeLightbox() {
    this.showLightbox.set(false);
    document.body.style.overflow = '';
  }

  nextImage(event: Event) {
    event.stopPropagation();
    if (this.gallery() && this.currentImageIndex() < this.gallery()!.imageUrls.length - 1) {
      this.currentImageIndex.set(this.currentImageIndex() + 1);
    }
  }

  previousImage(event: Event) {
    event.stopPropagation();
    if (this.currentImageIndex() > 0) {
      this.currentImageIndex.set(this.currentImageIndex() - 1);
    }
  }
}
