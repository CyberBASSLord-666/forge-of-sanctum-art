
import React, { useRef } from 'react';
import { LoadingScreen } from '@/components/ui/loading-screen';
import { MainLayout } from '@/components/layout/MainLayout';
import { useIndexLogic } from '@/hooks/useIndexLogic';
import { useIndexHandlers } from '@/hooks/useIndexHandlers';
import { useIndexEffects } from '@/hooks/useIndexEffects';

export const IndexPageContent: React.FC = () => {
  const mainRef = useRef<HTMLDivElement>(null);
  
  const {
    currentImage,
    setCurrentImage,
    layoutConfig,
    animationConfig,
    viewport,
    images,
    isGenerating,
    generateAndSave,
    stats,
    sessionLoading,
    hasUnsavedChanges,
    updateSession,
    updateForgeState,
    updateUIState,
    addRecentPrompt,
    activePanel,
    sidebarOpen,
    animationsEnabled,
    soundEnabled,
    gestureStateMachine,
  } = useIndexLogic();

  const {
    handleGenerate,
    handlePanelChange,
    handleSidebarToggle,
  } = useIndexHandlers({
    addRecentPrompt,
    updateForgeState,
    viewport,
    generateAndSave,
    setCurrentImage,
    soundEnabled,
    animationsEnabled,
    updateSession,
    updateUIState,
  });

  useIndexEffects({
    sessionLoading,
    sessionState: { lastUpdated: new Date() }, // simplified for this refactor
    viewport,
    activePanel,
    gestureStateMachine,
    handlePanelChange,
    handleSidebarToggle,
    mainRef,
  });

  // Show loading screen while session is loading
  if (sessionLoading) {
    return <LoadingScreen viewport={viewport} />;
  }

  return (
    <div 
      ref={mainRef}
      className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 relative overflow-hidden"
      style={{
        '--panel-width': layoutConfig.panelWidth,
        '--canvas-height': layoutConfig.canvasHeight,
        '--header-height': layoutConfig.headerHeight,
      } as React.CSSProperties}
    >
      <MainLayout
        layoutConfig={layoutConfig}
        animationConfig={animationConfig}
        activePanel={activePanel}
        sidebarOpen={sidebarOpen}
        animationsEnabled={animationsEnabled}
        currentImage={currentImage}
        isGenerating={isGenerating}
        images={images}
        stats={stats}
        hasUnsavedChanges={hasUnsavedChanges}
        gestureStateMachine={gestureStateMachine}
        onPanelChange={handlePanelChange}
        onSidebarToggle={handleSidebarToggle}
        onGenerate={handleGenerate}
      />
    </div>
  );
};
