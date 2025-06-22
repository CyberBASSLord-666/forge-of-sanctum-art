
import React from 'react';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { X, Palette, Image, Home, Settings, Help } from 'lucide-react';
import { standardAnimations } from '@/lib/animations/standard-animations';

interface StandardSidebarProps {
  isOpen: boolean;
  onClose: () => void;
  activeTab: 'forge' | 'gallery';
  onTabChange: (tab: 'forge' | 'gallery') => void;
}

export const StandardSidebar: React.FC<StandardSidebarProps> = ({
  isOpen,
  onClose,
  activeTab,
  onTabChange
}) => {
  return (
    <>
      {/* Overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 md:hidden"
          onClick={onClose}
        />
      )}
      
      {/* Sidebar */}
      <div className={`
        fixed md:relative top-0 left-0 h-full w-64 z-50
        bg-white border-r shadow-lg
        transform transition-transform duration-300 ease-in-out
        ${isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
      `}>
        <div className="p-4">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-gray-900">Navigation</h2>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className={`md:hidden ${standardAnimations.hoverFade}`}
            >
              <X className="w-4 h-4" />
            </Button>
          </div>

          {/* Main Navigation */}
          <nav className="space-y-2">
            <Button
              variant={activeTab === 'forge' ? 'secondary' : 'ghost'}
              className={`w-full justify-start ${standardAnimations.hoverFade}`}
              onClick={() => {
                onTabChange('forge');
                onClose();
              }}
            >
              <Palette className="w-4 h-4 mr-3" />
              Digital Forge
            </Button>
            
            <Button
              variant={activeTab === 'gallery' ? 'secondary' : 'ghost'}
              className={`w-full justify-start ${standardAnimations.hoverFade}`}
              onClick={() => {
                onTabChange('gallery');
                onClose();
              }}
            >
              <Image className="w-4 h-4 mr-3" />
              Gallery
            </Button>
          </nav>

          <Separator className="my-6" />

          {/* Secondary Navigation */}
          <nav className="space-y-2">
            <Button
              variant="ghost"
              className={`w-full justify-start ${standardAnimations.hoverFade}`}
            >
              <Home className="w-4 h-4 mr-3" />
              Home
            </Button>
            
            <Button
              variant="ghost"
              className={`w-full justify-start ${standardAnimations.hoverFade}`}
            >
              <Settings className="w-4 h-4 mr-3" />
              Settings
            </Button>
            
            <Button
              variant="ghost"
              className={`w-full justify-start ${standardAnimations.hoverFade}`}
            >
              <Help className="w-4 h-4 mr-3" />
              Help
            </Button>
          </nav>
        </div>
      </div>
    </>
  );
};
