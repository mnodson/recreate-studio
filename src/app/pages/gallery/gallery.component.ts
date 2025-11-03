import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { ImageService } from '../../services/image.service';

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
                [class.featured]="image.featured">
                <div class="image-container">
                  <img
                    [src]="imageService.getThumbnailUrl(image.imageUrl)"
                    [alt]="image.title"
                    class="gallery-image"
                    loading="lazy"
                    decoding="async"
                    (error)="onImageError($event)"
                    (load)="onImageLoad($event)">
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
  categories = ['Senior', 'Sports', 'Family', 'Newborn', 'Portraits', 'Boudoir'];

  constructor(public imageService: ImageService) {}

  allImages: GalleryImage[] = [
    { id: 1, title: 'Golden Hour Portrait', category: 'Portraits', description: 'Stunning outdoor portrait at sunset', imageUrl: 'portraits/portraits-001.jpg', featured: true },
    { id: 2, title: 'Graduation Celebration', category: 'Senior', description: 'Bold senior portrait session', imageUrl: 'senior/senior-001.jpg', featured: false },
    { id: 3, title: 'Championship Moment', category: 'Sports', description: 'Peak athletic performance captured', imageUrl: 'sports/sports-001.jpg', featured: false },
    { id: 4, title: 'Generations Together', category: 'Family', description: 'Multi-generational family portrait', imageUrl: 'family/family-001.jpg', featured: true },
    { id: 5, title: 'Sweet Dreams', category: 'Newborn', description: 'Peaceful newborn session', imageUrl: 'newborn/newborn-001.jpg', featured: false },
    { id: 6, title: 'Elegant Beauty', category: 'Boudoir', description: 'Timeless boudoir portraits', imageUrl: 'boudoir/boudoir-001.jpg', featured: false },
    { id: 7, title: 'Senior Style', category: 'Senior', description: 'Creative cap and gown session', imageUrl: 'senior/senior-002.jpg', featured: false },
    { id: 8, title: 'Game Day Glory', category: 'Sports', description: 'Intense game action shots', imageUrl: 'sports/sports-002.jpg', featured: true },
    { id: 9, title: 'Urban Portrait', category: 'Portraits', description: 'Modern city portrait session', imageUrl: 'portraits/portraits-002.jpg', featured: false },
    { id: 10, title: 'Outdoor Family Fun', category: 'Family', description: 'Candid family moments in nature', imageUrl: 'family/family-002.jpg', featured: false },
    { id: 11, title: 'First Days', category: 'Newborn', description: 'Lifestyle newborn photography', imageUrl: 'newborn/newborn-002.jpg', featured: false },
    { id: 12, title: 'Senior Sunset', category: 'Senior', description: 'Urban senior portrait session', imageUrl: 'senior/senior-003.jpg', featured: true },
    { id: 13, title: 'Victory Lap', category: 'Sports', description: 'Athlete triumph and celebration', imageUrl: 'sports/sports-003.jpg', featured: false },
    { id: 14, title: 'Classic Portrait', category: 'Portraits', description: 'Timeless studio portrait', imageUrl: 'portraits/portraits-003.jpg', featured: false },
    { id: 15, title: 'Family Laughter', category: 'Family', description: 'Joyful family connection', imageUrl: 'family/family-003.jpg', featured: false },
    { id: 16, title: 'Tiny Toes', category: 'Newborn', description: 'Detailed newborn features', imageUrl: 'newborn/newborn-003.jpg', featured: true },
    { id: 17, title: 'Confidence & Grace', category: 'Boudoir', description: 'Empowering boudoir session', imageUrl: 'boudoir/boudoir-002.jpg', featured: false },
    { id: 18, title: 'Senior Squad', category: 'Senior', description: 'Group senior portraits', imageUrl: 'senior/senior-004.jpg', featured: false }
  ];

  private _filteredImages: GalleryImage[] = [];
  displayedImages: GalleryImage[] = [];
  imagesPerLoad = 6; // Reduced for better initial performance
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

  onImageError(event: Event): void {
    const img = event.target as HTMLImageElement;
    img.style.display = 'none';
    console.warn('Failed to load gallery image:', img.src);
  }

  onImageLoad(event: Event): void {
    const img = event.target as HTMLImageElement;
    img.classList.add('loaded');
  }

  get filteredImages() {
    return this.displayedImages;
  }
}