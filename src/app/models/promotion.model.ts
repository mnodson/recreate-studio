export interface Promotion {
  id?: string;
  name: string;
  description: string;

  // Promotion Type
  discountType: 'percentage' | 'fixed';
  discountValue: number; // percentage (e.g., 20 for 20%) or fixed amount (e.g., 50 for $50)

  // Scope
  isActive: boolean;
  isSiteWide: boolean; // If true, applies to all packages
  targetPackageIds?: number[]; // Specific package IDs if not site-wide

  // Dates
  startDate: Date;
  endDate: Date;

  // Banner Display
  showBanner: boolean;
  bannerText: string;
  bannerBackgroundColor?: string; // Hex color (optional)
  bannerTextColor?: string; // Hex color (optional)

  // Metadata
  createdAt: Date;
  updatedAt: Date;
  createdBy?: string; // Admin email who created it
}

export interface PromotionSummary {
  hasActivePromotion: boolean;
  activePromotions: Promotion[];
  bannerPromotion?: Promotion; // The promotion to show in banner (if any)
}

export interface PackageWithPromotion {
  originalPrice: number;
  promotionalPrice?: number;
  discountAmount?: number;
  discountPercentage?: number;
  hasPromotion: boolean;
  applicablePromotion?: Promotion;
}
