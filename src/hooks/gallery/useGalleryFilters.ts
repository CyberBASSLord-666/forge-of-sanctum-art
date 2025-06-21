
import { useState, useMemo } from 'react';
import type { IGalleryItem } from '@/lib/enhanced-database';

interface FilterState {
  tags?: string[];
  collections?: string[];
  isFavorite?: boolean;
  dateRange?: { from: Date; to: Date };
}

export const useGalleryFilters = (allImages: IGalleryItem[]) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilter, setSelectedFilter] = useState<FilterState>({});
  const [sortBy, setSortBy] = useState<'createdAt' | 'rating' | 'prompt'>('createdAt');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  
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
  
  return {
    searchQuery,
    setSearchQuery,
    selectedFilter,
    setSelectedFilter,
    sortBy,
    setSortBy,
    sortOrder,
    setSortOrder,
    filteredImages,
  };
};
