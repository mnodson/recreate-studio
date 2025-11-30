import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PromotionService } from '../services/promotion.service';
import { AnalyticsService } from '../services/analytics.service';
import { Promotion } from '../models/promotion.model';

@Component({
  selector: 'app-promotional-banner',
  standalone: true,
  imports: [CommonModule],
  template: `
    @if (bannerPromotion && !isDismissed && bannerPromotion.bannerText) {
      <div
        class="promotional-banner"
        [style.background]="getBannerBackground()"
        [style.color]="getBannerTextColor()"
      >
        <div class="banner-content">
          <div class="banner-text">
            <span class="banner-icon">🎉</span>
            <span [innerHTML]="bannerPromotion.bannerText"></span>
          </div>
          <button
            class="dismiss-button"
            (click)="dismissBanner()"
            aria-label="Dismiss promotion"
            [style.color]="getBannerTextColor()"
          >
            ✕
          </button>
        </div>
      </div>
    }
  `,
  styles: [`
    .promotional-banner {
      position: sticky;
      top: 69px;
      z-index: 999;
      width: 100%;
      padding: 1rem;
      text-align: center;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
      animation: slideDown 0.3s ease-out;
    }

    .banner-content {
      max-width: 1200px;
      margin: 0 auto;
      display: flex;
      justify-content: center;
      align-items: center;
      gap: 1rem;
      position: relative;
    }

    .banner-text {
      font-size: 1rem;
      font-weight: 600;
      display: flex;
      align-items: center;
      gap: 0.5rem;
      flex: 1;
      justify-content: center;
    }

    .banner-icon {
      font-size: 1.25rem;
      animation: bounce 1s infinite;
    }

    .dismiss-button {
      background: transparent;
      border: none;
      font-size: 1.5rem;
      cursor: pointer;
      padding: 0.25rem 0.5rem;
      opacity: 0.8;
      transition: opacity 0.2s;
      line-height: 1;
      position: absolute;
      right: 0;
    }

    .dismiss-button:hover {
      opacity: 1;
    }

    @keyframes slideDown {
      from {
        transform: translateY(-100%);
        opacity: 0;
      }
      to {
        transform: translateY(0);
        opacity: 1;
      }
    }

    @keyframes bounce {
      0%, 100% {
        transform: translateY(0);
      }
      50% {
        transform: translateY(-4px);
      }
    }

    @media (max-width: 768px) {
      .banner-text {
        font-size: 0.9rem;
        padding-right: 2rem;
      }

      .banner-icon {
        font-size: 1rem;
      }

      .dismiss-button {
        font-size: 1.25rem;
      }
    }
  `],
})
export class PromotionalBannerComponent implements OnInit {
  private promotionService = inject(PromotionService);
  private analyticsService = inject(AnalyticsService);

  bannerPromotion: Promotion | null = null;
  isDismissed = false;

  ngOnInit(): void {
    this.loadBannerPromotion();
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

  getBannerBackground(): string {
    if (this.bannerPromotion?.bannerBackgroundColor) {
      return this.bannerPromotion.bannerBackgroundColor;
    }
    // Default gradient matching site theme
    return 'linear-gradient(135deg, #8b5cf6 0%, #c084fc 100%)';
  }

  getBannerTextColor(): string {
    return this.bannerPromotion?.bannerTextColor || '#ffffff';
  }
}
