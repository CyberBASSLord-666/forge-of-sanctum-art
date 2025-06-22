
import React from 'react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Menu, Settings, Home, Image, Palette } from 'lucide-react';
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
    <header className="h-16 border-b bg-white/95 backdrop-blur-sm shadow-sm">
      <div className="flex items-center justify-between h-full px-4 max-w-7xl mx-auto">
        {/* Logo and Brand */}
        <div className="flex items-center space-x-3">
          <Button
            variant="ghost"
            size="sm"
            onClick={onMenuToggle}
            className={`md:hidden ${standardAnimations.hoverFade}`}
          >
            <Menu className="w-5 h-5" />
          </Button>
          
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
              <Palette className="w-4 h-4 text-white" />
            </div>
            <h1 className="text-xl font-bold text-gray-900">MuseForge</h1>
          </div>
        </div>

        {/* Navigation Tabs */}
        <Tabs value={activeTab} onValueChange={onTabChange} className="hidden md:block">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger 
              value="forge" 
              className={`${standardAnimations.hoverFade} flex items-center space-x-2`}
            >
              <Palette className="w-4 h-4" />
              <span>Forge</span>
            </TabsTrigger>
            <TabsTrigger 
              value="gallery"
              className={`${standardAnimations.hoverFade} flex items-center space-x-2`}
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
          className={standardAnimations.hoverFade}
        >
          <Settings className="w-5 h-5" />
        </Button>
      </div>
    </header>
  );
};
