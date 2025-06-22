
import { useState, useEffect, useRef, useCallback } from 'react';
import { Sparkles, Download, Heart, ZoomIn, ZoomOut, RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { EnhancedLiquidGlass } from '@/components/ui/enhanced-liquid-glass';
import { useEnhancedAnimation } from '@/hooks/useEnhancedAnimation';
import { useGestures } from '@/lib/interaction/use-gestures';
import { clamp, throttle } from '@/lib/interaction/gesture-utils';

interface CanvasProps {
  currentImage?: string;
  isGenerating: boolean;
  animationsEnabled?: boolean;
}

interface ViewState {
  zoom: number;
  pan: { x: number; y: number };
  rotation: number;
}

export const Canvas = ({ currentImage, isGenerating, animationsEnabled = true }: CanvasProps) => {
  const [showForgeAnimation, setShowForgeAnimation] = useState(false);
  const [viewState, setViewState] = useState<ViewState>({
    zoom: 1,
    pan: { x: 0, y: 0 },
    rotation: 0,
  });
  const [isDragging, setIsDragging] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  
  // Refs for precise control
  const canvasRef = useRef<HTMLDivElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const lastPointerPos = useRef({ x: 0, y: 0 });
  const animationFrame = useRef<number>(0);
  
  const { animate, spring, physics, getPerformanceMetrics } = useEnhancedAnimation({
    intensity: 'medium',
    respectPerformance: true,
    autoOptimize: true,
    errorRecovery: true,
  });

  // Throttled state updates for performance
  const throttledSetViewState = useCallback(
    throttle((newState: ViewState) => {
      setViewState(newState);
    }, 16), // ~60fps
    []
  );

  // Professional image loading with enhanced animations
  useEffect(() => {
    setShowForgeAnimation(isGenerating);
    
    if (currentImage && !isGenerating && imageRef.current && animationsEnabled) {
      const imageElement = imageRef.current;
      setIsLoading(true);
      
      // Enhanced entrance sequence
      const performEntranceAnimation = async () => {
        try {
          // Phase 1: Initial setup
          imageElement.style.transform = 'scale(0.8) rotateY(15deg) translateZ(-100px)';
          imageElement.style.opacity = '0';
          imageElement.style.filter = 'blur(10px) brightness(0.5)';
          
          // Phase 2: Smooth entrance
          await animate(imageElement, {
            scaleX: 1,
            scaleY: 1,
            rotateY: 0,
            translateZ: 0,
          });
          
          // Phase 3: Clear effects
          imageElement.style.transition = 'opacity 0.4s ease-out, filter 0.4s ease-out';
          requestAnimationFrame(() => {
            imageElement.style.opacity = '1';
            imageElement.style.filter = 'blur(0px) brightness(1)';
          });
          
          // Phase 4: Subtle bounce
          await new Promise(resolve => setTimeout(resolve, 200));
          await spring(imageElement, {
            scaleX: 1.02,
            scaleY: 1.02,
          }, 'soft');
          
          await spring(imageElement, {
            scaleX: 1,
            scaleY: 1,
          }, 'soft');
          
        } catch (error) {
          console.warn('Enhanced entrance animation failed:', error);
        } finally {
          setIsLoading(false);
        }
      };
      
      performEntranceAnimation();
    }
  }, [isGenerating, currentImage, animationsEnabled, animate, spring]);

  // Enhanced gesture handlers
  const gestureHandlers = {
    onPan: useCallback((state: any) => {
      if (!currentImage || !canvasRef.current) return;
      
      const sensitivity = 1 / viewState.zoom;
      const newPan = {
        x: viewState.pan.x + state.deltaX * sensitivity,
        y: viewState.pan.y + state.deltaY * sensitivity,
      };
      
      throttledSetViewState({
        ...viewState,
        pan: newPan,
      });
    }, [currentImage, viewState, throttledSetViewState]),

    onPinch: useCallback((state: any) => {
      if (!currentImage) return;
      
      const newZoom = clamp(viewState.zoom * state.scale, 0.25, 5);
      throttledSetViewState({
        ...viewState,
        zoom: newZoom,
      });
    }, [currentImage, viewState, throttledSetViewState]),

    onRotation: useCallback((state: any) => {
      if (!currentImage) return;
      
      const newRotation = viewState.rotation + state.rotation;
      throttledSetViewState({
        ...viewState,
        rotation: newRotation,
      });
    }, [currentImage, viewState, throttledSetViewState]),

    onDoubleTap: useCallback(async () => {
      if (!currentImage || !imageRef.current) return;
      
      const targetZoom = viewState.zoom > 1 ? 1 : 2;
      const targetPan = targetZoom === 1 ? { x: 0, y: 0 } : viewState.pan;
      
      try {
        await spring(imageRef.current, {
          scaleX: targetZoom,
          scaleY: targetZoom,
          translateX: targetPan.x,
          translateY: targetPan.y,
        }, 'medium');
        
        setViewState({
          zoom: targetZoom,
          pan: targetPan,
          rotation: 0,
        });
      } catch (error) {
        console.warn('Double tap zoom failed:', error);
      }
    }, [currentImage, viewState, spring]),
  };

  // Setup gesture recognition
  useGestures(canvasRef, {
    enablePan: true,
    enablePinch: true,
    enableRotation: false, // Disabled for better UX
    enableDoubleTap: true,
    threshold: {
      pan: 5,
      swipe: 30,
      pinch: 0.05,
      rotation: 10,
    },
  }, gestureHandlers);

  // Enhanced mouse wheel handling
  const handleWheel = useCallback((e: React.WheelEvent) => {
    if (!currentImage || !imageRef.current) return;
    
    e.preventDefault();
    const delta = e.deltaY > 0 ? 0.9 : 1.1;
    const newZoom = clamp(viewState.zoom * delta, 0.25, 5);
    
    setViewState(prev => ({ ...prev, zoom: newZoom }));
    
    // Smooth zoom animation
    if (animationsEnabled) {
      try {
        spring(imageRef.current, {
          scaleX: newZoom,
          scaleY: newZoom,
        }, 'soft').catch(console.warn);
      } catch (error) {
        console.warn('Wheel zoom animation failed:', error);
      }
    }
  }, [currentImage, viewState.zoom, spring, animationsEnabled]);

  // Enhanced control handlers
  const handleZoomIn = useCallback(async () => {
    const newZoom = clamp(viewState.zoom * 1.3, 0.25, 5);
    setViewState(prev => ({ ...prev, zoom: newZoom }));
    
    if (imageRef.current && animationsEnabled) {
      try {
        await spring(imageRef.current, {
          scaleX: newZoom,
          scaleY: newZoom,
        }, 'medium');
      } catch (error) {
        console.warn('Zoom in animation failed:', error);
      }
    }
  }, [viewState.zoom, spring, animationsEnabled]);

  const handleZoomOut = useCallback(async () => {
    const newZoom = clamp(viewState.zoom / 1.3, 0.25, 5);
    setViewState(prev => ({ ...prev, zoom: newZoom }));
    
    if (imageRef.current && animationsEnabled) {
      try {
        await spring(imageRef.current, {
          scaleX: newZoom,
          scaleY: newZoom,
        }, 'medium');
      } catch (error) {
        console.warn('Zoom out animation failed:', error);
      }
    }
  }, [viewState.zoom, spring, animationsEnabled]);

  const handleResetView = useCallback(async () => {
    const targetState = { zoom: 1, pan: { x: 0, y: 0 }, rotation: 0 };
    setViewState(targetState);
    
    if (imageRef.current && animationsEnabled) {
      try {
        await spring(imageRef.current, {
          scaleX: 1,
          scaleY: 1,
          translateX: 0,
          translateY: 0,
          rotateZ: 0,
        }, 'soft');
      } catch (error) {
        console.warn('Reset view animation failed:', error);
      }
    }
  }, [spring, animationsEnabled]);

  const handleDownload = useCallback(async () => {
    if (!currentImage) return;
    
    // Enhanced download button animation
    const button = document.querySelector('[data-download-button]') as HTMLElement;
    if (button && animationsEnabled) {
      try {
        await animate(button, {
          scaleX: 0.92,
          scaleY: 0.92,
        });
        await animate(button, {
          scaleX: 1.05,
          scaleY: 1.05,
        });
        await animate(button, {
          scaleX: 1,
          scaleY: 1,
        });
      } catch (error) {
        console.warn('Download button animation failed:', error);
      }
    }
    
    const link = document.createElement('a');
    link.href = currentImage;
    link.download = `museforge-creation-${Date.now()}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }, [currentImage, animate, animationsEnabled]);

  // Apply transform to image
  useEffect(() => {
    if (!imageRef.current || isLoading) return;
    
    const element = imageRef.current;
    const transform = `
      scale(${viewState.zoom}) 
      translate(${viewState.pan.x / viewState.zoom}px, ${viewState.pan.y / viewState.zoom}px)
      rotate(${viewState.rotation}deg)
      translateZ(0)
    `.replace(/\s+/g, ' ').trim();
    
    element.style.transform = transform;
    element.style.willChange = isDragging ? 'transform' : 'auto';
  }, [viewState, isDragging, isLoading]);

  return (
    <div ref={containerRef} className="w-full max-w-4xl mx-auto relative">
      <EnhancedLiquidGlass 
        intensity="medium" 
        className="aspect-square relative overflow-hidden select-none"
        animated={animationsEnabled}
        interactive={true}
        glowColor="#8B5CF6"
      >
        <div 
          ref={canvasRef}
          className="w-full h-full relative touch-none"
          onWheel={handleWheel}
          style={{ cursor: isDragging ? 'grabbing' : currentImage ? 'grab' : 'default' }}
        >
          {/* Enhanced Forge Animation */}
          {showForgeAnimation && animationsEnabled && (
            <div className="absolute inset-0 flex items-center justify-center z-10">
              <div className="text-center space-y-6">
                <div className="relative">
                  {/* Multi-layered loading spinner */}
                  <div className="w-24 h-24 border-4 border-purple-500/20 border-t-purple-500 rounded-full animate-spin mx-auto" 
                       style={{ animationDuration: '1.2s', animationTimingFunction: 'cubic-bezier(0.4, 0, 0.6, 1)' }} />
                  
                  <div className="absolute inset-2 w-20 h-20 border-4 border-blue-500/20 border-b-blue-500 rounded-full animate-spin mx-auto" 
                       style={{ animationDirection: 'reverse', animationDuration: '1.8s' }} />
                  
                  <div className="absolute inset-4 w-16 h-16 border-2 border-pink-500/30 border-l-pink-500 rounded-full animate-spin mx-auto" 
                       style={{ animationDuration: '2.4s' }} />
                  
                  <div className="absolute inset-0 flex items-center justify-center">
                    <Sparkles className="w-10 h-10 text-purple-400 animate-pulse" 
                              style={{ animationDuration: '0.8s' }} />
                  </div>
                </div>
                
                <div className="space-y-4">
                  <h3 className="text-3xl font-bold text-white bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
                    Forging Your Vision
                  </h3>
                  <p className="text-white/80 max-w-sm leading-relaxed">
                    Advanced neural networks are synthesizing your imagination into extraordinary visual reality...
                  </p>
                </div>
              </div>
            </div>
          )}
          
          {/* Enhanced Image Display */}
          {currentImage && !isGenerating && (
            <div className="relative w-full h-full group">
              <img
                ref={imageRef}
                src={currentImage}
                alt="Generated masterpiece"
                className="w-full h-full object-contain transition-transform duration-100"
                draggable={false}
                style={{
                  transformOrigin: 'center center',
                  imageRendering: viewState.zoom > 2 ? 'pixelated' : 'auto',
                }}
              />
              
              {/* Professional Control Panel */}
              <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-x-2 group-hover:translate-x-0">
                <EnhancedLiquidGlass intensity="strong" className="p-3">
                  <div className="flex flex-col space-y-2">
                    <Button
                      size="sm"
                      onClick={handleZoomIn}
                      className="bg-white/10 backdrop-blur-sm border border-white/20 text-white hover:bg-white/20 hover:scale-105 transition-all duration-200"
                      disabled={viewState.zoom >= 5}
                    >
                      <ZoomIn className="w-4 h-4" />
                    </Button>
                    <Button
                      size="sm"
                      onClick={handleZoomOut}
                      className="bg-white/10 backdrop-blur-sm border border-white/20 text-white hover:bg-white/20 hover:scale-105 transition-all duration-200"
                      disabled={viewState.zoom <= 0.25}
                    >
                      <ZoomOut className="w-4 h-4" />
                    </Button>
                    <Button
                      size="sm"
                      onClick={handleResetView}
                      className="bg-white/10 backdrop-blur-sm border border-white/20 text-white hover:bg-white/20 hover:scale-105 transition-all duration-200"
                    >
                      <RotateCcw className="w-4 h-4" />
                    </Button>
                  </div>
                </EnhancedLiquidGlass>
              </div>
              
              {/* Enhanced Action Panel */}
              <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-all duration-300 translate-y-2 group-hover:translate-y-0">
                <EnhancedLiquidGlass intensity="strong" className="p-4">
                  <div className="flex items-center space-x-4">
                    <Button
                      data-download-button
                      onClick={handleDownload}
                      className="bg-white/10 backdrop-blur-sm border border-white/20 text-white hover:bg-white/20 hover:scale-105 transition-all duration-200"
                    >
                      <Download className="w-4 h-4 mr-2" />
                      Download
                    </Button>
                    <Button
                      className="bg-white/10 backdrop-blur-sm border border-white/20 text-white hover:bg-white/20 hover:scale-105 transition-all duration-200"
                    >
                      <Heart className="w-4 h-4 mr-2" />
                      Favorite
                    </Button>
                  </div>
                </EnhancedLiquidGlass>
              </div>
              
              {/* Professional Status Indicators */}
              <div className="absolute bottom-4 right-4 space-y-2">
                {viewState.zoom !== 1 && (
                  <EnhancedLiquidGlass intensity="subtle" className="px-3 py-2">
                    <span className="text-sm text-white/80 font-medium">
                      {Math.round(viewState.zoom * 100)}%
                    </span>
                  </EnhancedLiquidGlass>
                )}
                
                {(Math.abs(viewState.pan.x) > 5 || Math.abs(viewState.pan.y) > 5) && (
                  <EnhancedLiquidGlass intensity="subtle" className="px-3 py-2">
                    <span className="text-xs text-white/60">
                      Pan: {Math.round(viewState.pan.x)}, {Math.round(viewState.pan.y)}
                    </span>
                  </EnhancedLiquidGlass>
                )}
              </div>
            </div>
          )}
          
          {/* Enhanced Empty State */}
          {!currentImage && !isGenerating && (
            <div className="flex items-center justify-center h-full text-center">
              <div className="space-y-8 max-w-md">
                <div className="relative">
                  <div className="w-40 h-40 rounded-full bg-gradient-to-br from-purple-500/20 via-blue-500/20 to-pink-500/20 flex items-center justify-center mx-auto relative overflow-hidden">
                    <Sparkles className="w-20 h-20 text-purple-400 relative z-10" />
                    
                    {animationsEnabled && (
                      <>
                        <div className="absolute inset-0 border-2 border-purple-500/30 rounded-full animate-spin" 
                             style={{ animationDuration: '15s' }} />
                        <div className="absolute inset-4 border border-blue-500/20 rounded-full animate-spin" 
                             style={{ animationDuration: '10s', animationDirection: 'reverse' }} />
                      </>
                    )}
                  </div>
                </div>
                
                <div className="space-y-4">
                  <h3 className="text-3xl font-bold text-white bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
                    Digital Atelier
                  </h3>
                  <p className="text-white/70 leading-relaxed text-lg">
                    Your professional creative workspace awaits. Craft your vision in the Digital Forge, 
                    and witness AI transform imagination into extraordinary art.
                  </p>
                  <p className="text-white/50 text-sm">
                    🖱️ Mouse: Drag to pan • Wheel to zoom • Double-click to reset<br/>
                    📱 Touch: Pinch to zoom • Drag to pan • Double-tap to reset
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </EnhancedLiquidGlass>
      
      {/* Professional Metadata Panel */}
      {currentImage && (
        <div className="mt-6">
          <EnhancedLiquidGlass intensity="subtle" className="p-4">
            <div className="text-center space-y-2">
              <p className="text-sm text-white/70">
                Professional Image Controls • Zoom: {Math.round(viewState.zoom * 100)}% • High-DPI Ready
              </p>
              <p className="text-xs text-white/50">
                Multi-touch gestures supported • Hardware-accelerated rendering • Enterprise-grade precision
              </p>
            </div>
          </EnhancedLiquidGlass>
        </div>
      )}
    </div>
  );
};
