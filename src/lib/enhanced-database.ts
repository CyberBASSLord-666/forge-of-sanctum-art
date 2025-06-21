
import Dexie, { Table } from 'dexie';

export interface IGalleryItem {
  id: string;
  url: string;
  prompt: string;
  style: string;
  parameters: {
    steps: number;
    guidance: number;
    width: number;
    height: number;
    seed?: number;
  };
  createdAt: Date;
  updatedAt: Date;
  isFavorite: boolean;
  tags: string[];
  collections: string[];
  metadata?: {
    processingTime?: number;
    modelUsed?: string;
    cost?: number;
  };
}

export interface ISessionState {
  id: string;
  activePanel: 'forge' | 'gallery';
  forgeState: {
    prompt: string;
    style: string;
    steps: number;
    guidance: number;
    width: number;
    height: number;
    seed?: number;
    negativePrompt?: string;
  };
  galleryState: {
    searchQuery: string;
    selectedFilter: {
      tags?: string[];
      collections?: string[];
      isFavorite?: boolean;
      dateRange?: {
        start?: Date;
        end?: Date;
      };
    };
    sortBy: 'createdAt' | 'updatedAt' | 'prompt';
    sortOrder: 'asc' | 'desc';
  };
  uiState: {
    sidebarOpen: boolean;
    theme: 'dark' | 'light' | 'auto';
    animationsEnabled: boolean;
    soundEnabled: boolean;
  };
  recentPrompts: string[];
  createdAt: Date;
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
  session_state!: Table<ISessionState, string>;

  constructor() {
    super('MuseForgeEnhancedDB');
    
    this.version(1).stores({
      gallery_items: 'id, createdAt, updatedAt, prompt, style, isFavorite, *tags, *collections',
      session_state: 'id, lastUpdated'
    });

    this.gallery_items.hook('creating', function (primKey, obj, trans) {
      obj.createdAt = new Date();
      obj.updatedAt = new Date();
    });

    this.gallery_items.hook('updating', function (modifications, primKey, obj, trans) {
      modifications.updatedAt = new Date();
    });
  }

  async saveGalleryItem(item: Omit<IGalleryItem, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
    const id = crypto.randomUUID();
    const now = new Date();
    
    const galleryItem: IGalleryItem = {
      ...item,
      id,
      createdAt: now,
      updatedAt: now,
    };

    await this.gallery_items.add(galleryItem);
    return id;
  }

  async updateGalleryItem(id: string, updates: Partial<Omit<IGalleryItem, 'id' | 'createdAt'>>): Promise<void> {
    await this.gallery_items.update(id, {
      ...updates,
      updatedAt: new Date(),
    });
  }

  async getGalleryItems(filter?: IGalleryFilter, sortBy: keyof IGalleryItem = 'createdAt', sortOrder: 'asc' | 'desc' = 'desc'): Promise<IGalleryItem[]> {
    let collection = this.gallery_items.orderBy(sortBy);
    
    if (sortOrder === 'desc') {
      collection = collection.reverse();
    }

    if (filter) {
      collection = collection.filter((item: IGalleryItem) => {
        if (filter.isFavorite !== undefined && item.isFavorite !== filter.isFavorite) {
          return false;
        }
        
        if (filter.tags && filter.tags.length > 0) {
          const hasMatchingTag = filter.tags.some(tag => item.tags.includes(tag));
          if (!hasMatchingTag) return false;
        }
        
        if (filter.collections && filter.collections.length > 0) {
          const hasMatchingCollection = filter.collections.some(collection => item.collections.includes(collection));
          if (!hasMatchingCollection) return false;
        }
        
        if (filter.dateRange) {
          if (filter.dateRange.start && item.createdAt < filter.dateRange.start) {
            return false;
          }
          if (filter.dateRange.end && item.createdAt > filter.dateRange.end) {
            return false;
          }
        }
        
        return true;
      });
    }

    return await collection.toArray();
  }

  async searchGalleryItems(query: string): Promise<IGalleryItem[]> {
    const lowercaseQuery = query.toLowerCase();
    
    return await this.gallery_items
      .filter((item: IGalleryItem) => {
        return (
          item.prompt.toLowerCase().includes(lowercaseQuery) ||
          item.style.toLowerCase().includes(lowercaseQuery) ||
          item.tags.some(tag => tag.toLowerCase().includes(lowercaseQuery)) ||
          item.collections.some(collection => collection.toLowerCase().includes(lowercaseQuery))
        );
      })
      .toArray();
  }

  async getGalleryStats(): Promise<IGalleryStats> {
    const items = await this.gallery_items.toArray();
    
    const totalImages = items.length;
    const favorites = items.filter(item => item.isFavorite).length;
    
    const collectionsSet = new Set();
    items.forEach(item => {
      item.collections.forEach(collection => collectionsSet.add(collection));
    });
    const totalCollections = collectionsSet.size;
    
    const processingTimes = items
      .map(item => item.metadata?.processingTime)
      .filter((time): time is number => typeof time === 'number');
    const averageProcessingTime = processingTimes.length > 0
      ? processingTimes.reduce((sum, time) => sum + time, 0) / processingTimes.length
      : 0;
    
    const styleCounts: Record<string, number> = {};
    items.forEach(item => {
      styleCounts[item.style] = (styleCounts[item.style] || 0) + 1;
    });
    const mostUsedStyle = Object.entries(styleCounts)
      .sort(([,a], [,b]) => b - a)[0]?.[0] || '';

    return {
      totalImages,
      favorites,
      totalCollections,
      averageProcessingTime,
      mostUsedStyle,
    };
  }

  async saveSessionState(state: Omit<ISessionState, 'id' | 'createdAt' | 'lastUpdated'>): Promise<void> {
    const now = new Date();
    const sessionState: ISessionState = {
      ...state,
      id: 'current_session',
      createdAt: now,
      lastUpdated: now,
    };

    await this.session_state.put(sessionState);
  }

  async getSessionState(): Promise<ISessionState | undefined> {
    return await this.session_state.get('current_session');
  }

  async updateSessionState(updates: Partial<Omit<ISessionState, 'id' | 'createdAt'>>): Promise<void> {
    const existing = await this.getSessionState();
    if (existing) {
      await this.session_state.update('current_session', {
        ...updates,
        lastUpdated: new Date(),
      });
    }
  }
}

export const enhancedDB = new MuseForgeEnhancedDB();
