import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

interface GalleryImage {
  id: number;
  title: string;
  category: string;
  description: string;
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
                [class.featured]="image.featured">
                <div class="image-placeholder">
                  <span>{{ image.category }}</span>
                  <div class="image-overlay">
                    <h3>{{ image.title }}</h3>
                    <p>{{ image.description }}</p>
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
          <button class="btn-primary" routerLink="/packages">Book a Session</button>
        </div>
      </section>
    </div>
  `,
  styleUrls: ['./gallery.component.scss']
})
export class GalleryComponent implements OnInit {
  selectedCategory = 'all';
  categories = ['Weddings', 'Portraits', 'Fashion', 'Events', 'Commercial'];
  
  allImages: GalleryImage[] = [
    { id: 1, title: 'Golden Hour Wedding', category: 'Weddings', description: 'Romantic sunset ceremony', featured: true },
    { id: 2, title: 'Family Portrait', category: 'Portraits', description: 'Timeless family memories', featured: false },
    { id: 3, title: 'Fashion Editorial', category: 'Fashion', description: 'Contemporary styling', featured: true },
    { id: 4, title: 'Corporate Event', category: 'Events', description: 'Professional gathering', featured: false },
    { id: 5, title: 'Brand Photography', category: 'Commercial', description: 'Product showcase', featured: false },
    { id: 6, title: 'Bridal Portrait', category: 'Weddings', description: 'Elegant bridal session', featured: true },
    { id: 7, title: 'Senior Portraits', category: 'Portraits', description: 'Graduation celebration', featured: false },
    { id: 8, title: 'Editorial Shoot', category: 'Fashion', description: 'Magazine style photography', featured: false },
    { id: 9, title: 'Wedding Reception', category: 'Weddings', description: 'Celebration moments', featured: false },
    { id: 10, title: 'Business Headshots', category: 'Commercial', description: 'Professional portraits', featured: false },
    { id: 11, title: 'Maternity Session', category: 'Portraits', description: 'Expecting parents', featured: true },
    { id: 12, title: 'Fashion Week', category: 'Fashion', description: 'Runway photography', featured: false },
    { id: 13, title: 'Conference Coverage', category: 'Events', description: 'Corporate documentation', featured: false },
    { id: 14, title: 'Engagement Photos', category: 'Weddings', description: 'Couple in love', featured: false },
    { id: 15, title: 'Lifestyle Branding', category: 'Commercial', description: 'Brand storytelling', featured: false }
  ];

  private _filteredImages: GalleryImage[] = [];
  displayedImages: GalleryImage[] = [];
  imagesPerLoad = 9;
  currentLoadIndex = 0;
  hasMoreImages = true;

  ngOnInit() {
    this.filterGallery('all');
  }

  filterGallery(category: string) {
    this.selectedCategory = category;
    this.currentLoadIndex = 0;
    
    if (category === 'all') {
      this._filteredImages = [...this.allImages];
    } else {
      this._filteredImages = this.allImages.filter(image => image.category === category);
    }
    
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
  }

  updateHasMoreImages() {
    this.hasMoreImages = this.currentLoadIndex < this._filteredImages.length;
  }

  trackByImageId(_index: number, image: GalleryImage): number {
    return image.id;
  }

  get filteredImages() {
    return this.displayedImages;
  }
}