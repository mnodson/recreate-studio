import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { ImageService } from '../../services/image.service';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="home-container">
      <section class="hero">
        <div class="hero-content">
          <div class="hero-logo">
            <img src="images/Hero_Logo_White.png" alt="RecreateStudio - Professional Photography" class="hero-logo-image">
          </div>
          <h1 class="hero-title">Capturing Life's Most Beautiful Moments</h1>
          <p class="hero-subtitle">Professional photography that tells your unique story</p>
        </div>
        <div class="hero-image">
          <img
            [src]="imageService.getImageUrl('portraits/portraits-006.jpg')"
            alt="Featured Photography"
            class="hero-photo"
            (error)="onImageError($event)">
          <div class="mobile-cta-buttons">
            <button class="btn-primary" routerLink="/gallery">View Gallery</button>
            <button class="btn-secondary" routerLink="/packages">Book Session</button>
          </div>
        </div>
      </section>

      <section class="highlights">
        <div class="container">
          <h2>Recent Work</h2>
          <div class="highlights-grid">
            @for (highlight of highlights; track highlight.title) {
              <div class="highlight-item">
                <div class="highlight-image">
                  <img
                    [src]="imageService.getThumbnailUrl(highlight.imageUrl)"
                    [alt]="highlight.title"
                    (error)="onImageError($event)">
                </div>
                <h3>{{ highlight.title }}</h3>
                <p>{{ highlight.description }}</p>
              </div>
            }
          </div>
          <div class="cta-section">
            <button class="btn-outline" routerLink="/gallery">View All Work</button>
          </div>
        </div>
      </section>

      <section class="services-preview">
        <div class="container">
          <h2>Photography Services</h2>
          <div class="services-grid">
            @for (service of services; track service.name) {
              <div class="service-card">
                <h3>{{ service.name }}</h3>
                <p>{{ service.description }}</p>
                <span class="service-price">Starting at {{ service.price }}</span>
              </div>
            }
          </div>
          <div class="cta-section">
            <button class="btn-primary" routerLink="/packages">View All Packages</button>
          </div>
        </div>
      </section>
    </div>
  `,
  styleUrls: ['./home.component.scss']
})
export class HomeComponent {
  constructor(public imageService: ImageService) {}

  highlights = [
    {
      title: 'Senior Portraits',
      description: 'Celebrating milestones with bold, creative portraits that capture personality, confidence, and that unforgettable senior year spirit',
      category: 'Senior',
      imageUrl: 'senior/senior-001.jpg'
    },
    {
      title: 'Family Portraits',
      description: 'Authentic moments of laughter, love, and connection. Beautifully preserved memories that grow more precious with every passing year',
      category: 'Family',
      imageUrl: 'family/family-001.jpg'
    },
    {
      title: 'Sports Photography',
      description: 'Freezing peak athletic performance in stunning clarity. The intensity, the triumph, the split-second moments that define champions',
      category: 'Sports',
      imageUrl: 'sports/sports-003.jpg'
    }
  ];

  services = [
    {
      name: 'Portrait Photography',
      description: 'Professional individual and couple portraits with artistic vision and creative direction',
      price: '$400'
    },
    {
      name: 'Family Sessions',
      description: 'Capturing authentic family connections and timeless memories together',
      price: '$350'
    },
    {
      name: 'Senior Photography',
      description: 'Creative senior portraits celebrating your milestone year with style and personality',
      price: '$275'
    }
  ];

  /**
   * Fallback handler for image loading errors
   * Shows a placeholder or default image if the actual image fails to load
   */
  onImageError(event: Event): void {
    const img = event.target as HTMLImageElement;
    // You can set a default placeholder image here
    // For now, we'll hide the broken image
    img.style.display = 'none';
    console.warn('Failed to load image:', img.src);
  }
}