
// Re-export all interfaces
export type {
  IGalleryItem,
  ICollection,
  ISessionState,
  IGalleryFilter,
  IGalleryStats
} from './database/interfaces';

// Re-export database instance
export { enhancedDB } from './database/config';

// Re-export utilities
export { truncatePrompt } from './database/utils';

// Re-export managers
export { galleryManager } from './database/gallery-manager';
export { collectionManager } from './database/collection-manager';
export { sessionManager } from './database/session-manager';

// Export db alias for compatibility
export { enhancedDB as db } from './database/config';
