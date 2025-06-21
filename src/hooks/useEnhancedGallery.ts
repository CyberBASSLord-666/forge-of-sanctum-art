
import { useLiveQuery } from 'dexie-react-hooks';
import { useState, useCallback, useMemo } from 'react';
import { 
  db, 
  galleryManager, 
  collectionManager, 
  type IGalleryItem, 
  type ICollection 
} from '@/lib/enhanced-database';
import { museForgeAPI, type GenerateParams } from '@/lib/museforge-api';
import { toast } from '@/hooks/use-toast';

export const useEnhancedGallery = () => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilter, setSelectedFilter] = useState<{
    tags?: string[];
    collections?: string[];
    isFavorite?: boolean;
    dateRange?: { from: Date; to: Date };
  }>({});
  const [sortBy, setSortBy] = useState<'createdAt' | 'rating' | 'prompt'>('createdAt');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  
  // Live queries for reactive updates
  const allImages = useLiveQuery(() => galleryManager.getAllImages()) || [];
  const collections = useLiveQuery(() => collectionManager.getAllCollections()) || [];
  
  // Filtered and sorted images
  const filteredImages = useMemo(() => {
    let filtered = allImages;
    
    // Apply search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(image => 
        image.prompt.toLowerCase().includes(query) ||
        image.negativePrompt?.toLowerCase().includes(query) ||
        image.metadata.tags?.some(tag => tag.toLowerCase().includes(query))
      );
    }
    
    // Apply additional filters
    if (selectedFilter.tags?.length) {
      filtered = filtered.filter(image => 
        selectedFilter.tags!.some(tag => image.metadata.tags?.includes(tag))
      );
    }
    
    if (selectedFilter.collections?.length) {
      filtered = filtered.filter(image => 
        selectedFilter.collections!.some(collection => 
          image.metadata.collections?.includes(collection)
        )
      );
    }
    
    if (selectedFilter.isFavorite !== undefined) {
      filtered = filtered.filter(image => 
        image.metadata.isFavorite === selectedFilter.isFavorite
      );
    }
    
    if (selectedFilter.dateRange) {
      filtered = filtered.filter(image => 
        image.createdAt >= selectedFilter.dateRange!.from && 
        image.createdAt <= selectedFilter.dateRange!.to
      );
    }
    
    // Apply sorting
    filtered.sort((a, b) => {
      let comparison = 0;
      
      switch (sortBy) {
        case 'createdAt':
          comparison = a.createdAt.getTime() - b.createdAt.getTime();
          break;
        case 'rating':
          comparison = (a.metadata.rating || 0) - (b.metadata.rating || 0);
          break;
        case 'prompt':
          comparison = a.prompt.localeCompare(b.prompt);
          break;
      }
      
      return sortOrder === 'asc' ? comparison : -comparison;
    });
    
    return filtered;
  }, [allImages, searchQuery, selectedFilter, sortBy, sortOrder]);
  
  const generateAndSave = useCallback(async (params: GenerateParams) => {
    setIsGenerating(true);
    try {
      console.log('🎨 Starting enhanced generation process...');
      
      // Call the enhanced API
      const result = await museForgeAPI.generateImage(params);
      
      // Convert blob to data URL for storage
      const imageUrl = URL.createObjectURL(result.blob);
      
      // Save to IndexedDB with comprehensive metadata
      const savedImage = await galleryManager.addImage({
        url: imageUrl,
        prompt: params.prompt,
        negativePrompt: params.negativePrompt,
        parameters: {
          style: params.style,
          steps: params.steps,
          guidance: params.guidance,
          width: params.width || 512,
          height: params.height || 512,
          seed: params.seed,
          strength: params.strength,
        },
        metadata: {
          fileSize: result.blob.size,
          dimensions: { 
            width: params.width || 512, 
            height: params.height || 512 
          },
          processingTime: result.metadata.processingTime,
          modelUsed: result.metadata.modelUsed,
          cost: result.metadata.cost,
          tags: [],
          isFavorite: false,
          collections: [],
        },
      });
      
      toast({
        title: '✨ Creation Forged Successfully',
        description: `Generated in ${result.metadata.processingTime}ms using ${result.metadata.modelUsed}`,
      });
      
      return savedImage;
    } catch (error) {
      console.error('Enhanced generation failed:', error);
      toast({
        title: '⚠️ Forging Failed',
        description: error instanceof Error ? error.message : 'Unknown error occurred',
        variant: 'destructive',
      });
      throw error;
    } finally {
      setIsGenerating(false);
    }
  }, []);
  
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
      const image = await db.gallery_items.get(id);
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
    // Data
    images: filteredImages,
    allImages,
    collections,
    stats,
    
    // State
    isGenerating,
    searchQuery,
    selectedFilter,
    sortBy,
    sortOrder,
    
    // Actions
    generateAndSave,
    deleteImage,
    toggleFavorite,
    rateImage,
    addToCollection,
    removeFromCollection,
    createCollection,
    
    // Filters
    setSearchQuery,
    setSelectedFilter,
    setSortBy,
    setSortOrder,
  };
};
