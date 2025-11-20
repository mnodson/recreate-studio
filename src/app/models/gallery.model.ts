/**
 * Represents a personal gallery with selected images for clients
 */
export interface PersonalGallery {
  /** Unique identifier for the gallery */
  id: string;

  /** Gallery title/name */
  title: string;

  /** Optional description or message for the client */
  description?: string;

  /** Client name or identifier */
  clientName: string;

  /** Client email (optional) */
  clientEmail?: string;

  /** Array of image paths selected from the main portfolio */
  imageUrls: string[];

  /** Unique shareable link identifier */
  shareToken: string;

  /** Creation timestamp */
  createdAt: Date;

  /** Expiration timestamp */
  expiresAt: Date;

  /** Last accessed timestamp */
  lastAccessedAt?: Date;

  /** Number of times the gallery has been accessed */
  accessCount: number;

  /** Whether the gallery is active (not expired and not manually disabled) */
  isActive: boolean;

  /** Optional password protection */
  password?: string;

  /** Optional metadata */
  metadata?: GalleryMetadata;
}

/**
 * Additional metadata for a gallery
 */
export interface GalleryMetadata {
  /** Category or event type (e.g., 'wedding', 'senior', 'family') */
  category?: string;

  /** Shoot date */
  shootDate?: Date;

  /** Location of the shoot */
  location?: string;

  /** Any additional notes */
  notes?: string;
}

/**
 * Data Transfer Object for creating a new gallery
 */
export interface CreateGalleryRequest {
  title: string;
  description?: string;
  clientName: string;
  clientEmail?: string;
  imageUrls: string[];
  expirationDays: number;
  password?: string;
  metadata?: GalleryMetadata;
}

/**
 * Response when a gallery is created
 */
export interface CreateGalleryResponse {
  gallery: PersonalGallery;
  shareUrl: string;
}

/**
 * Options for querying galleries
 */
export interface GalleryQueryOptions {
  /** Filter by active status */
  activeOnly?: boolean;

  /** Filter by client name */
  clientName?: string;

  /** Limit number of results */
  limit?: number;

  /** Order by field */
  orderBy?: 'createdAt' | 'expiresAt' | 'accessCount' | 'lastAccessedAt';

  /** Order direction */
  orderDirection?: 'asc' | 'desc';
}

/**
 * Statistics for a gallery
 */
export interface GalleryStats {
  totalGalleries: number;
  activeGalleries: number;
  expiredGalleries: number;
  totalViews: number;
  averageViewsPerGallery: number;
}

/**
 * Portfolio categories
 */
export type PortfolioCategory =
  | 'Events'
  | 'FamilyPortraits'
  | 'Headshots'
  | 'HolidayMiniSessions'
  | 'Newborns'
  | 'Seniors'
  | 'Sports'
  | 'BabiesChildren';

/**
 * Represents a portfolio image in Firestore
 */
export interface PortfolioImage {
  /** Unique identifier for the image */
  id: string;

  /** Category the image belongs to */
  category: PortfolioCategory;

  /** Filename of the image */
  filename: string;

  /** Full path in GitHub repo (e.g., 'portfolio/Newborns/Newborns001.webp') */
  path: string;

  /** Full URL to the image */
  url: string;

  /** Whether the image is visible in the portfolio gallery */
  isVisible: boolean;

  /** Display order within the category */
  order: number;

  /** Upload timestamp */
  uploadedAt: Date;

  /** Optional caption or description */
  caption?: string;

  /** File size in bytes */
  fileSize?: number;

  /** Image dimensions */
  dimensions?: {
    width: number;
    height: number;
  };
}

/**
 * Data Transfer Object for creating portfolio images
 */
export interface CreatePortfolioImageRequest {
  category: PortfolioCategory;
  filename: string;
  path: string;
  url: string;
  isVisible?: boolean;
  order?: number;
  caption?: string;
  fileSize?: number;
  dimensions?: {
    width: number;
    height: number;
  };
}

/**
 * Options for querying portfolio images
 */
export interface PortfolioImageQueryOptions {
  /** Filter by category */
  category?: PortfolioCategory;

  /** Filter by visibility */
  visibleOnly?: boolean;

  /** Limit number of results */
  limit?: number;

  /** Order by field */
  orderBy?: 'order' | 'uploadedAt' | 'filename';

  /** Order direction */
  orderDirection?: 'asc' | 'desc';
}

/**
 * Statistics for portfolio images
 */
export interface PortfolioStats {
  totalImages: number;
  visibleImages: number;
  hiddenImages: number;
  imagesByCategory: Record<PortfolioCategory, number>;
}
