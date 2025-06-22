
import { useState, useMemo } from 'react';
import type { IGalleryItem } from '@/lib/database/interfaces';

export const useGalleryFilters = (images: IGalleryItem[]) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilter, setSelectedFilter] = useState<'all' | 'favorites' | 'recent'>('all');
  const [sortBy, setSortBy] = useState<'createdAt' | 'updatedAt' | 'prompt'>('createdAt');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  const filteredImages = useMemo(() => {
    let filtered = [...images];

    // Apply search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(img => 
        img.prompt.toLowerCase().includes(query) ||
        img.style.toLowerCase().includes(query) ||
        img.metadata.tags?.some(tag => tag.toLowerCase().includes(query))
      );
    }

    // Apply category filter
    switch (selectedFilter) {
      case 'favorites':
        filtered = filtered.filter(img => img.metadata.isFavorite);
        break;
      case 'recent':
        const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
        filtered = filtered.filter(img => new Date(img.createdAt) > oneDayAgo);
        break;
      default:
        // 'all' - no additional filtering
        break;
    }

    // Apply sorting
    filtered.sort((a, b) => {
      let aValue: any;
      let bValue: any;

      switch (sortBy) {
        case 'createdAt':
          aValue = new Date(a.createdAt).getTime();
          bValue = new Date(b.createdAt).getTime();
          break;
        case 'updatedAt':
          aValue = new Date(a.updatedAt).getTime();
          bValue = new Date(b.updatedAt).getTime();
          break;
        case 'prompt':
          aValue = a.prompt.toLowerCase();
          bValue = b.prompt.toLowerCase();
          break;
        default:
          return 0;
      }

      if (sortOrder === 'asc') {
        return aValue < bValue ? -1 : aValue > bValue ? 1 : 0;
      } else {
        return aValue > bValue ? -1 : aValue < bValue ? 1 : 0;
      }
    });

    return filtered;
  }, [images, searchQuery, selectedFilter, sortBy, sortOrder]);

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
