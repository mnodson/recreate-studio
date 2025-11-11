# Personal Gallery Service - Usage Guide

Complete guide for using the PersonalGalleryService in your Angular application.

## Overview

The PersonalGalleryService allows you to create and manage personal galleries for clients with the following features:

- Create galleries with selected images from your portfolio
- Generate unique, shareable links
- Set expiration dates for galleries
- Track access counts and last viewed times
- Optional password protection
- Query and manage galleries

## Service API

### Creating a Gallery

```typescript
import { PersonalGalleryService } from './services/personal-gallery.service';
import { CreateGalleryRequest } from './models/gallery.model';

constructor(private galleryService: PersonalGalleryService) {}

createClientGallery() {
  const request: CreateGalleryRequest = {
    title: 'Smith Family Portrait Session',
    description: 'Your beautiful family portraits from our session on March 15th',
    clientName: 'John Smith',
    clientEmail: 'john.smith@example.com',
    imageUrls: [
      'portraits/smith-family/img-001.jpg',
      'portraits/smith-family/img-002.jpg',
      'portraits/smith-family/img-003.jpg'
    ],
    expirationDays: 30,
    password: 'optional-password-123',
    metadata: {
      category: 'family',
      shootDate: new Date('2024-03-15'),
      location: 'Central Park'
    }
  };

  this.galleryService.createGallery(request).subscribe({
    next: (response) => {
      console.log('Gallery created successfully!');
      console.log('Share URL:', response.shareUrl);
      console.log('Gallery ID:', response.gallery.id);

      // Send the share URL to the client via email
      this.sendGalleryLinkEmail(response.shareUrl, request.clientEmail);
    },
    error: (error) => {
      console.error('Failed to create gallery:', error);
    }
  });
}
```

### Retrieving a Gallery by Share Token

```typescript
viewSharedGallery(shareToken: string, password?: string) {
  this.galleryService.getGalleryByShareToken(shareToken, password).subscribe({
    next: (gallery) => {
      if (gallery) {
        console.log('Gallery found:', gallery);
        console.log('Images:', gallery.imageUrls);
        console.log('Access count:', gallery.accessCount);
        this.displayGallery(gallery);
      } else {
        console.log('Gallery not found or expired');
      }
    },
    error: (error) => {
      if (error.message === 'Invalid password') {
        console.error('Wrong password');
      } else {
        console.error('Error retrieving gallery:', error);
      }
    }
  });
}
```

### Querying Galleries

```typescript
// Get all active galleries
getActiveGalleries() {
  this.galleryService.queryGalleries({
    activeOnly: true,
    orderBy: 'createdAt',
    orderDirection: 'desc',
    limit: 10
  }).subscribe({
    next: (galleries) => {
      console.log('Active galleries:', galleries);
    }
  });
}

// Get galleries for a specific client
getClientGalleries(clientName: string) {
  this.galleryService.queryGalleries({
    clientName: clientName,
    orderBy: 'createdAt',
    orderDirection: 'desc'
  }).subscribe({
    next: (galleries) => {
      console.log(`Galleries for ${clientName}:`, galleries);
    }
  });
}

// Get most viewed galleries
getMostViewedGalleries() {
  this.galleryService.queryGalleries({
    activeOnly: true,
    orderBy: 'accessCount',
    orderDirection: 'desc',
    limit: 5
  }).subscribe({
    next: (galleries) => {
      console.log('Most viewed galleries:', galleries);
    }
  });
}
```

### Extending Gallery Expiration

```typescript
extendGalleryAccess(galleryId: string, additionalDays: number) {
  this.galleryService.extendExpiration(galleryId, additionalDays).subscribe({
    next: () => {
      console.log(`Gallery expiration extended by ${additionalDays} days`);
    },
    error: (error) => {
      console.error('Failed to extend expiration:', error);
    }
  });
}
```

### Deactivating a Gallery

```typescript
closeGallery(galleryId: string) {
  this.galleryService.deactivateGallery(galleryId).subscribe({
    next: () => {
      console.log('Gallery deactivated successfully');
    },
    error: (error) => {
      console.error('Failed to deactivate gallery:', error);
    }
  });
}
```

