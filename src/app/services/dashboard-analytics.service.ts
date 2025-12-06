import { Injectable, inject } from '@angular/core';
import { Firestore, collection, collectionData, query, where, Timestamp } from '@angular/fire/firestore';
import { Observable, combineLatest, map } from 'rxjs';
import { ContactMessage } from './contact-message.service';
import { PersonalGallery } from '../models/gallery.model';
import { Promotion } from '../models/promotion.model';

export interface DateRange {
  start: Date;
  end: Date;
  label: string;
}

export interface MetricCard {
  title: string;
  value: number | string;
  change?: number;
  changeLabel?: string;
  trend?: 'up' | 'down' | 'neutral';
  icon?: string;
}

export interface InquiryByType {
  type: string;
  count: number;
  percentage: number;
}

export interface PackageInterest {
  packageName: string;
  count: number;
  percentage: number;
}

export interface GalleryStats {
  galleryId: string;
  title: string;
  clientName: string;
  views: number;
  lastAccessed?: Date;
  imageCount: number;
  createdAt: Date;
}

export interface PromotionStats {
  promotion: Promotion;
  views: number;
  clicks: number;
  dismissals: number;
  ctr: number;
  conversionRate: number;
}

export interface DashboardMetrics {
  // Overview metrics
  totalInquiries: number;
  inquiriesThisWeek: number;
  inquiriesChange: number;
  totalGalleryViews: number;
  galleryViewsThisWeek: number;
  galleryViewsChange: number;
  activePromotions: number;
  conversionRate: number;

  // Inquiry analytics
  inquiriesByType: InquiryByType[];
  packageInterest: PackageInterest[];
  inquiriesOverTime: { date: string; count: number }[];

  // Gallery analytics
  topGalleries: GalleryStats[];
  totalGalleries: number;
  activeGalleries: number;

  // Promotion analytics
  promotionStats: PromotionStats[];
}

@Injectable({
  providedIn: 'root'
})
export class DashboardAnalyticsService {
  private firestore: Firestore = inject(Firestore);

  getDateRange(preset: 'week' | 'month' | 'quarter' | 'year' | 'custom', customStart?: Date, customEnd?: Date): DateRange {
    const now = new Date();
    const end = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59);
    let start: Date;
    let label: string;

    switch (preset) {
      case 'week':
        start = new Date(now);
        start.setDate(now.getDate() - 7);
        start.setHours(0, 0, 0, 0);
        label = 'Last 7 Days';
        break;
      case 'month':
        start = new Date(now);
        start.setDate(now.getDate() - 30);
        start.setHours(0, 0, 0, 0);
        label = 'Last 30 Days';
        break;
      case 'quarter':
        start = new Date(now);
        start.setDate(now.getDate() - 90);
        start.setHours(0, 0, 0, 0);
        label = 'Last 90 Days';
        break;
      case 'year':
        start = new Date(now);
        start.setFullYear(now.getFullYear() - 1);
        start.setHours(0, 0, 0, 0);
        label = 'Last Year';
        break;
      case 'custom':
        if (!customStart || !customEnd) {
          throw new Error('Custom date range requires start and end dates');
        }
        start = customStart;
        label = 'Custom Range';
        return { start, end: customEnd, label };
      default:
        start = new Date(now);
        start.setDate(now.getDate() - 30);
        start.setHours(0, 0, 0, 0);
        label = 'Last 30 Days';
    }

