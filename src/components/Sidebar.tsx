
import { X, Palette, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  activePanel: 'forge' | 'gallery';
  setActivePanel: (panel: 'forge' | 'gallery') => void;
}

export const Sidebar = ({ isOpen, onClose, activePanel, setActivePanel }: SidebarProps) => {
  return (
    <>
      {/* Overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 lg:hidden"
          onClick={onClose}
        />
      )}
      
      {/* Sidebar */}
      <div className={`
        fixed lg:relative top-0 left-0 h-full w-64 z-50
        transform transition-transform duration-300 ease-in-out
        ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        border-r border-white/10 backdrop-blur-xl bg-white/5
        lg:w-20 lg:hover:w-64 lg:transition-all lg:duration-300
      `}>
        <div className="p-4 space-y-2">
          <div className="flex items-center justify-between lg:justify-center">
            <h2 className="text-sm font-medium text-white/70 lg:hidden lg:group-hover:block">
              Navigation
            </h2>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="lg:hidden text-white/70 hover:text-white hover:bg-white/10"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
          
          <nav className="space-y-1">
            <Button
              variant={activePanel === 'forge' ? 'secondary' : 'ghost'}
              className={`w-full justify-start ${
                activePanel === 'forge'
                  ? 'bg-white/10 text-white'
                  : 'text-white/70 hover:text-white hover:bg-white/5'
              }`}
              onClick={() => {
                setActivePanel('forge');
                onClose();
              }}
            >
              <Palette className="w-5 h-5 lg:mr-0 mr-3" />
              <span className="lg:hidden lg:group-hover:inline ml-3">Digital Forge</span>
            </Button>
            
            <Button
              variant={activePanel === 'gallery' ? 'secondary' : 'ghost'}
              className={`w-full justify-start ${
                activePanel === 'gallery'
                  ? 'bg-white/10 text-white'
                  : 'text-white/70 hover:text-white hover:bg-white/5'
              }`}
              onClick={() => {
                setActivePanel('gallery');
                onClose();
              }}
            >
              <Sparkles className="w-5 h-5 lg:mr-0 mr-3" />
              <span className="lg:hidden lg:group-hover:inline ml-3">Sacred Gallery</span>
            </Button>
          </nav>
        </div>
      </div>
    </>
  );
};