### Getting Gallery Statistics

```typescript
viewStatistics() {
  this.galleryService.getGalleryStats().subscribe({
    next: (stats) => {
      console.log('Total galleries:', stats.totalGalleries);
      console.log('Active galleries:', stats.activeGalleries);
      console.log('Expired galleries:', stats.expiredGalleries);
      console.log('Total views:', stats.totalViews);
      console.log('Average views per gallery:', stats.averageViewsPerGallery);
    }
  });
}
```

### Cleaning Up Expired Galleries

```typescript
cleanupExpired() {
  this.galleryService.cleanupExpiredGalleries().subscribe({
    next: (count) => {
      console.log(`Cleaned up ${count} expired galleries`);
    },
    error: (error) => {
      console.error('Failed to cleanup galleries:', error);
    }
  });
}
```

## Example: Admin Component for Managing Galleries

```typescript
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PersonalGalleryService } from '../../services/personal-gallery.service';
import { PersonalGallery, GalleryStats } from '../../models/gallery.model';

@Component({
  selector: 'app-gallery-admin',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="admin-container">
      <h1>Gallery Management</h1>

      <section class="stats">
        <h2>Statistics</h2>
        <div *ngIf="stats">
          <p>Total Galleries: {{ stats.totalGalleries }}</p>
          <p>Active: {{ stats.activeGalleries }}</p>
          <p>Expired: {{ stats.expiredGalleries }}</p>
          <p>Total Views: {{ stats.totalViews }}</p>
          <p>Average Views: {{ stats.averageViewsPerGallery | number:'1.2-2' }}</p>
        </div>
      </section>

      <section class="galleries">
        <h2>Active Galleries</h2>
        <div *ngFor="let gallery of galleries" class="gallery-item">
          <h3>{{ gallery.title }}</h3>
          <p>Client: {{ gallery.clientName }}</p>
          <p>Images: {{ gallery.imageUrls.length }}</p>
          <p>Views: {{ gallery.accessCount }}</p>
          <p>Expires: {{ gallery.expiresAt | date:'short' }}</p>
          <p>Share Link: {{ getShareUrl(gallery.shareToken) }}</p>
          <button (click)="extendGallery(gallery.id, 7)">Extend 7 Days</button>
          <button (click)="deactivateGallery(gallery.id)">Deactivate</button>
        </div>
      </section>
    </div>
  `,
  styles: [`
    .admin-container {
      max-width: 1200px;
      margin: 0 auto;
      padding: 2rem;
    }
    .stats {
      background: #f5f5f5;
      padding: 1rem;
      border-radius: 8px;
      margin-bottom: 2rem;
    }
    .gallery-item {
      border: 1px solid #ddd;
      padding: 1rem;
      margin-bottom: 1rem;
      border-radius: 4px;
    }
    button {
      margin-right: 0.5rem;
      padding: 0.5rem 1rem;
      cursor: pointer;
    }
  `]
})
export class GalleryAdminComponent implements OnInit {
  galleries: PersonalGallery[] = [];
  stats?: GalleryStats;

  constructor(private galleryService: PersonalGalleryService) {}

  ngOnInit() {
    this.loadGalleries();
    this.loadStats();
  }

  loadGalleries() {
    this.galleryService.queryGalleries({
      activeOnly: true,
      orderBy: 'createdAt',
      orderDirection: 'desc'
    }).subscribe({
      next: (galleries) => {
        this.galleries = galleries;
      }
    });
  }

  loadStats() {
    this.galleryService.getGalleryStats().subscribe({
      next: (stats) => {
        this.stats = stats;
      }
    });
  }

  getShareUrl(shareToken: string): string {
    return `${window.location.origin}/gallery/shared/${shareToken}`;
  }

  extendGallery(id: string, days: number) {
    this.galleryService.extendExpiration(id, days).subscribe({
      next: () => {
        console.log('Gallery extended');
        this.loadGalleries();
      }
    });
  }

