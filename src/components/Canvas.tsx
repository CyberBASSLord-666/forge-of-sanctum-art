
import { useState, useEffect } from 'react';
import { Sparkles, Download, Heart } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface CanvasProps {
  currentImage?: string;
  isGenerating: boolean;
}

export const Canvas = ({ currentImage, isGenerating }: CanvasProps) => {
  const [showForgeAnimation, setShowForgeAnimation] = useState(false);

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

  return (
    <div className="w-full max-w-2xl mx-auto">
      <div className="relative aspect-square bg-white/5 border border-white/20 rounded-2xl backdrop-blur-sm overflow-hidden">
        {/* Forge Animation */}
        {showForgeAnimation && (
          <div className="absolute inset-0 flex items-center justify-center z-10">
            <div className="text-center space-y-4">
              <div className="relative">
                <div className="w-16 h-16 border-4 border-purple-500/30 border-t-purple-500 rounded-full animate-spin mx-auto" />
                <div className="absolute inset-0 flex items-center justify-center">
                  <Sparkles className="w-6 h-6 text-purple-400 animate-pulse" />
                </div>
              </div>
              <div className="space-y-2">
                <h3 className="text-xl font-semibold text-white">Forging Creation</h3>
                <p className="text-white/60">The muses are weaving your vision...</p>
              </div>
              
              {/* Particle effects */}
              <div className="absolute inset-0 pointer-events-none">
                {[...Array(20)].map((_, i) => (
                  <div
                    key={i}
                    className="absolute w-1 h-1 bg-purple-400 rounded-full animate-ping"
                    style={{
                      left: `${Math.random() * 100}%`,
                      top: `${Math.random() * 100}%`,
                      animationDelay: `${Math.random() * 2}s`,
                      animationDuration: `${1 + Math.random()}s`,
                    }}
                  />
                ))}
              </div>
            </div>
          </div>
        )}
        
        {/* Generated Image */}
        {currentImage && !isGenerating && (
          <div className="relative w-full h-full group">
            <img
              src={currentImage}
              alt="Generated artwork"
              className="w-full h-full object-cover rounded-2xl"
            />
            
            {/* Image Overlay Actions */}
            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center space-x-4">
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
          </div>
        )}
        
        {/* Empty State */}
        {!currentImage && !isGenerating && (
          <div className="flex items-center justify-center h-full text-center">
            <div className="space-y-4">
              <div className="w-24 h-24 rounded-full bg-gradient-to-br from-purple-500/20 to-blue-500/20 flex items-center justify-center mx-auto">
                <Sparkles className="w-12 h-12 text-purple-400" />
              </div>
              <div className="space-y-2">
                <h3 className="text-xl font-semibold text-white">Digital Canvas</h3>
                <p className="text-white/60 max-w-sm">
                  Your AI-generated masterpieces will appear here. Start by describing your vision in the forge panel.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
