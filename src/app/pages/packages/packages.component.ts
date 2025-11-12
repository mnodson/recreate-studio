import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

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
              [class.popular]="package.popular">
              <div class="package-header" *ngIf="package.popular">
                <span class="popular-badge">Most Popular</span>
              </div>
              <div class="package-content">
                <div class="package-category">{{ package.category }}</div>
                <h3 class="package-name">{{ package.name }}</h3>
                <div class="package-price">{{ package.price }}</div>
                <div class="package-duration">{{ package.duration }}</div>
                <p class="package-description">{{ package.description }}</p>
                
                <ul class="package-features">
                  <li *ngFor="let feature of package.features">{{ feature }}</li>
                </ul>
                
                <div class="package-additional" *ngIf="package.additionalInfo">
                  <p>{{ package.additionalInfo }}</p>
                </div>
                
                <button class="package-btn">Book This Package</button>
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

      <section class="contact-section">
        <div class="container">
          <h2>Ready to Book?</h2>
          <p>Let's discuss your photography needs and create a custom package that fits your vision and budget.</p>
          <div class="contact-buttons">
            <button class="btn-primary">Schedule Consultation</button>
            <button class="btn-secondary">Get Custom Quote</button>
          </div>
          <div class="contact-info">
            <p>Call: (xxx) xxx-xxxx | Email: hello@recreatestudio.com</p>
          </div>
        </div>
      </section>
    </div>
  `,
  styleUrls: ['./packages.component.scss']
})
export class PackagesComponent {
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
      popular: false
    },
    {
      id: 3,
      name: 'Essential',
      category: 'Portrait Session',
      price: '$495',
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
      //additionalInfo: 'Bring friends for group shots'
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
      price: '$500',
      duration: '2 Hours',
      description: 'Professional photography for brands and businesses',
      features: [
        '2-hour photography session',
        'Business location or studio',
        '30 edited high-resolution images',
        'Commercial usage rights',
        'Online delivery',
        'Rush editing available',
        'Multiple outfit changes'
      ],
      popular: false
    },
    {
      id: 6,
      name: 'Event Coverage',
      category: 'Event Photography',
      price: '$400/hour',
      duration: 'Flexible',
      description: 'Professional event documentation and coverage',
      features: [
        'Hourly rate with 2-hour minimum',
        'Full event coverage',
        'Candid and posed shots',
        'Same-day preview images',
        'Online gallery delivery',
        'Print release included',
        'Professional editing'
      ],
      popular: false,
      additionalInfo: 'Multi-day events available'
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
}