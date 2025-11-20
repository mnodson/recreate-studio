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
  DocumentData,
  writeBatch
} from '@angular/fire/firestore';
import { Observable, from } from 'rxjs';
import {
  PortfolioImage,
  CreatePortfolioImageRequest,
  PortfolioImageQueryOptions,
  PortfolioStats,
  PortfolioCategory
} from '../models/gallery.model';

/**
 * Service for managing portfolio images in Firebase Firestore
 * Handles image CRUD operations, visibility toggling, and statistics
 */
@Injectable({
  providedIn: 'root'
})
export class PortfolioAdminService {
  private firestore = inject(Firestore);
  private readonly COLLECTION_NAME = 'portfolio-images';

  /**
   * Creates a new portfolio image document in Firestore
   */
  createImage(request: CreatePortfolioImageRequest): Observable<PortfolioImage> {
    return from(this.createImageAsync(request));
  }

  private async createImageAsync(request: CreatePortfolioImageRequest): Promise<PortfolioImage> {
    try {
      const portfolioCollection = collection(this.firestore, this.COLLECTION_NAME);
      const docRef = doc(portfolioCollection);

      const portfolioImage: PortfolioImage = {
        id: docRef.id,
        category: request.category,
        filename: request.filename,
        path: request.path,
        url: request.url,
        isVisible: request.isVisible ?? true,
        order: request.order ?? 0,
        uploadedAt: new Date(),
        caption: request.caption,
        fileSize: request.fileSize,
        dimensions: request.dimensions
      };

      const firestoreData = this.convertToFirestoreData(portfolioImage);
      await setDoc(docRef, firestoreData);

      return portfolioImage;
    } catch (error) {
      console.error('Error creating portfolio image:', error);
      throw new Error(`Failed to create portfolio image: ${error}`);
    }
  }

  /**
   * Creates multiple portfolio images in a batch operation
   */
  createImagesBatch(requests: CreatePortfolioImageRequest[]): Observable<PortfolioImage[]> {
    return from(this.createImagesBatchAsync(requests));
  }

  private async createImagesBatchAsync(requests: CreatePortfolioImageRequest[]): Promise<PortfolioImage[]> {
    try {
      const batch = writeBatch(this.firestore);
      const portfolioCollection = collection(this.firestore, this.COLLECTION_NAME);
      const portfolioImages: PortfolioImage[] = [];

      for (const request of requests) {
        const docRef = doc(portfolioCollection);

        const portfolioImage: PortfolioImage = {
          id: docRef.id,
          category: request.category,
          filename: request.filename,
          path: request.path,
          url: request.url,
          isVisible: request.isVisible ?? true,
          order: request.order ?? 0,
          uploadedAt: new Date(),
          caption: request.caption,
          fileSize: request.fileSize,
          dimensions: request.dimensions
        };

        const firestoreData = this.convertToFirestoreData(portfolioImage);
        batch.set(docRef, firestoreData);
        portfolioImages.push(portfolioImage);
      }

      await batch.commit();
      return portfolioImages;
    } catch (error) {
      console.error('Error creating portfolio images batch:', error);
      throw new Error(`Failed to create portfolio images: ${error}`);
    }
  }

  /**
   * Retrieves a portfolio image by ID
   */
  getImageById(id: string): Observable<PortfolioImage | null> {
    return from(this.getImageByIdAsync(id));
  }

  private async getImageByIdAsync(id: string): Promise<PortfolioImage | null> {
    try {
      const docRef = doc(this.firestore, this.COLLECTION_NAME, id);
      const docSnap = await getDoc(docRef);

      if (!docSnap.exists()) {
        return null;
      }

      return this.convertFromFirestoreData(docSnap.data());
    } catch (error) {
      console.error('Error getting portfolio image:', error);
      throw new Error(`Failed to retrieve portfolio image: ${error}`);
    }
  }

  /**
   * Queries portfolio images with optional filters
   */
  queryImages(options: PortfolioImageQueryOptions = {}): Observable<PortfolioImage[]> {
    return from(this.queryImagesAsync(options));
  }

  private async queryImagesAsync(options: PortfolioImageQueryOptions): Promise<PortfolioImage[]> {
    try {
      const portfolioCollection = collection(this.firestore, this.COLLECTION_NAME);
      const constraints: QueryConstraint[] = [];

      // Add filters
      if (options.category) {
        constraints.push(where('category', '==', options.category));
      }

      if (options.visibleOnly) {
        constraints.push(where('isVisible', '==', true));
      }

      // Add ordering
      const orderByField = options.orderBy || 'order';
      const orderDirection = options.orderDirection || 'asc';
      constraints.push(orderBy(orderByField, orderDirection));

      // Add limit
      if (options.limit) {
        constraints.push(limit(options.limit));
      }

      const q = query(portfolioCollection, ...constraints);
      const querySnapshot = await getDocs(q);

      return querySnapshot.docs.map(doc =>
        this.convertFromFirestoreData(doc.data())
      );
    } catch (error) {
      console.error('Error querying portfolio images:', error);
      throw new Error(`Failed to query portfolio images: ${error}`);
    }
  }

  /**
   * Gets all images for a specific category
   */
  getImagesByCategory(category: PortfolioCategory, visibleOnly = false): Observable<PortfolioImage[]> {
    return this.queryImages({
      category,
      visibleOnly,
      orderBy: 'order',
      orderDirection: 'asc'
    });
  }

