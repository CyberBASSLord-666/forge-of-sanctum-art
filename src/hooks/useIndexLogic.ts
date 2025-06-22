
import { useState, useMemo } from 'react';
import { useEnhancedGallery } from '@/hooks/useEnhancedGallery';
import { useEnhancedSession } from '@/hooks/useEnhancedSession';
import { useLayoutConfig } from '@/hooks/useLayoutConfig';
import { useMotionEngine } from '@/lib/animation/motion-engine';
import { GestureStateMachine } from '@/lib/interaction/gesture-state-machine';

export const useIndexLogic = () => {
  const [currentImage, setCurrentImage] = useState<string>();
  
  // Enhanced systems
  const motionEngine = useMotionEngine();
  const gestureStateMachine = useMemo(() => new GestureStateMachine(), []);
  const { layoutConfig, animationConfig, viewport } = useLayoutConfig();
  
  // Enhanced hooks
  const { 
    images, 
    isGenerating, 
    generateAndSave,
    stats
  } = useEnhancedGallery();
  
  const { 
    sessionState,
    isLoading: sessionLoading,
    hasUnsavedChanges,
    updateSession,
    updateForgeState,
    updateUIState,
    addRecentPrompt,
  } = useEnhancedSession();

  // Derived state
  const activePanel = sessionState?.activePanel || 'forge';
  const sidebarOpen = sessionState?.uiState?.sidebarOpen || false;
  const animationsEnabled = sessionState?.uiState?.animationsEnabled ?? true;
  const soundEnabled = sessionState?.uiState?.soundEnabled ?? true;

  return {
    currentImage,
    setCurrentImage,
    motionEngine,
    gestureStateMachine,
    layoutConfig,
    animationConfig,
    viewport,
    images,
    isGenerating,
    generateAndSave,
    stats,
    sessionState,
    sessionLoading,
    hasUnsavedChanges,
    updateSession,
    updateForgeState,
    updateUIState,
    addRecentPrompt,
    activePanel,
    sidebarOpen,
    animationsEnabled,
    soundEnabled,
  };
};
