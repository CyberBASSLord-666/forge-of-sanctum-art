
import { enhancedDB } from './config';
import { galleryManager } from './gallery-manager';
import { collectionManager } from './collection-manager';
import { sessionManager } from './session-manager';
import type { IGalleryItem, ICollection, ISessionState } from './interfaces';

// Unified database manager that consolidates all database operations
export class UnifiedDatabaseManager {
  // Gallery operations
  async addImage(image: Omit<IGalleryItem, 'id' | 'createdAt' | 'updatedAt'>) {
    return await galleryManager.addImage(image);
  }

  async getAllImages() {
    return await galleryManager.getAllImages();
  }

  async deleteImage(id: string) {
    return await galleryManager.deleteImage(id);
  }

  async toggleFavorite(id: string) {
    return await galleryManager.toggleFavorite(id);
  }

  async rateImage(id: string, rating: number) {
    return await galleryManager.rateImage(id, rating);
  }

  // Collection operations
  async createCollection(collection: Omit<ICollection, 'id' | 'createdAt' | 'updatedAt'>) {
    return await collectionManager.createCollection(collection);
  }

  async getAllCollections() {
    return await collectionManager.getAllCollections();
  }

  async deleteCollection(id: string) {
    return await collectionManager.deleteCollection(id);
  }

  async addToCollection(imageId: string, collectionId: string) {
    return await galleryManager.addToCollection(imageId, collectionId);
  }

  async removeFromCollection(imageId: string, collectionId: string) {
    return await galleryManager.removeFromCollection(imageId, collectionId);
  }

  // Session operations
  async saveSession(state: ISessionState) {
    return await sessionManager.saveSession(state);
  }

  async loadSession() {
    return await sessionManager.loadSession();
  }

  async clearSession() {
    return await sessionManager.clearSession();
  }

  async exportSession() {
    return await sessionManager.exportSession();
  }

  async importSession(jsonData: string) {
    return await sessionManager.importSession(jsonData);
  }

  // Cleanup and maintenance operations
  async cleanup() {
    try {
      // Clean up blob URLs that are no longer needed
      const images = await this.getAllImages();
      const currentTime = new Date();
      const oneWeekAgo = new Date(currentTime.getTime() - 7 * 24 * 60 * 60 * 1000);

      for (const image of images) {
        if (new Date(image.updatedAt) < oneWeekAgo && image.url.startsWith('blob:')) {
          URL.revokeObjectURL(image.url);
        }
      }

      console.log('🧹 Database cleanup completed');
    } catch (error) {
      console.error('Database cleanup failed:', error);
    }
  }

  // Database health check
  async healthCheck() {
    try {
      const images = await this.getAllImages();
      const collections = await this.getAllCollections();
      const session = await this.loadSession();

      return {
        isHealthy: true,
        imageCount: images.length,
        collectionCount: collections.length,
        hasSession: !!session,
        dbSize: await this.estimateDbSize(),
      };
    } catch (error) {
      return {
        isHealthy: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  private async estimateDbSize() {
    try {
      if ('storage' in navigator && 'estimate' in navigator.storage) {
        const estimate = await navigator.storage.estimate();
        return estimate.usage || 0;
      }
      return 0;
    } catch {
      return 0;
    }
  }
}

export const unifiedDB = new UnifiedDatabaseManager();
