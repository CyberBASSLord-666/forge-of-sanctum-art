
import Dexie, { type EntityTable } from 'dexie';

// Enhanced interfaces with comprehensive metadata
export interface IGalleryItem {
  id: string;
  url: string;
  prompt: string;
  negativePrompt?: string;
  parameters: {
    style: string;
    steps: number;
    guidance: number;
    width: number;
    height: number;
    seed?: number;
    strength?: number;
  };
  metadata: {
    fileSize: number;
    dimensions: { width: number; height: number };
    processingTime?: number;
    modelUsed?: string;
    cost?: number;
    tags?: string[];
    rating?: number; // 1-5 stars
    isFavorite?: boolean;
    collections?: string[];
  };
  createdAt: Date;
  updatedAt: Date;
  exportedAt?: Date;
}

export interface ISessionState {
  id: 'current_session';
  activePanel: 'forge' | 'gallery' | 'canvas';
  forgeState: {
    prompt: string;
    negativePrompt: string;
    style: string;
    steps: number;
    guidance: number;
    width: number;
    height: number;
    seed?: number;
    showAdvanced: boolean;
    recentPrompts: string[];
    favoriteStyles: string[];
  };
  galleryState: {
    searchQuery: string;
    selectedImage?: string;
    viewMode: 'grid' | 'list' | 'masonry';
    sortBy: 'createdAt' | 'rating' | 'prompt';
    sortOrder: 'asc' | 'desc';
    filterBy: {
      tags?: string[];
      collections?: string[];
      dateRange?: { from: Date; to: Date };
      isFavorite?: boolean;
    };
  };
  canvasState: {
    currentImage?: string;
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

export interface ICollection {
  id: string;
  name: string;
  description?: string;
  color: string;
  imageIds: string[];
  createdAt: Date;
  updatedAt: Date;
}

export interface IPromptTemplate {
  id: string;
  name: string;
  template: string;
  category: string;
  tags: string[];
  useCount: number;
  createdAt: Date;
}

export class MuseForgeDB extends Dexie {
  gallery_items!: EntityTable<IGalleryItem, 'id'>;
  session_state!: EntityTable<ISessionState, 'id'>;
  collections!: EntityTable<ICollection, 'id'>;
  prompt_templates!: EntityTable<IPromptTemplate, 'id'>;

  constructor() {
    super('MuseForgeDB');
    
    this.version(1).stores({
      gallery_items: 'id, createdAt, prompt, *tags, rating, isFavorite, *collections',
      session_state: 'id',
      collections: 'id, name, createdAt',
      prompt_templates: 'id, name, category, *tags, useCount',
    });

    // Add hooks for automatic timestamps
    this.gallery_items.hook('creating', (primKey, obj, trans) => {
      obj.createdAt = new Date();
      obj.updatedAt = new Date();
    });

    this.gallery_items.hook('updating', (modifications, primKey, obj, trans) => {
      modifications.updatedAt = new Date();
    });

    this.collections.hook('creating', (primKey, obj, trans) => {
      obj.createdAt = new Date();
      obj.updatedAt = new Date();
    });

    this.collections.hook('updating', (modifications, primKey, obj, trans) => {
      modifications.updatedAt = new Date();
    });
  }
}

export const db = new MuseForgeDB();

// Enhanced session management
export const sessionManager = {
  async saveSession(state: Omit<ISessionState, 'id' | 'lastUpdated'>) {
    await db.session_state.put({
      ...state,
      id: 'current_session',
      lastUpdated: new Date(),
    });
  },

  async loadSession(): Promise<ISessionState | null> {
    return await db.session_state.get('current_session') || null;
  },

  async clearSession() {
    await db.session_state.delete('current_session');
  },

  async exportSession(): Promise<string> {
    const session = await this.loadSession();
    const gallery = await galleryManager.getAllImages();
    const collections = await collectionManager.getAllCollections();
    
    return JSON.stringify({
      session,
      gallery,
      collections,
      exportedAt: new Date(),
      version: '1.0.0',
    }, null, 2);
  },

  async importSession(data: string): Promise<void> {
    const imported = JSON.parse(data);
    
    if (imported.session) {
      await this.saveSession(imported.session);
    }
    
    if (imported.gallery) {
      for (const item of imported.gallery) {
        await galleryManager.addImage(item);
      }
    }
    
    if (imported.collections) {
      for (const collection of imported.collections) {
        await collectionManager.createCollection(collection);
      }
    }
  },
};

// Enhanced gallery management
export const galleryManager = {
  async addImage(image: Omit<IGalleryItem, 'id' | 'createdAt' | 'updatedAt'>) {
    const newImage: IGalleryItem = {
      ...image,
      id: crypto.randomUUID(),
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    
    await db.gallery_items.add(newImage);
    return newImage;
  },

  async getAllImages(limit?: number) {
    const query = db.gallery_items.orderBy('createdAt').reverse();
    return limit ? await query.limit(limit).toArray() : await query.toArray();
  },

  async getImagesByFilter(filter: ISessionState['galleryState']['filterBy']) {
    let query = db.gallery_items.toCollection();
    
    if (filter.tags?.length) {
      query = query.filter(item => 
        filter.tags!.some(tag => item.metadata.tags?.includes(tag))
      );
    }
    
    if (filter.collections?.length) {
      query = query.filter(item => 
        filter.collections!.some(collection => 
          item.metadata.collections?.includes(collection)
        )
      );
    }
    
    if (filter.isFavorite !== undefined) {
      query = query.filter(item => item.metadata.isFavorite === filter.isFavorite);
    }
    
    if (filter.dateRange) {
      query = query.filter(item => 
        item.createdAt >= filter.dateRange!.from && 
        item.createdAt <= filter.dateRange!.to
      );
    }
    
    return await query.toArray();
  },

  async searchImages(query: string) {
    const normalizedQuery = query.toLowerCase();
    
    return await db.gallery_items
      .filter(item => 
        item.prompt.toLowerCase().includes(normalizedQuery) ||
        item.negativePrompt?.toLowerCase().includes(normalizedQuery) ||
        item.metadata.tags?.some(tag => tag.toLowerCase().includes(normalizedQuery)) ||
        item.metadata.collections?.some(collection => 
          collection.toLowerCase().includes(normalizedQuery)
        )
      )
      .toArray();
  },

  async deleteImage(id: string) {
    await db.gallery_items.delete(id);
  },

  async updateImage(id: string, updates: Partial<IGalleryItem>) {
    await db.gallery_items.update(id, {
      ...updates,
      updatedAt: new Date(),
    });
  },

  async toggleFavorite(id: string) {
    const image = await db.gallery_items.get(id);
    if (image) {
      await this.updateImage(id, {
        metadata: {
          ...image.metadata,
          isFavorite: !image.metadata.isFavorite,
        },
      });
    }
  },

  async rateImage(id: string, rating: number) {
    const image = await db.gallery_items.get(id);
    if (image) {
      await this.updateImage(id, {
        metadata: {
          ...image.metadata,
          rating: Math.max(1, Math.min(5, rating)),
        },
      });
    }
  },

  async addToCollection(imageId: string, collectionId: string) {
    const image = await db.gallery_items.get(imageId);
    if (image) {
      const collections = image.metadata.collections || [];
      if (!collections.includes(collectionId)) {
        collections.push(collectionId);
        await this.updateImage(imageId, {
          metadata: {
            ...image.metadata,
            collections,
          },
        });
      }
    }
  },

  async removeFromCollection(imageId: string, collectionId: string) {
    const image = await db.gallery_items.get(imageId);
    if (image && image.metadata.collections) {
      const collections = image.metadata.collections.filter(id => id !== collectionId);
      await this.updateImage(imageId, {
        metadata: {
          ...image.metadata,
          collections,
        },
      });
    }
  },
};

// Collection management
export const collectionManager = {
  async createCollection(collection: Omit<ICollection, 'id' | 'createdAt' | 'updatedAt'>) {
    const newCollection: ICollection = {
      ...collection,
      id: crypto.randomUUID(),
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    
    await db.collections.add(newCollection);
    return newCollection;
  },

  async getAllCollections() {
    return await db.collections.orderBy('name').toArray();
  },

  async getCollection(id: string) {
    return await db.collections.get(id);
  },

  async updateCollection(id: string, updates: Partial<ICollection>) {
    await db.collections.update(id, {
      ...updates,
      updatedAt: new Date(),
    });
  },

  async deleteCollection(id: string) {
    // Remove collection from all images
    const images = await db.gallery_items.toArray();
    for (const image of images) {
      if (image.metadata.collections?.includes(id)) {
        await galleryManager.removeFromCollection(image.id, id);
      }
    }
    
    await db.collections.delete(id);
  },
};

// Prompt template management
export const promptTemplateManager = {
  async createTemplate(template: Omit<IPromptTemplate, 'id' | 'createdAt'>) {
    const newTemplate: IPromptTemplate = {
      ...template,
      id: crypto.randomUUID(),
      createdAt: new Date(),
    };
    
    await db.prompt_templates.add(newTemplate);
    return newTemplate;
  },

  async getAllTemplates() {
    return await db.prompt_templates.orderBy('useCount').reverse().toArray();
  },

  async getTemplatesByCategory(category: string) {
    return await db.prompt_templates.where('category').equals(category).toArray();
  },

  async incrementUseCount(id: string) {
    const template = await db.prompt_templates.get(id);
    if (template) {
      await db.prompt_templates.update(id, {
        useCount: template.useCount + 1,
      });
    }
  },

  async deleteTemplate(id: string) {
    await db.prompt_templates.delete(id);
  },
};
