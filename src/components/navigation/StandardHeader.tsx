
import React from 'react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Menu, Settings, Palette, Image, Sparkles } from 'lucide-react';
import { standardAnimations } from '@/lib/animations/standard-animations';

interface StandardHeaderProps {
  activeTab: 'forge' | 'gallery';
  onTabChange: (tab: 'forge' | 'gallery') => void;
  onMenuToggle: () => void;
  menuOpen: boolean;
}

export const StandardHeader: React.FC<StandardHeaderProps> = ({
  activeTab,
  onTabChange,
  onMenuToggle,
  menuOpen
}) => {
  return (
    <header className="h-16 border-b glass-strong shadow-lg" style={{ borderColor: 'rgba(166, 153, 255, 0.3)' }}>
      <div className="flex items-center justify-between h-full px-4 max-w-7xl mx-auto">
        {/* Logo and Brand */}
        <div className="flex items-center space-x-3">
          <Button
            variant="ghost"
            size="sm"
            onClick={onMenuToggle}
            className={`md:hidden text-mf-text-secondary hover:text-mf-text-primary hover:bg-mf-glass-base ${standardAnimations.hoverFade}`}
          >
            <Menu className="w-5 h-5" />
          </Button>
          
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-mf-primary-gradient rounded-lg flex items-center justify-center shadow-lg glow-primary">
              <Sparkles className="w-4 h-4 text-mf-primary-bg" />
            </div>
            <h1 className="text-xl font-bold text-gradient">MuseForge</h1>
          </div>
        </div>

        {/* Navigation Tabs */}
        <Tabs value={activeTab} onValueChange={onTabChange} className="hidden md:block">
          <TabsList className="grid w-full grid-cols-2 bg-mf-glass-base border" style={{ borderColor: 'rgba(166, 153, 255, 0.2)' }}>
            <TabsTrigger 
              value="forge" 
              className={`${standardAnimations.hoverFade} flex items-center space-x-2 text-mf-text-secondary data-[state=active]:text-mf-primary-bg data-[state=active]:bg-mf-primary-gradient`}
            >
              <Palette className="w-4 h-4" />
              <span>Forge</span>
            </TabsTrigger>
            <TabsTrigger 
              value="gallery"
              className={`${standardAnimations.hoverFade} flex items-center space-x-2 text-mf-text-secondary data-[state=active]:text-mf-primary-bg data-[state=active]:bg-mf-primary-gradient`}
            >
              <Image className="w-4 h-4" />
              <span>Gallery</span>
            </TabsTrigger>
          </TabsList>
        </Tabs>

        {/* Settings */}
        <Button 
          variant="ghost" 
          size="sm"
          className={`${standardAnimations.hoverFade} text-mf-text-secondary hover:text-mf-text-primary hover:bg-mf-glass-base focus-ring`}
        >
          <Settings className="w-5 h-5" />
        </Button>
      </div>
    </header>
  );
};
