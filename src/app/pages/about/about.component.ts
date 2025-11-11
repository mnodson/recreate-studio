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
              <div class="carousel-track" [style.transform]="'translateX(-' + (currentImageIndex() * 100) + '%)'">
                <img
                  *ngFor="let image of bioImages"
                  [src]="imageService.getImageUrl(image)"
                  alt="Laura Hoffman - Photographer"
                  class="portrait-image"
                  (error)="onImageError($event)">
              </div>
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
I'm Laura Hoffman, homeschool mom, runner, bass player and photographer. My husband gifted me my first DSLR camera over 15 years ago just before the birth of our first daughter knowing I would want to capture every moment I could. I fell in love with photography and wanted other moms to have those same treasured moments documented photographically. So with a baby on my hip, I set out to snap those precious moments and grow Laura Hoffman Photography.
<br><br>
Now that my babies are grown, I am relaunching my business with a fresh new look and a new name. Welcome to (RE)create Studio!
<br><br>
I specialize in natural light photography. I am available for family, senior, sports and special events. 

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
              <div class="carousel-track" [style.transform]="'translateX(-' + (currentImageIndex() * 100) + '%)'">
                <img
                  *ngFor="let image of bioImages.reverse()"
                  [src]="imageService.getImageUrl(image)"
                  alt="Behind the Scenes"
                  class="bts-image"
                  (error)="onImageError($event)">
              </div>
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

  // Bio images from the bio folder
  bioImages = [
    'bio/bio-001.jpg',
    'bio/bio-002.jpg',
    'bio/bio-003.jpg',
    'bio/bio-004.jpg'
  ];

  constructor(public imageService: ImageService) { }

  ngOnInit(): void {
    // Rotate through images every 5 seconds
    this.intervalId = window.setInterval(() => {
      this.currentImageIndex.set((this.currentImageIndex() + 1) % this.bioImages.length);
    }, 5000);
  }

  ngOnDestroy(): void {
    if (this.intervalId) {
      clearInterval(this.intervalId);
    }
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