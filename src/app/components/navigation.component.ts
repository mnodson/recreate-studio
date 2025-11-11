import { Component } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-navigation',
  standalone: true,
  imports: [RouterLink, RouterLinkActive, CommonModule],
  template: `
    <nav class="navigation">
      <div class="nav-container">
        <ul class="nav-links">
          <li><a routerLink="/home" routerLinkActive="active">Home</a></li>
          <li><a routerLink="/about" routerLinkActive="active">About</a></li>
          <li><a routerLink="/gallery" routerLinkActive="active">Gallery</a></li>
          <li><a routerLink="/packages" routerLinkActive="active">Packages</a></li>
          <li><a routerLink="/gallery-admin" routerLinkActive="active" class="admin-link">Admin</a></li>
        </ul>
        <div class="mobile-menu-toggle" (click)="toggleMobileMenu()">
          <span></span>
          <span></span>
          <span></span>
        </div>
      </div>
      <div class="mobile-nav" [class.active]="mobileMenuOpen">
        <a routerLink="/home" (click)="closeMobileMenu()">Home</a>
        <a routerLink="/about" (click)="closeMobileMenu()">About</a>
        <a routerLink="/gallery" (click)="closeMobileMenu()">Gallery</a>
        <a routerLink="/packages" (click)="closeMobileMenu()">Packages</a>
        <a routerLink="/gallery-admin" (click)="closeMobileMenu()" class="admin-link">Admin</a>
      </div>
    </nav>
  `,
  styleUrls: ['./navigation.component.scss']
})
export class NavigationComponent {
  mobileMenuOpen = false;

  toggleMobileMenu() {
    this.mobileMenuOpen = !this.mobileMenuOpen;
  }

  closeMobileMenu() {
    this.mobileMenuOpen = false;
  }
}