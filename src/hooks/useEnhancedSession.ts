import { useState, useCallback, useEffect, useRef } from 'react';
import { unifiedDB, type ISessionState } from '@/lib/enhanced-database';
import { errorHandler, ErrorSeverity } from '@/lib/error/error-boundary';
import { resourceManager } from '@/lib/cleanup/resource-manager';
import { toast } from '@/hooks/use-toast';

// Default session state
const DEFAULT_SESSION_STATE: Omit<ISessionState, 'id' | 'lastUpdated'> = {
  activePanel: 'forge',
  forgeState: {
    prompt: '',
    negativePrompt: '',
    style: 'photorealistic',
    steps: 30,
    guidance: 7.5,
    width: 512,
    height: 512,
    showAdvanced: false,
    recentPrompts: [],
    favoriteStyles: ['photorealistic', 'digital-art', 'fantasy'],
  },
  galleryState: {
    searchQuery: '',
    viewMode: 'grid',
    sortBy: 'createdAt',
    sortOrder: 'desc',
    filterBy: {},
  },
  canvasState: {
    zoom: 1,
    pan: { x: 0, y: 0 },
    showMetadata: false,
  },
  uiState: {
    sidebarOpen: false,
    theme: 'dark',
    soundEnabled: true,
    hapticsEnabled: true,
    animationsEnabled: true,
    accessibility: {
      reducedMotion: false,
      highContrast: false,
      fontSize: 'medium',
    },
  },
};

