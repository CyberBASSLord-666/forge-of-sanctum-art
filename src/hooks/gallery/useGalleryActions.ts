
import { useCallback } from 'react';
import { galleryManager } from '@/lib/enhanced-database';
import { toast } from '@/hooks/use-toast';

export const useGalleryActions = () => {
  const deleteImage = useCallback(async (id: string) => {
    try {
      await galleryManager.deleteImage(id);
      toast({
        title: '🗑️ Creation Removed',
        description: 'Image deleted from your gallery',
      });
    } catch (error) {
      console.error('Failed to delete image:', error);
      toast({
        title: '⚠️ Delete Failed',
        description: 'Could not delete the image',
        variant: 'destructive',
      });
    }
  }, []);

  const toggleFavorite = useCallback(async (id: string) => {
    try {
      await galleryManager.toggleFavorite(id);
      toast({
        title: '❤️ Favorite Updated',
        description: 'Image favorite status changed',
      });
    } catch (error) {
      console.error('Failed to toggle favorite:', error);
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
        description: `Image rated ${rating} stars`,
      });
    } catch (error) {
      console.error('Failed to rate image:', error);
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
