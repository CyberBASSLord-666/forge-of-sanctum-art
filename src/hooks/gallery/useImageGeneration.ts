
import { useState, useCallback } from 'react';
import { galleryManager } from '@/lib/enhanced-database';
import { api, type GenerateParams } from '@/lib/api';
import { toast } from '@/hooks/use-toast';

export const useImageGeneration = () => {
  const [isGenerating, setIsGenerating] = useState(false);

  const generateAndSave = useCallback(async (params: GenerateParams) => {
    setIsGenerating(true);
    try {
      console.log('🎨 Starting generation process...');
      
      // Call the API
      const imageBlob = await api.generateImage(params);
      
      // Convert blob to data URL for storage
      const imageUrl = URL.createObjectURL(imageBlob);
      
      // Save to IndexedDB with required width/height defaults
      const savedImage = await galleryManager.addImage({
        url: imageUrl,
        prompt: params.prompt,
        negativePrompt: params.negativePrompt,
        style: params.style,
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
          fileSize: imageBlob.size,
          dimensions: { width: params.width || 512, height: params.height || 512 },
          isFavorite: false,
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

  return {
    isGenerating,
    generateAndSave,
  };
};
