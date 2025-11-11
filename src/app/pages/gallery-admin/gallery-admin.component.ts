import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PersonalGalleryService } from '../../services/personal-gallery.service';
import { ImageService } from '../../services/image.service';
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
      <section class="create-form" *ngIf="showCreateForm()">
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
              placeholder="Leave blank for no password">
          </div>

          <div class="form-group">
            <label for="imageUrls">Image URLs (one per line) *</label>
            <textarea
              id="imageUrls"
              [(ngModel)]="imageUrlsText"
              name="imageUrls"
              rows="5"
              placeholder="portraits/client-name/img-001.jpg&#10;portraits/client-name/img-002.jpg"
              required></textarea>
            <small>Enter relative paths from your image base URL</small>
          </div>

          <div class="form-actions">
            <button type="submit" class="btn-primary" [disabled]="creating()">
              {{ creating() ? 'Creating...' : 'Create Gallery' }}
            </button>
            <button type="button" class="btn-secondary" (click)="toggleCreateForm()">
              Cancel
            </button>
          </div>

          <div class="success-message" *ngIf="createdShareUrl()">
            <h3>Gallery Created Successfully!</h3>
            <p>Share URL:</p>
            <div class="share-url-box">
              <input
                type="text"
                [value]="createdShareUrl()"
                readonly
                #shareUrlInput>
              <button type="button" class="btn-copy" (click)="copyToClipboard(shareUrlInput)">
                Copy
              </button>
            </div>
          </div>
        </form>
      </section>

      <!-- Statistics -->
      <section class="stats-section" *ngIf="stats()">
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

        <div class="loading" *ngIf="loading()">
          <div class="loading-spinner"></div>
          Loading galleries...
        </div>

        <div class="galleries-list" *ngIf="!loading()">
          <div class="empty-state" *ngIf="galleries().length === 0">
            <p>No galleries found. Create your first gallery above!</p>
          </div>

          <div
            *ngFor="let gallery of galleries()"
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
              <p class="description" *ngIf="gallery.description">
                {{ gallery.description }}
              </p>

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
                <div class="meta-item" *ngIf="gallery.lastAccessedAt">
                  <strong>Last Viewed:</strong> {{ gallery.lastAccessedAt | date:'short' }}
                </div>
                <div class="meta-item" *ngIf="gallery.password">
                  <strong>Password Protected:</strong> Yes
                </div>
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
              <button
                class="btn-action btn-deactivate"
                (click)="deactivateGallery(gallery.id)"
                *ngIf="gallery.isActive">
                Deactivate
              </button>
              <button
                class="btn-action btn-delete"
                (click)="deleteGallery(gallery.id)">
                Delete
              </button>
            </div>
          </div>
        </div>
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
    public imageService: ImageService
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
      // Reset form
      this.newGallery = {
        title: '',
        clientName: '',
        clientEmail: '',
        description: '',
        expirationDays: 30,
        password: ''
      };
      this.imageUrlsText = '';
    }
  }

  createGallery(event: Event) {
    event.preventDefault();

    if (!this.newGallery.title || !this.newGallery.clientName || !this.imageUrlsText) {
      alert('Please fill in all required fields');
      return;
    }

    this.creating.set(true);

    // Parse image URLs from textarea
    const imageUrls = this.imageUrlsText
      .split('\n')
      .map(url => url.trim())
      .filter(url => url.length > 0);

    if (imageUrls.length === 0) {
      alert('Please add at least one image URL');
      this.creating.set(false);
      return;
    }

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
        this.loadGalleries();
        this.loadStats();
        // Scroll to success message
        setTimeout(() => {
          document.querySelector('.success-message')?.scrollIntoView({ behavior: 'smooth' });
        }, 100);
      },
      error: (error) => {
        console.error('Error creating gallery:', error);
        alert('Failed to create gallery: ' + error.message);
        this.creating.set(false);
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

  isExpired(gallery: PersonalGallery): boolean {
    return !gallery.isActive || new Date(gallery.expiresAt) < new Date();
  }
}
