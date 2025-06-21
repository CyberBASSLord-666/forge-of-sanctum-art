
export interface IGalleryItem {
  id: string;
  url: string;
  prompt: string;
  negativePrompt?: string;
  style: string;
  parameters: {
    style: string;
    steps: number;
    guidance: number;
    width: number;
    height: number;
    seed?: number;
    strength?: number;
  };
  createdAt: Date;
  updatedAt: Date;
  metadata: {
    fileSize: number;
    dimensions: { width: number; height: number };
    processingTime?: number;
    modelUsed?: string;
    cost?: number;
    tags?: string[];
    isFavorite: boolean;
    collections?: string[];
    rating?: number;
  };
}

export interface ICollection {
  id: string;
  name: string;
  description?: string;
  color: string;
  imageIds: string[];
  createdAt: Date;
  updatedAt: Date;
}

export interface ISessionState {
  id: string;
  activePanel: 'forge' | 'gallery';
  forgeState: {
    prompt: string;
    negativePrompt?: string;
    style: string;
    steps: number;
    guidance: number;
    width: number;
    height: number;
    seed?: number;
    showAdvanced?: boolean;
    recentPrompts: string[];
    favoriteStyles: string[];
  };
  galleryState: {
    searchQuery: string;
    viewMode: 'grid' | 'list';
    sortBy: 'createdAt' | 'updatedAt' | 'prompt';
    sortOrder: 'asc' | 'desc';
    filterBy: {
      tags?: string[];
      collections?: string[];
      isFavorite?: boolean;
      dateRange?: {
        start?: Date;
        end?: Date;
      };
    };
  };
  canvasState: {
    zoom: number;
    pan: { x: number; y: number };
    showMetadata: boolean;
  };
  uiState: {
    sidebarOpen: boolean;
    theme: 'dark' | 'light' | 'auto';
    soundEnabled: boolean;
    hapticsEnabled: boolean;
    animationsEnabled: boolean;
    accessibility: {
      reducedMotion: boolean;
      highContrast: boolean;
      fontSize: 'small' | 'medium' | 'large';
    };
  };
  lastUpdated: Date;
}

export interface IGalleryFilter {
  tags?: string[];
  collections?: string[];
  isFavorite?: boolean;
  dateRange?: {
    start?: Date;
    end?: Date;
  };
}

export interface IGalleryStats {
  totalImages: number;
  favorites: number;
  totalCollections: number;
  averageProcessingTime: number;
  mostUsedStyle: string;
}
