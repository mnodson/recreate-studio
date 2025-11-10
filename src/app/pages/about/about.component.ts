import { Component, OnInit, OnDestroy, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { ImageService } from '../../services/image.service';

@Component({
  selector: 'app-about',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="about-container">
      <section class="hero-about">
        <div class="container">
          <div class="about-content">
            <div class="about-image">
              <img
                [src]="imageService.getImageUrl(bioImages[currentImageIndex()])"
                alt="Laura Hoffman - Photographer"
                class="portrait-image"
                [class.fade-out]="isTransitioning()"
                (error)="onImageError($event)">
              <img
                [src]="imageService.getImageUrl(bioImages[getNextImageIndex()])"
                alt="Laura Hoffman - Photographer"
                class="portrait-image portrait-image-next"
                [class.fade-in]="isTransitioning()"
                (error)="onImageError($event)">
            </div>
            <div class="about-text">
              <h1>About the Artist</h1>
              <h2>Laura Hoffman</h2>
              <p class="intro">
                With over 15 years of experience in photography, I specialize in
                capturing authentic moments that tell compelling stories. My passion lies in
                creating timeless images that reflect the unique beauty and emotion of each
                subject.
              </p>
              <p>
                Based in the heart of Texas, I work with individuals, families, and
                businesses to create stunning visual narratives. Whether it's capturing
                the authentic joy of a family gathering, the bold confidence of a senior
                portrait, or the professional polish of a business headshot, I approach
                each session with creativity, patience, and attention to detail.
              </p>
              <!-- <div class="credentials">
                <h3>Background</h3>
                <ul>
                  <li>Family Events</li>
                  <li>Senior shots</li>
                </ul>
              </div> -->
            </div>
          </div>
        </div>
      </section>

      <section class="philosophy">
        <div class="container">
          <h2>My Philosophy</h2>
          <div class="philosophy-grid">
            <div class="philosophy-item">
              <h3>Authentic Storytelling</h3>
              <p>
                Every photograph should tell a story. I believe in capturing genuine
                emotions and candid moments that reflect who you truly are.
              </p>
            </div>
            <div class="philosophy-item">
              <h3>Artistic Vision</h3>
              <p>
                Combining technical expertise with creative vision to produce images
                that are both beautiful and meaningful.
              </p>
            </div>
            <div class="philosophy-item">
              <h3>Personal Connection</h3>
              <p>
                Building trust and rapport with my clients to create a comfortable
                environment where natural expressions shine through.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section class="approach">
        <div class="container">
          <h2>My Approach</h2>
          <div class="approach-content">
            <div class="approach-text">
              <h3>The Process</h3>
              <div class="process-steps">
                <div class="step">
                  <h4>1. Consultation</h4>
                  <p>We discuss your vision, style preferences, and session goals to ensure perfect alignment.</p>
                </div>
                <div class="step">
                  <h4>2. Planning</h4>
                  <p>Together we plan the location, timing, and any special requirements for your session.</p>
                </div>
                <div class="step">
                  <h4>3. Photography Session</h4>
                  <p>A relaxed, professional session where we capture beautiful, authentic moments.</p>
                </div>
                <div class="step">
                  <h4>4. Post-Production</h4>
                  <p>Careful editing and retouching to enhance the natural beauty of each image.</p>
                </div>
                <div class="step">
                  <h4>5. Delivery</h4>
                  <p>Professional delivery of high-resolution images through secure online gallery.</p>
                </div>
              </div>
            </div>
            <div class="approach-image">
              <img
                [src]="imageService.getImageUrl(bioImages[(currentImageIndex() + 2) % bioImages.length])"
                alt="Behind the Scenes"
                class="bts-image"
                [class.fade-out]="isTransitioning()"
                (error)="onImageError($event)">
              <img
                [src]="imageService.getImageUrl(bioImages[(currentImageIndex() + 3) % bioImages.length])"
                alt="Behind the Scenes"
                class="bts-image bts-image-next"
                [class.fade-in]="isTransitioning()"
                (error)="onImageError($event)">
            </div>
          </div>
        </div>
      </section>

      <section class="contact-cta">
        <div class="container">
          <h2>Let's Create Something Beautiful Together</h2>
          <p>Ready to capture your special moments? I'd love to hear about your vision.</p>
          <div class="cta-buttons">
            <button class="btn-primary" routerLink="/packages">View Packages</button>
            <button class="btn-secondary" routerLink="/gallery">See My Work</button>
          </div>
        </div>
      </section>
    </div>
  `,
  styleUrls: ['./about.component.scss']
})
export class AboutComponent implements OnInit, OnDestroy {
  private intervalId?: number;
  currentImageIndex = signal(0);
  isTransitioning = signal(false);

  // Bio images from the bio folder
  bioImages = [
    'bio/bio-001.jpg',
    'bio/bio-002.jpg',
    'bio/bio-003.jpg',
    'bio/bio-004.jpg'
  ];

  constructor(public imageService: ImageService) {}

  ngOnInit(): void {
    // Rotate through images every 6 seconds
    this.intervalId = window.setInterval(() => {
      this.isTransitioning.set(true);
      setTimeout(() => {
        this.currentImageIndex.set((this.currentImageIndex() + 1) % this.bioImages.length);
        this.isTransitioning.set(false);
      }, 1000); // Wait 1s before swapping (half of 2s transition)
    }, 6000);
  }

  ngOnDestroy(): void {
    if (this.intervalId) {
      clearInterval(this.intervalId);
    }
  }

  getNextImageIndex(): number {
    return (this.currentImageIndex() + 1) % this.bioImages.length;
  }

  /**
   * Fallback handler for image loading errors
   */
  onImageError(event: Event): void {
    const img = event.target as HTMLImageElement;
    img.style.display = 'none';
    console.warn('Failed to load image:', img.src);
  }
}