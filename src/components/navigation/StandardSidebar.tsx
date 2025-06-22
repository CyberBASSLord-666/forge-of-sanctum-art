
import React from 'react';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { X, Palette, Image, Home, Settings, HelpCircle } from 'lucide-react';
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
          className="fixed inset-0 bg-mf-primary-bg/80 backdrop-blur-sm z-40 md:hidden"
          onClick={onClose}
        />
      )}
      
      {/* Sidebar */}
      <div className={`
        fixed md:relative top-0 left-0 h-full w-64 z-50
        glass-strong shadow-lg
        transform transition-transform duration-300 ease-in-out
        ${isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
      `} style={{ borderColor: 'rgba(166, 153, 255, 0.3)' }}>
        <div className="p-4">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-mf-text-primary">Navigation</h2>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className={`md:hidden text-mf-text-secondary hover:text-mf-text-primary hover:bg-mf-glass-base ${standardAnimations.hoverFade}`}
            >
              <X className="w-4 h-4" />
            </Button>
          </div>

          {/* Main Navigation */}
          <nav className="space-y-2">
            <Button
              variant={activeTab === 'forge' ? 'secondary' : 'ghost'}
              className={`w-full justify-start ${standardAnimations.hoverFade} ${
                activeTab === 'forge' 
                  ? 'bg-mf-primary-gradient text-mf-primary-bg' 
                  : 'text-mf-text-secondary hover:text-mf-text-primary hover:bg-mf-glass-base'
              }`}
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
              className={`w-full justify-start ${standardAnimations.hoverFade} ${
                activeTab === 'gallery' 
                  ? 'bg-mf-primary-gradient text-mf-primary-bg' 
                  : 'text-mf-text-secondary hover:text-mf-text-primary hover:bg-mf-glass-base'
              }`}
              onClick={() => {
                onTabChange('gallery');
                onClose();
              }}
            >
              <Image className="w-4 h-4 mr-3" />
              Gallery
            </Button>
          </nav>

          <Separator className="my-6" style={{ backgroundColor: 'rgba(166, 153, 255, 0.2)' }} />

          {/* Secondary Navigation */}
          <nav className="space-y-2">
            <Button
              variant="ghost"
              className={`w-full justify-start ${standardAnimations.hoverFade} text-mf-text-secondary hover:text-mf-text-primary hover:bg-mf-glass-base`}
            >
              <Home className="w-4 h-4 mr-3" />
              Home
            </Button>
            
            <Button
              variant="ghost"
              className={`w-full justify-start ${standardAnimations.hoverFade} text-mf-text-secondary hover:text-mf-text-primary hover:bg-mf-glass-base`}
            >
              <Settings className="w-4 h-4 mr-3" />
              Settings
            </Button>
            
            <Button
              variant="ghost"
              className={`w-full justify-start ${standardAnimations.hoverFade} text-mf-text-secondary hover:text-mf-text-primary hover:bg-mf-glass-base`}
            >
              <HelpCircle className="w-4 h-4 mr-3" />
              Help
            </Button>
          </nav>
        </div>
      </div>
    </>
  );
};
