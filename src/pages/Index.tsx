
import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { Header } from '@/components/Header';
import { AdvancedForgePanel } from '@/components/AdvancedForgePanel';
import { Canvas } from '@/components/Canvas';
import { Gallery } from '@/components/Gallery';
import { Sidebar } from '@/components/Sidebar';
import { useEnhancedGallery } from '@/hooks/useEnhancedGallery';
import { useEnhancedSession } from '@/hooks/useEnhancedSession';
import { EnhancedLiquidGlass } from '@/components/ui/enhanced-liquid-glass';
import { useViewport, useResponsiveValue } from '@/lib/responsive/viewport-system';
import { useMotionEngine } from '@/lib/animation/motion-engine';
import { useGestures } from '@/lib/interaction/gesture-system';
import { animationFactory } from '@/lib/animation/animation-factory';
import { performanceMonitor } from '@/lib/animation/performance-monitor';
import { GestureStateMachine } from '@/lib/interaction/gesture-state-machine';
import { toast } from '@/hooks/use-toast';

const Index = () => {
  const [currentImage, setCurrentImage] = useState<string>();
  const mainRef = useRef<HTMLDivElement>(null);
  const leftPanelRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLDivElement>(null);
  
  // Enhanced systems
  const viewport = useViewport();
  const motionEngine = useMotionEngine();
  const gestureStateMachine = useMemo(() => new GestureStateMachine(), []);
  
  // Enhanced hooks
  const { 
    images, 
    isGenerating, 
    generateAndSave,
    searchQuery,
    setSearchQuery,
    selectedFilter,
    setSelectedFilter,
    stats
  } = useEnhancedGallery();
  
  const { 
    sessionState,
    isLoading: sessionLoading,
    hasUnsavedChanges,
    updateSession,
    updateForgeState,
    updateGalleryState,
    updateUIState,
    addRecentPrompt,
  } = useEnhancedSession();

  // Performance monitoring
  useEffect(() => {
    performanceMonitor.startMonitoring();
    
    const unsubscribe = performanceMonitor.subscribe((metrics) => {
      if (!performanceMonitor.isPerformanceGood()) {
        const recommendations = performanceMonitor.getRecommendations();
        console.warn('Performance degradation detected:', recommendations);
        
        // Auto-adjust animation profile based on performance
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

  // Responsive layout configuration with performance optimization
  const layoutConfig = useResponsiveValue({
    mobile: {
      panelWidth: '100vw',
      canvasHeight: '60vh',
      headerHeight: '64px',
      sidebarMode: 'overlay',
      panelPosition: 'bottom',
    },
    tablet: {
      panelWidth: '50vw',
      canvasHeight: '70vh',
      headerHeight: '72px',
      sidebarMode: 'push',
      panelPosition: 'side',
    },
    desktop: {
      panelWidth: '384px',
      canvasHeight: '100vh',
      headerHeight: '80px',
      sidebarMode: 'sidebar',
      panelPosition: 'side',
    },
    ultrawide: {
      panelWidth: '420px',
      canvasHeight: '100vh',
      headerHeight: '88px',
      sidebarMode: 'sidebar',
      panelPosition: 'side',
    },
  }, {
    panelWidth: '384px',
    canvasHeight: '100vh',
    headerHeight: '80px',
    sidebarMode: 'sidebar',
    panelPosition: 'side',
  });

  // Dynamic animation configuration using factory
  const animationConfig = useMemo(() => {
    const deviceCapabilities = animationFactory.getDeviceCapabilities();
    const currentProfile = animationFactory.getCurrentProfile();
    
    return {
      intensity: currentProfile.complexity === 'basic' ? 'subtle' :
                currentProfile.complexity === 'intermediate' ? 'medium' :
                currentProfile.complexity === 'advanced' ? 'strong' : 'immersive',
      duration: currentProfile.duration,
      complexity: currentProfile.complexity,
      particleCount: currentProfile.particleCount
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
      
      if (state.scale > 1.1 && canvasRef.current) {
        const config = animationFactory.createMotionConfig('medium');
        motionEngine.animate(canvasRef.current, { scaleX: 1.05, scaleY: 1.05 }, config);
      } else if (state.scale < 0.9 && canvasRef.current) {
        const config = animationFactory.createMotionConfig('medium');
        motionEngine.animate(canvasRef.current, { scaleX: 0.95, scaleY: 0.95 }, config);
      }
    },
    onDoubleTap: () => {
      gestureStateMachine.transition({ type: 'doubletap' });
      
      if (activePanel === 'forge') {
        console.log('Double tap: Quick generation trigger');
      } else {
        console.log('Double tap: Quick image actions');
      }
    },
    onLongPress: () => {
      gestureStateMachine.transition({ type: 'longpress' });
      console.log('Long press: Context menu');
    },
  }), [activePanel, viewport, motionEngine, gestureStateMachine]);

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

  // Dynamic background effects with performance optimization
  const backgroundEffects = useMemo(() => {
    if (!viewport || !animationsEnabled) return [];
    
    const particleCount = animationConfig.particleCount;
    
    return Array.from({ length: particleCount }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: Math.random() * 3 + 1,
      duration: Math.random() * 4 + 2,
      delay: Math.random() * 3,
    }));
  }, [viewport, animationsEnabled, animationConfig.particleCount]);

  // Enhanced layout transitions with performance monitoring
  const handlePanelTransition = useCallback(async (newPanel: 'forge' | 'gallery') => {
    if (!leftPanelRef.current || !animationsEnabled) return;
    
    const animationStart = performance.now();
    performanceMonitor.updateAnimationCount(1);
    
    const direction = newPanel === 'gallery' ? -1 : 1;
    const config = animationFactory.createMotionConfig('medium');
    
    try {
      await motionEngine.sequence([
        {
          element: leftPanelRef.current,
          config: { ...config, duration: config.duration * 0.5 },
          transform: { translateX: direction * 20, scaleX: 0.98, opacity: 0.7 }
        },
        {
          element: leftPanelRef.current,
          config,
          transform: { translateX: 0, scaleX: 1, opacity: 1 }
        }
      ]);
    } finally {
      performanceMonitor.updateAnimationCount(0);
      console.log(`Panel transition completed in ${performance.now() - animationStart}ms`);
    }
  }, [motionEngine, animationsEnabled]);

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
        
        toast({
          title: `${deviceGreeting} Welcome Back, Master Creator`,
          description: `${daysDiff} day${daysDiff > 1 ? 's' : ''} since your last forging session. Your ${viewport.deviceType} forge awaits your vision.`,
        });
      }
    }
  }, [sessionLoading, sessionState, viewport]);

  const handleGenerate = async (prompt: string, parameters: any) => {
    try {
      addRecentPrompt(prompt);
      updateForgeState({ prompt, ...parameters });
      
      // Enhanced generation with device-specific optimizations
      const deviceCapabilities = animationFactory.getDeviceCapabilities();
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
        
        if (animationsEnabled && canvasRef.current) {
          const config = animationFactory.createMotionConfig('strong');
          await motionEngine.sequence([
            {
              element: canvasRef.current,
              config: { ...config, duration: 100 },
              transform: { scaleX: 1.02, scaleY: 1.02 }
            },
            {
              element: canvasRef.current,
              config: { ...config, easing: 'elasticOut' },
              transform: { scaleX: 1, scaleY: 1 }
            }
          ]);
        }
        
        if (soundEnabled && animationsEnabled) {
          console.log('🔊 Playing generation complete harmony');
        }
        
        updateSession({ activePanel: 'forge' });
      }
    } catch (error) {
      console.error('Advanced generation failed:', error);
      
      if (animationsEnabled && leftPanelRef.current) {
        const config = animationFactory.createMotionConfig('subtle');
        motionEngine.animate(leftPanelRef.current, 
          { translateX: -5, rotateZ: -1 }, 
          { ...config, duration: 100 }
        ).then(() => 
          motionEngine.animate(leftPanelRef.current!, 
            { translateX: 5, rotateZ: 1 }, 
            { ...config, duration: 100 }
          )
        ).then(() =>
          motionEngine.animate(leftPanelRef.current!, 
            { translateX: 0, rotateZ: 0 }, 
            { ...config, duration: 200 }
          )
        );
      }
    }
  };

  const handlePanelChange = async (panel: 'forge' | 'gallery') => {
    await handlePanelTransition(panel);
    updateSession({ activePanel: panel });
  };

  const handleSidebarToggle = (open: boolean) => {
    updateUIState({ sidebarOpen: open });
  };

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
      {/* Ultra-advanced ambient background system */}
      <div className="absolute inset-0">
        {/* Primary gradient with device optimization */}
        <div 
          className="absolute inset-0"
          style={{
            background: viewport?.deviceType === 'mobile' 
              ? 'radial-gradient(ellipse at center, rgba(139, 92, 246, 0.15), rgba(15, 23, 42, 0.8))'
              : 'radial-gradient(ellipse at top, rgba(139, 92, 246, 0.3), rgba(15, 23, 42, 0.5), rgba(0, 0, 0, 0.7))'
          }}
        />
        
        {/* Animated aurora effect - complexity based on device */}
        {animationsEnabled && animationConfig.complexity !== 'basic' && (
          <div className="absolute inset-0 opacity-20">
            <div 
              className="absolute inset-0 bg-gradient-to-r from-purple-500/20 via-blue-500/20 to-purple-500/20"
              style={{
                animation: `aurora ${20 + (viewport?.width || 1920) / 100}s ease-in-out infinite`,
                filter: `blur(${viewport?.deviceType === 'mobile' ? '50px' : '100px'})`,
              }}
            />
          </div>
        )}
        
        {/* Performance-optimized particle system */}
        {animationsEnabled && (
          <div className="absolute inset-0 pointer-events-none">
            {backgroundEffects.map((particle) => (
              <div
                key={particle.id}
                className="absolute rounded-full animate-pulse"
                style={{
                  left: `${particle.x}%`,
                  top: `${particle.y}%`,
                  width: `${particle.size}px`,
                  height: `${particle.size}px`,
                  backgroundColor: particle.id % 3 === 0 ? '#8B5CF6' : 
                                   particle.id % 3 === 1 ? '#3B82F6' : '#A855F7',
                  animationDelay: `${particle.delay}s`,
                  animationDuration: `${particle.duration}s`,
                }}
              />
            ))}
          </div>
        )}
        
        {/* Responsive dot pattern */}
        <div 
          className="absolute inset-0 opacity-30" 
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='${viewport?.deviceType === 'mobile' ? 40 : 60}' height='${viewport?.deviceType === 'mobile' ? 40 : 60}' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%239C92AC' fill-opacity='0.03'%3E%3Ccircle cx='30' cy='30' r='1'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          }}
        />
      </div>
      
      <div className="relative z-10 flex flex-col h-screen">
        <Header 
          activePanel={activePanel}
          setActivePanel={handlePanelChange}
          sidebarOpen={sidebarOpen}
          setSidebarOpen={handleSidebarToggle}
        />
        
        <div className="flex-1 flex overflow-hidden">
          <Sidebar 
            isOpen={sidebarOpen}
            onClose={() => handleSidebarToggle(false)}
            activePanel={activePanel}
            setActivePanel={handlePanelChange}
          />
          
          <main className="flex-1 flex overflow-hidden">
            {/* Ultra-responsive Left Panel */}
            <div 
              ref={leftPanelRef}
              className="border-r border-white/10 backdrop-blur-xl bg-white/5 overflow-y-auto transition-all duration-300"
              style={{ 
                width: layoutConfig.panelWidth,
                maxWidth: viewport?.deviceType === 'mobile' ? '100vw' : '50vw',
              }}
            >
              <EnhancedLiquidGlass 
                intensity={animationConfig.intensity as any}
                className="h-full border-none rounded-none"
                interactive={false}
                animated={animationsEnabled}
                turbulenceScale={viewport?.deviceType === 'mobile' ? 0.01 : 0.02}
                shimmerSpeed={animationConfig.duration / 10}
              >
                {activePanel === 'forge' ? (
                  <AdvancedForgePanel 
                    onGenerate={handleGenerate}
                    isGenerating={isGenerating}
                  />
                ) : (
                  <Gallery 
                    images={images}
                    loading={false}
                  />
                )}
              </EnhancedLiquidGlass>
            </div>
            
            {/* Ultra-responsive Main Canvas Area */}
            <div 
              ref={canvasRef}
              className="flex-1 flex items-center justify-center p-8 relative"
              style={{ minHeight: layoutConfig.canvasHeight }}
            >
              {/* Advanced session status indicator */}
              {hasUnsavedChanges && (
                <div className="absolute top-4 right-4 z-20">
                  <EnhancedLiquidGlass intensity="subtle" className="px-3 py-2">
                    <div className="flex items-center space-x-2 text-sm text-white/70">
                      <div className="w-2 h-2 bg-amber-400 rounded-full animate-pulse" />
                      <span>Quantum-saving...</span>
                    </div>
                  </EnhancedLiquidGlass>
                </div>
              )}
              
              {/* Enhanced stats overlay with device context and performance metrics */}
              {stats.totalImages > 0 && (
                <div className="absolute bottom-4 left-4 z-20">
                  <EnhancedLiquidGlass intensity="subtle" className="px-4 py-2">
                    <div className="text-xs text-white/60 space-y-1">
                      <div>{stats.totalImages} creations forged</div>
                      <div>{stats.favorites} favorites ❤️</div>
                      {viewport && (
                        <div className="text-xs opacity-50">
                          {viewport.deviceType} • {viewport.width}×{viewport.height}
                        </div>
                      )}
                      <div className="text-xs opacity-40">
                        {animationConfig.particleCount} particles • {animationConfig.complexity}
                      </div>
                    </div>
                  </EnhancedLiquidGlass>
                </div>
              )}
              
              {/* Performance metrics for advanced users */}
              {viewport?.deviceType === 'ultrawide' && animationConfig.complexity === 'ultra' && (
                <div className="absolute top-4 left-4 z-20">
                  <EnhancedLiquidGlass intensity="subtle" className="px-3 py-2">
                    <div className="text-xs text-white/60 space-y-1">
                      <div>Profile: {animationConfig.complexity}</div>
                      <div>DPR: {viewport.pixelDensity.toFixed(1)}x</div>
                      <div>Ratio: {viewport.ratio.toFixed(2)}</div>
                      <div>State: {gestureStateMachine.getCurrentState()}</div>
                    </div>
                  </EnhancedLiquidGlass>
                </div>
              )}
              
              <Canvas 
                currentImage={currentImage}
                isGenerating={isGenerating}
                animationsEnabled={animationsEnabled}
              />
            </div>
          </main>
        </div>
      </div>
    </div>
  );
};

export default Index;
