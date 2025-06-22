
import React, { useRef } from 'react';
import { Header } from '@/components/Header';
import { AdvancedForgePanel } from '@/components/AdvancedForgePanel';
import { Canvas } from '@/components/Canvas';
import { Gallery } from '@/components/Gallery';
import { Sidebar } from '@/components/Sidebar';
import { EnhancedLiquidGlass } from '@/components/ui/enhanced-liquid-glass';
import { BackgroundSystem } from './BackgroundSystem';
import { StatusIndicators } from './StatusIndicators';

interface MainLayoutProps {
  layoutConfig: any;
  animationConfig: any;
  activePanel: 'forge' | 'gallery';
  sidebarOpen: boolean;
  animationsEnabled: boolean;
  currentImage?: string;
  isGenerating: boolean;
  images: any[];
  stats: any;
  hasUnsavedChanges: boolean;
  gestureStateMachine: any;
  onPanelChange: (panel: 'forge' | 'gallery') => void;
  onSidebarToggle: (open: boolean) => void;
  onGenerate: (prompt: string, parameters: any) => void;
}

export const MainLayout: React.FC<MainLayoutProps> = ({
  layoutConfig,
  animationConfig,
  activePanel,
  sidebarOpen,
  animationsEnabled,
  currentImage,
  isGenerating,
  images,
  stats,
  hasUnsavedChanges,
  gestureStateMachine,
  onPanelChange,
  onSidebarToggle,
  onGenerate,
}) => {
  const leftPanelRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLDivElement>(null);

  return (
    <>
      {/* Ultra-advanced ambient background system */}
      <BackgroundSystem 
        animationsEnabled={animationsEnabled}
        animationConfig={animationConfig}
      />
      
      <div className="relative z-10 flex flex-col h-screen">
        <Header 
          activePanel={activePanel}
          setActivePanel={onPanelChange}
          sidebarOpen={sidebarOpen}
          setSidebarOpen={onSidebarToggle}
        />
        
        <div className="flex-1 flex overflow-hidden">
          <Sidebar 
            isOpen={sidebarOpen}
            onClose={() => onSidebarToggle(false)}
            activePanel={activePanel}
            setActivePanel={onPanelChange}
          />
          
          <main className="flex-1 flex overflow-hidden">
            {/* Ultra-responsive Left Panel */}
            <div 
              ref={leftPanelRef}
              className="border-r border-white/10 backdrop-blur-xl bg-white/5 overflow-y-auto transition-all duration-300"
              style={{ 
                width: layoutConfig.panelWidth,
                maxWidth: layoutConfig.deviceType === 'mobile' ? '100vw' : '50vw',
              }}
            >
              <EnhancedLiquidGlass 
                intensity={animationConfig.intensity as any}
                className="h-full border-none rounded-none"
                interactive={false}
                animated={animationsEnabled}
                turbulenceScale={layoutConfig.deviceType === 'mobile' ? 0.01 : 0.02}
                shimmerSpeed={animationConfig.duration / 10}
              >
                {activePanel === 'forge' ? (
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
              </EnhancedLiquidGlass>
            </div>
            
            {/* Ultra-responsive Main Canvas Area */}
            <div 
              ref={canvasRef}
              className="flex-1 flex items-center justify-center p-8 relative"
              style={{ minHeight: layoutConfig.canvasHeight }}
            >
              <StatusIndicators
                hasUnsavedChanges={hasUnsavedChanges}
                stats={stats}
                animationConfig={animationConfig}
                gestureStateMachine={gestureStateMachine}
              />
              
              <Canvas 
                currentImage={currentImage}
                isGenerating={isGenerating}
                animationsEnabled={animationsEnabled}
              />
            </div>
          </main>
        </div>
      </div>
    </>
  );
};
