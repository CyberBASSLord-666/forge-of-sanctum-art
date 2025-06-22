
import { useLiveQuery } from 'dexie-react-hooks';
import { galleryManager, collectionManager } from '@/lib/enhanced-database';
import type { IGalleryStats } from '@/lib/database/interfaces';

export const useGalleryData = () => {
  const allImages = useLiveQuery(() => galleryManager.getAllImages()) || [];
  const collections = useLiveQuery(() => collectionManager.getAllCollections()) || [];
  
  const stats: IGalleryStats = {
    totalImages: allImages.length,
    favorites: allImages.filter(img => img.metadata.isFavorite).length,
    totalCollections: collections.length,
    averageProcessingTime: allImages.reduce((acc, img) => 
      acc + (img.metadata.processingTime || 0), 0) / Math.max(allImages.length, 1),
    mostUsedStyle: allImages.reduce((acc, img) => {
      acc[img.style] = (acc[img.style] || 0) + 1;
      return acc;
    }, {} as Record<string, number>),
  };

  // Convert mostUsedStyle object to the most used style string
  const mostUsedStyleString = Object.entries(stats.mostUsedStyle as Record<string, number>)
    .sort(([,a], [,b]) => b - a)[0]?.[0] || 'photorealistic';

  return {
    allImages,
    collections,
    stats: {
      ...stats,
      mostUsedStyle: mostUsedStyleString,
    },
  };
};