export const useEnhancedSession = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [sessionState, setSessionState] = useState<ISessionState | null>(null);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  
  // Auto-save timer
  const autoSaveTimer = useRef<NodeJS.Timeout>();
  const lastSavedState = useRef<string>();
  
  // Register auto-save timer for cleanup
  useEffect(() => {
    if (autoSaveTimer.current) {
      resourceManager.registerTimeout(autoSaveTimer.current);
    }
    return () => {
      if (autoSaveTimer.current) {
        resourceManager.unregisterResource(`timeout-${autoSaveTimer.current}`);
      }
    };
  }, []);
  
  // Load session on mount
  useEffect(() => {
    const initializeSession = async () => {
      setIsLoading(true);
      try {
        const savedSession = await unifiedDB.loadSession();
        
        if (savedSession) {
          setSessionState(savedSession);
          lastSavedState.current = JSON.stringify(savedSession);
          
          toast({
            title: '🔮 Session Restored',
            description: `Welcome back! Session from ${savedSession.lastUpdated.toLocaleDateString()}`,
          });
        } else {
          // Create new session with defaults
          const newSession: ISessionState = {
            ...DEFAULT_SESSION_STATE,
            id: 'current_session',
            lastUpdated: new Date(),
          };
          
          setSessionState(newSession);
          await unifiedDB.saveSession(newSession);
          lastSavedState.current = JSON.stringify(newSession);
          
          toast({
            title: '✨ New Session Started',
            description: 'Welcome to your creative sanctuary',
          });
        }
      } catch (error) {
        errorHandler.handleError({
          code: 'SESSION_INIT_FAILED',
          message: 'Failed to initialize session',
          severity: ErrorSeverity.HIGH,
          context: { error },
        });
        
        // Fallback to default state
        const fallbackSession: ISessionState = {
          ...DEFAULT_SESSION_STATE,
          id: 'current_session',
          lastUpdated: new Date(),
        };
        setSessionState(fallbackSession);
      } finally {
        setIsLoading(false);
      }
    };
    
    initializeSession();
  }, []);
  
  // Auto-save mechanism with error handling
  useEffect(() => {
    if (!sessionState || isLoading) return;
    
    const currentStateString = JSON.stringify(sessionState);
    
    // Check if state has changed
    if (currentStateString !== lastSavedState.current) {
      setHasUnsavedChanges(true);
      
      // Clear existing timer
      if (autoSaveTimer.current) {
        clearTimeout(autoSaveTimer.current);
        resourceManager.unregisterResource(`timeout-${autoSaveTimer.current}`);
      }
      
      // Set new auto-save timer (debounced)
      autoSaveTimer.current = setTimeout(async () => {
        try {
          await unifiedDB.saveSession(sessionState);
          lastSavedState.current = currentStateString;
          setHasUnsavedChanges(false);
          console.log('🔄 Session auto-saved');
        } catch (error) {
          errorHandler.handleError({
            code: 'AUTO_SAVE_FAILED',
            message: 'Auto-save failed',
            severity: ErrorSeverity.MEDIUM,
            context: { error },
          });
        }
      }, 2000);
      
      resourceManager.registerTimeout(autoSaveTimer.current);
    }
    
    return () => {
      if (autoSaveTimer.current) {
        clearTimeout(autoSaveTimer.current);
        resourceManager.unregisterResource(`timeout-${autoSaveTimer.current}`);
      }
    };
  }, [sessionState, isLoading]);
  
  
  const updateSession = useCallback((updates: Partial<ISessionState>) => {
    setSessionState(current => {
      if (!current) return current;
      
      return {
        ...current,
        ...updates,
        lastUpdated: new Date(),
      };
    });
  }, []);
  
  const updateForgeState = useCallback((updates: Partial<ISessionState['forgeState']>) => {
    updateSession({
      forgeState: {
        ...sessionState?.forgeState || DEFAULT_SESSION_STATE.forgeState,
        ...updates,
      },
    });
  }, [sessionState?.forgeState, updateSession]);
  
  const updateGalleryState = useCallback((updates: Partial<ISessionState['galleryState']>) => {
    updateSession({
      galleryState: {
        ...sessionState?.galleryState || DEFAULT_SESSION_STATE.galleryState,
        ...updates,
      },
    });
  }, [sessionState?.galleryState, updateSession]);
  
  const updateCanvasState = useCallback((updates: Partial<ISessionState['canvasState']>) => {
    updateSession({
      canvasState: {
        ...sessionState?.canvasState || DEFAULT_SESSION_STATE.canvasState,
        ...updates,
      },
    });
  }, [sessionState?.canvasState, updateSession]);
  
  const updateUIState = useCallback((updates: Partial<ISessionState['uiState']>) => {
    updateSession({
      uiState: {
        ...sessionState?.uiState || DEFAULT_SESSION_STATE.uiState,
        ...updates,
      },
    });
  }, [sessionState?.uiState, updateSession]);
  
  const addRecentPrompt = useCallback((prompt: string) => {
    if (!sessionState) return;
    
    const recentPrompts = [
      prompt,
      ...sessionState.forgeState.recentPrompts.filter(p => p !== prompt)
    ].slice(0, 10); // Keep only last 10
    
    updateForgeState({ recentPrompts });
  }, [sessionState, updateForgeState]);
  
  const addFavoriteStyle = useCallback((style: string) => {
    if (!sessionState) return;
    
    const favoriteStyles = [
      ...sessionState.forgeState.favoriteStyles.filter(s => s !== style),
      style
    ].slice(-5); // Keep only last 5
    
    updateForgeState({ favoriteStyles });
  }, [sessionState, updateForgeState]);
  
  const saveSession = useCallback(async () => {
    if (!sessionState) return;
    
    try {
      await unifiedDB.saveSession(sessionState);
      lastSavedState.current = JSON.stringify(sessionState);
      setHasUnsavedChanges(false);
      
      toast({
        title: '💾 Session Saved',
        description: 'Your creative progress has been preserved',
      });
    } catch (error) {
      errorHandler.handleError({
        code: 'MANUAL_SAVE_FAILED',
        message: 'Manual save failed',
        severity: ErrorSeverity.HIGH,
        context: { error },
      });
    }
  }, [sessionState]);
  
  const clearSession = useCallback(async () => {
    try {
      await unifiedDB.clearSession();
      
      const newSession: ISessionState = {
        ...DEFAULT_SESSION_STATE,
        id: 'current_session',
        lastUpdated: new Date(),
      };
      
      setSessionState(newSession);
      lastSavedState.current = JSON.stringify(newSession);
      setHasUnsavedChanges(false);
      
      toast({
        title: '🧹 Session Cleared',
        description: 'Starting fresh with a clean workspace',
      });
    } catch (error) {
      console.error('Clear session failed:', error);
      toast({
        title: '⚠️ Clear Failed',
        description: 'Could not clear session',
        variant: 'destructive',
      });
    }
  }, []);
  
  const exportSession = useCallback(async () => {
    try {
      const exportData = await unifiedDB.exportSession();
      
      const blob = new Blob([exportData], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      
      const link = document.createElement('a');
      link.href = url;
      link.download = `museforge-session-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      URL.revokeObjectURL(url);
      
      toast({
        title: '📦 Session Exported',
        description: 'Your entire creative workspace has been exported',
      });
    } catch (error) {
      console.error('Export failed:', error);
      toast({
        title: '⚠️ Export Failed',
        description: 'Could not export session',
        variant: 'destructive',
      });
    }
  }, []);
  
  const importSession = useCallback(async (file: File) => {
    try {
      const text = await file.text();
      await unifiedDB.importSession(text);
      
      // Reload session
      const importedSession = await unifiedDB.loadSession();
      if (importedSession) {
        setSessionState(importedSession);
        lastSavedState.current = JSON.stringify(importedSession);
        setHasUnsavedChanges(false);
      }
      
      toast({
        title: '📦 Session Imported',
        description: 'Your creative workspace has been restored',
      });
    } catch (error) {
      console.error('Import failed:', error);
      toast({
        title: '⚠️ Import Failed',
        description: 'Could not import session file',
        variant: 'destructive',
      });
    }
  }, []);
  
  return {
    // State
    sessionState,
    isLoading,
    hasUnsavedChanges,
    
    // Update methods
    updateSession,
    updateForgeState,
    updateGalleryState,
    updateCanvasState,
    updateUIState,
    
    // Convenience methods
    addRecentPrompt,
    addFavoriteStyle,
    
    // Session management
    saveSession,
    clearSession,
    exportSession,
    importSession,
  };
};
