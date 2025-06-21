
import { Palette, Sparkles, Menu, Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface HeaderProps {
  activePanel: 'forge' | 'gallery';
  setActivePanel: (panel: 'forge' | 'gallery') => void;
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
}

export const Header = ({ activePanel, setActivePanel, sidebarOpen, setSidebarOpen }: HeaderProps) => {
  return (
    <header className="h-16 border-b border-white/10 backdrop-blur-xl bg-white/5 flex items-center justify-between px-6">
      <div className="flex items-center space-x-4">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="lg:hidden text-white/70 hover:text-white hover:bg-white/10"
        >
          <Menu className="w-5 h-5" />
        </Button>
        
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-500 to-blue-600 flex items-center justify-center">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          <h1 className="text-xl font-bold bg-gradient-to-r from-white to-purple-200 bg-clip-text text-transparent">
            MuseForge
          </h1>
        </div>
      </div>
      
      <nav className="hidden md:flex items-center space-x-1">
        <Button
          variant={activePanel === 'forge' ? 'secondary' : 'ghost'}
          size="sm"
          onClick={() => setActivePanel('forge')}
          className={`${
            activePanel === 'forge'
              ? 'bg-white/10 text-white'
              : 'text-white/70 hover:text-white hover:bg-white/5'
          } transition-all duration-200`}
        >
          <Palette className="w-4 h-4 mr-2" />
          Forge
        </Button>
        <Button
          variant={activePanel === 'gallery' ? 'secondary' : 'ghost'}
          size="sm"
          onClick={() => setActivePanel('gallery')}
          className={`${
            activePanel === 'gallery'
              ? 'bg-white/10 text-white'
              : 'text-white/70 hover:text-white hover:bg-white/5'
          } transition-all duration-200`}
        >
          <Sparkles className="w-4 h-4 mr-2" />
          Gallery
        </Button>
      </nav>
      
      <Button
        variant="ghost"
        size="sm"
        className="text-white/70 hover:text-white hover:bg-white/10"
      >
        <Settings className="w-5 h-5" />
      </Button>
    </header>
  );
};