  deactivateGallery(id: string) {
    if (confirm('Are you sure you want to deactivate this gallery?')) {
      this.galleryService.deactivateGallery(id).subscribe({
        next: () => {
          console.log('Gallery deactivated');
          this.loadGalleries();
          this.loadStats();
        }
      });
    }
  }
}
```

## Example: Shared Gallery Viewer Component

```typescript
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { PersonalGalleryService } from '../../services/personal-gallery.service';
import { ImageService } from '../../services/image.service';
import { PersonalGallery } from '../../models/gallery.model';

@Component({
  selector: 'app-shared-gallery',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="shared-gallery" *ngIf="gallery">
      <header>
        <h1>{{ gallery.title }}</h1>
        <p *ngIf="gallery.description">{{ gallery.description }}</p>
      </header>

      <div class="image-grid">
        <div *ngFor="let imageUrl of gallery.imageUrls" class="image-item">
          <img
            [src]="imageService.getImageUrl(imageUrl)"
            [alt]="gallery.title"
            (click)="openLightbox(imageUrl)">
        </div>
      </div>

      <footer>
        <p>This gallery expires on {{ gallery.expiresAt | date:'fullDate' }}</p>
      </footer>
    </div>

    <div class="error" *ngIf="!gallery && !loading">
      <h2>Gallery Not Found</h2>
      <p>This gallery may have expired or the link is invalid.</p>
    </div>
  `,
  styles: [`
    .shared-gallery {
      max-width: 1400px;
      margin: 0 auto;
      padding: 2rem;
    }
    header {
      text-align: center;
      margin-bottom: 3rem;
    }
    .image-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
      gap: 1rem;
    }
    .image-item img {
      width: 100%;
      height: auto;
      cursor: pointer;
      border-radius: 4px;
      transition: transform 0.2s;
    }
    .image-item img:hover {
      transform: scale(1.05);
    }
    footer {
      text-align: center;
      margin-top: 3rem;
      color: #666;
    }
  `]
})
export class SharedGalleryComponent implements OnInit {
  gallery?: PersonalGallery;
  loading = true;

  constructor(
    private route: ActivatedRoute,
    private galleryService: PersonalGalleryService,
    public imageService: ImageService
  ) {}

  ngOnInit() {
    const shareToken = this.route.snapshot.paramMap.get('token');
    if (shareToken) {
      this.loadGallery(shareToken);
    }
  }

  loadGallery(shareToken: string) {
    this.galleryService.getGalleryByShareToken(shareToken).subscribe({
      next: (gallery) => {
        this.gallery = gallery || undefined;
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading gallery:', error);
        this.loading = false;
      }
    });
  }

  openLightbox(imageUrl: string) {
    // Implement lightbox functionality
    console.log('Opening image:', imageUrl);
  }
}
```

## Best Practices

1. **Always handle errors** when calling service methods
2. **Unsubscribe from observables** or use AsyncPipe in templates
3. **Validate expiration dates** before displaying galleries
4. **Implement proper authentication** for admin functions
5. **Use environment variables** for sensitive configuration
6. **Monitor Firestore usage** to manage costs
7. **Implement email notifications** when galleries are created
8. **Add loading states** in your UI
9. **Cache gallery data** when appropriate to reduce Firestore reads
10. **Set up scheduled tasks** to cleanup expired galleries

## Error Handling

```typescript
this.galleryService.createGallery(request).subscribe({
  next: (response) => {
    // Success handling
  },
  error: (error) => {
    if (error.message.includes('permission')) {
      // Handle permission errors
    } else if (error.message.includes('network')) {
      // Handle network errors
    } else {
      // Handle other errors
    }
  }
});
```

## Performance Tips

1. **Use query limits** to avoid loading too much data
2. **Implement pagination** for large result sets
3. **Create Firestore indexes** for frequently used queries
4. **Cache gallery listings** on the client side
5. **Use thumbnails** for gallery previews instead of full images
6. **Lazy load images** in gallery views
