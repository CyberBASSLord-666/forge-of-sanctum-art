
import React from 'react';
import { StandardHeader } from '@/components/navigation/StandardHeader';
import { StandardSidebar } from '@/components/navigation/StandardSidebar';
import { StandardImageViewer } from '@/components/viewer/StandardImageViewer';
import { AdvancedForgePanel } from '@/components/AdvancedForgePanel';
import { Gallery } from '@/components/Gallery';
import { ResponsiveContainer } from './ResponsiveContainer';
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
    <div className="min-h-screen bg-mf-primary-bg">
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
          {/* Infinitely Responsive Left Panel */}
          <div className={`
            adaptive-panel
            w-full sm:w-96 lg:w-80 xl:w-96
            min-w-[280px] max-w-[50vw]
            border-r 
            ${standardAnimations.slideInFromLeft}
          `} 
          style={{ borderColor: 'rgba(166, 153, 255, 0.2)' }}>
            <ResponsiveContainer 
              maxHeight="calc(100vh - 4rem)"
              adaptiveSpacing={true}
            >
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
            </ResponsiveContainer>
          </div>
          
          {/* Infinitely Responsive Main Content */}
          <div className={`
            flex-1 
            adaptive-content
            min-w-0
            ${standardAnimations.fadeIn}
          `}>
            <ResponsiveContainer 
              maxHeight="calc(100vh - 4rem)"
              adaptiveSpacing={true}
            >
              <StandardImageViewer 
                currentImage={currentImage}
                isGenerating={isGenerating}
              />
            </ResponsiveContainer>
          </div>
        </main>
      </div>
    </div>
  );
};
