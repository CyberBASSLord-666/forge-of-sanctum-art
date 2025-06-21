
import Dexie, { Table } from 'dexie';
import type { IGalleryItem, ICollection, ISessionState } from './interfaces';

export class MuseForgeEnhancedDB extends Dexie {
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

    this.gallery_items.hook('updating', function (modifications: Partial<IGalleryItem>, primKey, obj, trans) {
      modifications.updatedAt = new Date();
    });

    this.collections.hook('creating', function (primKey, obj, trans) {
      obj.createdAt = new Date();
      obj.updatedAt = new Date();
    });

    this.collections.hook('updating', function (modifications: Partial<ICollection>, primKey, obj, trans) {
      modifications.updatedAt = new Date();
    });
  }
}

export const enhancedDB = new MuseForgeEnhancedDB();
