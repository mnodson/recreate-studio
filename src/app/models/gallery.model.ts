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
