import { Component, OnInit, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { PortfolioAdminService } from '../../services/portfolio-admin.service';
import { ImageService } from '../../services/image.service';
import { GithubUploadService, UploadResult } from '../../services/github-upload.service';
import { AuthService } from '../../services/auth.service';
import { AnalyticsService } from '../../services/analytics.service';
import { ContactMessageService } from '../../services/contact-message.service';
import {
  PortfolioImage,
  PortfolioCategory,
  PortfolioStats,
  CreatePortfolioImageRequest,
  PortfolioImageQueryOptions
} from '../../models/gallery.model';
import { environment } from '../../../environments/environment';

interface CategoryDisplay {
  value: PortfolioCategory;
  label: string;
  folder: string;
}

@Component({
  selector: 'app-portfolio-admin',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="admin-container">
      <header class="admin-header">
        <div class="header-left">
          <h1>Portfolio Image Management</h1>
          @if (authService.currentUser()) {
            <div class="user-info">
              <span class="user-email">{{ authService.currentUser()!.email }}</span>
            </div>
          }
        </div>
        <div class="header-actions">
          <button class="btn-secondary" (click)="navigateToGalleryAdmin()">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
              <polyline points="9 22 9 12 15 12 15 22"></polyline>
            </svg>
            Client Galleries
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
          <button class="btn-secondary" (click)="navigateToPromotionAdmin()">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"></path>
              <line x1="7" y1="7" x2="7.01" y2="7"></line>
            </svg>
            Promotions
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

      <!-- Statistics -->
      @if (stats()) {
        <section class="stats-section">
          <div class="stat-card">
            <h3>Total Images</h3>
            <p class="stat-number">{{ stats()!.totalImages }}</p>
          </div>
          <div class="stat-card">
            <h3>Visible</h3>
            <p class="stat-number">{{ stats()!.visibleImages }}</p>
          </div>
          <div class="stat-card">
            <h3>Hidden</h3>
            <p class="stat-number">{{ stats()!.hiddenImages }}</p>
          </div>
        </section>
      }

      <!-- Upload Section -->
      <section class="upload-section">
        <div class="section-header">
          <h2>Upload New Images</h2>
          @if (!showUploadForm()) {
            <button class="btn-primary" (click)="showUploadForm.set(true)">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                <polyline points="17 8 12 3 7 8"></polyline>
                <line x1="12" y1="3" x2="12" y2="15"></line>
              </svg>
              Upload Images
            </button>
          }
        </div>

        @if (showUploadForm()) {
          <div class="upload-form">
            <div class="form-group">
              <label for="category">Category *</label>
              <select
                id="category"
                [(ngModel)]="selectedCategory"
                name="category"
                class="form-select"
                required>
                <option value="">Select a category</option>
                @for (cat of categories; track cat.value) {
                  <option [value]="cat.value">{{ cat.label }}</option>
                }
              </select>
            </div>

            <div class="form-group">
              <label for="visibility">Visibility</label>
              <div class="checkbox-group">
                <input
                  type="checkbox"
                  id="visibility"
                  [(ngModel)]="uploadAsVisible"
                  name="visibility">
                <label for="visibility">Make images visible immediately</label>
              </div>
            </div>

            <div class="form-group">
              <label for="imageFiles">Select Images *</label>
              <input
                type="file"
                id="imageFiles"
                accept="image/jpeg,image/jpg,image/png,image/gif,image/webp"
                multiple
                (change)="onFilesSelected($event)"
                class="file-input">
              <small>Select JPEG, PNG, GIF, or WebP images (max 25MB each). Images will be automatically converted to WebP format for optimal performance.</small>
            </div>

            @if (convertingToWebP()) {
              <div class="conversion-progress">
                <div class="progress-spinner"></div>
                <span>{{ conversionProgress() }}</span>
              </div>
            }

            @if (generatingThumbnails()) {
              <div class="thumbnail-loading">
                <div class="progress-spinner"></div>
                <span>Generating thumbnails for {{ selectedFiles().length }} images...</span>
              </div>
            }

            @if (imagePreviews().length > 0 && !generatingThumbnails() && !convertingToWebP()) {
              <div class="image-previews-section">
                <label>Selected Images ({{ selectedFiles().length }})</label>
                <div class="image-previews" [style.--thumbnail-size.px]="thumbnailSize()">
                  @for (preview of imagePreviews(); track preview; let i = $index) {
                    <div class="preview-item">
                      <img
                        [src]="preview"
                        [alt]="selectedFiles()[i].name"
                        loading="lazy"
                        decoding="async">
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

            @if (deploymentStatus()) {
              <div class="deployment-status">
                <div class="progress-spinner"></div>
                <span>{{ deploymentStatus() }}</span>
              </div>
            }

            <div class="form-actions">
              <button
                class="btn-primary"
                (click)="uploadImages()"
                [disabled]="!selectedCategory || selectedFiles().length === 0 || uploading() || convertingToWebP()">
                {{ uploading() ? 'Uploading...' : 'Upload Images' }}
              </button>
              <button class="btn-secondary" (click)="cancelUpload()" [disabled]="uploading() || convertingToWebP()">
                Cancel
              </button>
            </div>

            @if (uploadSuccess()) {
              <div class="success-message">
                Successfully uploaded {{ uploadedCount() }} images!
              </div>
            }

            @if (uploadError()) {
              <div class="error-message">
                {{ uploadError() }}
              </div>
            }
          </div>
        }
      </section>

      <!-- Filter Section -->
      <section class="filter-section">
        <h2>Manage Portfolio Images</h2>
        <div class="filters">
          <div class="filter-group">
            <label for="filterCategory">Category:</label>
            <select
              id="filterCategory"
              [(ngModel)]="filterCategory"
              (ngModelChange)="loadImages()"
              class="form-select">
              <option value="">All Categories</option>
              @for (cat of categories; track cat.value) {
                <option [value]="cat.value">{{ cat.label }} ({{ getCategoryCount(cat.value) }})</option>
              }
            </select>
          </div>

          <div class="filter-group">
            <label for="filterVisibility">Visibility:</label>
            <select
              id="filterVisibility"
              [(ngModel)]="filterVisibility"
              (ngModelChange)="loadImages()"
              class="form-select">
              <option value="all">All Images</option>
              <option value="visible">Visible Only</option>
              <option value="hidden">Hidden Only</option>
            </select>
          </div>

          <button class="btn-secondary" (click)="loadImages()">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <polyline points="23 4 23 10 17 10"></polyline>
              <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"></path>
            </svg>
            Refresh
          </button>
        </div>
      </section>

      <!-- Bulk Actions Bar -->
      @if (selectedCount > 0) {
        <section class="bulk-actions-bar">
          <div class="bulk-actions-content">
            <span class="selection-count">{{ selectedCount }} image{{ selectedCount > 1 ? 's' : '' }} selected</span>
            <div class="bulk-actions-buttons">
              <button class="btn-secondary" (click)="deselectAll()">
                Deselect All
              </button>
              <button
                class="btn-danger"
                (click)="confirmBulkDelete()"
                [disabled]="bulkDeleting()">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <polyline points="3 6 5 6 21 6"></polyline>
                  <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                </svg>
                {{ bulkDeleting() ? 'Deleting...' : 'Delete Selected' }}
              </button>
            </div>
          </div>
        </section>
      }

      <!-- Images Grid -->
      <section class="images-section">
        @if (loading()) {
          <div class="loading">
            <div class="progress-spinner"></div>
            <p>Loading images...</p>
          </div>
        } @else if (portfolioImages().length === 0) {
          <div class="empty-state">
            <svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1">
              <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
              <circle cx="8.5" cy="8.5" r="1.5"></circle>
              <polyline points="21 15 16 10 5 21"></polyline>
            </svg>
            <h3>No images found</h3>
            <p>Upload some images to get started</p>
          </div>
        } @else {
          <div class="images-grid">
            @for (image of displayedImages(); track image.id) {
              <div class="image-card" [class.hidden]="!image.isVisible" [class.selected]="selectedImageIds().has(image.id)">
                <div class="image-wrapper">
                  <div class="checkbox-wrapper">
                    <input
                      type="checkbox"
                      [id]="'checkbox-' + image.id"
                      [checked]="selectedImageIds().has(image.id)"
                      (change)="toggleImageSelection(image.id)"
                      class="image-checkbox">
                    <label [for]="'checkbox-' + image.id" class="checkbox-label"></label>
                  </div>
                  <img
                    [src]="image.url"
                    [alt]="image.filename"
                    loading="lazy"
                    decoding="async">
                  <div class="image-overlay">
                    <div class="image-actions">
                      <button
                        class="btn-icon"
                        (click)="toggleVisibility(image)"
                        [title]="image.isVisible ? 'Hide from portfolio' : 'Show in portfolio'">
                        @if (image.isVisible) {
                          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                            <circle cx="12" cy="12" r="3"></circle>
                          </svg>
                        } @else {
                          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path>
                            <line x1="1" y1="1" x2="23" y2="23"></line>
                          </svg>
                        }
                      </button>
                      <button
                        class="btn-icon"
                        (click)="confirmMoveCategory(image)"
                        title="Move to different category">
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                          <polyline points="5 9 2 12 5 15"></polyline>
                          <polyline points="9 5 12 2 15 5"></polyline>
                          <polyline points="15 19 12 22 9 19"></polyline>
                          <polyline points="19 9 22 12 19 15"></polyline>
                          <line x1="2" y1="12" x2="22" y2="12"></line>
                          <line x1="12" y1="2" x2="12" y2="22"></line>
                        </svg>
                      </button>
                      <button
                        class="btn-icon btn-delete"
                        (click)="confirmDelete(image)"
                        title="Delete image">
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                          <polyline points="3 6 5 6 21 6"></polyline>
                          <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                        </svg>
                      </button>
                    </div>
                  </div>
                  @if (!image.isVisible) {
                    <div class="hidden-badge">Hidden</div>
                  }
                </div>
                <div class="image-info">
                  <span class="image-filename" [title]="image.filename">{{ image.filename }}</span>
                  <span class="image-category">{{ getCategoryLabel(image.category) }}</span>
                </div>
              </div>
            }
          </div>

          @if (hasMoreImages) {
            <div class="load-more-section">
              <button class="btn-secondary" (click)="loadMoreImages()">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <polyline points="6 9 12 15 18 9"></polyline>
                </svg>
                Load More Images ({{ displayedImages().length }} of {{ portfolioImages().length }})
              </button>
            </div>
          }
        }
      </section>

      <!-- Delete Confirmation Modal -->
      @if (imageToDelete()) {
        <div class="modal-overlay" (click)="cancelDelete()">
          <div class="modal" (click)="$event.stopPropagation()">
            <h3>Confirm Delete</h3>
            <p>Are you sure you want to delete this image?</p>
            <div class="modal-image">
              <img [src]="imageToDelete()!.url" [alt]="imageToDelete()!.filename">
            </div>
            <p class="warning">
              <strong>Warning:</strong> This will only remove the image metadata from the database.
              The image file will remain in the hosting repository.
            </p>
            <div class="modal-actions">
              <button class="btn-danger" (click)="deleteImage()" [disabled]="deleting()">
                {{ deleting() ? 'Deleting...' : 'Delete' }}
              </button>
              <button class="btn-secondary" (click)="cancelDelete()" [disabled]="deleting()">
                Cancel
              </button>
            </div>
          </div>
        </div>
      }

      <!-- Move Category Modal -->
      @if (imageToMove()) {
        <div class="modal-overlay" (click)="cancelMove()">
          <div class="modal" (click)="$event.stopPropagation()">
            <h3>Move to Different Category</h3>
            <p>Move this image to a different portfolio category</p>
            <div class="modal-image">
              <img [src]="imageToMove()!.url" [alt]="imageToMove()!.filename">
            </div>
            <div class="modal-info">
              <p><strong>Current Category:</strong> {{ getCategoryLabel(imageToMove()!.category) }}</p>
              <p><strong>Filename:</strong> {{ imageToMove()!.filename }}</p>
            </div>
            <div class="form-group">
              <label for="targetCategory">Move to Category:</label>
              <select
                id="targetCategory"
                [(ngModel)]="targetCategory"
                class="form-select">
                @for (cat of categories; track cat.value) {
                  <option [value]="cat.value" [disabled]="cat.value === imageToMove()!.category">
                    {{ cat.label }}@if (cat.value === imageToMove()!.category) { (Current) }
                  </option>
                }
              </select>
            </div>
            <p class="info">
              <strong>Note:</strong> This updates the category metadata. The image file will remain in its current folder, but will display in the selected category.
            </p>
            <div class="modal-actions">
              <button
                class="btn-primary"
                (click)="moveToCategory()"
                [disabled]="moving() || !targetCategory || targetCategory === imageToMove()!.category">
                {{ moving() ? 'Moving...' : 'Move Image' }}
              </button>
              <button class="btn-secondary" (click)="cancelMove()" [disabled]="moving()">
                Cancel
              </button>
            </div>
          </div>
        </div>
      }
    </div>
  `,
  styleUrls: ['./portfolio-admin.component.scss']
})
export class PortfolioAdminComponent implements OnInit {
  authService = inject(AuthService);
  private portfolioService = inject(PortfolioAdminService);
  private imageService = inject(ImageService);
  private githubUploadService = inject(GithubUploadService);
  private router = inject(Router);
  private analyticsService = inject(AnalyticsService);
  private contactMessageService = inject(ContactMessageService);

  // Statistics
  stats = signal<PortfolioStats | null>(null);
  unreadMessageCount = signal(0);

  // Upload form
  showUploadForm = signal(false);
  selectedCategory = '';
  uploadAsVisible = true;
  selectedFiles = signal<File[]>([]);
  imagePreviews = signal<string[]>([]);
  generatingThumbnails = signal(false);
  thumbnailSize = signal(150);
  uploading = signal(false);
  uploadProgress = signal('');
  uploadSuccess = signal(false);
  uploadError = signal('');
  uploadedCount = signal(0);
  deploymentStatus = signal('');
  convertingToWebP = signal(false);
  conversionProgress = signal('');

  // Filtering
  filterCategory = '';
  filterVisibility = 'all';
  loading = signal(false);
  portfolioImages = signal<PortfolioImage[]>([]);

  // Pagination for smooth scrolling
  displayedImages = signal<PortfolioImage[]>([]);
  imagesPerPage = 24; // Show 24 images initially
  currentPage = signal(0);

  // Delete
  imageToDelete = signal<PortfolioImage | null>(null);
  deleting = signal(false);

  // Bulk selection and delete
  selectedImageIds = signal<Set<string>>(new Set());
  bulkDeleting = signal(false);

  // Move to category
  imageToMove = signal<PortfolioImage | null>(null);
  targetCategory = '';
  moving = signal(false);

  categories: CategoryDisplay[] = [
    { value: 'Events', label: 'Events', folder: 'Events' },
    { value: 'FamilyPortraits', label: 'Family Portraits', folder: 'FamilyPortraits' },
    { value: 'Headshots', label: 'Headshots', folder: 'Headshots' },
    { value: 'HolidayMiniSessions', label: 'Holiday Mini Sessions', folder: 'HolidayMiniSessions' },
    { value: 'Newborns', label: 'Newborns', folder: 'Newborns' },
    { value: 'Seniors', label: 'Seniors', folder: 'Seniors' },
    { value: 'Sports', label: 'Sports', folder: 'Sports' },
    { value: 'BabiesChildren', label: 'Babies & Children', folder: 'BabiesChildren' }
  ];

  ngOnInit(): void {
    this.analyticsService.trackPageView('Portfolio Admin');
    this.loadStats();
    this.loadImages();
    this.loadUnreadMessageCount();
  }

  loadStats(): void {
    this.portfolioService.getStats().subscribe({
      next: (stats: PortfolioStats) => {
        this.stats.set(stats);
      },
      error: (error: Error) => {
        console.error('Error loading stats:', error);
      }
    });
  }

  loadImages(): void {
    this.loading.set(true);

    const options: PortfolioImageQueryOptions = {
      orderBy: 'order',
      orderDirection: 'asc'
    };

    // Apply category filter if selected
    if (this.filterCategory && this.filterCategory !== '') {
      options.category = this.filterCategory as PortfolioCategory;
      console.log('Filtering by category:', this.filterCategory);
    }

    // Apply visibility filter
    if (this.filterVisibility === 'visible') {
      options.visibleOnly = true;
    } else if (this.filterVisibility === 'hidden') {
      // We'll filter manually after loading - don't set visibleOnly
      // This will load all images and then filter client-side
    }

    console.log('Query options:', options);

    this.portfolioService.queryImages(options).subscribe({
      next: (images: PortfolioImage[]) => {
        console.log('Received images:', images.length);

        // Apply hidden filter manually if needed
        if (this.filterVisibility === 'hidden') {
          const filtered = images.filter((img: PortfolioImage) => !img.isVisible);
          console.log('Filtered to hidden images:', filtered.length);
          this.portfolioImages.set(filtered);
        } else {
          this.portfolioImages.set(images);
        }

        // Reset pagination and show first page
        this.currentPage.set(0);
        this.updateDisplayedImages();
        this.loading.set(false);
      },
      error: (error: Error) => {
        console.error('Error loading images:', error);
        this.uploadError.set(`Failed to load images: ${error.message || error}`);
        this.loading.set(false);
      }
    });
  }

  updateDisplayedImages(): void {
    const allImages = this.portfolioImages();
    const endIndex = (this.currentPage() + 1) * this.imagesPerPage;
    this.displayedImages.set(allImages.slice(0, endIndex));
  }

  loadMoreImages(): void {
    this.currentPage.set(this.currentPage() + 1);
    this.updateDisplayedImages();
  }

  get hasMoreImages(): boolean {
    return this.displayedImages().length < this.portfolioImages().length;
  }

  onFilesSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (!input.files || input.files.length === 0) {
      return;
    }

    const files = Array.from(input.files);
    this.validateAndProcessFiles(files);
  }

  async validateAndProcessFiles(files: File[]): Promise<void> {
    const MAX_FILE_SIZE = 25 * 1024 * 1024; // 25MB
    const ALLOWED_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];

    const validFiles: File[] = [];
    const errors: string[] = [];

    for (const file of files) {
      if (!ALLOWED_TYPES.includes(file.type)) {
        errors.push(`${file.name}: Invalid file type. Only JPEG, PNG, GIF, and WebP are allowed.`);
        continue;
      }

      if (file.size > MAX_FILE_SIZE) {
        errors.push(`${file.name}: File too large. Maximum size is 25MB.`);
        continue;
      }

      validFiles.push(file);
    }

    if (errors.length > 0) {
      this.uploadError.set(errors.join('\n'));
      setTimeout(() => this.uploadError.set(''), 10000);
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
        this.generateThumbnails(webpFiles);
      } catch (error) {
        console.error('Error converting to WebP:', error);
        this.uploadError.set('Failed to convert images to WebP. Using original files.');
        this.convertingToWebP.set(false);
        this.conversionProgress.set('');
        // Fall back to original files
        this.selectedFiles.set(validFiles);
        this.generateThumbnails(validFiles);
      }
    }
  }

  generateThumbnails(files: File[]): void {
    this.generatingThumbnails.set(true);
    this.imagePreviews.set([]);

    // Adaptive thumbnail size based on file count
    if (files.length > 50) {
      this.thumbnailSize.set(100);
    } else if (files.length > 20) {
      this.thumbnailSize.set(120);
    } else {
      this.thumbnailSize.set(150);
    }

    const quality = files.length > 30 ? 0.5 : 0.7;

    const promises = files.map(file => this.createImagePreview(file, quality));

    Promise.all(promises).then(previews => {
      this.imagePreviews.set(previews);
      this.generatingThumbnails.set(false);
    });
  }

  private createImagePreview(file: File, quality: number): Promise<string> {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          const targetSize = this.thumbnailSize();

          let width = img.width;
          let height = img.height;

          if (width > height) {
            if (width > targetSize) {
              height = (height * targetSize) / width;
              width = targetSize;
            }
          } else {
            if (height > targetSize) {
              width = (width * targetSize) / height;
              height = targetSize;
            }
          }

          canvas.width = width;
          canvas.height = height;

          const ctx = canvas.getContext('2d')!;
          ctx.drawImage(img, 0, 0, width, height);

          resolve(canvas.toDataURL('image/jpeg', quality));
        };
        img.src = e.target!.result as string;
      };
      reader.readAsDataURL(file);
    });
  }

  removeFile(index: number): void {
    const files = [...this.selectedFiles()];
    const previews = [...this.imagePreviews()];

    files.splice(index, 1);
    previews.splice(index, 1);

    this.selectedFiles.set(files);
    this.imagePreviews.set(previews);
  }

  uploadImages(): void {
    if (!this.selectedCategory || this.selectedFiles().length === 0) {
      return;
    }

    this.uploading.set(true);
    this.uploadProgress.set('Preparing upload...');
    this.uploadError.set('');
    this.uploadSuccess.set(false);

    const category = this.categories.find(c => c.value === this.selectedCategory);
    if (!category) {
      this.uploadError.set('Invalid category selected');
      this.uploading.set(false);
      return;
    }

    const folderPath = `portfolio/${category.folder}`;

    this.uploadProgress.set(`Uploading ${this.selectedFiles().length} images to respository...`);

    this.githubUploadService.uploadImagesToCustomPath(this.selectedFiles(), folderPath).subscribe({
      next: (results: UploadResult[]) => {
        this.uploadProgress.set('Creating database records...');
        this.createFirestoreRecords(results, category.value);
      },
      error: (error: any) => {
        console.error('Upload error:', error);
        this.uploadError.set(`Upload failed: ${error.message || error}`);
        this.uploading.set(false);
        this.uploadProgress.set('');
      }
    });
  }

  private createFirestoreRecords(uploadResults: UploadResult[], category: PortfolioCategory): void {
    const requests: CreatePortfolioImageRequest[] = uploadResults.map((result, index) => ({
      category,
      filename: result.filename,
      path: result.path,
      url: result.url,
      isVisible: this.uploadAsVisible,
      order: index
    }));

    this.portfolioService.createImagesBatch(requests).subscribe({
      next: (images: PortfolioImage[]) => {
        this.uploadedCount.set(images.length);
        this.uploadSuccess.set(true);
        this.uploadProgress.set('');
        this.uploading.set(false);

        this.analyticsService.trackCustomEvent('portfolio_images_uploaded', {
          category,
          count: images.length
        });

        // Check deployment status and reload after confirmation
        this.checkDeploymentStatus(images[0].url, () => {
          // Reload data only after deployment is confirmed
          this.loadStats();
          this.loadImages();

          // Clear form after a delay
          setTimeout(() => {
            this.cancelUpload();
          }, 3000);
        });
      },
      error: (error: any) => {
        console.error('Firestore error:', error);
        this.uploadError.set(`Failed to save to database: ${error.message || error}`);
        this.uploading.set(false);
        this.uploadProgress.set('');
      }
    });
  }

  private checkDeploymentStatus(imageUrl: string, onDeployed?: () => void): void {
    this.deploymentStatus.set('Checking deployment...');

    const maxAttempts = 60; // 5 minutes
    const intervalMs = 5000; // 5 seconds
    let attempts = 0;

    const checkInterval = setInterval(() => {
      attempts++;

      fetch(imageUrl, { method: 'HEAD', cache: 'no-cache' })
        .then(response => {
          if (response.ok) {
            this.deploymentStatus.set('Images are now live!');
            clearInterval(checkInterval);

            // Call the callback when deployment is confirmed
            if (onDeployed) {
              onDeployed();
            }

            setTimeout(() => this.deploymentStatus.set(''), 3000);
          } else if (attempts >= maxAttempts) {
            this.deploymentStatus.set('Deployment taking longer than expected. Images will be available soon.');
            clearInterval(checkInterval);

            // Still call callback even if we timed out
            if (onDeployed) {
              onDeployed();
            }

            setTimeout(() => this.deploymentStatus.set(''), 5000);
          }
        })
        .catch(() => {
          if (attempts >= maxAttempts) {
            this.deploymentStatus.set('Unable to verify deployment. Please check back later.');
            clearInterval(checkInterval);

            // Still call callback even if verification failed
            if (onDeployed) {
              onDeployed();
            }

            setTimeout(() => this.deploymentStatus.set(''), 5000);
          }
        });
    }, intervalMs);
  }

  cancelUpload(): void {
    this.showUploadForm.set(false);
    this.selectedCategory = '';
    this.uploadAsVisible = true;
    this.selectedFiles.set([]);
    this.imagePreviews.set([]);
    this.uploadProgress.set('');
    this.uploadSuccess.set(false);
    this.uploadError.set('');
    this.uploadedCount.set(0);
    this.deploymentStatus.set('');
    this.convertingToWebP.set(false);
    this.conversionProgress.set('');
  }

  toggleVisibility(image: PortfolioImage): void {
    const newVisibility = !image.isVisible;

    this.portfolioService.toggleVisibility(image.id, newVisibility).subscribe({
      next: () => {
        // Update local state
        const images = this.displayedImages().map(img =>
          img.id === image.id ? { ...img, isVisible: newVisibility } : img
        );
        this.displayedImages.set(images);

        // Reload stats
        this.loadStats();

        this.analyticsService.trackCustomEvent('portfolio_image_visibility_toggled', {
          imageId: image.id,
          category: image.category,
          newVisibility
        });
      },
      error: (error: Error) => {
        console.error('Error toggling visibility:', error);
        alert('Failed to update visibility. Please try again.');
      }
    });
  }

  confirmDelete(image: PortfolioImage): void {
    this.imageToDelete.set(image);
  }

  cancelDelete(): void {
    this.imageToDelete.set(null);
    this.deleting.set(false);
  }

  deleteImage(): void {
    const image = this.imageToDelete();
    if (!image) return;

    this.deleting.set(true);

    this.portfolioService.deleteImage(image.id).subscribe({
      next: () => {
        this.analyticsService.trackCustomEvent('portfolio_image_deleted', {
          imageId: image.id,
          category: image.category
        });

        this.cancelDelete();

        // Refresh images and stats after deletion
        this.loadStats();
        this.loadImages();
      },
      error: (error: Error) => {
        console.error('Error deleting image:', error);
        alert('Failed to delete image. Please try again.');
        this.deleting.set(false);
      }
    });
  }

  toggleImageSelection(imageId: string): void {
    const selected = new Set(this.selectedImageIds());
    if (selected.has(imageId)) {
      selected.delete(imageId);
    } else {
      selected.add(imageId);
    }
    this.selectedImageIds.set(selected);
  }

  selectAll(): void {
    const allIds = new Set(this.displayedImages().map(img => img.id));
    this.selectedImageIds.set(allIds);
  }

  deselectAll(): void {
    this.selectedImageIds.set(new Set());
  }

  get selectedCount(): number {
    return this.selectedImageIds().size;
  }

  confirmBulkDelete(): void {
    const count = this.selectedCount;
    if (count === 0) return;

    const confirmed = confirm(
      `Are you sure you want to delete ${count} selected image${count > 1 ? 's' : ''}?\n\n` +
      'This will remove the image metadata from the database. The files will remain in the hosting repository.'
    );

    if (confirmed) {
      this.bulkDeleteImages();
    }
  }

  bulkDeleteImages(): void {
    const imageIds = Array.from(this.selectedImageIds());
    if (imageIds.length === 0) return;

    this.bulkDeleting.set(true);

    this.portfolioService.deleteImagesBatch(imageIds).subscribe({
      next: () => {
        this.analyticsService.trackCustomEvent('portfolio_images_bulk_deleted', {
          count: imageIds.length
        });

        // Clear selection
        this.deselectAll();
        this.bulkDeleting.set(false);

        // Refresh images and stats after deletion
        this.loadStats();
        this.loadImages();
      },
      error: (error: Error) => {
        console.error('Error bulk deleting images:', error);
        alert('Failed to delete images. Please try again.');
        this.bulkDeleting.set(false);
      }
    });
  }

  getCategoryLabel(category: PortfolioCategory): string {
    return this.categories.find(c => c.value === category)?.label || category;
  }

  getCategoryCount(category: PortfolioCategory): number {
    return this.stats()?.imagesByCategory?.[category] || 0;
  }

  confirmMoveCategory(image: PortfolioImage): void {
    this.imageToMove.set(image);
    this.targetCategory = image.category; // Default to current category
  }

  cancelMove(): void {
    this.imageToMove.set(null);
    this.targetCategory = '';
    this.moving.set(false);
  }

  moveToCategory(): void {
    const image = this.imageToMove();
    if (!image || !this.targetCategory || this.targetCategory === image.category) {
      return;
    }

    this.moving.set(true);

    this.portfolioService.updateImage(image.id, {
      category: this.targetCategory as PortfolioCategory
    }).subscribe({
      next: () => {
        // Update local state
        const images = this.portfolioImages().map(img =>
          img.id === image.id ? { ...img, category: this.targetCategory as PortfolioCategory } : img
        );
        this.portfolioImages.set(images);
        this.updateDisplayedImages();

        // Reload stats to update category counts
        this.loadStats();

        this.analyticsService.trackCustomEvent('portfolio_image_moved', {
          imageId: image.id,
          fromCategory: image.category,
          toCategory: this.targetCategory
        });

        this.cancelMove();
      },
      error: (error: Error) => {
        console.error('Error moving image:', error);
        alert('Failed to move image. Please try again.');
        this.moving.set(false);
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

  navigateToGalleryAdmin(): void {
    this.router.navigate(['/gallery-admin']);
  }

  navigateToMessageCenter(): void {
    this.router.navigate(['/message-center']);
  }

  navigateToPromotionAdmin(): void {
    this.router.navigate(['/promotion-admin']);
  }

  logout(): void {
    this.authService.signOut();
    this.router.navigate(['/login']);
  }
}
