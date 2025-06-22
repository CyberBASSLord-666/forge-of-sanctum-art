
import React from 'react';
import { StandardHeader } from '@/components/navigation/StandardHeader';
import { StandardSidebar } from '@/components/navigation/StandardSidebar';
import { StandardImageViewer } from '@/components/viewer/StandardImageViewer';
import { AdvancedForgePanel } from '@/components/AdvancedForgePanel';
import { Gallery } from '@/components/Gallery';
import { standardAnimations } from '@/lib/animations/standard-animations';

interface StandardLayoutProps {
  activeTab: 'forge' | 'gallery';
  sidebarOpen: boolean;
  currentImage?: string;
  isGenerating: boolean;
  images: any[];
  onTabChange: (tab: 'forge' | 'gallery') => void;
  onSidebarToggle: (open: boolean) => void;
  onGenerate: (prompt: string, parameters: any) => Promise<void>;
}

export const StandardLayout: React.FC<StandardLayoutProps> = ({
  activeTab,
  sidebarOpen,
  currentImage,
  isGenerating,
  images,
  onTabChange,
  onSidebarToggle,
  onGenerate,
}) => {
  return (
    <div className="min-h-screen bg-gray-50">
      <StandardHeader 
        activeTab={activeTab}
        onTabChange={onTabChange}
        onMenuToggle={() => onSidebarToggle(!sidebarOpen)}
        menuOpen={sidebarOpen}
      />
      
      <div className="flex h-[calc(100vh-4rem)]">
        <StandardSidebar 
          isOpen={sidebarOpen}
          onClose={() => onSidebarToggle(false)}
          activeTab={activeTab}
          onTabChange={onTabChange}
        />
        
        <main className="flex-1 flex overflow-hidden">
          {/* Left Panel */}
          <div className={`w-80 border-r bg-white overflow-y-auto ${standardAnimations.slideInFromLeft}`}>
            {activeTab === 'forge' ? (
              <AdvancedForgePanel 
                onGenerate={onGenerate}
                isGenerating={isGenerating}
              />
            ) : (
              <Gallery 
                images={images}
                loading={false}
              />
            )}
          </div>
          
          {/* Main Content */}
          <div className={`flex-1 p-8 overflow-auto ${standardAnimations.fadeIn}`}>
            <StandardImageViewer 
              currentImage={currentImage}
              isGenerating={isGenerating}
            />
          </div>
        </main>
      </div>
    </div>
  );
};
