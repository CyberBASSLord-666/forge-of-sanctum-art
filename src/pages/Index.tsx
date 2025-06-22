
import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { useEnhancedGallery } from '@/hooks/useEnhancedGallery';
import { useEnhancedSession } from '@/hooks/useEnhancedSession';
import { EnhancedLiquidGlass } from '@/components/ui/enhanced-liquid-glass';
import { useMotionEngine } from '@/lib/animation/motion-engine';
import { useGestures } from '@/lib/interaction/gesture-system';
import { animationFactory } from '@/lib/animation/animation-factory';
import { performanceMonitor } from '@/lib/animation/performance-monitor';
import { GestureStateMachine } from '@/lib/interaction/gesture-state-machine';
import { toast } from '@/hooks/use-toast';
import { useLayoutConfig } from '@/hooks/useLayoutConfig';
import { MainLayout } from '@/components/layout/MainLayout';
import { LoadingScreen } from '@/components/ui/loading-screen';

const Index = () => {
  const [currentImage, setCurrentImage] = useState<string>();
  const mainRef = useRef<HTMLDivElement>(null);
  
  // Enhanced systems - always initialize
  const motionEngine = useMotionEngine();
  const gestureStateMachine = useMemo(() => new GestureStateMachine(), []);
  const { layoutConfig, animationConfig, viewport } = useLayoutConfig();
  
  // Enhanced hooks - always call
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

  // Performance monitoring - always initialize
  useEffect(() => {
    performanceMonitor.startMonitoring();
    
    const unsubscribe = performanceMonitor.subscribe((metrics) => {
      if (!performanceMonitor.isPerformanceGood()) {
        const currentProfile = animationFactory.getCurrentProfile();
        if (metrics.fps < 30) {
          animationFactory.updateProfile({
            complexity: 'basic',
            particleCount: Math.max(6, currentProfile.particleCount / 2)
          });
        }
      }
    });

    return () => {
      performanceMonitor.stopMonitoring();
      unsubscribe();
    };
  }, []);

  // Session state management - always derive values safely
  const activePanel = sessionState?.activePanel || 'forge';
  const sidebarOpen = sessionState?.uiState?.sidebarOpen || false;
  const animationsEnabled = sessionState?.uiState?.animationsEnabled ?? true;
  const soundEnabled = sessionState?.uiState?.soundEnabled ?? true;

  // Enhanced gesture handling with state machine
  const gestureHandlers = useMemo(() => ({
    onPan: (state: any) => {
      const gestureStart = performance.now();
      const newState = gestureStateMachine.transition({ type: 'move', ...state });
      
      if (newState === 'pan') {
        if (state.deltaX > 50 && activePanel === 'gallery') {
          handlePanelChange('forge');
        } else if (state.deltaX < -50 && activePanel === 'forge') {
          handlePanelChange('gallery');
        }
      }
      
      performanceMonitor.recordGestureResponseTime(performance.now() - gestureStart);
    },
    onSwipe: (direction: 'up' | 'down' | 'left' | 'right') => {
      const gestureStart = performance.now();
      gestureStateMachine.transition({ type: 'swipe', direction });
      
      switch (direction) {
        case 'left':
          if (activePanel === 'forge') handlePanelChange('gallery');
          break;
        case 'right':
          if (activePanel === 'gallery') handlePanelChange('forge');
          break;
        case 'up':
          if (viewport?.deviceType === 'mobile') {
            handleSidebarToggle(true);
          }
          break;
        case 'down':
          if (viewport?.deviceType === 'mobile') {
            handleSidebarToggle(false);
          }
          break;
      }
      
      performanceMonitor.recordGestureResponseTime(performance.now() - gestureStart);
    },
    onPinch: (state: any) => {
      gestureStateMachine.transition({ type: 'pinch', scale: state.scale });
    },
    onDoubleTap: () => {
      gestureStateMachine.transition({ type: 'doubletap' });
    },
    onLongPress: () => {
      gestureStateMachine.transition({ type: 'longpress' });
    },
  }), [activePanel, viewport, gestureStateMachine]);

  useGestures(mainRef, {
    enablePan: true,
    enableSwipe: true,
    enablePinch: true,
    enableDoubleTap: true,
    enableLongPress: true,
    threshold: {
      pan: viewport?.deviceType === 'mobile' ? 20 : 10,
      swipe: viewport?.deviceType === 'mobile' ? 75 : 50,
      pinch: 0.1,
      rotation: 5,
    },
  }, gestureHandlers);

  // Welcome message - only run when conditions are met
  useEffect(() => {
    if (sessionLoading || !sessionState || !viewport) return;
    
    const now = new Date();
    const lastSession = sessionState.lastUpdated;
    const timeDiff = now.getTime() - lastSession.getTime();
    const daysDiff = Math.floor(timeDiff / (1000 * 60 * 60 * 24));
    
    if (daysDiff > 0) {
      const deviceGreeting = viewport.deviceType === 'mobile' ? '📱' :
                            viewport.deviceType === 'tablet' ? '📋' :
                            viewport.deviceType === 'ultrawide' ? '🖥️' : '💻';
      
      const capabilities = animationFactory.getDeviceCapabilities();
      
      toast({
        title: `${deviceGreeting} Welcome Back, Master Creator`,
        description: `${daysDiff} day${daysDiff > 1 ? 's' : ''} since your last forging session. Your ${viewport.deviceType} forge awaits (${capabilities.maxAnimations} concurrent animations, ${capabilities.preferredFPS}fps).`,
      });
    }
  }, [sessionLoading, sessionState, viewport]);

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
  }, [addRecentPrompt, updateForgeState, viewport, generateAndSave, soundEnabled, animationsEnabled, updateSession]);

  const handlePanelChange = useCallback(async (panel: 'forge' | 'gallery') => {
    updateSession({ activePanel: panel });
  }, [updateSession]);

  const handleSidebarToggle = useCallback((open: boolean) => {
    updateUIState({ sidebarOpen: open });
  }, [updateUIState]);

  // Show loading screen while session is loading
  if (sessionLoading) {
    return <LoadingScreen viewport={viewport} />;
  }

  return (
    <div 
      ref={mainRef}
      className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 relative overflow-hidden"
      style={{
        '--panel-width': layoutConfig.panelWidth,
        '--canvas-height': layoutConfig.canvasHeight,
        '--header-height': layoutConfig.headerHeight,
      } as React.CSSProperties}
    >
      <MainLayout
        layoutConfig={layoutConfig}
        animationConfig={animationConfig}
        activePanel={activePanel}
        sidebarOpen={sidebarOpen}
        animationsEnabled={animationsEnabled}
        currentImage={currentImage}
        isGenerating={isGenerating}
        images={images}
        stats={stats}
        hasUnsavedChanges={hasUnsavedChanges}
        gestureStateMachine={gestureStateMachine}
        onPanelChange={handlePanelChange}
        onSidebarToggle={handleSidebarToggle}
        onGenerate={handleGenerate}
      />
    </div>
  );
};

export default Index;
