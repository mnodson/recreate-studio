import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';
import { PromotionService } from '../services/promotion.service';
import { AnalyticsService } from '../services/analytics.service';
import { Promotion } from '../models/promotion.model';

@Component({
  selector: 'app-promotional-banner',
  standalone: true,
  imports: [CommonModule],
  template: `
    @if (bannerPromotion && !isDismissed && !isAdminRoute && bannerPromotion.bannerText) {
      <div class="promotional-banner-wrapper">
        <div class="promotional-banner" [style.background]="getBackgroundStyle()">
          <div class="banner-background">
            <div class="promo-image-left" [style.opacity]="hasCustomBackground() ? '0.08' : '0.15'"></div>
            <div class="promo-image-right" [style.opacity]="hasCustomBackground() ? '0.08' : '0.15'"></div>
          </div>
          <div class="banner-content">
            <div class="promo-badge" [style.background]="getBadgeGradient()">
              <span class="badge-text">LIMITED TIME</span>
            </div>
            <div class="banner-text">
              <h2 class="promo-title" [innerHTML]="bannerPromotion.bannerText" [style.color]="getTextColor()"></h2>
              @if (bannerPromotion.description) {
                <p class="promo-description" [style.color]="getSecondaryTextColor()">{{ bannerPromotion.description }}</p>
              }
            </div>
            <div class="banner-actions">
              <button class="cta-button" (click)="navigateToPackages()" [style.background]="getCtaGradient()">
                View Packages
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <line x1="5" y1="12" x2="19" y2="12"></line>
                  <polyline points="12 5 19 12 12 19"></polyline>
                </svg>
              </button>
              <button class="dismiss-link" (click)="dismissBanner()" [style.color]="getSecondaryTextColor()">
                Maybe later
              </button>
            </div>
          </div>
          <button class="close-button" (click)="dismissBanner()" aria-label="Close promotion" [style.color]="getTextColor()">
            ✕
          </button>
        </div>
      </div>
    }
  `,
  styles: [`
    .promotional-banner-wrapper {
      width: 100%;
      padding: 2rem 1rem;
      margin-top: 80px;
      overflow: hidden;
    }

    .promotional-banner {
      position: relative;
      max-width: 1200px;
      margin: 0 auto;
      border-radius: 20px;
      padding: 3rem 2rem;
      box-shadow:
        0 20px 60px rgba(0, 0, 0, 0.4),
        0 0 0 1px rgba(255, 255, 255, 0.1);
      overflow: hidden;
      animation: slideInFromEdges 0.8s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
    }

    .banner-background {
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      opacity: 0.15;
      pointer-events: none;
    }

    .promo-image-left,
    .promo-image-right {
      position: absolute;
      width: 300px;
      height: 100%;
      background-size: cover;
      background-position: center;
      filter: blur(2px);
    }

    .promo-image-left {
      left: 0;
      top: 0;
      background-image: linear-gradient(90deg, transparent 0%, transparent 30%, #1a0f2e 70%, #1a0f2e 100%),
                        url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzAwIiBoZWlnaHQ9IjMwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZGVmcz48cGF0dGVybiBpZD0iZ3JpZCIgd2lkdGg9IjQwIiBoZWlnaHQ9IjQwIiBwYXR0ZXJuVW5pdHM9InVzZXJTcGFjZU9uVXNlIj48cGF0aCBkPSJNIDQwIDAgTCAwIDAgMCA0MCIgZmlsbD0ibm9uZSIgc3Ryb2tlPSJyZ2JhKDE5MiwgMTMyLCAyNTIsIDAuMSkiIHN0cm9rZS13aWR0aD0iMSIvPjwvcGF0dGVybj48L2RlZnM+PHJlY3Qgd2lkdGg9IjEwMCUiIGhlaWdodD0iMTAwJSIgZmlsbD0idXJsKCNncmlkKSIvPjwvc3ZnPg==');
      animation: slideInLeft 0.8s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
    }

    .promo-image-right {
      right: 0;
      top: 0;
      background-image: linear-gradient(270deg, transparent 0%, transparent 30%, #1a0f2e 70%, #1a0f2e 100%),
                        url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzAwIiBoZWlnaHQ9IjMwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZGVmcz48cGF0dGVybiBpZD0iZ3JpZCIgd2lkdGg9IjQwIiBoZWlnaHQ9IjQwIiBwYXR0ZXJuVW5pdHM9InVzZXJTcGFjZU9uVXNlIj48cGF0aCBkPSJNIDQwIDAgTCAwIDAgMCA0MCIgZmlsbD0ibm9uZSIgc3Ryb2tlPSJyZ2JhKDE5MiwgMTMyLCAyNTIsIDAuMSkiIHN0cm9rZS13aWR0aD0iMSIvPjwvcGF0dGVybj48L2RlZnM+PHJlY3Qgd2lkdGg9IjEwMCUiIGhlaWdodD0iMTAwJSIgZmlsbD0idXJsKCNncmlkKSIvPjwvc3ZnPg==');
      animation: slideInRight 0.8s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
    }

    .banner-content {
      position: relative;
      z-index: 1;
      text-align: center;
      max-width: 800px;
      margin: 0 auto;
    }

    .promo-badge {
      display: inline-block;
      margin-bottom: 1.5rem;
      animation: fadeInDown 0.6s ease-out 0.3s both;
    }

    .badge-text {
      display: inline-block;
      padding: 0.5rem 1.5rem;
      background: linear-gradient(135deg, #ff6b6b, #ff4757);
      color: white;
      font-size: 0.75rem;
      font-weight: 700;
      letter-spacing: 2px;
      text-transform: uppercase;
      border-radius: 20px;
      box-shadow: 0 4px 15px rgba(255, 71, 87, 0.4);
      animation: pulse 2s ease-in-out infinite;
    }

    .banner-text {
      margin-bottom: 2rem;
      animation: fadeInUp 0.6s ease-out 0.4s both;
    }

    .promo-title {
      font-size: 2.5rem;
      font-weight: 300;
      color: #e6d7ff;
      margin: 0 0 1rem 0;
      line-height: 1.4;
      padding: 0.25rem 0;
      background: linear-gradient(135deg, #e6d7ff, #c084fc, #8b5cf6);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
    }

    .promo-description {
      font-size: 1.1rem;
      color: #b8a9d1;
      margin: 0;
      font-weight: 300;
    }

    .banner-actions {
      display: flex;
      gap: 1rem;
      justify-content: center;
      align-items: center;
      flex-wrap: wrap;
      animation: fadeInUp 0.6s ease-out 0.5s both;
    }

    .cta-button {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      padding: 1rem 2rem;
      background: linear-gradient(135deg, #c084fc, #8b5cf6);
      color: white;
      border: none;
      border-radius: 12px;
      font-size: 1.1rem;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.3s ease;
      box-shadow: 0 8px 25px rgba(192, 132, 252, 0.4);

      svg {
        transition: transform 0.3s ease;
      }

      &:hover {
        transform: translateY(-3px);
        box-shadow: 0 12px 35px rgba(192, 132, 252, 0.6);

        svg {
          transform: translateX(4px);
        }
      }
    }

    .dismiss-link {
      background: transparent;
      border: none;
      color: #b8a9d1;
      font-size: 0.95rem;
      cursor: pointer;
      text-decoration: underline;
      opacity: 0.8;
      transition: opacity 0.3s ease;

      &:hover {
        opacity: 1;
      }
    }

    .close-button {
      position: absolute;
      top: 1rem;
      right: 1rem;
      background: rgba(255, 255, 255, 0.1);
      border: 1px solid rgba(255, 255, 255, 0.2);
      border-radius: 50%;
      width: 36px;
      height: 36px;
      display: flex;
      align-items: center;
      justify-content: center;
      color: #e6d7ff;
      font-size: 1.5rem;
      cursor: pointer;
      transition: all 0.3s ease;
      z-index: 2;

      &:hover {
        background: rgba(255, 255, 255, 0.2);
        transform: rotate(90deg);
      }
    }

    @keyframes slideInFromEdges {
      from {
        opacity: 0;
        transform: scale(0.8);
      }
      to {
        opacity: 1;
        transform: scale(1);
      }
    }

    @keyframes slideInLeft {
      from {
        transform: translateX(-100%);
      }
      to {
        transform: translateX(0);
      }
    }

    @keyframes slideInRight {
      from {
        transform: translateX(100%);
      }
      to {
        transform: translateX(0);
      }
    }

    @keyframes fadeInDown {
      from {
        opacity: 0;
        transform: translateY(-20px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }

    @keyframes fadeInUp {
      from {
        opacity: 0;
        transform: translateY(20px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }

    @keyframes pulse {
      0%, 100% {
        transform: scale(1);
      }
      50% {
        transform: scale(1.05);
      }
    }

    @media (max-width: 768px) {
      .promotional-banner-wrapper {
        padding: 1.5rem 0.5rem;
        margin-top: 70px;
      }

      .promotional-banner {
        padding: 2rem 1.5rem;
        border-radius: 16px;
      }

      .promo-title {
        font-size: 1.75rem;
        line-height: 1.4;
        padding: 0.25rem 0;
      }

      .promo-description {
        font-size: 1rem;
        line-height: 1.5;
      }

      .cta-button {
        width: 100%;
        justify-content: center;
        padding: 0.875rem 1.5rem;
      }

      .banner-actions {
        flex-direction: column;
        width: 100%;
      }

      .promo-image-left,
      .promo-image-right {
        width: 150px;
      }
    }
  `],
})
export class PromotionalBannerComponent implements OnInit {
  private promotionService = inject(PromotionService);
  private analyticsService = inject(AnalyticsService);
  private router = inject(Router);

