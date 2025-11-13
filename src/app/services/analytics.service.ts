import { Injectable, inject } from '@angular/core';
import { Analytics, logEvent } from '@angular/fire/analytics';

@Injectable({
  providedIn: 'root'
})
export class AnalyticsService {
  private analytics: Analytics = inject(Analytics);

  // Page Views
  trackPageView(pageName: string, additionalParams?: Record<string, any>) {
    logEvent(this.analytics, 'page_view', {
      page_name: pageName,
      ...additionalParams
    });
  }

  // Gallery Events
  trackGalleryView(galleryId: string, galleryTitle: string, imageCount: number) {
    logEvent(this.analytics, 'gallery_view', {
      gallery_id: galleryId,
      gallery_title: galleryTitle,
      image_count: imageCount
    });
  }

  trackGalleryPasswordAttempt(galleryId: string, success: boolean) {
    logEvent(this.analytics, 'gallery_password_attempt', {
      gallery_id: galleryId,
      success: success
    });
  }

  trackGalleryScrollToImages(galleryId: string) {
    logEvent(this.analytics, 'gallery_scroll_to_images', {
      gallery_id: galleryId
    });
  }

  // Image Events
  trackImageView(imageUrl: string, galleryId: string, imageIndex: number) {
    logEvent(this.analytics, 'image_view', {
      image_url: imageUrl,
      gallery_id: galleryId,
      image_index: imageIndex
    });
  }

  trackImageLightboxOpen(imageIndex: number, totalImages: number) {
    logEvent(this.analytics, 'lightbox_open', {
      image_index: imageIndex,
      total_images: totalImages
    });
  }

  trackImageNavigation(direction: 'next' | 'previous', imageIndex: number) {
    logEvent(this.analytics, 'lightbox_navigate', {
      direction: direction,
      image_index: imageIndex
    });
  }

  trackImageError(imageUrl: string, errorType: string) {
    logEvent(this.analytics, 'image_error', {
      image_url: imageUrl,
      error_type: errorType
    });
  }

  // Navigation Events
  trackNavigation(destination: string) {
    logEvent(this.analytics, 'navigation', {
      destination: destination
    });
  }

  trackExternalLink(linkUrl: string, linkText: string) {
    logEvent(this.analytics, 'external_link_click', {
      link_url: linkUrl,
      link_text: linkText
    });
  }

  // Contact & Engagement Events
  trackContactClick(contactType: 'email' | 'phone' | 'instagram' | 'form') {
    logEvent(this.analytics, 'contact_click', {
      contact_type: contactType
    });
  }

  trackPackageView(packageName: string) {
    logEvent(this.analytics, 'package_view', {
      package_name: packageName
    });
  }

  // Admin Events (be careful with PII - don't log user emails)
  trackAdminLogin(success: boolean) {
    logEvent(this.analytics, 'admin_login', {
      success: success
    });
  }

  trackAdminGalleryCreate(imageCount: number) {
    logEvent(this.analytics, 'admin_gallery_create', {
      image_count: imageCount
    });
  }

  trackAdminGalleryEdit(galleryId: string, action: string) {
    logEvent(this.analytics, 'admin_gallery_edit', {
      gallery_id: galleryId,
      action: action
    });
  }

  trackAdminImageUpload(imageCount: number, uploadMethod: string) {
    logEvent(this.analytics, 'admin_image_upload', {
      image_count: imageCount,
      upload_method: uploadMethod
    });
  }

  // Performance Events
  trackThumbnailGeneration(imageCount: number, duration: number) {
    logEvent(this.analytics, 'thumbnail_generation', {
      image_count: imageCount,
      duration_ms: duration
    });
  }

  // Error Events
  trackError(errorMessage: string, errorContext: string) {
    logEvent(this.analytics, 'error', {
      error_message: errorMessage,
      error_context: errorContext
    });
  }

  // Custom Events
  trackCustomEvent(eventName: string, params?: Record<string, any>) {
    logEvent(this.analytics, eventName, params);
  }
}
