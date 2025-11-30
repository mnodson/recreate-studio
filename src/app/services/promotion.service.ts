import { Injectable, inject } from '@angular/core';
import {
  Firestore,
  collection,
  collectionData,
  doc,
  addDoc,
  updateDoc,
  deleteDoc,
  Timestamp,
} from '@angular/fire/firestore';
import { Observable, map } from 'rxjs';
import { Promotion, PromotionSummary, PackageWithPromotion } from '../models/promotion.model';

@Injectable({
  providedIn: 'root',
})
export class PromotionService {
  private firestore = inject(Firestore);
  private promotionsCollection = collection(this.firestore, 'promotions');

  constructor() {}

  /**
   * Get all promotions from Firestore
   */
  getAllPromotions(): Observable<Promotion[]> {
    return collectionData(this.promotionsCollection, { idField: 'id' }).pipe(
      map((promotions: any[]) =>
        promotions.map((promo) => this.convertTimestamps(promo))
      )
    );
  }

  /**
   * Get only active promotions (within date range and isActive=true)
   */
  getActivePromotions(): Observable<Promotion[]> {
    return this.getAllPromotions().pipe(
      map((promotions) => {
        const now = new Date();
        return promotions.filter((promo) => {
          return (
            promo.isActive &&
            new Date(promo.startDate) <= now &&
            new Date(promo.endDate) >= now
          );
        });
      })
    );
  }

  /**
   * Get promotion summary including banner promotion
   */
  getPromotionSummary(): Observable<PromotionSummary> {
    return this.getActivePromotions().pipe(
      map((activePromotions) => {
        const bannerPromotion = activePromotions.find((promo) => promo.showBanner);
        return {
          hasActivePromotion: activePromotions.length > 0,
          activePromotions,
          bannerPromotion,
        };
      })
    );
  }

  /**
   * Calculate promotional pricing for a package
   */
  calculatePromotionalPrice(
    packageId: number,
    originalPrice: number,
    activePromotions: Promotion[]
  ): PackageWithPromotion {
    const result: PackageWithPromotion = {
      originalPrice,
      hasPromotion: false,
    };

    // Find applicable promotion for this package
    const applicablePromotion = activePromotions.find((promo) => {
      return promo.isSiteWide || promo.targetPackageIds?.includes(packageId);
    });

    if (!applicablePromotion) {
      return result;
    }

    // Calculate discounted price
    let discountAmount = 0;
    if (applicablePromotion.discountType === 'percentage') {
      discountAmount = (originalPrice * applicablePromotion.discountValue) / 100;
    } else {
      discountAmount = applicablePromotion.discountValue;
    }

    const promotionalPrice = Math.max(0, originalPrice - discountAmount);

    return {
      originalPrice,
      promotionalPrice: Math.round(promotionalPrice),
      discountAmount: Math.round(discountAmount),
      discountPercentage:
        applicablePromotion.discountType === 'percentage'
          ? applicablePromotion.discountValue
          : Math.round((discountAmount / originalPrice) * 100),
      hasPromotion: true,
      applicablePromotion,
    };
  }

  /**
   * Create a new promotion
   */
  async createPromotion(
    promotion: Omit<Promotion, 'id' | 'createdAt' | 'updatedAt'>
  ): Promise<string> {
    const now = new Date();
    const promoData = {
      ...promotion,
      createdAt: Timestamp.fromDate(now),
      updatedAt: Timestamp.fromDate(now),
      startDate: Timestamp.fromDate(new Date(promotion.startDate)),
      endDate: Timestamp.fromDate(new Date(promotion.endDate)),
    };

    const docRef = await addDoc(this.promotionsCollection, promoData);
    return docRef.id;
  }

  /**
   * Update an existing promotion
   */
  async updatePromotion(
    id: string,
    updates: Partial<Promotion>
  ): Promise<void> {
    const promoDoc = doc(this.firestore, 'promotions', id);
    const updateData: any = {
      ...updates,
      updatedAt: Timestamp.fromDate(new Date()),
    };

    // Convert date fields to Timestamps if they exist in updates
    if (updates.startDate) {
      updateData.startDate = Timestamp.fromDate(new Date(updates.startDate));
    }
    if (updates.endDate) {
      updateData.endDate = Timestamp.fromDate(new Date(updates.endDate));
    }

    await updateDoc(promoDoc, updateData);
  }

  /**
   * Delete a promotion
   */
  async deletePromotion(id: string): Promise<void> {
    const promoDoc = doc(this.firestore, 'promotions', id);
    await deleteDoc(promoDoc);
  }

  /**
   * Helper to convert Firestore Timestamps to Date objects
   */
  private convertTimestamps(promo: any): Promotion {
    return {
      ...promo,
      startDate: promo.startDate?.toDate ? promo.startDate.toDate() : promo.startDate,
      endDate: promo.endDate?.toDate ? promo.endDate.toDate() : promo.endDate,
      createdAt: promo.createdAt?.toDate ? promo.createdAt.toDate() : promo.createdAt,
      updatedAt: promo.updatedAt?.toDate ? promo.updatedAt.toDate() : promo.updatedAt,
    };
  }
}