  bannerPromotion: Promotion | null = null;
  isDismissed = false;
  isAdminRoute = false;

  ngOnInit(): void {
    this.checkAdminRoute();
    this.loadBannerPromotion();

    // Listen for route changes
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe(() => {
      this.checkAdminRoute();
    });
  }

  checkAdminRoute(): void {
    const url = this.router.url;
    this.isAdminRoute = url.includes('admin') || url.includes('login') || url.includes('message-center');
  }

  navigateToPackages(): void {
    this.router.navigate(['/packages']);
    this.analyticsService.trackCustomEvent('promotion_cta_clicked', {
      promotion_id: this.bannerPromotion?.id,
      promotion_name: this.bannerPromotion?.name,
    });
  }

  loadBannerPromotion(): void {
    this.promotionService.getPromotionSummary().subscribe({
      next: (summary) => {
        console.log('Promotion summary loaded:', summary);
        this.bannerPromotion = summary.bannerPromotion || null;

        // Check if user has dismissed this specific promotion in current session
        if (this.bannerPromotion) {
          console.log('Banner promotion found:', this.bannerPromotion);
          const dismissedId = sessionStorage.getItem('dismissedPromotionBanner');
          this.isDismissed = dismissedId === this.bannerPromotion.id;

          if (!this.isDismissed) {
            // Track banner view
            this.analyticsService.trackCustomEvent('promotion_banner_view', {
              promotion_id: this.bannerPromotion.id,
              promotion_name: this.bannerPromotion.name,
            });
          }
        } else {
          console.log('No active banner promotion found');
        }
      },
      error: (error) => {
        console.error('Error loading promotion summary:', error);
      }
    });
  }

