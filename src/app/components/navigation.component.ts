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
        <a routerLink="/home" (click)="trackMobileNavClick('home')">Home</a>
        <a routerLink="/about" (click)="trackMobileNavClick('about')">About</a>
        <a routerLink="/gallery" (click)="trackMobileNavClick('gallery')">Gallery</a>
        <a routerLink="/packages" (click)="trackMobileNavClick('packages')">Packages</a>
        <a routerLink="/gallery-admin" (click)="trackMobileNavClick('admin')" class="admin-link">
          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
            <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
          </svg>
          Admin
        </a>
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