  /**
   * Updates a portfolio image
   */
  updateImage(id: string, updates: Partial<PortfolioImage>): Observable<void> {
    return from(this.updateImageAsync(id, updates));
  }

  private async updateImageAsync(id: string, updates: Partial<PortfolioImage>): Promise<void> {
    try {
      const docRef = doc(this.firestore, this.COLLECTION_NAME, id);

      // Remove fields that shouldn't be updated
      const { id: _, ...updateData } = updates;

      const firestoreData = this.convertToFirestoreData(updateData as any);
      await updateDoc(docRef, firestoreData);
    } catch (error) {
      console.error('Error updating portfolio image:', error);
      throw new Error(`Failed to update portfolio image: ${error}`);
    }
  }

  /**
   * Toggles the visibility of a portfolio image
   */
  toggleVisibility(id: string, isVisible: boolean): Observable<void> {
    return this.updateImage(id, { isVisible });
  }

  /**
   * Updates the order of a portfolio image
   */
  updateOrder(id: string, order: number): Observable<void> {
    return this.updateImage(id, { order });
  }

  /**
   * Deletes a portfolio image
   */
  deleteImage(id: string): Observable<void> {
    return from(this.deleteImageAsync(id));
  }

  private async deleteImageAsync(id: string): Promise<void> {
    try {
      const docRef = doc(this.firestore, this.COLLECTION_NAME, id);
      await deleteDoc(docRef);
    } catch (error) {
      console.error('Error deleting portfolio image:', error);
      throw new Error(`Failed to delete portfolio image: ${error}`);
    }
  }

  /**
   * Deletes multiple portfolio images in a batch operation
   */
  deleteImagesBatch(ids: string[]): Observable<void> {
    return from(this.deleteImagesBatchAsync(ids));
  }

  private async deleteImagesBatchAsync(ids: string[]): Promise<void> {
    try {
      const batch = writeBatch(this.firestore);

      for (const id of ids) {
        const docRef = doc(this.firestore, this.COLLECTION_NAME, id);
        batch.delete(docRef);
      }

      await batch.commit();
    } catch (error) {
      console.error('Error deleting portfolio images batch:', error);
      throw new Error(`Failed to delete portfolio images: ${error}`);
    }
  }

  /**
   * Gets statistics for portfolio images
   */
  getStats(): Observable<PortfolioStats> {
    return from(this.getStatsAsync());
  }

  private async getStatsAsync(): Promise<PortfolioStats> {
    try {
      const portfolioCollection = collection(this.firestore, this.COLLECTION_NAME);
      const allImagesSnapshot = await getDocs(portfolioCollection);

      const stats: PortfolioStats = {
        totalImages: 0,
        visibleImages: 0,
        hiddenImages: 0,
        imagesByCategory: {
          'Events': 0,
          'FamilyPortraits': 0,
          'Headshots': 0,
          'HolidayMiniSessions': 0,
          'Newborns': 0,
          'Seniors': 0,
          'Sports': 0,
          'BabiesChildren': 0
        }
      };

      allImagesSnapshot.forEach(doc => {
        const data = doc.data();
        stats.totalImages++;

        if (data['isVisible']) {
          stats.visibleImages++;
        } else {
          stats.hiddenImages++;
        }

        const category = data['category'] as PortfolioCategory;
        if (category && stats.imagesByCategory[category] !== undefined) {
          stats.imagesByCategory[category]++;
        }
      });

      return stats;
    } catch (error) {
      console.error('Error getting portfolio stats:', error);
      throw new Error(`Failed to get portfolio statistics: ${error}`);
    }
  }

  /**
   * Gets the next available order number for a category
   */
  getNextOrderNumber(category: PortfolioCategory): Observable<number> {
    return from(this.getNextOrderNumberAsync(category));
  }

  private async getNextOrderNumberAsync(category: PortfolioCategory): Promise<number> {
    try {
      const images = await this.queryImagesAsync({
        category,
        orderBy: 'order',
        orderDirection: 'desc',
        limit: 1
      });

      if (images.length === 0) {
        return 0;
      }

      return images[0].order + 1;
    } catch (error) {
      console.error('Error getting next order number:', error);
      return 0;
    }
  }

  /**
   * Converts a PortfolioImage to Firestore-compatible data
   * Removes undefined values as Firestore doesn't support them
   */
  private convertToFirestoreData(image: Partial<PortfolioImage>): DocumentData {
    const data: DocumentData = {};

    // Copy all defined properties
    Object.keys(image).forEach(key => {
      const value = (image as any)[key];
      if (value !== undefined) {
        data[key] = value;
      }
    });

    // Convert Date to Timestamp
    if (image.uploadedAt instanceof Date) {
      data['uploadedAt'] = Timestamp.fromDate(image.uploadedAt);
    }

    return data;
  }

  /**
   * Converts Firestore data to a PortfolioImage
   */
  private convertFromFirestoreData(data: DocumentData): PortfolioImage {
    return {
      id: data['id'],
      category: data['category'],
      filename: data['filename'],
      path: data['path'],
      url: data['url'],
      isVisible: data['isVisible'],
      order: data['order'],
      uploadedAt: data['uploadedAt']?.toDate() || new Date(),
      caption: data['caption'],
      fileSize: data['fileSize'],
      dimensions: data['dimensions']
    };
  }
}
