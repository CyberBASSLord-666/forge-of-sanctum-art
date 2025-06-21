
import Dexie, { Table } from 'dexie';

export interface IGalleryItem {
  id: string;
  url: string;
  prompt: string;
  negativePrompt?: string;
  style: string;
  parameters: {
    style: string;
    steps: number;
    guidance: number;
    width: number;
    height: number;
    seed?: number;
    strength?: number;
  };
  createdAt: Date;
  updatedAt: Date;
  metadata: {
    fileSize: number;
    dimensions: { width: number; height: number };
    processingTime?: number;
    modelUsed?: string;
    cost?: number;
    tags?: string[];
    isFavorite: boolean;
    collections?: string[];
    rating?: number;
  };
}

export interface ICollection {
  id: string;
  name: string;
  description?: string;
  color: string;
  imageIds: string[];
  createdAt: Date;
  updatedAt: Date;
}

export interface ISessionState {
  id: string;
  activePanel: 'forge' | 'gallery';
  forgeState: {
    prompt: string;
    negativePrompt?: string;
    style: string;
    steps: number;
    guidance: number;
    width: number;
    height: number;
    seed?: number;
    showAdvanced?: boolean;
    recentPrompts: string[];
    favoriteStyles: string[];
  };
  galleryState: {
    searchQuery: string;
    viewMode: 'grid' | 'list';
    sortBy: 'createdAt' | 'updatedAt' | 'prompt';
    sortOrder: 'asc' | 'desc';
    filterBy: {
      tags?: string[];
      collections?: string[];
      isFavorite?: boolean;
      dateRange?: {
        start?: Date;
        end?: Date;
      };
    };
  };
  canvasState: {
    zoom: number;
    pan: { x: number; y: number };
    showMetadata: boolean;
  };
  uiState: {
    sidebarOpen: boolean;
    theme: 'dark' | 'light' | 'auto';
    soundEnabled: boolean;
    hapticsEnabled: boolean;
    animationsEnabled: boolean;
    accessibility: {
      reducedMotion: boolean;
      highContrast: boolean;
      fontSize: 'small' | 'medium' | 'large';
    };
  };
  lastUpdated: Date;
}

export interface IGalleryFilter {
  tags?: string[];
  collections?: string[];
  isFavorite?: boolean;
  dateRange?: {
    start?: Date;
    end?: Date;
  };
}

export interface IGalleryStats {
  totalImages: number;
  favorites: number;
  totalCollections: number;
  averageProcessingTime: number;
  mostUsedStyle: string;
}

class MuseForgeEnhancedDB extends Dexie {
  gallery_items!: Table<IGalleryItem, string>;
  collections!: Table<ICollection, string>;
  session_state!: Table<ISessionState, string>;

  constructor() {
    super('MuseForgeEnhancedDB');
    
    this.version(1).stores({
      gallery_items: 'id, createdAt, updatedAt, prompt, style, *metadata.tags, *metadata.collections',
      collections: 'id, name, createdAt, updatedAt',
      session_state: 'id, lastUpdated'
    });

    this.gallery_items.hook('creating', function (primKey, obj, trans) {
      obj.createdAt = new Date();
      obj.updatedAt = new Date();
    });

    this.gallery_items.hook('updating', function (modifications, primKey, obj, trans) {
      modifications.updatedAt = new Date();
    });

    this.collections.hook('creating', function (primKey, obj, trans) {
      obj.createdAt = new Date();
      obj.updatedAt = new Date();
    });

    this.collections.hook('updating', function (modifications, primKey, obj, trans) {
      modifications.updatedAt = new Date();
    });
  }
}

export const enhancedDB = new MuseForgeEnhancedDB();

// Export the db as well for compatibility
export const db = enhancedDB;

// Gallery Manager
export const galleryManager = {
  async addImage(image: Omit<IGalleryItem, 'id' | 'createdAt' | 'updatedAt'>) {
    const id = crypto.randomUUID();
    const now = new Date();
    
    const galleryItem: IGalleryItem = {
      ...image,
      id,
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

// Collection Manager
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

// Session Manager
export const sessionManager = {
  async saveSession(state: ISessionState): Promise<void> {
    await enhancedDB.session_state.put({
      ...state,
      lastUpdated: new Date(),
    });
  },

  async loadSession(): Promise<ISessionState | undefined> {
    return await enhancedDB.session_state.get('current_session');
  },

  async clearSession(): Promise<void> {
    await enhancedDB.session_state.delete('current_session');
  },

  async exportSession(): Promise<string> {
    const session = await this.loadSession();
    const images = await galleryManager.getAllImages();
    const collections = await collectionManager.getAllCollections();
    
    return JSON.stringify({
      session,
      images,
      collections,
      exportedAt: new Date(),
    }, null, 2);
  },

  async importSession(jsonData: string): Promise<void> {
    const data = JSON.parse(jsonData);
    
    if (data.session) {
      await this.saveSession(data.session);
    }
    
    if (data.images) {
      for (const image of data.images) {
        await enhancedDB.gallery_items.put(image);
      }
    }
    
    if (data.collections) {
      for (const collection of data.collections) {
        await enhancedDB.collections.put(collection);
      }
    }
  },
};
