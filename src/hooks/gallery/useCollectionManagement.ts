
import { useCallback } from 'react';
import { galleryManager, collectionManager } from '@/lib/enhanced-database';
import { toast } from '@/hooks/use-toast';

export const useCollectionManagement = () => {
  const addToCollection = useCallback(async (imageId: string, collectionId: string) => {
    try {
      await galleryManager.addToCollection(imageId, collectionId);
      toast({
        title: '📁 Added to Collection',
        description: 'Image added to collection successfully',
      });
    } catch (error) {
      console.error('Failed to add to collection:', error);
      toast({
        title: '⚠️ Collection Error',
        description: 'Could not add image to collection',
        variant: 'destructive',
      });
    }
  }, []);

  const removeFromCollection = useCallback(async (imageId: string, collectionId: string) => {
    try {
      await galleryManager.removeFromCollection(imageId, collectionId);
      toast({
        title: '📁 Removed from Collection',
        description: 'Image removed from collection',
      });
    } catch (error) {
      console.error('Failed to remove from collection:', error);
      toast({
        title: '⚠️ Collection Error',
        description: 'Could not remove image from collection',
        variant: 'destructive',
      });
    }
  }, []);

  const createCollection = useCallback(async (name: string, description?: string) => {
    try {
      const collection = await collectionManager.createCollection({
        name,
        description,
        color: '#8B5CF6', // Default purple color
        imageIds: [],
      });
      
      toast({
        title: '📁 Collection Created',
        description: `"${name}" collection created successfully`,
      });
      
      return collection;
    } catch (error) {
      console.error('Failed to create collection:', error);
      toast({
        title: '⚠️ Creation Failed',
        description: 'Could not create collection',
        variant: 'destructive',
      });
      throw error;
    }
  }, []);

  return {
    addToCollection,
    removeFromCollection,
    createCollection,
  };
};