    return { start, end, label };
  }

  getDashboardMetrics(dateRange: DateRange): Observable<DashboardMetrics> {
    const messagesRef = collection(this.firestore, 'contact-messages');
    const galleriesRef = collection(this.firestore, 'personal-galleries');
    const promotionsRef = collection(this.firestore, 'promotions');

    // Query messages in date range
    const messagesQuery = query(
      messagesRef,
      where('createdAt', '>=', Timestamp.fromDate(dateRange.start)),
      where('createdAt', '<=', Timestamp.fromDate(dateRange.end))
    );

    // Query all messages for comparison (previous period)
    const previousStart = new Date(dateRange.start);
    previousStart.setDate(previousStart.getDate() - (dateRange.end.getTime() - dateRange.start.getTime()) / (1000 * 60 * 60 * 24));

    const previousMessagesQuery = query(
      messagesRef,
      where('createdAt', '>=', Timestamp.fromDate(previousStart)),
      where('createdAt', '<', Timestamp.fromDate(dateRange.start))
    );

    // Query galleries
    const galleriesQuery = query(galleriesRef);

    // Query active promotions
    const activePromotionsQuery = query(
      promotionsRef,
      where('isActive', '==', true)
    );

    return combineLatest([
      collectionData(messagesQuery, { idField: 'id' }) as Observable<ContactMessage[]>,
      collectionData(previousMessagesQuery, { idField: 'id' }) as Observable<ContactMessage[]>,
      collectionData(galleriesQuery, { idField: 'id' }) as Observable<PersonalGallery[]>,
      collectionData(activePromotionsQuery, { idField: 'id' }) as Observable<Promotion[]>
    ]).pipe(
      map(([messages, previousMessages, galleries, promotions]) => {
        return this.calculateMetrics(messages, previousMessages, galleries, promotions, dateRange);
      })
    );
  }

  private calculateMetrics(
    messages: ContactMessage[],
    previousMessages: ContactMessage[],
    galleries: PersonalGallery[],
    promotions: Promotion[],
    dateRange: DateRange
  ): DashboardMetrics {
    // Calculate inquiry metrics
    const totalInquiries = messages.length;
    const previousInquiries = previousMessages.length;
    const inquiriesChange = previousInquiries > 0
      ? ((totalInquiries - previousInquiries) / previousInquiries) * 100
      : 0;

    // Inquiries by type
    const typeCount = new Map<string, number>();
    messages.forEach(msg => {
      const type = msg.inquiryType || 'general';
      typeCount.set(type, (typeCount.get(type) || 0) + 1);
    });

    const inquiriesByType: InquiryByType[] = Array.from(typeCount.entries()).map(([type, count]) => ({
      type: this.formatInquiryType(type),
      count,
      percentage: totalInquiries > 0 ? (count / totalInquiries) * 100 : 0
    }));

    // Package interest
    const packageCount = new Map<string, number>();
    messages
      .filter(msg => msg.packageInterest && msg.packageInterest.trim() !== '')
      .forEach(msg => {
        const pkgName = msg.packageInterest!;
        packageCount.set(pkgName, (packageCount.get(pkgName) || 0) + 1);
      });

    const packageInterest: PackageInterest[] = Array.from(packageCount.entries())
      .map(([packageName, count]) => ({
        packageName,
        count,
        percentage: totalInquiries > 0 ? (count / totalInquiries) * 100 : 0
      }))
      .sort((a, b) => b.count - a.count);

    // Inquiries over time (daily breakdown)
    const inquiriesOverTime = this.groupInquiriesByDate(messages, dateRange);

    // Gallery analytics
    const now = new Date();
    const activeGalleries = galleries.filter(g => {
      const expiresAt = g.expiresAt instanceof Date ? g.expiresAt : (g.expiresAt as any).toDate();
      return g.isActive && expiresAt > now;
    }).length;
    const totalGalleryViews = galleries.reduce((sum, g) => sum + (g.accessCount || 0), 0);

    // Calculate gallery views for current period (if lastAccessedAt is in range)
    const galleryViewsThisWeek = galleries
      .filter(g => {
        if (!g.lastAccessedAt) return false;
        const lastAccessedAt = g.lastAccessedAt instanceof Date ? g.lastAccessedAt : (g.lastAccessedAt as any).toDate();
        return this.isDateInRange(lastAccessedAt, dateRange);
      })
      .reduce((sum, g) => sum + (g.accessCount || 0), 0);

      console.log(galleries)
    const topGalleries: GalleryStats[] = galleries
      .filter(g => g.isActive && g.accessCount && g.accessCount > 0)
      .sort((a, b) => (b.accessCount || 0) - (a.accessCount || 0))
      .slice(0, 10)
      .map(g => ({
        galleryId: g.id || '',
        title: g.title,
        clientName: g.clientName,
        views: g.accessCount || 0,
        lastAccessed: g.lastAccessedAt ? (g.lastAccessedAt instanceof Date ? g.lastAccessedAt : (g.lastAccessedAt as any).toDate()) : undefined,
        imageCount: g.imageUrls?.length || 0,
        createdAt: g.createdAt instanceof Date ? g.createdAt : (g.createdAt as any).toDate()
      }));

      console.log('top galleries', topGalleries)

    // Filter promotions that are actually active and within date range
    const activePromotionsNow = promotions.filter(promo => {
      const now = new Date();
      const startDate = promo.startDate instanceof Date ? promo.startDate : (promo.startDate as any).toDate();
      const endDate = promo.endDate instanceof Date ? promo.endDate : (promo.endDate as any).toDate();
      return promo.isActive && now >= startDate && now <= endDate;
    });

    // Promotion analytics (placeholder - would need actual analytics events from Firebase Analytics)
    const promotionStats: PromotionStats[] = activePromotionsNow.map(promo => ({
      promotion: promo,
      views: 0, // Would come from Firebase Analytics
      clicks: 0, // Would come from Firebase Analytics
      dismissals: 0, // Would come from Firebase Analytics
      ctr: 0,
      conversionRate: 0
    }));

    // Conversion rate (placeholder - would need booking/conversion data)
    const conversionRate = 0; // Would be calculated from bookings vs inquiries

    return {
      totalInquiries,
      inquiriesThisWeek: totalInquiries,
      inquiriesChange,
      totalGalleryViews,
      galleryViewsThisWeek,
      galleryViewsChange: 0, // Would need previous period data
      activePromotions: activePromotionsNow.length,
      conversionRate,
      inquiriesByType,
      packageInterest,
      inquiriesOverTime,
      topGalleries,
      totalGalleries: galleries.length,
      activeGalleries,
      promotionStats
    };
  }

  private formatInquiryType(type: string): string {
    const typeMap: Record<string, string> = {
      'general': 'General Inquiry',
      'consultation': 'Consultation',
      'quote': 'Quote Request',
      'package': 'Package Inquiry',
      'booking': 'Booking Request'
    };
    return typeMap[type] || type;
  }

  private groupInquiriesByDate(messages: ContactMessage[], dateRange: DateRange): { date: string; count: number }[] {
    const dailyCount = new Map<string, number>();

    // Initialize all dates in range with 0
    const currentDate = new Date(dateRange.start);
    while (currentDate <= dateRange.end) {
      const dateKey = currentDate.toISOString().split('T')[0];
      dailyCount.set(dateKey, 0);
      currentDate.setDate(currentDate.getDate() + 1);
    }

    // Count messages by date
    messages.forEach(msg => {
      if (msg.createdAt) {
        const date = msg.createdAt.toDate();
        const dateKey = date.toISOString().split('T')[0];
        dailyCount.set(dateKey, (dailyCount.get(dateKey) || 0) + 1);
      }
    });

    return Array.from(dailyCount.entries())
      .map(([date, count]) => ({ date, count }))
      .sort((a, b) => a.date.localeCompare(b.date));
  }

  private isDateInRange(date: Date, range: DateRange): boolean {
    return date >= range.start && date <= range.end;
  }

  // Get metric cards for overview
  getMetricCards(metrics: DashboardMetrics): MetricCard[] {
    return [
      {
        title: 'Total Inquiries',
        value: metrics.totalInquiries,
        change: metrics.inquiriesChange,
        changeLabel: 'vs previous period',
        trend: metrics.inquiriesChange > 0 ? 'up' : metrics.inquiriesChange < 0 ? 'down' : 'neutral',
        icon: 'mail'
      },
      {
        title: 'Gallery Views',
        value: metrics.totalGalleryViews,
        change: metrics.galleryViewsChange,
        changeLabel: 'vs previous period',
        trend: metrics.galleryViewsChange > 0 ? 'up' : metrics.galleryViewsChange < 0 ? 'down' : 'neutral',
        icon: 'eye'
      },
      {
        title: 'Active Galleries',
        value: metrics.activeGalleries,
        icon: 'image'
      },
      {
        title: 'Active Promotions',
        value: metrics.activePromotions,
        icon: 'tag'
      }
    ];
  }
}
