
import React from 'react';
import { LoadingScreen } from '@/components/ui/loading-screen';
import { StandardLayout } from '@/components/layout/StandardLayout';
import { useIndexLogic } from '@/hooks/useIndexLogic';
import { useIndexHandlers } from '@/hooks/useIndexHandlers';

export const IndexPageContent: React.FC = () => {
  const {
    currentImage,
    setCurrentImage,
    viewport,
    images,
    isGenerating,
    generateAndSave,
    sessionLoading,
    updateForgeState,
    addRecentPrompt,
    updateSession,
    updateUIState,
    activePanel,
    sidebarOpen,
    animationsEnabled,
    soundEnabled,
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

  // Show loading screen while session is loading
  if (sessionLoading) {
    return <LoadingScreen viewport={viewport} />;
  }

  return (
    <StandardLayout
      activeTab={activePanel}
      sidebarOpen={sidebarOpen}
      currentImage={currentImage}
      isGenerating={isGenerating}
      images={images}
      onTabChange={handlePanelChange}
      onSidebarToggle={handleSidebarToggle}
      onGenerate={handleGenerate}
    />
  );
};
