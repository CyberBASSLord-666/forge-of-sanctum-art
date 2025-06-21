
import { enhancedDB } from './config';
import type { ICollection } from './interfaces';

export const collectionManager = {
  async createCollection(collection: Omit<ICollection, 'id' | 'createdAt' | 'updatedAt'>) {
    const id = crypto.randomUUID();
    const now = new Date();
    
    const newCollection: ICollection = {
      ...collection,
      id,
      createdAt: now,
      updatedAt: now,
    };

    await enhancedDB.collections.add(newCollection);
    return newCollection;
  },

  async getAllCollections(): Promise<ICollection[]> {
    return await enhancedDB.collections.orderBy('createdAt').reverse().toArray();
  },

  async getCollection(id: string): Promise<ICollection | undefined> {
    return await enhancedDB.collections.get(id);
  },

  async deleteCollection(id: string): Promise<void> {
    await enhancedDB.collections.delete(id);
  },
};
