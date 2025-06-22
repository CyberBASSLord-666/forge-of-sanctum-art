
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

const Index = () => {
  const [currentImage, setCurrentImage] = useState<string>();
  const mainRef = useRef<HTMLDivElement>(null);
  
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

  // Performance monitoring
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

  // Session state management
  const activePanel = sessionState?.activePanel || 'forge';
  const sidebarOpen = sessionState?.uiState.sidebarOpen || false;
  const animationsEnabled = sessionState?.uiState.animationsEnabled ?? true;
  const soundEnabled = sessionState?.uiState.soundEnabled ?? true;

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

  // Welcome message with enhanced timing
  useEffect(() => {
    if (!sessionLoading && sessionState && viewport) {
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
    }
  }, [sessionLoading, sessionState, viewport]);

  const handleGenerate = async (prompt: string, parameters: any) => {
    try {
      addRecentPrompt(prompt);
      updateForgeState({ prompt, ...parameters });
      
      // Enhanced generation with device-specific optimizations
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
  };

  const handlePanelChange = async (panel: 'forge' | 'gallery') => {
    updateSession({ activePanel: panel });
  };

  const handleSidebarToggle = (open: boolean) => {
    updateUIState({ sidebarOpen: open });
  };

  // Loading state with device-specific optimization
  if (sessionLoading) {
    const loadingIntensity = viewport?.deviceType === 'mobile' ? 'medium' : 'immersive';
    
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <EnhancedLiquidGlass intensity={loadingIntensity} className="p-8">
          <div className="text-center space-y-4">
            <div className="relative">
              <div className="w-16 h-16 border-4 border-purple-500/30 border-t-purple-500 rounded-full animate-spin mx-auto" />
              {viewport?.deviceType !== 'mobile' && (
                <div className="absolute inset-2 w-12 h-12 border-4 border-blue-500/20 border-b-blue-500 rounded-full animate-spin mx-auto" style={{ animationDirection: 'reverse' }} />
              )}
            </div>
            <div className="space-y-2">
              <h3 className="text-xl font-semibold text-white">Awakening the Forge</h3>
              <p className="text-white/60">
                Calibrating {viewport?.deviceType || 'your'} creative sanctuary
                {viewport && ` (${viewport.width}×${viewport.height})`}...
              </p>
            </div>
          </div>
        </EnhancedLiquidGlass>
      </div>
    );
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
