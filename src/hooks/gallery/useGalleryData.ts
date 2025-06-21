
import { useLiveQuery } from 'dexie-react-hooks';
import { useMemo } from 'react';
import { galleryManager, collectionManager, type IGalleryItem } from '@/lib/enhanced-database';

export const useGalleryData = () => {
  // Live queries for reactive updates
  const allImages = useLiveQuery(() => galleryManager.getAllImages()) || [];
  const collections = useLiveQuery(() => collectionManager.getAllCollections()) || [];
  
  // Statistics
  const stats = useMemo(() => ({
    totalImages: allImages.length,
    favorites: allImages.filter(img => img.metadata.isFavorite).length,
    totalCollections: collections.length,
    averageRating: allImages.reduce((sum, img) => sum + (img.metadata.rating || 0), 0) / allImages.length || 0,
    totalFileSize: allImages.reduce((sum, img) => sum + img.metadata.fileSize, 0),
    mostUsedStyle: allImages.reduce((acc, img) => {
      acc[img.parameters.style] = (acc[img.parameters.style] || 0) + 1;
      return acc;
    }, {} as Record<string, number>),
  }), [allImages, collections]);
  
  return {
    allImages,
    collections,
    stats,
  };
};
