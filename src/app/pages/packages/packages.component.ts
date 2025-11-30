import { Component, OnInit, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AnalyticsService } from '../../services/analytics.service';
import { PromotionService } from '../../services/promotion.service';
import { Promotion, PackageWithPromotion } from '../../models/promotion.model';

interface Package {
  id: number;
  name: string;
  category: string;
  price: string;
  duration: string;
  description: string;
  features: string[];
  popular: boolean;
  additionalInfo?: string;
}

interface SpecialtyOffering {
  name: string;
  category: string;
  price: string;
  description: string;
  features: string[];
}

interface SpecialtySection {
  sectionName: string;
  tagline: string;
  description: string;
  offerings: SpecialtyOffering[];
}

@Component({
  selector: 'app-packages',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="packages-container">
      <section class="packages-header">
        <div class="container">
          <h1>Photography Packages</h1>
          <p>Professional photography services tailored to your unique needs and vision</p>
        </div>
      </section>

      <section class="packages-grid">
        <div class="container">
          <div class="grid">
            <div
              class="package-card"
              *ngFor="let package of packages"
              [class.popular]="package.popular"
              [class.expanded]="isPackageExpanded(package.id)">
              <div class="package-header" *ngIf="package.popular">
                <span class="popular-badge">Most Popular</span>
              </div>
              <div class="package-content">
                <div class="package-summary" (click)="togglePackage(package.id)">
                  <div class="summary-main">
                    <div class="package-category">{{ package.category }}</div>
                    <h3 class="package-name">{{ package.name }}</h3>
                    <div class="package-pricing">
                      @if (getPackagePromotion(package.id)?.hasPromotion) {
                        <div class="promotional-pricing">
                          <span class="promo-badge">
                            {{ getPackagePromotion(package.id)?.discountPercentage }}% OFF
                          </span>
                          <div class="price-display">
                            <span class="original-price">{{ formatOriginalPrice(package.id) }}</span>
                            <span class="promo-price">{{ formatPromoPrice(package.id) }}</span>
                          </div>
                        </div>
                      } @else {
                        <div class="package-price">{{ package.price }}</div>
                      }
                    </div>
                    <div class="package-duration">{{ package.duration }}</div>
                  </div>
                  <button class="expand-btn" type="button">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <polyline points="6 9 12 15 18 9"></polyline>
                    </svg>
                  </button>
                </div>

                <div class="package-details">
                  <p class="package-description">{{ package.description }}</p>

                  <ul class="package-features">
                    <li *ngFor="let feature of package.features">{{ feature }}</li>
                  </ul>

                  <div class="package-additional" *ngIf="package.additionalInfo">
                    <p>{{ package.additionalInfo }}</p>
                  </div>

                  <button class="package-btn" (click)="trackPackageInterest(package)">Book This Package</button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section class="add-ons">
        <div class="container">
          <h2>Add-On Services</h2>
          <div class="add-ons-grid">
            <div class="add-on-item" *ngFor="let addon of addOns">
              <h4>{{ addon.name }}</h4>
              <p>{{ addon.description }}</p>
              <span class="add-on-price">{{ addon.price }}</span>
            </div>
          </div>
        </div>
      </section>

      <section class="booking-process">
        <div class="container">
          <h2>How It Works</h2>
          <div class="process-steps">
            <div class="step" *ngFor="let step of bookingSteps; let i = index">
              <div class="step-number">{{ i + 1 }}</div>
              <div class="step-content">
                <h4>{{ step.title }}</h4>
                <p>{{ step.description }}</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section class="specialty-section">
        <div class="container">
          <div class="specialty-card">
            <div class="specialty-header">
              <div class="specialty-badge">{{ specialtySection.sectionName }}</div>
              <h2>{{ specialtySection.tagline }}</h2>
              <p class="specialty-intro">{{ specialtySection.description }}</p>
            </div>

            <div class="specialty-offerings">
              @for (offering of specialtySection.offerings; track offering.name) {
                <div class="specialty-offering">
                  <div class="offering-header">
                    <div class="offering-info">
                      <div class="offering-category">{{ offering.category }}</div>
                      <h3 class="offering-name">{{ offering.name }}</h3>
                    </div>
                    <div class="offering-price">{{ offering.price }}</div>
                  </div>
                  <p class="offering-description">{{ offering.description }}</p>
                  <ul class="offering-features">
                    @for (feature of offering.features; track feature) {
                      <li>{{ feature }}</li>
                    }
                  </ul>
                  <button class="offering-btn" (click)="trackPackageInterest({ name: offering.name, category: offering.category })">
                    Inquire About This Session
                  </button>
                </div>
              }
            </div>
          </div>
        </div>
      </section>

      <section class="contact-section">
        <div class="container">
          <h2>Ready to Book?</h2>
          <p>Let's discuss your photography needs and create a custom package that fits your vision and budget.</p>
          <div class="contact-buttons">
            <button class="btn-primary" (click)="trackContactClick('consultation')">Schedule Consultation</button>
            <button class="btn-secondary" (click)="trackContactClick('quote')">Get Custom Quote</button>
          </div>
          <div class="contact-info">
            <p>Call: (817) 501-1023 | Email: laura@recreate-studio.com</p>
          </div>
        </div>
      </section>
    </div>
  `,
  styleUrls: ['./packages.component.scss']
})
export class PackagesComponent implements OnInit {
  expandedPackages = signal<Set<number>>(new Set());
  activePromotions = signal<Promotion[]>([]);
  packagePromotions = signal<Map<number, PackageWithPromotion>>(new Map());

  private analytics = inject(AnalyticsService);
  private router = inject(Router);
  private promotionService = inject(PromotionService);

  ngOnInit() {
    this.analytics.trackPageView('packages');
    this.loadPromotions();
  }

  loadPromotions() {
    this.promotionService.getActivePromotions().subscribe((promotions) => {
      this.activePromotions.set(promotions);
      this.calculatePackagePromotions();
    });
  }

  calculatePackagePromotions() {
    const promotionsMap = new Map<number, PackageWithPromotion>();

    this.packages.forEach((pkg) => {
      const basePrice = this.extractNumericPrice(pkg.price);
      if (basePrice > 0) {
        const promoData = this.promotionService.calculatePromotionalPrice(
          pkg.id,
          basePrice,
          this.activePromotions()
        );
        promotionsMap.set(pkg.id, promoData);
      }
    });

    this.packagePromotions.set(promotionsMap);
  }

  extractNumericPrice(priceString: string): number {
    // Extract first number from price string (e.g., "$495" => 495, "$600 /2hr" => 600, "from $695" => 695)
    const match = priceString.match(/\d+/);
    return match ? parseInt(match[0], 10) : 0;
  }

  getPackagePromotion(packageId: number): PackageWithPromotion | undefined {
    return this.packagePromotions().get(packageId);
  }

  formatOriginalPrice(packageId: number): string {
    const promo = this.getPackagePromotion(packageId);
    return promo ? `$${promo.originalPrice}` : '';
  }

  formatPromoPrice(packageId: number): string {
    const promo = this.getPackagePromotion(packageId);
    return promo ? `$${promo.promotionalPrice}` : '';
  }

  togglePackage(packageId: number) {
    const expanded = new Set(this.expandedPackages());
    if (expanded.has(packageId)) {
      expanded.delete(packageId);
    } else {
      expanded.add(packageId);
    }
    this.expandedPackages.set(expanded);
  }

  isPackageExpanded(packageId: number): boolean {
    return this.expandedPackages().has(packageId);
  }

  trackPackageInterest(pkg: Package | { name: string; category: string }) {
    this.analytics.trackPackageView(pkg.name);
    this.analytics.trackContactClick('form');

    // Navigate to contact form with package details
    this.router.navigate(['/contact'], {
      queryParams: {
        type: 'package',
        package: pkg.name,
        category: pkg.category
      }
    });
  }

  trackContactClick(type: string) {
    this.analytics.trackContactClick('form');
    this.analytics.trackCustomEvent('contact_interest', { type });

    // Navigate to contact form with inquiry type
    this.router.navigate(['/contact'], {
      queryParams: {
        type: type
      }
    });
  }

  packages: Package[] = [
    {
      id: 1,
      name: 'Mini Session',
      category: 'Portrait Session',
      price: '$95',
      duration: '30 Min',
      description: 'Great for seasonal or holiday celebrations',
      features: [
        '30 min photography session',
        'At least 5 edited high-resolution images',
        'Online gallery for viewing'
      ],
      popular: false
    },
    {
      id: 2,
      name: 'Seniors',
      category: 'Senior Portraits',
      price: '$495',
      duration: '2 Hours',
      description: 'Celebrate your senior year with bold, creative portraits',
      features: [
        '2-hour photography session',
        '2 outfit changes',
        '25 edited high-resolution images',
        'Online gallery with slideshow',
        'Optional locations'
      ],
      popular: true
    },
    {
      id: 3,
      name: 'Essential',
      category: 'Portrait Session',
      price: '$395',
      duration: '1.5 Hours',
      description: 'Perfect for individual portraits, couples, or small families',
      features: [
        '1.5-hour portrait session',
        '1 outfit changes',
        '25 edited high-resolution images',
        'Multiple location options',
        'Online gallery for sharing'
      ],
      popular: false,
    },
    {
      id: 4,
      name: 'Premium',
      category: 'Portrait Session',
      price: '$625',
      duration: '2 Hours',
      description: 'Perfect for larger families, or groups of families',
      features: [
        '2-hour private session',
        '3 outfit changes',
        '40 edited high-resolution images',
        'Private online gallery',
      ],
      popular: false,
      additionalInfo: 'Bring friends for group shots'
    },
    {
      id: 5,
      name: 'Commercial',
      category: 'Business Photography',
      price: '$999',
      duration: '2 Hours',
      description: 'Professional photography for brands and businesses',
      features: [
        '2-hour photography session',
        'Business location',
        '20-30 edited high-resolution images',
        'Commercial usage rights',
        'Rush editing available'
      ],
      popular: false
    },
    {
      id: 6,
      name: 'Event Coverage',
      category: 'Event Photography',
      price: '$600 /2hr',
      duration: 'Flexible',
      description: 'Professional event documentation and coverage',
      features: [
        'Hourly rate with 2-hour minimum',
        '$200 per additional hour',
        'Full event coverage',
        'Candid and posed shots',
        'Online gallery',
        'Professional editing'
      ],
      popular: false
    }
  ];

  addOns = [
    {
      name: 'Additional Hour',
      description: 'Extend your session for more variety and options',
      price: '+$150'
    },
    {
      name: 'Extra Outfit Changes',
      description: 'Perfect for capturing different looks and styles',
      price: '+$50 each'
    },
    {
      name: 'Rush Editing',
      description: 'Receive your edited images within 48 hours',
      price: '+$200'
    }
  ];

  bookingSteps = [
    {
      title: 'Initial Consultation',
      description: 'We discuss your vision, style preferences, and session details to ensure perfect alignment.'
    },
    {
      title: 'Package Selection',
      description: 'Choose the package that best fits your needs, or we can create a custom solution.'
    },
    {
      title: 'Contract & Deposit',
      description: 'Secure your date with a signed contract and 50% deposit.'
    },
    {
      title: 'Session Planning',
      description: 'We plan all the details including location, timing, outfits, and any special requirements.'
    },
    {
      title: 'Photography Session',
      description: 'Enjoy a relaxed, professional session where we capture beautiful, authentic moments.'
    },
    {
      title: 'Image Delivery',
      description: 'Receive your edited high-resolution images within 2 weeks.'
    }
  ];

  specialtySection: SpecialtySection = {
    sectionName: 'Specialty Sessions',
    tagline: 'Unique moments deserve specialized expertise',
    description: 'Every story is different. These sessions are fully customized to your specific needs.',
    offerings: [
      {
        name: 'Intimate Portraits',
        category: 'Boudoir',
        price: 'from $695',
        description: 'Empowering, artistic portraits in a safe, comfortable environment',
        features: [
          'Pre-session consultation',
          'Private online gallery',
          'Discrete, professional service'
        ]
      },
      {
        name: 'Birth Story',
        category: 'Birth Photography',
        price: 'from $1,495',
        description: 'Document the incredible journey of your child\'s arrival',
        features: [
          'On-call coverage 38-42 weeks',
          'Labor and delivery coverage',
          'Fresh 48 session included',
        ]
      },
      {
        name: 'Game Day',
        category: 'Sports Photography',
        price: 'from $295/game',
        description: 'Capture the action, emotion, and triumph of youth sports',
        features: [
          'Full game coverage',
          'Action shots & team moments',
          'Online gallery for team sharing',
          'Package deals for full season'
        ]
      }
    ]
  };
}