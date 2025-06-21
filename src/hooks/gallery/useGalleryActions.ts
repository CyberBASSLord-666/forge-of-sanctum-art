
import { useCallback } from 'react';
import { enhancedDB, galleryManager } from '@/lib/enhanced-database';
import { toast } from '@/hooks/use-toast';

export const useGalleryActions = () => {
  const deleteImage = useCallback(async (id: string) => {
    try {
      await galleryManager.deleteImage(id);
      toast({
        title: '🗑️ Creation Removed',
        description: 'Image deleted from your sacred gallery',
      });
    } catch (error) {
      toast({
        title: '⚠️ Deletion Failed',
        description: 'Could not delete the image',
        variant: 'destructive',
      });
    }
  }, []);
  
  const toggleFavorite = useCallback(async (id: string) => {
    try {
      await galleryManager.toggleFavorite(id);
      const image = await enhancedDB.gallery_items.get(id);
      toast({
        title: image?.metadata.isFavorite ? '❤️ Added to Favorites' : '💔 Removed from Favorites',
        description: 'Your preference has been saved',
      });
    } catch (error) {
      toast({
        title: '⚠️ Update Failed',
        description: 'Could not update favorite status',
        variant: 'destructive',
      });
    }
  }, []);
  
  const rateImage = useCallback(async (id: string, rating: number) => {
    try {
      await galleryManager.rateImage(id, rating);
      toast({
        title: '⭐ Rating Saved',
        description: `Rated ${rating} out of 5 stars`,
      });
    } catch (error) {
      toast({
        title: '⚠️ Rating Failed',
        description: 'Could not save rating',
        variant: 'destructive',
      });
    }
  }, []);
  
  return {
    deleteImage,
    toggleFavorite,
    rateImage,
  };
};
