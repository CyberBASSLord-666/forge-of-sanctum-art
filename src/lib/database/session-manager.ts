
import { enhancedDB } from './config';
import { galleryManager } from './gallery-manager';
import { collectionManager } from './collection-manager';
import type { ISessionState } from './interfaces';

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
