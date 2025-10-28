import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

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
          <div class="hero-buttons">
            <button class="btn-primary" routerLink="/gallery">View Gallery</button>
            <button class="btn-secondary" routerLink="/packages">Book Session</button>
          </div>
        </div>
        <div class="hero-image">
          <div class="placeholder-image">
            <span>Featured Photography</span>
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
                <span>{{ highlight.category }}</span>
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
  highlights = [
    {
      title: 'Sunset Wedding',
      description: 'Romantic outdoor ceremony captured in golden hour',
      category: 'Wedding'
    },
    {
      title: 'Family Portrait',
      description: 'Timeless family memories in natural setting',
      category: 'Portrait'
    },
    {
      title: 'Fashion Editorial',
      description: 'Contemporary fashion photography with bold styling',
      category: 'Fashion'
    }
  ];

  services = [
    {
      name: 'Wedding Photography',
      description: 'Complete wedding day coverage with artistic storytelling',
      price: '$2,500'
    },
    {
      name: 'Portrait Sessions',
      description: 'Individual, couple, and family portrait photography',
      price: '$350'
    },
    {
      name: 'Commercial Photography',
      description: 'Professional photography for brands and businesses',
      price: '$500'
    }
  ];
}