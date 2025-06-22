
import { useLiveQuery } from 'dexie-react-hooks';
import { galleryManager, collectionManager } from '@/lib/enhanced-database';
import type { IGalleryStats } from '@/lib/database/interfaces';

export const useGalleryData = () => {
  const allImages = useLiveQuery(() => galleryManager.getAllImages()) || [];
  const collections = useLiveQuery(() => collectionManager.getAllCollections()) || [];
  
  // Calculate most used style properly
  const styleCount = allImages.reduce((acc, img) => {
    acc[img.style] = (acc[img.style] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const mostUsedStyleString = Object.entries(styleCount)
    .sort(([,a], [,b]) => b - a)[0]?.[0] || 'photorealistic';

  const stats: IGalleryStats = {
    totalImages: allImages.length,
    favorites: allImages.filter(img => img.metadata.isFavorite).length,
    totalCollections: collections.length,
    averageProcessingTime: allImages.reduce((acc, img) => 
      acc + (img.metadata.processingTime || 0), 0) / Math.max(allImages.length, 1),
    mostUsedStyle: mostUsedStyleString,
  };

  return {
    allImages,
    collections,
    stats,
  };
};
