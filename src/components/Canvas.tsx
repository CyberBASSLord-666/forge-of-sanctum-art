
import { useState, useEffect, useRef } from 'react';
import { Sparkles, Download, Heart, ZoomIn, ZoomOut, RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { EnhancedLiquidGlass } from '@/components/ui/enhanced-liquid-glass';

interface CanvasProps {
  currentImage?: string;
  isGenerating: boolean;
  animationsEnabled?: boolean;
}

export const Canvas = ({ currentImage, isGenerating, animationsEnabled = true }: CanvasProps) => {
  const [showForgeAnimation, setShowForgeAnimation] = useState(false);
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const canvasRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setShowForgeAnimation(isGenerating);
  }, [isGenerating]);

  const handleDownload = () => {
    if (!currentImage) return;
    
    const link = document.createElement('a');
    link.href = currentImage;
    link.download = `museforge-creation-${Date.now()}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleZoomIn = () => {
    setZoom(prev => Math.min(prev * 1.2, 3));
  };

  const handleZoomOut = () => {
    setZoom(prev => Math.max(prev / 1.2, 0.5));
  };

  const handleResetView = () => {
    setZoom(1);
    setPan({ x: 0, y: 0 });
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    if (!currentImage) return;
    setIsDragging(true);
    setDragStart({ x: e.clientX - pan.x, y: e.clientY - pan.y });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || !currentImage) return;
    setPan({
      x: e.clientX - dragStart.x,
      y: e.clientY - dragStart.y,
    });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleWheel = (e: React.WheelEvent) => {
    if (!currentImage) return;
    e.preventDefault();
    
    const delta = e.deltaY > 0 ? 0.9 : 1.1;
    setZoom(prev => Math.max(0.5, Math.min(3, prev * delta)));
  };

  return (
    <div className="w-full max-w-4xl mx-auto relative">
      <EnhancedLiquidGlass 
        intensity="medium" 
        className="aspect-square relative overflow-hidden cursor-crosshair"
        animated={animationsEnabled}
        interactive={true}
        glowColor="#8B5CF6"
      >
        <div 
          ref={canvasRef}
          className="w-full h-full relative"
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
          onWheel={handleWheel}
        >
          {/* Enhanced Forge Animation */}
          {showForgeAnimation && animationsEnabled && (
            <div className="absolute inset-0 flex items-center justify-center z-10">
              <div className="text-center space-y-6">
                <div className="relative">
                  {/* Primary spinner */}
                  <div className="w-20 h-20 border-4 border-purple-500/20 border-t-purple-500 rounded-full animate-spin mx-auto" />
                  
                  {/* Secondary spinner */}
                  <div className="absolute inset-2 w-16 h-16 border-4 border-blue-500/20 border-b-blue-500 rounded-full animate-spin mx-auto" style={{ animationDirection: 'reverse' }} />
                  
                  {/* Core sparkle */}
                  <div className="absolute inset-0 flex items-center justify-center">
                    <Sparkles className="w-8 h-8 text-purple-400 animate-pulse" />
                  </div>
                </div>
                
                <div className="space-y-3">
                  <h3 className="text-2xl font-bold text-white">Forging Your Vision</h3>
                  <p className="text-white/70 max-w-sm">
                    The digital muses are weaving pixels into reality, translating your imagination through layers of neural artistry...
                  </p>
                </div>
                
                {/* Enhanced particle effects */}
                <div className="absolute inset-0 pointer-events-none overflow-hidden">
                  {[...Array(30)].map((_, i) => (
                    <div
                      key={i}
                      className="absolute rounded-full animate-ping"
                      style={{
                        left: `${Math.random() * 100}%`,
                        top: `${Math.random() * 100}%`,
                        width: `${2 + Math.random() * 4}px`,
                        height: `${2 + Math.random() * 4}px`,
                        backgroundColor: i % 3 === 0 ? '#8B5CF6' : i % 3 === 1 ? '#3B82F6' : '#A855F7',
                        animationDelay: `${Math.random() * 3}s`,
                        animationDuration: `${1 + Math.random() * 2}s`,
                      }}
                    />
                  ))}
                </div>
                
                {/* Progress ripples */}
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  {[...Array(3)].map((_, i) => (
                    <div
                      key={i}
                      className="absolute border border-purple-500/30 rounded-full animate-ping"
                      style={{
                        width: `${(i + 1) * 100}px`,
                        height: `${(i + 1) * 100}px`,
                        animationDelay: `${i * 0.5}s`,
                        animationDuration: '2s',
                      }}
                    />
                  ))}
                </div>
              </div>
            </div>
          )}
          
          {/* Generated Image with enhanced controls */}
          {currentImage && !isGenerating && (
            <div className="relative w-full h-full group">
              <img
                src={currentImage}
                alt="Generated masterpiece"
                className="w-full h-full object-contain transition-transform duration-300"
                style={{
                  transform: `scale(${zoom}) translate(${pan.x / zoom}px, ${pan.y / zoom}px)`,
                  cursor: isDragging ? 'grabbing' : 'grab',
                }}
                draggable={false}
              />
              
              {/* Enhanced Image Controls */}
              <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300 space-y-2">
                <EnhancedLiquidGlass intensity="strong" className="p-2">
                  <div className="flex flex-col space-y-2">
                    <Button
                      size="sm"
                      onClick={handleZoomIn}
                      className="bg-white/10 backdrop-blur-sm border border-white/20 text-white hover:bg-white/20"
                    >
                      <ZoomIn className="w-4 h-4" />
                    </Button>
                    <Button
                      size="sm"
                      onClick={handleZoomOut}
                      className="bg-white/10 backdrop-blur-sm border border-white/20 text-white hover:bg-white/20"
                    >
                      <ZoomOut className="w-4 h-4" />
                    </Button>
                    <Button
                      size="sm"
                      onClick={handleResetView}
                      className="bg-white/10 backdrop-blur-sm border border-white/20 text-white hover:bg-white/20"
                    >
                      <RotateCcw className="w-4 h-4" />
                    </Button>
                  </div>
                </EnhancedLiquidGlass>
              </div>
              
              {/* Enhanced Action Overlay */}
              <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <EnhancedLiquidGlass intensity="strong" className="p-3">
                  <div className="flex items-center space-x-3">
                    <Button
                      onClick={handleDownload}
                      className="bg-white/10 backdrop-blur-sm border border-white/20 text-white hover:bg-white/20"
                    >
                      <Download className="w-4 h-4 mr-2" />
                      Download
                    </Button>
                    <Button
                      className="bg-white/10 backdrop-blur-sm border border-white/20 text-white hover:bg-white/20"
                    >
                      <Heart className="w-4 h-4 mr-2" />
                      Favorite
                    </Button>
                  </div>
                </EnhancedLiquidGlass>
              </div>
              
              {/* Zoom indicator */}
              {zoom !== 1 && (
                <div className="absolute bottom-4 right-4">
                  <EnhancedLiquidGlass intensity="subtle" className="px-3 py-1">
                    <span className="text-sm text-white/70">
                      {Math.round(zoom * 100)}%
                    </span>
                  </EnhancedLiquidGlass>
                </div>
              )}
            </div>
          )}
          
          {/* Enhanced Empty State */}
          {!currentImage && !isGenerating && (
            <div className="flex items-center justify-center h-full text-center">
              <div className="space-y-6 max-w-md">
                <div className="relative">
                  <div className="w-32 h-32 rounded-full bg-gradient-to-br from-purple-500/20 to-blue-500/20 flex items-center justify-center mx-auto relative overflow-hidden">
                    <Sparkles className="w-16 h-16 text-purple-400" />
                    
                    {/* Rotating ring */}
                    {animationsEnabled && (
                      <div className="absolute inset-0 border-2 border-purple-500/30 rounded-full animate-spin" style={{ animationDuration: '10s' }} />
                    )}
                  </div>
                </div>
                
                <div className="space-y-3">
                  <h3 className="text-2xl font-bold text-white">Digital Atelier</h3>
                  <p className="text-white/70 leading-relaxed">
                    Your creative sanctuary awaits. Begin by describing your vision in the Digital Forge, 
                    and watch as AI transforms your words into stunning visual masterpieces.
                  </p>
                </div>
                
                {animationsEnabled && (
                  <div className="flex justify-center space-x-2">
                    {[...Array(3)].map((_, i) => (
                      <div
                        key={i}
                        className="w-2 h-2 bg-purple-400 rounded-full animate-bounce"
                        style={{ animationDelay: `${i * 0.2}s` }}
                      />
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </EnhancedLiquidGlass>
      
      {/* Canvas metadata panel */}
      {currentImage && (
        <div className="mt-4">
          <EnhancedLiquidGlass intensity="subtle" className="p-4">
            <div className="text-center">
              <p className="text-sm text-white/60">
                Use mouse wheel to zoom • Click and drag to pan • Hover for controls
              </p>
            </div>
          </EnhancedLiquidGlass>
        </div>
      )}
    </div>
  );
};
