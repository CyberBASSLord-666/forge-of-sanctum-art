
import Dexie, { type EntityTable } from 'dexie';

export interface IGalleryItem {
  id: string;
  url: string;
  prompt: string;
  parameters: {
    style: string;
    steps: number;
    guidance: number;
    width: number;
    height: number;
    seed?: number;
  };
  createdAt: Date;
  updatedAt: Date;
  metadata?: {
    fileSize?: number;
    dimensions?: { width: number; height: number };
    tags?: string[];
  };
}

export interface ISessionState {
  id: 'current_session';
  activePanel: 'forge' | 'gallery';
  forgeState: {
    prompt: string;
    style: string;
    steps: number;
    guidance: number;
    showAdvanced: boolean;
  };
  galleryState: {
    searchQuery: string;
    selectedImage?: string;
    viewMode: 'grid' | 'list';
  };
  uiState: {
    sidebarOpen: boolean;
    theme: 'dark' | 'light' | 'auto';
  };
  lastUpdated: Date;
}

export class MuseForgeDB extends Dexie {
  gallery_items!: EntityTable<IGalleryItem, 'id'>;
  session_state!: EntityTable<ISessionState, 'id'>;

  constructor() {
    super('MuseForgeDB');
    
    this.version(1).stores({
      gallery_items: 'id, createdAt, prompt, *tags',
      session_state: 'id',
    });
  }
}

export const db = new MuseForgeDB();

// Session management utilities
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
};

// Gallery utilities
export const galleryManager = {
  async addImage(image: Omit<IGalleryItem, 'id' | 'createdAt' | 'updatedAt'>) {
    const now = new Date();
    const newImage: IGalleryItem = {
      ...image,
      id: crypto.randomUUID(),
      createdAt: now,
      updatedAt: now,
    };
    
    await db.gallery_items.add(newImage);
    return newImage;
  },

  async getImages(limit = 50) {
    return await db.gallery_items
      .orderBy('createdAt')
      .reverse()
      .limit(limit)
      .toArray();
  },

  async searchImages(query: string) {
    return await db.gallery_items
      .filter(item => 
        item.prompt.toLowerCase().includes(query.toLowerCase()) ||
        item.metadata?.tags?.some(tag => tag.toLowerCase().includes(query.toLowerCase()))
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
};