  dismissBanner(): void {
    if (this.bannerPromotion) {
      sessionStorage.setItem('dismissedPromotionBanner', this.bannerPromotion.id || '');
      this.isDismissed = true;

      // Track banner dismissal
      this.analyticsService.trackCustomEvent('promotion_banner_dismissed', {
        promotion_id: this.bannerPromotion.id,
        promotion_name: this.bannerPromotion.name,
      });
    }
  }

  // Color customization methods
  hasCustomBackground(): boolean {
    return !!this.bannerPromotion?.bannerBackgroundColor;
  }

  getBackgroundStyle(): string {
    if (this.bannerPromotion?.bannerBackgroundColor) {
      const color = this.bannerPromotion.bannerBackgroundColor;
      // Create a gradient using the custom color with slight variations
      return `linear-gradient(135deg, ${color} 0%, ${this.adjustBrightness(color, -10)} 50%, ${color} 100%)`;
    }
    // Default gradient
    return 'linear-gradient(135deg, #1a0f2e 0%, #2d1b4e 50%, #1a0f2e 100%)';
  }

  getTextColor(): string {
    if (this.bannerPromotion?.bannerTextColor) {
      return this.bannerPromotion.bannerTextColor;
    }
    // Default text color
    return '#e6d7ff';
  }

  getSecondaryTextColor(): string {
    const baseColor = this.getTextColor();
    // Add transparency for secondary text
    return this.addAlpha(baseColor, 0.85);
  }

  getBadgeGradient(): string {
    if (this.bannerPromotion?.bannerBackgroundColor) {
      const color = this.bannerPromotion.bannerBackgroundColor;
      // Create a vibrant gradient from the custom color
      return `linear-gradient(135deg, ${this.adjustBrightness(color, 20)}, ${this.adjustBrightness(color, 30)})`;
    }
    // Default red badge gradient
    return 'linear-gradient(135deg, #ff6b6b, #ff4757)';
  }

  getCtaGradient(): string {
    if (this.bannerPromotion?.bannerBackgroundColor) {
      const color = this.bannerPromotion.bannerBackgroundColor;
      // Create a lighter gradient for the CTA button
      return `linear-gradient(135deg, ${this.adjustBrightness(color, 30)}, ${this.adjustBrightness(color, 40)})`;
    }
    // Default purple gradient
    return 'linear-gradient(135deg, #c084fc, #8b5cf6)';
  }

  // Helper function to adjust color brightness
  private adjustBrightness(color: string, percent: number): string {
    const hex = color.replace('#', '');
    const r = parseInt(hex.substring(0, 2), 16);
    const g = parseInt(hex.substring(2, 4), 16);
    const b = parseInt(hex.substring(4, 6), 16);

    const adjust = (val: number) => {
      const adjusted = val + (val * percent) / 100;
      return Math.max(0, Math.min(255, Math.round(adjusted)));
    };

    const newR = adjust(r).toString(16).padStart(2, '0');
    const newG = adjust(g).toString(16).padStart(2, '0');
    const newB = adjust(b).toString(16).padStart(2, '0');

    return `#${newR}${newG}${newB}`;
  }

  // Helper function to add alpha transparency to hex color
  private addAlpha(color: string, alpha: number): string {
    const hex = color.replace('#', '');
    const r = parseInt(hex.substring(0, 2), 16);
    const g = parseInt(hex.substring(2, 4), 16);
    const b = parseInt(hex.substring(4, 6), 16);

    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
  }
}
