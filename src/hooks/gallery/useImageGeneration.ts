
import { useState, useCallback } from 'react';
import { galleryManager, truncatePrompt } from '@/lib/enhanced-database';
import { museForgeAPI, type GenerateParams } from '@/lib/museforge-api';
import { toast } from '@/hooks/use-toast';

export const useImageGeneration = () => {
  const [isGenerating, setIsGenerating] = useState(false);
  
  const generateAndSave = useCallback(async (params: GenerateParams) => {
    setIsGenerating(true);
    try {
      console.log('🎨 Starting enhanced generation process...');
      
      // Truncate prompt if too long to prevent API errors
      const truncatedPrompt = truncatePrompt(params.prompt);
      if (truncatedPrompt !== params.prompt) {
        console.log('📝 Prompt truncated to prevent API limit exceeded');
        toast({
          title: '✂️ Prompt Truncated',
          description: 'Your prompt was shortened to stay within API limits',
        });
      }
      
      const truncatedParams = {
        ...params,
        prompt: truncatedPrompt,
      };
      
      // Call the enhanced API
      const result = await museForgeAPI.generateImage(truncatedParams);
      
      // Convert blob to data URL for storage
      const imageUrl = URL.createObjectURL(result.blob);
      
      // Save to IndexedDB with comprehensive metadata
      const savedImage = await galleryManager.addImage({
        url: imageUrl,
        prompt: truncatedParams.prompt,
        negativePrompt: truncatedParams.negativePrompt,
        style: truncatedParams.style,
        parameters: {
          style: truncatedParams.style,
          steps: truncatedParams.steps,
          guidance: truncatedParams.guidance,
          width: truncatedParams.width || 512,
          height: truncatedParams.height || 512,
          seed: truncatedParams.seed,
          strength: truncatedParams.strength,
        },
        metadata: {
          fileSize: result.blob.size,
          dimensions: { 
            width: truncatedParams.width || 512, 
            height: truncatedParams.height || 512 
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
  
  return {
    isGenerating,
    generateAndSave,
  };
};
