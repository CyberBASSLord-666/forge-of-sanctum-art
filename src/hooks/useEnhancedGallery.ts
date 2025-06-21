
import { useGalleryData } from './gallery/useGalleryData';
import { useGalleryFilters } from './gallery/useGalleryFilters';
import { useImageGeneration } from './gallery/useImageGeneration';
import { useGalleryActions } from './gallery/useGalleryActions';
import { useCollectionManagement } from './gallery/useCollectionManagement';

export const useEnhancedGallery = () => {
  // Compose smaller hooks
  const { allImages, collections, stats } = useGalleryData();
  
  const {
    searchQuery,
    setSearchQuery,
    selectedFilter,
    setSelectedFilter,
    sortBy,
    setSortBy,
    sortOrder,
    setSortOrder,
    filteredImages,
  } = useGalleryFilters(allImages);
  
  const { isGenerating, generateAndSave } = useImageGeneration();
  
  const { deleteImage, toggleFavorite, rateImage } = useGalleryActions();
  
  const { addToCollection, removeFromCollection, createCollection } = useCollectionManagement();
  
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
