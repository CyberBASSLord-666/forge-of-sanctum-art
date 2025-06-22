
import React, { useState, useRef, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { ZoomIn, ZoomOut, RotateCcw, Download, Heart } from 'lucide-react';
import { standardAnimations, GeometricLoader } from '@/lib/animations/standard-animations';

interface StandardImageViewerProps {
  currentImage?: string;
  isGenerating: boolean;
}

export const StandardImageViewer: React.FC<StandardImageViewerProps> = ({
  currentImage,
  isGenerating
}) => {
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const imageRef = useRef<HTMLImageElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const dragStart = useRef({ x: 0, y: 0 });

  const handleZoomIn = useCallback(() => {
    setZoom(prev => Math.min(prev * 1.2, 3));
  }, []);

  const handleZoomOut = useCallback(() => {
    setZoom(prev => Math.max(prev / 1.2, 0.5));
  }, []);

  const handleReset = useCallback(() => {
    setZoom(1);
    setPan({ x: 0, y: 0 });
  }, []);

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    if (!currentImage) return;
    setIsDragging(true);
    dragStart.current = {
      x: e.clientX - pan.x,
      y: e.clientY - pan.y
    };
  }, [currentImage, pan]);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (!isDragging || !currentImage) return;
    setPan({
      x: e.clientX - dragStart.current.x,
      y: e.clientY - dragStart.current.y
    });
  }, [isDragging, currentImage]);

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  const handleWheel = useCallback((e: React.WheelEvent) => {
    if (!currentImage) return;
    e.preventDefault();
    const delta = e.deltaY > 0 ? 0.9 : 1.1;
    setZoom(prev => Math.max(0.5, Math.min(3, prev * delta)));
  }, [currentImage]);

  const handleDownload = useCallback(() => {
    if (!currentImage) return;
    const link = document.createElement('a');
    link.href = currentImage;
    link.download = `museforge-${Date.now()}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }, [currentImage]);

  return (
    <div className="w-full max-w-4xl mx-auto">
      <Card className="relative overflow-hidden">
        <div 
          ref={containerRef}
          className="aspect-square relative bg-gray-50 flex items-center justify-center"
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
          onWheel={handleWheel}
          style={{ cursor: isDragging ? 'grabbing' : currentImage ? 'grab' : 'default' }}
        >
          {/* Loading State */}
          {isGenerating && (
            <div className={`absolute inset-0 flex items-center justify-center bg-white/80 z-10 ${standardAnimations.fadeIn}`}>
              <div className="text-center space-y-4">
                <GeometricLoader />
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Creating Your Image</h3>
                  <p className="text-gray-600">AI is processing your request...</p>
                </div>
              </div>
            </div>
          )}

          {/* Image Display */}
          {currentImage && !isGenerating && (
            <img
              ref={imageRef}
              src={currentImage}
              alt="Generated artwork"
              className={`max-w-full max-h-full object-contain transition-transform duration-100 ${standardAnimations.fadeIn}`}
              style={{
                transform: `scale(${zoom}) translate(${pan.x / zoom}px, ${pan.y / zoom}px)`,
                transformOrigin: 'center center'
              }}
              draggable={false}
            />
          )}

          {/* Empty State */}
          {!currentImage && !isGenerating && (
            <div className={`text-center space-y-4 ${standardAnimations.fadeIn}`}>
              <div className="w-24 h-24 bg-gray-200 rounded-full flex items-center justify-center mx-auto">
                <div className="w-12 h-12 bg-gray-300 rounded-lg"></div>
              </div>
              <div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Canvas Ready</h3>
                <p className="text-gray-600">Use the Forge to create your first image</p>
              </div>
            </div>
          )}

          {/* Controls */}
          {currentImage && (
            <div className={`absolute top-4 right-4 space-y-2 ${standardAnimations.slideInFromRight}`}>
              <div className="bg-white/90 backdrop-blur-sm rounded-lg p-2 shadow-lg">
                <div className="flex flex-col space-y-1">
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={handleZoomIn}
                    disabled={zoom >= 3}
                    className={standardAnimations.hoverScale}
                  >
                    <ZoomIn className="w-4 h-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={handleZoomOut}
                    disabled={zoom <= 0.5}
                    className={standardAnimations.hoverScale}
                  >
                    <ZoomOut className="w-4 h-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={handleReset}
                    className={standardAnimations.hoverScale}
                  >
                    <RotateCcw className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </div>
          )}

          {/* Action Bar */}
          {currentImage && (
            <div className={`absolute bottom-4 left-1/2 transform -translate-x-1/2 ${standardAnimations.slideInFromBottom}`}>
              <div className="bg-white/90 backdrop-blur-sm rounded-lg p-3 shadow-lg">
                <div className="flex items-center space-x-3">
                  <Button
                    onClick={handleDownload}
                    className={standardAnimations.hoverLift}
                  >
                    <Download className="w-4 h-4 mr-2" />
                    Download
                  </Button>
                  <Button
                    variant="outline"
                    className={standardAnimations.hoverLift}
                  >
                    <Heart className="w-4 h-4 mr-2" />
                    Save
                  </Button>
                </div>
              </div>
            </div>
          )}

          {/* Zoom Indicator */}
          {currentImage && zoom !== 1 && (
            <div className={`absolute bottom-4 right-4 ${standardAnimations.fadeIn}`}>
              <div className="bg-white/90 backdrop-blur-sm rounded-lg px-3 py-2 shadow-lg">
                <span className="text-sm font-medium text-gray-700">
                  {Math.round(zoom * 100)}%
                </span>
              </div>
            </div>
          )}
        </div>
      </Card>
    </div>
  );
};
