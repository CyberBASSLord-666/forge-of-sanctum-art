
import { useCallback } from 'react';
import { galleryManager, collectionManager } from '@/lib/enhanced-database';
import { toast } from '@/hooks/use-toast';

export const useCollectionManagement = () => {
  const addToCollection = useCallback(async (imageId: string, collectionId: string) => {
    try {
      await galleryManager.addToCollection(imageId, collectionId);
      const collection = await collectionManager.getCollection(collectionId);
      toast({
        title: '📁 Added to Collection',
        description: `Added to "${collection?.name}"`,
      });
    } catch (error) {
      toast({
        title: '⚠️ Collection Update Failed',
        description: 'Could not add to collection',
        variant: 'destructive',
      });
    }
  }, []);
  
  const removeFromCollection = useCallback(async (imageId: string, collectionId: string) => {
    try {
      await galleryManager.removeFromCollection(imageId, collectionId);
      const collection = await collectionManager.getCollection(collectionId);
      toast({
        title: '📁 Removed from Collection',
        description: `Removed from "${collection?.name}"`,
      });
    } catch (error) {
      toast({
        title: '⚠️ Collection Update Failed',
        description: 'Could not remove from collection',
        variant: 'destructive',
      });
    }
  }, []);
  
  const createCollection = useCallback(async (
    name: string, 
    description?: string, 
    color: string = '#8B5CF6'
  ) => {
    try {
      const collection = await collectionManager.createCollection({
        name,
        description,
        color,
        imageIds: [],
      });
      
      toast({
        title: '📁 Collection Created',
        description: `"${name}" is ready for your creations`,
      });
      
      return collection;
    } catch (error) {
      toast({
        title: '⚠️ Collection Creation Failed',
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
