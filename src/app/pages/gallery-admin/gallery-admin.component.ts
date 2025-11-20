import { Component, OnInit, OnDestroy, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { PersonalGalleryService } from '../../services/personal-gallery.service';
import { ImageService } from '../../services/image.service';
import { GithubUploadService } from '../../services/github-upload.service';
import { AuthService } from '../../services/auth.service';
import { AnalyticsService } from '../../services/analytics.service';
import { ContactMessageService } from '../../services/contact-message.service';
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
        <div class="header-left">
          <h1>Gallery Management</h1>
          @if (authService.currentUser()) {
            <div class="user-info">
              <span class="user-email">{{ authService.currentUser()!.email }}</span>
            </div>
          }
        </div>
        <div class="header-actions">
          <button class="btn-primary" (click)="toggleCreateForm()">
            {{ showCreateForm() ? 'Cancel' : 'Create New Gallery' }}
          </button>
          <button class="btn-secondary" (click)="navigateToPortfolioAdmin()">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
              <circle cx="8.5" cy="8.5" r="1.5"></circle>
              <polyline points="21 15 16 10 5 21"></polyline>
            </svg>
            Portfolio Images
          </button>
          <button class="btn-secondary messages-btn" (click)="navigateToMessageCenter()">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
              <polyline points="22,6 12,13 2,6"></polyline>
            </svg>
            Messages
            @if (unreadMessageCount() > 0) {
              <span class="message-badge">{{ unreadMessageCount() }}</span>
            }
          </button>
          <button class="btn-secondary" (click)="logout()">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
              <polyline points="16 17 21 12 16 7"></polyline>
              <line x1="21" y1="12" x2="9" y2="12"></line>
            </svg>
            Logout
          </button>
        </div>
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
            <small>Select JPEG, PNG, GIF, or WebP images (max 25MB each). Images will be automatically converted to WebP format for optimal performance.</small>
          </div>

          @if (convertingToWebP()) {
            <div class="form-group">
              <div class="conversion-progress">
                <div class="progress-spinner"></div>
                <span>{{ conversionProgress() }}</span>
              </div>
            </div>
          }

          @if (generatingThumbnails()) {
            <div class="form-group">
              <div class="thumbnail-loading">
                <div class="progress-spinner"></div>
                <span>Generating thumbnails for {{ selectedFiles().length }} images...</span>
              </div>
            </div>
          }

          @if (imagePreviews().length > 0 && !generatingThumbnails() && !convertingToWebP()) {
            <div class="form-group">
              <label>Selected Images ({{ selectedFiles().length }}) - Click an image to set as hero</label>
              <div class="image-previews" [style.--thumbnail-size.px]="thumbnailSize()">
                @for (preview of imagePreviews(); track preview; let i = $index) {
                  <div
                    class="preview-item"
                    [class.hero-selected]="selectedHeroIndex() === i"
                    (click)="selectHeroImage(i)">
                    <img
                      [src]="preview"
                      [alt]="selectedFiles()[i].name"
                      loading="lazy"
                      decoding="async">
                    @if (selectedHeroIndex() === i) {
                      <div class="hero-badge">
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                          <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                        </svg>
                        <span>Hero</span>
                      </div>
                    }
                    <div class="preview-overlay">
                      <span class="preview-filename">{{ selectedFiles()[i].name }}</span>
                      <button type="button" class="btn-remove" (click)="removeFile(i); $event.stopPropagation()">×</button>
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
            <button type="submit" class="btn-primary" [disabled]="creating() || uploading() || convertingToWebP()">
              {{ uploading() ? uploadProgress() : (creating() ? 'Creating...' : 'Create Gallery') }}
            </button>
            <button type="button" class="btn-secondary" (click)="toggleCreateForm()" [disabled]="convertingToWebP()">
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
              <div class="button-group">
                <button type="button" class="btn-copy" (click)="copyToClipboard(shareUrlInput)">
                  Copy Link
                </button>
                <button type="button" class="btn-view" (click)="openGallery(createdShareUrl())">
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path>
                    <polyline points="15 3 21 3 21 9"></polyline>
                    <line x1="10" y1="14" x2="21" y2="3"></line>
                  </svg>
                  View
                </button>
              </div>
            </div>

            <!-- Deployment Status -->
            @if (deploymentStatus()) {
              <div class="deployment-status" [class.status-ready]="deploymentStatus() === 'ready'" [class.status-error]="deploymentStatus() === 'error'">
                @if (deploymentStatus() === 'checking' || deploymentStatus() === 'deploying') {
                  <div class="status-icon">
                    <div class="loading-spinner"></div>
                  </div>
                  <div class="status-content">
                    <strong>Images Deploying...</strong>
                    <p>Your images are being published. The gallery will be ready to view in a few moments.</p>
                  </div>
                }
                @if (deploymentStatus() === 'ready') {
                  <div class="status-icon">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                      <polyline points="22 4 12 14.01 9 11.01"></polyline>
                    </svg>
                  </div>
                  <div class="status-content">
                    <strong>Gallery Ready!</strong>
                    <p>Your images are now live and the gallery is ready to view.</p>
                  </div>
                }
                @if (deploymentStatus() === 'error') {
                  <div class="status-icon">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <circle cx="12" cy="12" r="10"></circle>
                      <line x1="12" y1="8" x2="12" y2="12"></line>
                      <line x1="12" y1="16" x2="12.01" y2="16"></line>
                    </svg>
                  </div>
                  <div class="status-content">
                    <strong>Deployment Check Timeout</strong>
                    <p>The gallery has been created, but we couldn't confirm the images are live. Please check back in a few minutes.</p>
                  </div>
                }
              </div>
            }
          </div>
        </section>
      }

      <!-- Password Regeneration Modal -->
      @if (regeneratedPassword()) {
        <section class="password-modal-overlay" (click)="dismissPasswordModal()">
          <div class="password-modal" (click)="$event.stopPropagation()">
            <div class="modal-header">
              <h3>New Password Generated</h3>
              <button type="button" class="btn-close" (click)="dismissPasswordModal()">×</button>
            </div>
            <div class="modal-body">
              <p>A new password has been generated for gallery: <strong>{{ regeneratedPasswordGalleryTitle() }}</strong></p>
              <div class="password-display">
                <input
                  type="text"
                  [value]="regeneratedPassword()"
                  readonly
                  #passwordInput>
                <button type="button" class="btn-copy" (click)="copyToClipboard(passwordInput)">
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
                    <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
                  </svg>
                  Copy
                </button>
              </div>
              <p class="warning-text">
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path>
                  <line x1="12" y1="9" x2="12" y2="13"></line>
                  <line x1="12" y1="17" x2="12.01" y2="17"></line>
                </svg>
                Make sure to save this password and share it with the client. It won't be shown again.
              </p>
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
          <div class="galleries-grid">
            @if (galleries().length === 0) {
              <div class="empty-state">
                <p>No galleries found. Create your first gallery above!</p>
              </div>
            }

            @for (gallery of galleries(); track gallery.id) {
              <div
                class="gallery-card"
                [class.expired]="isExpired(gallery)"
                (click)="closeDropdown()">
                <div class="gallery-card-header">
                  <div class="gallery-info">
                    <h3>{{ gallery.title }}</h3>
                    <p class="client-name">
                      <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                        <circle cx="12" cy="7" r="4"></circle>
                      </svg>
                      {{ gallery.clientName }}
                    </p>
                  </div>
                  <div class="header-actions">
                    <div class="gallery-status" [class.active]="!isExpired(gallery)">
                      {{ isExpired(gallery) ? 'Expired' : 'Active' }}
                    </div>
                    <div class="dropdown-container">
                      <button
                        class="dropdown-toggle"
                        (click)="toggleDropdown(gallery.id, $event)"
                        [class.active]="openDropdownId() === gallery.id">
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                          <circle cx="12" cy="12" r="1"></circle>
                          <circle cx="12" cy="5" r="1"></circle>
                          <circle cx="12" cy="19" r="1"></circle>
                        </svg>
                      </button>
                      @if (openDropdownId() === gallery.id) {
                        <div class="dropdown-menu" (click)="$event.stopPropagation()">
                          <button
                            class="dropdown-item"
                            (click)="extendGallery(gallery.id, 7); closeDropdown()"
                            [disabled]="!gallery.isActive">
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                              <circle cx="12" cy="12" r="10"></circle>
                              <polyline points="12 6 12 12 16 14"></polyline>
                            </svg>
                            Extend 7 Days
                          </button>
                          <button
                            class="dropdown-item"
                            (click)="extendGallery(gallery.id, 30); closeDropdown()"
                            [disabled]="!gallery.isActive">
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                              <circle cx="12" cy="12" r="10"></circle>
                              <polyline points="12 6 12 12 16 14"></polyline>
                            </svg>
                            Extend 30 Days
                          </button>
                          <button
                            class="dropdown-item"
                            (click)="regeneratePassword(gallery.id, gallery.title); closeDropdown()">
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                              <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
                              <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
                            </svg>
                            Regenerate Password
                          </button>
                          @if (gallery.isActive) {
                            <button
                              class="dropdown-item deactivate"
                              (click)="deactivateGallery(gallery.id); closeDropdown()">
                              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <circle cx="12" cy="12" r="10"></circle>
                                <line x1="15" y1="9" x2="9" y2="15"></line>
                                <line x1="9" y1="9" x2="15" y2="15"></line>
                              </svg>
                              Deactivate
                            </button>
                          }
                          <button
                            class="dropdown-item delete"
                            (click)="deleteGallery(gallery.id); closeDropdown()">
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                              <polyline points="3 6 5 6 21 6"></polyline>
                              <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                            </svg>
                            Delete
                          </button>
                        </div>
                      }
                    </div>
                  </div>
                </div>

                <div class="gallery-card-body">
                  @if (gallery.description) {
                    <p class="description">{{ gallery.description }}</p>
                  }

                  <div class="gallery-meta">
                    <div class="meta-item">
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                        <circle cx="8.5" cy="8.5" r="1.5"></circle>
                        <polyline points="21 15 16 10 5 21"></polyline>
                      </svg>
                      <span>{{ gallery.imageUrls.length }} images</span>
                    </div>
                    <div class="meta-item">
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                        <circle cx="12" cy="12" r="3"></circle>
                      </svg>
                      <span>{{ gallery.accessCount }} views</span>
                    </div>
                    <div class="meta-item">
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                        <line x1="16" y1="2" x2="16" y2="6"></line>
                        <line x1="8" y1="2" x2="8" y2="6"></line>
                        <line x1="3" y1="10" x2="21" y2="10"></line>
                      </svg>
                      <span>{{ gallery.createdAt | date:'MMM d, y' }}</span>
                    </div>
                    <div class="meta-item">
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <circle cx="12" cy="12" r="10"></circle>
                        <polyline points="12 6 12 12 16 14"></polyline>
                      </svg>
                      <span>Expires {{ gallery.expiresAt | date:'MMM d' }}</span>
                    </div>
                    @if (gallery.lastAccessedAt) {
                      <div class="meta-item">
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                          <polyline points="23 6 13.5 15.5 8.5 10.5 1 18"></polyline>
                          <polyline points="17 6 23 6 23 12"></polyline>
                        </svg>
                        <span>{{ gallery.lastAccessedAt | date:'MMM d' }}</span>
                      </div>
                    }
                    @if (gallery.password) {
                      <div class="meta-item password">
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                          <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
                          <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
                        </svg>
                        <span>Password protected</span>
                      </div>
                    }
                  </div>
                </div>

                <div class="gallery-card-footer">
                  <label class="share-label">Share Link</label>
                  <div class="share-url-inline">
                    <input
                      type="text"
                      [value]="getShareUrl(gallery.shareToken)"
                      readonly
                      #galleryShareUrl
                      (click)="$event.stopPropagation()">
                    <div class="button-group">
                      <button class="btn-copy" (click)="copyToClipboard(galleryShareUrl); $event.stopPropagation()">
                        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                          <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
                          <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
                        </svg>
                        Copy
                      </button>
                      <button class="btn-view" (click)="openGallery(getShareUrl(gallery.shareToken)); $event.stopPropagation()">
                        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                          <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path>
                          <polyline points="15 3 21 3 21 9"></polyline>
                          <line x1="10" y1="14" x2="21" y2="3"></line>
                        </svg>
                        View
                      </button>
                    </div>
                  </div>
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
export class GalleryAdminComponent implements OnInit, OnDestroy {
  galleries = signal<PersonalGallery[]>([]);
  stats = signal<GalleryStats | null>(null);
  loading = signal(true);
  creating = signal(false);
  showCreateForm = signal(false);
  createdShareUrl = signal('');
  showToast = signal(false);
  toastMessage = signal('');
  openDropdownId = signal<string | null>(null);
  unreadMessageCount = signal(0);
  regeneratedPassword = signal('');
  regeneratedPasswordGalleryTitle = signal('');

  // File upload state
  selectedFiles = signal<File[]>([]);
  uploading = signal(false);
  uploadProgress = signal<string>('');
  imagePreviews = signal<string[]>([]);
  generatingThumbnails = signal(false);
  convertingToWebP = signal(false);
  conversionProgress = signal('');

  // Hero image selection (index of selected hero image, defaults to 0)
  selectedHeroIndex = signal<number>(0);

  // Deployment status
  deploymentStatus = signal<'checking' | 'deploying' | 'ready' | 'error' | null>(null);
  private deploymentCheckInterval: any = null;
  private deploymentCheckAttempts = 0;
  private maxDeploymentCheckAttempts = 60; // 5 minutes max (60 * 5 seconds)

  // Computed thumbnail size based on image count
  thumbnailSize = () => {
    const count = this.selectedFiles().length;
    if (count <= 14) return 150;
    if (count <= 21) return 100;
    if (count <= 35) return 75;
    return 60; // For very large sets
  };

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
    private githubUploadService: GithubUploadService,
    public authService: AuthService,
    private analytics: AnalyticsService,
    private router: Router,
    private contactMessageService: ContactMessageService
  ) {}

  ngOnInit() {
    this.analytics.trackPageView('gallery_admin');
    this.loadGalleries();
    this.loadStats();
    this.loadUnreadMessageCount();
  }

  ngOnDestroy() {
    // Clean up object URLs to prevent memory leaks
    this.imagePreviews().forEach(url => URL.revokeObjectURL(url));

    // Clear deployment check interval
    if (this.deploymentCheckInterval) {
      clearInterval(this.deploymentCheckInterval);
    }
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

  async loadUnreadMessageCount() {
    try {
      const count = await this.contactMessageService.getUnreadCount();
      this.unreadMessageCount.set(count);
    } catch (error) {
      console.error('Error loading unread message count:', error);
    }
  }

  toggleCreateForm() {
    this.showCreateForm.set(!this.showCreateForm());
    this.createdShareUrl.set('');
    if (this.showCreateForm()) {
      this.resetForm();
    }
  }

  private resetForm() {
    // Clean up object URLs before resetting
    this.imagePreviews().forEach(url => URL.revokeObjectURL(url));

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
    this.generatingThumbnails.set(false);
    this.convertingToWebP.set(false);
    this.conversionProgress.set('');
    this.selectedHeroIndex.set(0);
  }

  async onFilesSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (!input.files || input.files.length === 0) return;

    // Revoke old object URLs to prevent memory leaks
    this.imagePreviews().forEach(url => URL.revokeObjectURL(url));

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

    if (validFiles.length > 0) {
      // Convert to WebP format
      this.convertingToWebP.set(true);
      this.conversionProgress.set('Converting images to WebP format...');

      try {
        const webpFiles = await this.imageService.convertMultipleToWebP(
          validFiles,
          0.85, // 85% quality
          (current: number, total: number) => {
            this.conversionProgress.set(`Converting to WebP: ${current}/${total}`);
          }
        );

        this.selectedFiles.set(webpFiles);
        this.convertingToWebP.set(false);
        this.conversionProgress.set('');
        this.generateImagePreviews(webpFiles);

        // Track file selection
        this.analytics.trackAdminImageUpload(webpFiles.length, 'file_picker');
      } catch (error) {
        console.error('Error converting to WebP:', error);
        this.showToastMessage('Failed to convert images to WebP. Using original files.');
        this.convertingToWebP.set(false);
        this.conversionProgress.set('');
        // Fall back to original files
        this.selectedFiles.set(validFiles);
        this.generateImagePreviews(validFiles);

        // Track file selection
        this.analytics.trackAdminImageUpload(validFiles.length, 'file_picker');
      }
    }
  }

  selectHeroImage(index: number) {
    if (index >= 0 && index < this.selectedFiles().length) {
      this.selectedHeroIndex.set(index);
    }
  }

  private generateImagePreviews(files: File[]) {
    // Generate actual thumbnail images for better rendering performance
    this.generatingThumbnails.set(true);
    const thumbnailPromises = files.map(file => this.createThumbnail(file));

    Promise.all(thumbnailPromises).then(thumbnails => {
      this.imagePreviews.set(thumbnails);
      this.generatingThumbnails.set(false);
    }).catch(error => {
      console.error('Error generating thumbnails:', error);
      this.generatingThumbnails.set(false);
    });
  }

  private async createThumbnail(file: File): Promise<string> {
    return new Promise((resolve) => {
      const img = new Image();
      const objectUrl = URL.createObjectURL(file);

      img.onload = () => {
        // Clean up the temporary object URL
        URL.revokeObjectURL(objectUrl);

        // Create canvas for thumbnail
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d')!;

        // Dynamic thumbnail size based on image count
        // More images = smaller thumbnails for better performance
        const count = this.selectedFiles().length;
        let maxSize = 300;
        if (count > 21) maxSize = 200;
        if (count > 35) maxSize = 150;

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

        // Convert to blob URL with adaptive quality
        // Lower quality for large sets to save memory
        const quality = count > 35 ? 0.75 : 0.85;
        canvas.toBlob((blob) => {
          if (blob) {
            resolve(URL.createObjectURL(blob));
          } else {
            // Fallback to original if blob creation fails
            resolve(URL.createObjectURL(file));
          }
        }, 'image/jpeg', quality);
      };

      img.onerror = () => {
        // Fallback to original on error
        URL.revokeObjectURL(objectUrl);
        resolve(URL.createObjectURL(file));
      };

      img.src = objectUrl;
    });
  }

  removeFile(index: number) {
    const files = [...this.selectedFiles()];
    const previews = [...this.imagePreviews()];

    // Revoke the object URL to prevent memory leak
    URL.revokeObjectURL(previews[index]);

    files.splice(index, 1);
    previews.splice(index, 1);

    this.selectedFiles.set(files);
    this.imagePreviews.set(previews);

    // Adjust hero index if necessary
    const currentHeroIndex = this.selectedHeroIndex();
    if (index === currentHeroIndex) {
      // If removed image was hero, reset to first image
      this.selectedHeroIndex.set(0);
    } else if (index < currentHeroIndex) {
      // If removed image was before hero, decrement hero index
      this.selectedHeroIndex.set(currentHeroIndex - 1);
    }
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

        // Set the hero image URL based on selected index
        const heroImageUrl = imageUrls[this.selectedHeroIndex()];

        const request: CreateGalleryRequest = {
          title: this.newGallery.title!,
          clientName: this.newGallery.clientName!,
          clientEmail: this.newGallery.clientEmail,
          description: this.newGallery.description,
          imageUrls,
          heroImageUrl,
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

            // Track gallery creation
            this.analytics.trackAdminGalleryCreate(imageUrls.length);

            // Hide the form and reset it
            this.showCreateForm.set(false);
            this.resetForm();

            this.loadGalleries();
            this.loadStats();
            this.showToastMessage(`Gallery created successfully with ${imageUrls.length} images!`);

            // Start checking deployment status
            this.startDeploymentCheck(imageUrls[0]);

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

  private startDeploymentCheck(firstImagePath: string) {
    // Clear any existing interval
    if (this.deploymentCheckInterval) {
      clearInterval(this.deploymentCheckInterval);
    }

    // Reset attempt counter
    this.deploymentCheckAttempts = 0;
    this.deploymentStatus.set('checking');

    // Check immediately
    this.checkImageDeployment(firstImagePath);

    // Then check every 5 seconds
    this.deploymentCheckInterval = setInterval(() => {
      this.checkImageDeployment(firstImagePath);
    }, 5000);
  }

  private checkImageDeployment(imagePath: string) {
    this.deploymentCheckAttempts++;

    // Get the full image URL
    const imageUrl = this.imageService.getImageUrl(imagePath);

    // Try to load the image
    const img = new Image();
    img.crossOrigin = 'anonymous';

    img.onload = () => {
      // Image loaded successfully - deployment is complete
      this.deploymentStatus.set('ready');
      if (this.deploymentCheckInterval) {
        clearInterval(this.deploymentCheckInterval);
        this.deploymentCheckInterval = null;
      }
    };

    img.onerror = () => {
      // Image not accessible yet
      if (this.deploymentCheckAttempts >= this.maxDeploymentCheckAttempts) {
        // Max attempts reached - stop checking and show error
        this.deploymentStatus.set('error');
        if (this.deploymentCheckInterval) {
          clearInterval(this.deploymentCheckInterval);
          this.deploymentCheckInterval = null;
        }
      } else {
        // Still deploying
        this.deploymentStatus.set('deploying');
      }
    };

    img.src = imageUrl + '?t=' + Date.now(); // Add cache buster
  }

  extendGallery(id: string, days: number) {
    this.galleryService.extendExpiration(id, days).subscribe({
      next: () => {
        console.log(`Gallery expiration extended by ${days} days`);
        this.analytics.trackAdminGalleryEdit(id, `extend_${days}_days`);
        this.loadGalleries();
        this.showToastMessage(`Gallery extended by ${days} days`);
      },
      error: (error) => {
        console.error('Error extending gallery:', error);
        this.analytics.trackError(error.message, 'extend_gallery');
        alert('Failed to extend gallery expiration');
      }
    });
  }

  deactivateGallery(id: string) {
    if (confirm('Are you sure you want to deactivate this gallery? It will no longer be accessible.')) {
      this.galleryService.deactivateGallery(id).subscribe({
        next: () => {
          console.log('Gallery deactivated');
          this.analytics.trackAdminGalleryEdit(id, 'deactivate');
          this.loadGalleries();
          this.loadStats();
          this.showToastMessage('Gallery deactivated successfully');
        },
        error: (error) => {
          console.error('Error deactivating gallery:', error);
          this.analytics.trackError(error.message, 'deactivate_gallery');
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
          this.analytics.trackAdminGalleryEdit(id, 'delete');
          this.loadGalleries();
          this.loadStats();
          this.showToastMessage('Gallery deleted successfully');
        },
        error: (error) => {
          console.error('Error deleting gallery:', error);
          this.analytics.trackError(error.message, 'delete_gallery');
          alert('Failed to delete gallery');
        }
      });
    }
  }

  regeneratePassword(id: string, galleryTitle: string) {
    if (confirm('This will generate a new password for the gallery. The old password will no longer work. Continue?')) {
      // Generate a random 8-character password
      const newPassword = this.generateRandomPassword();

      this.galleryService.updateGallery(id, { password: newPassword }).subscribe({
        next: () => {
          console.log('Password regenerated for gallery:', id);
          this.analytics.trackAdminGalleryEdit(id, 'regenerate_password');
          this.regeneratedPassword.set(newPassword);
          this.regeneratedPasswordGalleryTitle.set(galleryTitle);
          this.loadGalleries(); // Refresh gallery list
        },
        error: (error) => {
          console.error('Error regenerating password:', error);
          this.analytics.trackError(error.message, 'regenerate_password');
          alert('Failed to regenerate password');
        }
      });
    }
  }

  generateRandomPassword(): string {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789';
    let password = '';
    for (let i = 0; i < 8; i++) {
      password += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return password;
  }

  dismissPasswordModal() {
    this.regeneratedPassword.set('');
    this.regeneratedPasswordGalleryTitle.set('');
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
    this.deploymentStatus.set(null);
    if (this.deploymentCheckInterval) {
      clearInterval(this.deploymentCheckInterval);
      this.deploymentCheckInterval = null;
    }
  }

  openGallery(url: string) {
    window.open(url, '_blank');
  }

  isExpired(gallery: PersonalGallery): boolean {
    return !gallery.isActive || new Date(gallery.expiresAt) < new Date();
  }

  navigateToMessageCenter() {
    this.router.navigate(['/message-center']);
  }

  navigateToPortfolioAdmin() {
    this.router.navigate(['/portfolio-admin']);
  }

  async logout() {
    try {
      await this.authService.signOut();
    } catch (error: any) {
      this.showToastMessage('Failed to sign out: ' + error.message);
    }
  }

  toggleDropdown(galleryId: string, event?: Event) {
    if (event) {
      event.stopPropagation();
    }
    this.openDropdownId.set(this.openDropdownId() === galleryId ? null : galleryId);
  }

  closeDropdown() {
    this.openDropdownId.set(null);
  }
}
