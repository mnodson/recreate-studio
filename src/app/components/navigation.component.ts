import { Component } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AnalyticsService } from '../services/analytics.service';

@Component({
  selector: 'app-navigation',
  standalone: true,
  imports: [RouterLink, RouterLinkActive, CommonModule],
  template: `
    <nav class="navigation">
      <div class="nav-container">
        <ul class="nav-links">
          <li><a routerLink="/home" routerLinkActive="active" (click)="trackNavClick('home')">Home</a></li>
          <li><a routerLink="/about" routerLinkActive="active" (click)="trackNavClick('about')">About</a></li>
          <li><a routerLink="/gallery" routerLinkActive="active" (click)="trackNavClick('gallery')">Gallery</a></li>
          <li><a routerLink="/packages" routerLinkActive="active" (click)="trackNavClick('packages')">Packages</a></li>
          <li><a routerLink="/contact" routerLinkActive="active" (click)="trackNavClick('contact')" class="contact-link">Contact</a></li>
        </ul>
        <div class="nav-spacer"></div>
        <a routerLink="/gallery-admin" routerLinkActive="active" class="admin-link" title="Admin Access - Restricted" (click)="trackNavClick('admin')">
          <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
            <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
          </svg>
        </a>
        <div class="mobile-menu-toggle" (click)="toggleMobileMenu()">
          <span></span>
          <span></span>
          <span></span>
        </div>
      </div>
      <div class="mobile-nav" [class.active]="mobileMenuOpen">
        <div class="mobile-nav-header">
          <img src="images/Hero_Logo_White.png" alt="RecreateStudio" class="mobile-logo">
          <button class="close-menu" (click)="closeMobileMenu()">
            <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        </div>

        <nav class="mobile-nav-links">
          <a routerLink="/home" (click)="trackMobileNavClick('home')" class="mobile-nav-item">
            <div class="nav-icon">
              <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
                <polyline points="9 22 9 12 15 12 15 22"></polyline>
              </svg>
            </div>
            <div class="nav-content">
              <span class="nav-label">Home</span>
              <span class="nav-description">Welcome & Portfolio</span>
            </div>
            <div class="nav-arrow">›</div>
          </a>

          <a routerLink="/about" (click)="trackMobileNavClick('about')" class="mobile-nav-item">
            <div class="nav-icon">
              <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <circle cx="12" cy="12" r="10"></circle>
                <line x1="12" y1="16" x2="12" y2="12"></line>
                <line x1="12" y1="8" x2="12.01" y2="8"></line>
              </svg>
            </div>
            <div class="nav-content">
              <span class="nav-label">About</span>
              <span class="nav-description">Meet the Artist</span>
            </div>
            <div class="nav-arrow">›</div>
          </a>

          <a routerLink="/gallery" (click)="trackMobileNavClick('gallery')" class="mobile-nav-item">
            <div class="nav-icon">
              <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                <circle cx="8.5" cy="8.5" r="1.5"></circle>
                <polyline points="21 15 16 10 5 21"></polyline>
              </svg>
            </div>
            <div class="nav-content">
              <span class="nav-label">Gallery</span>
              <span class="nav-description">View Our Work</span>
            </div>
            <div class="nav-arrow">›</div>
          </a>

          <a routerLink="/packages" (click)="trackMobileNavClick('packages')" class="mobile-nav-item">
            <div class="nav-icon">
              <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"></path>
                <line x1="7" y1="7" x2="7.01" y2="7"></line>
              </svg>
            </div>
            <div class="nav-content">
              <span class="nav-label">Packages</span>
              <span class="nav-description">Pricing & Sessions</span>
            </div>
            <div class="nav-arrow">›</div>
          </a>

          <a routerLink="/contact" (click)="trackMobileNavClick('contact')" class="mobile-nav-item">
            <div class="nav-icon">
              <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
                <polyline points="22,6 12,13 2,6"></polyline>
              </svg>
            </div>
            <div class="nav-content">
              <span class="nav-label">Contact</span>
              <span class="nav-description">Get in Touch</span>
            </div>
            <div class="nav-arrow">›</div>
          </a>
        </nav>

        <div class="mobile-nav-footer">
          <a routerLink="/gallery-admin" (click)="trackMobileNavClick('admin')" class="admin-link-mobile">
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
              <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
            </svg>
            <span>Admin Portal</span>
          </a>
        </div>
      </div>
    </nav>
  `,
  styleUrls: ['./navigation.component.scss']
})
export class NavigationComponent {
  mobileMenuOpen = false;

  constructor(private analytics: AnalyticsService) {}

  toggleMobileMenu() {
    this.mobileMenuOpen = !this.mobileMenuOpen;
    this.analytics.trackCustomEvent('mobile_menu_toggle', { open: this.mobileMenuOpen });
  }

  closeMobileMenu() {
    this.mobileMenuOpen = false;
  }

  trackNavClick(destination: string) {
    this.analytics.trackNavigation(destination);
  }

  trackMobileNavClick(destination: string) {
    this.analytics.trackNavigation(destination);
    this.analytics.trackCustomEvent('mobile_navigation', { destination });
    this.closeMobileMenu();
  }
}