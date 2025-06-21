
import { useLiveQuery } from 'dexie-react-hooks';
import { useState, useCallback } from 'react';
import { db, galleryManager, sessionManager, type IGalleryItem } from '@/lib/database';
import { api, type GenerateParams } from '@/lib/api';
import { toast } from '@/hooks/use-toast';

export const useGallery = () => {
  const [isGenerating, setIsGenerating] = useState(false);
  
  // Live query for reactive updates
  const images = useLiveQuery(() => galleryManager.getImages()) || [];
  
  const generateAndSave = useCallback(async (params: GenerateParams) => {
    setIsGenerating(true);
    try {
      console.log('🎨 Starting generation process...');
      
      // Call the API
      const imageBlob = await api.generateImage(params);
      
      // Convert blob to data URL for storage
      const imageUrl = URL.createObjectURL(imageBlob);
      
      // Save to IndexedDB
      const savedImage = await galleryManager.addImage({
        url: imageUrl,
        prompt: params.prompt,
        parameters: params,
        metadata: {
          fileSize: imageBlob.size,
          dimensions: { width: params.width || 512, height: params.height || 512 },
        },
      });
      
      toast({
        title: '✨ Creation Forged',
        description: 'Your vision has been brought to life',
      });
      
      return savedImage;
    } catch (error) {
      console.error('Generation failed:', error);
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
    await galleryManager.deleteImage(id);
    toast({
      title: '🗑️ Creation Removed',
      description: 'Image deleted from your gallery',
    });
  }, []);
  
  const searchImages = useCallback(async (query: string) => {
    if (!query.trim()) return images;
    return await galleryManager.searchImages(query);
  }, [images]);
  
  return {
    images,
    isGenerating,
    generateAndSave,
    deleteImage,
    searchImages,
  };
};

export const useSessionPersistence = () => {
  const [isLoading, setIsLoading] = useState(true);
  
  const saveSession = useCallback(async (state: any) => {
    try {
      await sessionManager.saveSession(state);
    } catch (error) {
      console.error('Failed to save session:', error);
    }
  }, []);
  
  const loadSession = useCallback(async () => {
    setIsLoading(true);
    try {
      const session = await sessionManager.loadSession();
      return session;
    } catch (error) {
      console.error('Failed to load session:', error);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);
  
  const clearSession = useCallback(async () => {
    try {
      await sessionManager.clearSession();
      toast({
        title: '🧹 Session Cleared',
        description: 'Your workspace has been reset',
      });
    } catch (error) {
      console.error('Failed to clear session:', error);
    }
  }, []);
  
  return {
    isLoading,
    saveSession,
    loadSession,
    clearSession,
  };
};
