import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

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
              <div class="placeholder-image">
                <span>Photographer Portrait</span>
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
                Based in the heart of Texas, I work with individuals, families, and 
                businesses to create stunning visual narratives. Whether it's the intimate 
                moments of a wedding day, the joy of a family gathering, or the confidence 
                of a professional headshot, I approach each session with creativity, 
                patience, and attention to detail.
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
              <div class="placeholder-image">
                <span>Behind the Scenes</span>
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
export class AboutComponent {}