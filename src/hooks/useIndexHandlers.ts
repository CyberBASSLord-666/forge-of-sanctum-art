
import { useCallback } from 'react';
import { toast } from '@/hooks/use-toast';

interface UseIndexHandlersProps {
  addRecentPrompt: (prompt: string) => void;
  updateForgeState: (state: any) => void;
  viewport: any;
  generateAndSave: (params: any) => Promise<any>;
  setCurrentImage: (image: string) => void;
  soundEnabled: boolean;
  animationsEnabled: boolean;
  updateSession: (state: any) => void;
  updateUIState: (state: any) => void;
}

export const useIndexHandlers = ({
  addRecentPrompt,
  updateForgeState,
  viewport,
  generateAndSave,
  setCurrentImage,
  soundEnabled,
  animationsEnabled,
  updateSession,
  updateUIState,
}: UseIndexHandlersProps) => {
  
  const handleGenerate = useCallback(async (prompt: string, parameters: any) => {
    try {
      addRecentPrompt(prompt);
      updateForgeState({ prompt, ...parameters });
      
      const optimizedParams = {
        ...parameters,
        ...(viewport?.deviceType === 'mobile' && { steps: Math.min(parameters.steps, 25) }),
        ...(viewport?.pixelDensity && viewport.pixelDensity > 2 && { 
          width: parameters.width * 1.5,
          height: parameters.height * 1.5 
        }),
      };
      
      const generatedImage = await generateAndSave({
        prompt,
        ...optimizedParams,
      });
      
      if (generatedImage) {
        setCurrentImage(generatedImage.url);
        
        if (soundEnabled && animationsEnabled) {
          console.log('🔊 Playing generation complete harmony');
        }
        
        updateSession({ activePanel: 'forge' });
      }
    } catch (error) {
      console.error('Advanced generation failed:', error);
    }
  }, [addRecentPrompt, updateForgeState, viewport, generateAndSave, setCurrentImage, soundEnabled, animationsEnabled, updateSession]);

  const handlePanelChange = useCallback(async (panel: 'forge' | 'gallery') => {
    updateSession({ activePanel: panel });
  }, [updateSession]);

  const handleSidebarToggle = useCallback((open: boolean) => {
    updateUIState({ sidebarOpen: open });
  }, [updateUIState]);

  return {
    handleGenerate,
    handlePanelChange,
    handleSidebarToggle,
  };
};
