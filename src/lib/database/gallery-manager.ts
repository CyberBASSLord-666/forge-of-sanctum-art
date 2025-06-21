
import { enhancedDB } from './config';
import { truncatePrompt } from './utils';
import type { IGalleryItem } from './interfaces';

export const galleryManager = {
  async addImage(image: Omit<IGalleryItem, 'id' | 'createdAt' | 'updatedAt'>) {
    const id = crypto.randomUUID();
    const now = new Date();
    
    // Ensure prompt doesn't exceed API limits
    const truncatedPrompt = truncatePrompt(image.prompt);
    
    const galleryItem: IGalleryItem = {
      ...image,
      id,
      prompt: truncatedPrompt,
      createdAt: now,
      updatedAt: now,
    };

    await enhancedDB.gallery_items.add(galleryItem);
    return galleryItem;
  },

  async getAllImages(): Promise<IGalleryItem[]> {
    return await enhancedDB.gallery_items.orderBy('createdAt').reverse().toArray();
  },

  async deleteImage(id: string): Promise<void> {
    await enhancedDB.gallery_items.delete(id);
  },

  async toggleFavorite(id: string): Promise<void> {
    const image = await enhancedDB.gallery_items.get(id);
    if (image) {
      await enhancedDB.gallery_items.update(id, {
        'metadata.isFavorite': !image.metadata.isFavorite,
      });
    }
  },

  async rateImage(id: string, rating: number): Promise<void> {
    await enhancedDB.gallery_items.update(id, {
      'metadata.rating': rating,
    });
  },

  async addToCollection(imageId: string, collectionId: string): Promise<void> {
    const image = await enhancedDB.gallery_items.get(imageId);
    if (image) {
      const collections = image.metadata.collections || [];
      if (!collections.includes(collectionId)) {
        collections.push(collectionId);
        await enhancedDB.gallery_items.update(imageId, {
          'metadata.collections': collections,
        });
      }
    }
  },

  async removeFromCollection(imageId: string, collectionId: string): Promise<void> {
    const image = await enhancedDB.gallery_items.get(imageId);
    if (image) {
      const collections = (image.metadata.collections || []).filter(id => id !== collectionId);
      await enhancedDB.gallery_items.update(imageId, {
        'metadata.collections': collections,
      });
    }
  },
};
