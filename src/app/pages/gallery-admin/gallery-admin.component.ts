import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PersonalGalleryService } from '../../services/personal-gallery.service';
import { ImageService } from '../../services/image.service';
import { GithubUploadService } from '../../services/github-upload.service';
import {
  PersonalGallery,
  GalleryStats,
  CreateGalleryRequest
} from '../../models/gallery.model';

@Component({
  selector: 'app-gallery-admin',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="admin-container">
      <header class="admin-header">
        <h1>Gallery Management</h1>
        <button class="btn-primary" (click)="toggleCreateForm()">
          {{ showCreateForm() ? 'Cancel' : 'Create New Gallery' }}
        </button>
      </header>

      <!-- Create Gallery Form -->
      @if (showCreateForm()) {
        <section class="create-form">
        <h2>Create New Gallery</h2>
        <form (submit)="createGallery($event)" class="gallery-form">
          <div class="form-row">
            <div class="form-group">
              <label for="title">Gallery Title *</label>
              <input
                type="text"
                id="title"
                [(ngModel)]="newGallery.title"
                name="title"
                required>
            </div>
            <div class="form-group">
              <label for="clientName">Client Name *</label>
              <input
                type="text"
                id="clientName"
                [(ngModel)]="newGallery.clientName"
                name="clientName"
                required>
            </div>
          </div>

          <div class="form-row">
            <div class="form-group">
              <label for="clientEmail">Client Email</label>
              <input
                type="email"
                id="clientEmail"
                [(ngModel)]="newGallery.clientEmail"
                name="clientEmail">
            </div>
            <div class="form-group">
              <label for="expirationDays">Expiration (days) *</label>
              <input
                type="number"
                id="expirationDays"
                [(ngModel)]="newGallery.expirationDays"
                name="expirationDays"
                min="1"
                required>
            </div>
          </div>

          <div class="form-group">
            <label for="description">Description</label>
            <textarea
              id="description"
              [(ngModel)]="newGallery.description"
              name="description"
              rows="3"></textarea>
          </div>

          <div class="form-group">
            <label for="password">Password Protection (optional)</label>
            <input
              type="text"
              id="password"
              [(ngModel)]="newGallery.password"
              name="password"
              autocomplete="off"
              placeholder="Leave blank for no password">
          </div>

          <div class="form-group">
            <label for="imageFiles">Upload Images *</label>
            <input
              type="file"
              id="imageFiles"
              accept="image/jpeg,image/jpg,image/png,image/gif,image/webp"
              multiple
              (change)="onFilesSelected($event)"
              #fileInput
              class="file-input">
            <small>Select JPEG, PNG, GIF, or WebP images (max 10MB each)</small>
          </div>

          @if (imagePreviews().length > 0) {
            <div class="form-group">
              <label>Selected Images ({{ selectedFiles().length }})</label>
              <div class="image-previews">
                @for (preview of imagePreviews(); track preview; let i = $index) {
                  <div class="preview-item">
                    <img [src]="preview" [alt]="selectedFiles()[i].name">
                    <div class="preview-overlay">
                      <span class="preview-filename">{{ selectedFiles()[i].name }}</span>
                      <button type="button" class="btn-remove" (click)="removeFile(i)">×</button>
                    </div>
                  </div>
                }
              </div>
            </div>
          }

          @if (uploadProgress()) {
            <div class="upload-progress">
              <div class="progress-spinner"></div>
              <span>{{ uploadProgress() }}</span>
            </div>
          }

          <div class="form-actions">
            <button type="submit" class="btn-primary" [disabled]="creating() || uploading()">
              {{ uploading() ? uploadProgress() : (creating() ? 'Creating...' : 'Create Gallery') }}
            </button>
            <button type="button" class="btn-secondary" (click)="toggleCreateForm()">
              Cancel
            </button>
          </div>

        </form>
        </section>
      }

      <!-- Success Banner (shown after form is hidden) -->
      @if (createdShareUrl() && !showCreateForm()) {
        <section class="success-banner">
          <div class="success-content">
            <div class="success-header">
              <h3>Gallery Created Successfully!</h3>
              <button type="button" class="btn-close" (click)="dismissSuccess()">×</button>
            </div>
            <p>Share this link with your client:</p>
            <div class="share-url-box">
              <input
                type="text"
                [value]="createdShareUrl()"
                readonly
                #shareUrlInput>
              <button type="button" class="btn-copy" (click)="copyToClipboard(shareUrlInput)">
                Copy Link
              </button>
            </div>
          </div>
        </section>
      }

      <!-- Statistics -->
      @if (stats()) {
        <section class="stats-section">
          <h2>Statistics</h2>
          <div class="stats-grid">
            <div class="stat-card">
              <div class="stat-value">{{ stats()!.totalGalleries }}</div>
              <div class="stat-label">Total Galleries</div>
            </div>
            <div class="stat-card">
              <div class="stat-value">{{ stats()!.activeGalleries }}</div>
              <div class="stat-label">Active</div>
            </div>
            <div class="stat-card">
              <div class="stat-value">{{ stats()!.expiredGalleries }}</div>
              <div class="stat-label">Expired</div>
            </div>
            <div class="stat-card">
              <div class="stat-value">{{ stats()!.totalViews }}</div>
              <div class="stat-label">Total Views</div>
            </div>
          </div>
        </section>
      }

      <!-- Galleries List -->
      <section class="galleries-section">
        <div class="section-header">
          <h2>Active Galleries</h2>
          <div class="filter-controls">
            <button
              class="btn-secondary"
              (click)="loadGalleries()"
              [disabled]="loading()">
              Refresh
            </button>
            <button
              class="btn-secondary"
              (click)="cleanupExpired()">
              Cleanup Expired
            </button>
          </div>
        </div>

        @if (loading()) {
          <div class="loading">
            <div class="loading-spinner"></div>
            Loading galleries...
          </div>
        }

        @if (!loading()) {
          <div class="galleries-list">
            @if (galleries().length === 0) {
              <div class="empty-state">
                <p>No galleries found. Create your first gallery above!</p>
              </div>
            }

            @for (gallery of galleries(); track gallery.id) {
              <div
                class="gallery-card"
                [class.expired]="isExpired(gallery)">
            <div class="gallery-card-header">
              <div class="gallery-info">
                <h3>{{ gallery.title }}</h3>
                <p class="client-name">{{ gallery.clientName }}</p>
              </div>
              <div class="gallery-status" [class.active]="!isExpired(gallery)">
                {{ isExpired(gallery) ? 'Expired' : 'Active' }}
              </div>
            </div>

            <div class="gallery-card-body">
              @if (gallery.description) {
                <p class="description">
                  {{ gallery.description }}
                </p>
              }

              <div class="gallery-meta">
                <div class="meta-item">
                  <strong>Images:</strong> {{ gallery.imageUrls.length }}
                </div>
                <div class="meta-item">
                  <strong>Views:</strong> {{ gallery.accessCount }}
                </div>
                <div class="meta-item">
                  <strong>Created:</strong> {{ gallery.createdAt | date:'short' }}
                </div>
                <div class="meta-item">
                  <strong>Expires:</strong> {{ gallery.expiresAt | date:'short' }}
                </div>
                @if (gallery.lastAccessedAt) {
                  <div class="meta-item">
                    <strong>Last Viewed:</strong> {{ gallery.lastAccessedAt | date:'short' }}
                  </div>
                }
                @if (gallery.password) {
                  <div class="meta-item">
                    <strong>Password Protected:</strong> Yes
                  </div>
                }
              </div>

              <div class="share-url">
                <strong>Share Link:</strong>
                <div class="share-url-inline">
                  <input
                    type="text"
                    [value]="getShareUrl(gallery.shareToken)"
                    readonly
                    #galleryShareUrl>
                  <button class="btn-copy" (click)="copyToClipboard(galleryShareUrl)">
                    Copy
                  </button>
                </div>
              </div>
            </div>

            <div class="gallery-card-actions">
              <button
                class="btn-action btn-extend"
                (click)="extendGallery(gallery.id, 7)"
                [disabled]="!gallery.isActive">
                Extend 7 Days
              </button>
              <button
                class="btn-action btn-extend"
                (click)="extendGallery(gallery.id, 30)"
                [disabled]="!gallery.isActive">
                Extend 30 Days
              </button>
              @if (gallery.isActive) {
                <button
                  class="btn-action btn-deactivate"
                  (click)="deactivateGallery(gallery.id)">
                  Deactivate
                </button>
              }
              <button
                class="btn-action btn-delete"
                (click)="deleteGallery(gallery.id)">
                Delete
              </button>
            </div>
              </div>
            }
          </div>
        }
      </section>

      <!-- Toast Notification -->
      @if (showToast()) {
        <div class="toast-notification">
          <div class="toast-content">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <polyline points="20 6 9 17 4 12"></polyline>
            </svg>
            <span>{{ toastMessage() }}</span>
          </div>
        </div>
      }
    </div>
  `,
  styleUrls: ['./gallery-admin.component.scss']
})
export class GalleryAdminComponent implements OnInit {
  galleries = signal<PersonalGallery[]>([]);
  stats = signal<GalleryStats | null>(null);
  loading = signal(true);
  creating = signal(false);
  showCreateForm = signal(false);
  createdShareUrl = signal('');
  showToast = signal(false);
  toastMessage = signal('');

  // File upload state
  selectedFiles = signal<File[]>([]);
  uploading = signal(false);
  uploadProgress = signal<string>('');
  imagePreviews = signal<string[]>([]);

  newGallery: Partial<CreateGalleryRequest> = {
    title: '',
    clientName: '',
    clientEmail: '',
    description: '',
    expirationDays: 30,
    password: ''
  };

  imageUrlsText = '';

  constructor(
    private galleryService: PersonalGalleryService,
    public imageService: ImageService,
    private githubUploadService: GithubUploadService
  ) {}

  ngOnInit() {
    this.loadGalleries();
    this.loadStats();
  }

  loadGalleries() {
    this.loading.set(true);
    this.galleryService.queryGalleries({
      orderBy: 'createdAt',
      orderDirection: 'desc'
    }).subscribe({
      next: (galleries) => {
        this.galleries.set(galleries);
        this.loading.set(false);
      },
      error: (error) => {
        console.error('Error loading galleries:', error);
        this.loading.set(false);
      }
    });
  }

  loadStats() {
    this.galleryService.getGalleryStats().subscribe({
      next: (stats) => {
        this.stats.set(stats);
      },
      error: (error) => {
        console.error('Error loading stats:', error);
      }
    });
  }

  toggleCreateForm() {
    this.showCreateForm.set(!this.showCreateForm());
    this.createdShareUrl.set('');
    if (this.showCreateForm()) {
      this.resetForm();
    }
  }

  private resetForm() {
    // Reset form fields
    this.newGallery = {
      title: '',
      clientName: '',
      clientEmail: '',
      description: '',
      expirationDays: 30,
      password: ''
    };
    this.imageUrlsText = '';
    this.selectedFiles.set([]);
    this.imagePreviews.set([]);
    this.uploadProgress.set('');
  }

  onFilesSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (!input.files || input.files.length === 0) return;

    const files = Array.from(input.files);
    const validFiles: File[] = [];

    for (const file of files) {
      const validation = this.githubUploadService.validateImageFile(file);
      if (validation.valid) {
        validFiles.push(file);
      } else {
        this.showToastMessage(validation.error || 'Invalid file');
      }
    }

    this.selectedFiles.set(validFiles);
    this.generateImagePreviews(validFiles);
  }

  private generateImagePreviews(files: File[]) {
    const previews: string[] = [];
    let loaded = 0;

    files.forEach(file => {
      const reader = new FileReader();
      reader.onload = (e) => {
        previews.push(e.target?.result as string);
        loaded++;
        if (loaded === files.length) {
          this.imagePreviews.set(previews);
        }
      };
      reader.readAsDataURL(file);
    });
  }

  removeFile(index: number) {
    const files = [...this.selectedFiles()];
    const previews = [...this.imagePreviews()];

    files.splice(index, 1);
    previews.splice(index, 1);

    this.selectedFiles.set(files);
    this.imagePreviews.set(previews);
  }

  createGallery(event: Event) {
    event.preventDefault();

    if (!this.newGallery.title || !this.newGallery.clientName) {
      this.showToastMessage('Please fill in all required fields');
      return;
    }

    if (this.selectedFiles().length === 0) {
      this.showToastMessage('Please select at least one image');
      return;
    }

    this.creating.set(true);
    this.uploading.set(true);
    this.uploadProgress.set('Uploading images...');

    // Upload images to GitHub as a single commit
    this.githubUploadService.uploadImages(this.selectedFiles(), this.newGallery.clientName!).subscribe({
      next: (uploadResults) => {
        this.uploadProgress.set('Creating gallery...');

        // Extract image paths from upload results
        const imageUrls = uploadResults.map(result => result.path);

        const request: CreateGalleryRequest = {
          title: this.newGallery.title!,
          clientName: this.newGallery.clientName!,
          clientEmail: this.newGallery.clientEmail,
          description: this.newGallery.description,
          imageUrls,
          expirationDays: this.newGallery.expirationDays || 30,
          password: this.newGallery.password || undefined
        };

        this.galleryService.createGallery(request).subscribe({
          next: (response) => {
            console.log('Gallery created successfully:', response);
            this.createdShareUrl.set(response.shareUrl);
            this.creating.set(false);
            this.uploading.set(false);
            this.uploadProgress.set('');

            // Hide the form and reset it
            this.showCreateForm.set(false);
            this.resetForm();

            this.loadGalleries();
            this.loadStats();
            this.showToastMessage(`Gallery created successfully with ${imageUrls.length} images!`);

            // Scroll to success message
            setTimeout(() => {
              document.querySelector('.success-banner')?.scrollIntoView({ behavior: 'smooth' });
            }, 100);
          },
          error: (error) => {
            console.error('Error creating gallery:', error);
            this.showToastMessage('Failed to create gallery: ' + error.message);
            this.creating.set(false);
            this.uploading.set(false);
            this.uploadProgress.set('');
          }
        });
      },
      error: (error) => {
        console.error('Error uploading images:', error);
        this.showToastMessage('Failed to upload images: ' + error.message);
        this.creating.set(false);
        this.uploading.set(false);
        this.uploadProgress.set('');
      }
    });
  }

  extendGallery(id: string, days: number) {
    this.galleryService.extendExpiration(id, days).subscribe({
      next: () => {
        console.log(`Gallery expiration extended by ${days} days`);
        this.loadGalleries();
      },
      error: (error) => {
        console.error('Error extending gallery:', error);
        alert('Failed to extend gallery expiration');
      }
    });
  }

  deactivateGallery(id: string) {
    if (confirm('Are you sure you want to deactivate this gallery? It will no longer be accessible.')) {
      this.galleryService.deactivateGallery(id).subscribe({
        next: () => {
          console.log('Gallery deactivated');
          this.loadGalleries();
          this.loadStats();
        },
        error: (error) => {
          console.error('Error deactivating gallery:', error);
          alert('Failed to deactivate gallery');
        }
      });
    }
  }

  deleteGallery(id: string) {
    if (confirm('Are you sure you want to permanently delete this gallery? This action cannot be undone.')) {
      this.galleryService.deleteGallery(id).subscribe({
        next: () => {
          console.log('Gallery deleted');
          this.loadGalleries();
          this.loadStats();
        },
        error: (error) => {
          console.error('Error deleting gallery:', error);
          alert('Failed to delete gallery');
        }
      });
    }
  }

  cleanupExpired() {
    if (confirm('This will deactivate all expired galleries. Continue?')) {
      this.galleryService.cleanupExpiredGalleries().subscribe({
        next: (count) => {
          alert(`Cleaned up ${count} expired galleries`);
          this.loadGalleries();
          this.loadStats();
        },
        error: (error) => {
          console.error('Error cleaning up galleries:', error);
          alert('Failed to cleanup expired galleries');
        }
      });
    }
  }

  getShareUrl(shareToken: string): string {
    return `${window.location.origin}/#/gallery/shared/${shareToken}`;
  }

  copyToClipboard(input: HTMLInputElement) {
    input.select();

    // Use modern Clipboard API with fallback
    if (navigator.clipboard && window.isSecureContext) {
      navigator.clipboard.writeText(input.value).then(() => {
        this.showToastMessage('Link copied to clipboard!');
      }).catch(() => {
        // Fallback to execCommand
        document.execCommand('copy');
        this.showToastMessage('Link copied to clipboard!');
      });
    } else {
      // Fallback for older browsers
      document.execCommand('copy');
      this.showToastMessage('Link copied to clipboard!');
    }
  }

  private showToastMessage(message: string) {
    this.toastMessage.set(message);
    this.showToast.set(true);

    // Auto-hide after 3 seconds
    setTimeout(() => {
      this.showToast.set(false);
    }, 3000);
  }

  dismissSuccess() {
    this.createdShareUrl.set('');
  }

  isExpired(gallery: PersonalGallery): boolean {
    return !gallery.isActive || new Date(gallery.expiresAt) < new Date();
  }
}
