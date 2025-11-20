import { Injectable, inject } from '@angular/core';
import {
  Firestore,
  collection,
  doc,
  setDoc,
  getDoc,
  getDocs,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  limit,
  Timestamp,
  QueryConstraint,
  DocumentData
} from '@angular/fire/firestore';
import { Observable, from } from 'rxjs';
import {
  PersonalGallery,
  CreateGalleryRequest,
  CreateGalleryResponse,
  GalleryQueryOptions,
  GalleryStats
} from '../models/gallery.model';

/**
 * Service for managing personal galleries with Firebase Firestore
 * Handles gallery creation, sharing, expiration, and access tracking
 */
@Injectable({
  providedIn: 'root'
})
export class PersonalGalleryService {
  private firestore = inject(Firestore);
  private readonly COLLECTION_NAME = 'personal-galleries';
  private readonly SHARE_TOKEN_LENGTH = 12;

  /**
   * Creates a new personal gallery with selected images
   * Generates a unique share token and sets expiration
   */
  createGallery(request: CreateGalleryRequest): Observable<CreateGalleryResponse> {
    return from(this.createGalleryAsync(request));
  }

  private async createGalleryAsync(request: CreateGalleryRequest): Promise<CreateGalleryResponse> {
    try {
      // Generate unique share token
      const shareToken = await this.generateUniqueShareToken();

      // Calculate expiration date
      const createdAt = new Date();
      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + request.expirationDays);

      // Create gallery object
      const gallery: PersonalGallery = {
        id: '', // Will be set after doc creation
        title: request.title,
        description: request.description,
        clientName: request.clientName,
        clientEmail: request.clientEmail,
        imageUrls: request.imageUrls,
        heroImageUrl: request.heroImageUrl,
        shareToken,
        createdAt,
        expiresAt,
        accessCount: 0,
        isActive: true,
        password: request.password,
        metadata: request.metadata
      };

      // Create document reference with auto-generated ID
      const galleryRef = doc(collection(this.firestore, this.COLLECTION_NAME));
      gallery.id = galleryRef.id;

      // Convert dates to Firestore Timestamps for storage
      const firestoreData = this.convertToFirestoreData(gallery);

      // Save to Firestore
      await setDoc(galleryRef, firestoreData);

      // Generate share URL
      const shareUrl = this.generateShareUrl(shareToken);

      return {
        gallery,
        shareUrl
      };
    } catch (error) {
      console.error('Error creating gallery:', error);
      throw new Error('Failed to create gallery');
    }
  }

  /**
   * Retrieves a gallery by its share token
   * Automatically increments access count and updates last accessed time
   */
  getGalleryByShareToken(shareToken: string, password?: string): Observable<PersonalGallery | null> {
    return from(this.getGalleryByShareTokenAsync(shareToken, password));
  }

  private async getGalleryByShareTokenAsync(
    shareToken: string,
    password?: string
  ): Promise<PersonalGallery | null> {
    try {
      const galleriesRef = collection(this.firestore, this.COLLECTION_NAME);
      const q = query(galleriesRef, where('shareToken', '==', shareToken), limit(1));
      const querySnapshot = await getDocs(q);

      if (querySnapshot.empty) {
        return null;
      }

      const docSnapshot = querySnapshot.docs[0];
      const gallery = this.convertFromFirestoreData(docSnapshot.data(), docSnapshot.id);

      // Check if gallery is expired
      if (!this.isGalleryValid(gallery)) {
        return null;
      }

      // Check password if required
      if (gallery.password && gallery.password !== password) {
        throw new Error('Invalid password');
      }

      // Increment access count and update last accessed time
      await this.incrementAccessCount(gallery.id);

      // Update local object
      gallery.accessCount += 1;
      gallery.lastAccessedAt = new Date();

      return gallery;
    } catch (error) {
      console.error('Error retrieving gallery:', error);
      throw error;
    }
  }

  /**
   * Retrieves a gallery by its ID (for admin purposes)
   */
  getGalleryById(id: string): Observable<PersonalGallery | null> {
    return from(this.getGalleryByIdAsync(id));
  }

  private async getGalleryByIdAsync(id: string): Promise<PersonalGallery | null> {
    try {
      const docRef = doc(this.firestore, this.COLLECTION_NAME, id);
      const docSnapshot = await getDoc(docRef);

      if (!docSnapshot.exists()) {
        return null;
      }

      return this.convertFromFirestoreData(docSnapshot.data(), docSnapshot.id);
    } catch (error) {
      console.error('Error retrieving gallery by ID:', error);
      throw error;
    }
  }

  /**
   * Queries galleries with optional filters
   */
  queryGalleries(options: GalleryQueryOptions = {}): Observable<PersonalGallery[]> {
    return from(this.queryGalleriesAsync(options));
  }

  private async queryGalleriesAsync(options: GalleryQueryOptions): Promise<PersonalGallery[]> {
    try {
      const galleriesRef = collection(this.firestore, this.COLLECTION_NAME);
      const constraints: QueryConstraint[] = [];

      // Apply filters
      if (options.activeOnly) {
        constraints.push(where('isActive', '==', true));
        constraints.push(where('expiresAt', '>', Timestamp.now()));
      }

      if (options.clientName) {
        constraints.push(where('clientName', '==', options.clientName));
      }

      // Apply ordering
      if (options.orderBy) {
        constraints.push(orderBy(options.orderBy, options.orderDirection || 'desc'));
      }

      // Apply limit
      if (options.limit) {
        constraints.push(limit(options.limit));
      }

      const q = query(galleriesRef, ...constraints);
      const querySnapshot = await getDocs(q);

      return querySnapshot.docs.map(doc =>
        this.convertFromFirestoreData(doc.data(), doc.id)
      );
    } catch (error) {
      console.error('Error querying galleries:', error);
      throw error;
    }
  }

  /**
   * Updates a gallery's details
   */
  updateGallery(id: string, updates: Partial<PersonalGallery>): Observable<void> {
    return from(this.updateGalleryAsync(id, updates));
  }

  private async updateGalleryAsync(id: string, updates: Partial<PersonalGallery>): Promise<void> {
    try {
      const docRef = doc(this.firestore, this.COLLECTION_NAME, id);
      const firestoreUpdates = this.convertToFirestoreData(updates as PersonalGallery);
      await updateDoc(docRef, firestoreUpdates);
    } catch (error) {
      console.error('Error updating gallery:', error);
      throw error;
    }
  }

  /**
   * Deactivates a gallery (soft delete)
   */
  deactivateGallery(id: string): Observable<void> {
    return from(this.updateGalleryAsync(id, { isActive: false } as Partial<PersonalGallery>));
  }

  /**
   * Permanently deletes a gallery
   */
  deleteGallery(id: string): Observable<void> {
    return from(this.deleteGalleryAsync(id));
  }

  private async deleteGalleryAsync(id: string): Promise<void> {
    try {
      const docRef = doc(this.firestore, this.COLLECTION_NAME, id);
      await deleteDoc(docRef);
    } catch (error) {
      console.error('Error deleting gallery:', error);
      throw error;
    }
  }

  /**
   * Extends the expiration date of a gallery
   */
  extendExpiration(id: string, additionalDays: number): Observable<void> {
    return from(this.extendExpirationAsync(id, additionalDays));
  }

  private async extendExpirationAsync(id: string, additionalDays: number): Promise<void> {
    try {
      const gallery = await this.getGalleryByIdAsync(id);
      if (!gallery) {
        throw new Error('Gallery not found');
      }

      const newExpiresAt = new Date(gallery.expiresAt);
      newExpiresAt.setDate(newExpiresAt.getDate() + additionalDays);

      await this.updateGalleryAsync(id, { expiresAt: newExpiresAt } as Partial<PersonalGallery>);
    } catch (error) {
      console.error('Error extending expiration:', error);
      throw error;
    }
  }

  /**
   * Gets statistics across all galleries
   */
  getGalleryStats(): Observable<GalleryStats> {
    return from(this.getGalleryStatsAsync());
  }

  private async getGalleryStatsAsync(): Promise<GalleryStats> {
    try {
      const galleries = await this.queryGalleriesAsync({});

      const activeGalleries = galleries.filter(g => this.isGalleryValid(g));
      const expiredGalleries = galleries.filter(g => !this.isGalleryValid(g));
      const totalViews = galleries.reduce((sum, g) => sum + g.accessCount, 0);

      return {
        totalGalleries: galleries.length,
        activeGalleries: activeGalleries.length,
        expiredGalleries: expiredGalleries.length,
        totalViews,
        averageViewsPerGallery: galleries.length > 0 ? totalViews / galleries.length : 0
      };
    } catch (error) {
      console.error('Error getting gallery stats:', error);
      throw error;
    }
  }

  /**
   * Cleans up expired galleries (marks them as inactive)
   */
  cleanupExpiredGalleries(): Observable<number> {
    return from(this.cleanupExpiredGalleriesAsync());
  }

  private async cleanupExpiredGalleriesAsync(): Promise<number> {
    try {
      const galleries = await this.queryGalleriesAsync({ activeOnly: false });
      const now = new Date();
      let cleanedCount = 0;

      for (const gallery of galleries) {
        if (gallery.isActive && new Date(gallery.expiresAt) < now) {
          await new Promise<void>((resolve, reject) => {
            this.deactivateGallery(gallery.id).subscribe({
              next: () => resolve(),
              error: reject
            });
          });
          cleanedCount++;
        }
      }

      return cleanedCount;
    } catch (error) {
      console.error('Error cleaning up expired galleries:', error);
      throw error;
    }
  }

  // ============================================================================
  // Private Helper Methods
  // ============================================================================

  /**
   * Generates a unique share token
   */
  private async generateUniqueShareToken(): Promise<string> {
    let token: string;
    let isUnique = false;
    let attempts = 0;
    const maxAttempts = 10;

    while (!isUnique && attempts < maxAttempts) {
      token = this.generateRandomToken(this.SHARE_TOKEN_LENGTH);

      // Check if token already exists
      const galleriesRef = collection(this.firestore, this.COLLECTION_NAME);
      const q = query(galleriesRef, where('shareToken', '==', token), limit(1));
      const querySnapshot = await getDocs(q);

      isUnique = querySnapshot.empty;
      attempts++;

      if (isUnique) {
        return token;
      }
    }

    throw new Error('Failed to generate unique share token');
  }

  /**
   * Generates a random alphanumeric token
   */
  private generateRandomToken(length: number): string {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789';
    let token = '';
    for (let i = 0; i < length; i++) {
      token += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return token;
  }

  /**
   * Generates the shareable URL for a gallery
   */
  private generateShareUrl(shareToken: string): string {
    // In production, this should use your actual domain
    const baseUrl = window.location.origin;
    return `${baseUrl}/#/gallery/shared/${shareToken}`;
  }

  /**
   * Increments the access count for a gallery
   */
  private async incrementAccessCount(id: string): Promise<void> {
    try {
      const docRef = doc(this.firestore, this.COLLECTION_NAME, id);
      const docSnapshot = await getDoc(docRef);

      if (docSnapshot.exists()) {
        const currentCount = docSnapshot.data()['accessCount'] || 0;
        await updateDoc(docRef, {
          accessCount: currentCount + 1,
          lastAccessedAt: Timestamp.now()
        });
      }
    } catch (error) {
      console.error('Error incrementing access count:', error);
      // Don't throw - this is not critical
    }
  }

  /**
   * Checks if a gallery is valid (active and not expired)
   */
  private isGalleryValid(gallery: PersonalGallery): boolean {
    if (!gallery.isActive) {
      return false;
    }

    const now = new Date();
    const expiresAt = new Date(gallery.expiresAt);
    return expiresAt > now;
  }

  /**
   * Converts a PersonalGallery object to Firestore data format
   * Converts Date objects to Firestore Timestamps
   */
  private convertToFirestoreData(gallery: Partial<PersonalGallery>): DocumentData {
    const data: any = { ...gallery };

    // Convert Date fields to Timestamps
    if (data.createdAt instanceof Date) {
      data.createdAt = Timestamp.fromDate(data.createdAt);
    }
    if (data.expiresAt instanceof Date) {
      data.expiresAt = Timestamp.fromDate(data.expiresAt);
    }
    if (data.lastAccessedAt instanceof Date) {
      data.lastAccessedAt = Timestamp.fromDate(data.lastAccessedAt);
    }
    if (data.metadata?.shootDate instanceof Date) {
      data.metadata.shootDate = Timestamp.fromDate(data.metadata.shootDate);
    }

    // Remove undefined fields
    Object.keys(data).forEach(key => {
      if (data[key] === undefined) {
        delete data[key];
      }
    });

    return data;
  }

  /**
   * Converts Firestore data to PersonalGallery object
   * Converts Firestore Timestamps to Date objects
   */
  private convertFromFirestoreData(data: DocumentData, id: string): PersonalGallery {
    return {
      id,
      title: data['title'],
      description: data['description'],
      clientName: data['clientName'],
      clientEmail: data['clientEmail'],
      imageUrls: data['imageUrls'] || [],
      heroImageUrl: data['heroImageUrl'],
      shareToken: data['shareToken'],
      createdAt: data['createdAt']?.toDate() || new Date(),
      expiresAt: data['expiresAt']?.toDate() || new Date(),
      lastAccessedAt: data['lastAccessedAt']?.toDate(),
      accessCount: data['accessCount'] || 0,
      isActive: data['isActive'] ?? true,
      password: data['password'],
      metadata: data['metadata'] ? {
        category: data['metadata'].category,
        shootDate: data['metadata'].shootDate?.toDate(),
        location: data['metadata'].location,
        notes: data['metadata'].notes
      } : undefined
    };
  }
}
