
import React, { useState, useEffect } from 'react';
import { Header } from '@/components/Header';
import { AdvancedForgePanel } from '@/components/AdvancedForgePanel';
import { Canvas } from '@/components/Canvas';
import { Gallery } from '@/components/Gallery';
import { Sidebar } from '@/components/Sidebar';
import { useEnhancedGallery } from '@/hooks/useEnhancedGallery';
import { useEnhancedSession } from '@/hooks/useEnhancedSession';
import { EnhancedLiquidGlass } from '@/components/ui/enhanced-liquid-glass';
import { toast } from '@/hooks/use-toast';

const Index = () => {
  const [currentImage, setCurrentImage] = useState<string>();
  
  // Enhanced hooks
  const { 
    images, 
    isGenerating, 
    generateAndSave,
    searchQuery,
    setSearchQuery,
    selectedFilter,
    setSelectedFilter,
    stats
  } = useEnhancedGallery();
  
  const { 
    sessionState,
    isLoading: sessionLoading,
    hasUnsavedChanges,
    updateSession,
    updateForgeState,
    updateGalleryState,
    updateUIState,
    addRecentPrompt,
  } = useEnhancedSession();

  // Derived state from session
  const activePanel = sessionState?.activePanel || 'forge';
  const sidebarOpen = sessionState?.uiState.sidebarOpen || false;
  const animationsEnabled = sessionState?.uiState.animationsEnabled ?? true;
  const soundEnabled = sessionState?.uiState.soundEnabled ?? true;

  // Welcome message on session load
  useEffect(() => {
    if (!sessionLoading && sessionState) {
      const now = new Date();
      const lastSession = sessionState.lastUpdated;
      const timeDiff = now.getTime() - lastSession.getTime();
      const daysDiff = Math.floor(timeDiff / (1000 * 60 * 60 * 24));
      
      if (daysDiff > 0) {
        toast({
          title: '🎨 Welcome Back, Creator',
          description: `It's been ${daysDiff} day${daysDiff > 1 ? 's' : ''} since your last session. Ready to forge new creations?`,
        });
      }
    }
  }, [sessionLoading, sessionState]);

  const handleGenerate = async (prompt: string, parameters: any) => {
    try {
      // Add to recent prompts
      addRecentPrompt(prompt);
      
      // Update forge state
      updateForgeState({
        prompt,
        ...parameters,
      });
      
      // Generate image
      const generatedImage = await generateAndSave({
        prompt,
        ...parameters,
      });
      
      if (generatedImage) {
        setCurrentImage(generatedImage.url);
        
        // Play sound effect if enabled
        if (soundEnabled && animationsEnabled) {
          // Web Audio API sound effect would go here
          console.log('🔊 Playing generation complete sound');
        }
        
        // Switch to canvas to show result
        updateSession({ activePanel: 'forge' });
      }
    } catch (error) {
      console.error('Generation failed:', error);
    }
  };

  const handlePanelChange = (panel: 'forge' | 'gallery') => {
    updateSession({ activePanel: panel });
  };

  const handleSidebarToggle = (open: boolean) => {
    updateUIState({ sidebarOpen: open });
  };

  // Ambient background with enhanced parallax
  const backgroundImageStyle = {
    backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%239C92AC' fill-opacity='0.03'%3E%3Ccircle cx='30' cy='30' r='1'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
  };

  if (sessionLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <EnhancedLiquidGlass intensity="immersive" className="p-8">
          <div className="text-center space-y-4">
            <div className="w-16 h-16 border-4 border-purple-500/30 border-t-purple-500 rounded-full animate-spin mx-auto" />
            <div className="space-y-2">
              <h3 className="text-xl font-semibold text-white">Awakening the Muses</h3>
              <p className="text-white/60">Preparing your creative sanctuary...</p>
            </div>
          </div>
        </EnhancedLiquidGlass>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 relative overflow-hidden">
      {/* Enhanced ambient background effects */}
      <div className="absolute inset-0">
        {/* Primary gradient */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-purple-900/30 via-slate-900/50 to-black/70" />
        
        {/* Animated aurora effect */}
        {animationsEnabled && (
          <div className="absolute inset-0 opacity-20">
            <div 
              className="absolute inset-0 bg-gradient-to-r from-purple-500/20 via-blue-500/20 to-purple-500/20"
              style={{
                animation: 'aurora 20s ease-in-out infinite',
                filter: 'blur(100px)',
              }}
            />
          </div>
        )}
        
        {/* Dot pattern */}
        <div className="absolute inset-0 opacity-30" style={backgroundImageStyle} />
        
        {/* Interactive particles */}
        {animationsEnabled && (
          <div className="absolute inset-0 pointer-events-none">
            {[...Array(12)].map((_, i) => (
              <div
                key={i}
                className="absolute w-1 h-1 bg-purple-400/40 rounded-full animate-pulse"
                style={{
                  left: `${Math.random() * 100}%`,
                  top: `${Math.random() * 100}%`,
                  animationDelay: `${Math.random() * 3}s`,
                  animationDuration: `${2 + Math.random() * 2}s`,
                }}
              />
            ))}
          </div>
        )}
      </div>
      
      <div className="relative z-10 flex flex-col h-screen">
        <Header 
          activePanel={activePanel}
          setActivePanel={handlePanelChange}
          sidebarOpen={sidebarOpen}
          setSidebarOpen={handleSidebarToggle}
        />
        
        <div className="flex-1 flex overflow-hidden">
          <Sidebar 
            isOpen={sidebarOpen}
            onClose={() => handleSidebarToggle(false)}
            activePanel={activePanel}
            setActivePanel={handlePanelChange}
          />
          
          <main className="flex-1 flex overflow-hidden">
            {/* Enhanced Left Panel */}
            <div className="w-96 border-r border-white/10 backdrop-blur-xl bg-white/5 overflow-y-auto">
              <EnhancedLiquidGlass 
                intensity="medium" 
                className="h-full border-none rounded-none"
                interactive={false}
              >
                {activePanel === 'forge' ? (
                  <AdvancedForgePanel 
                    onGenerate={handleGenerate}
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
            
            {/* Enhanced Main Canvas Area */}
            <div className="flex-1 flex items-center justify-center p-8 relative">
              {/* Session status indicator */}
              {hasUnsavedChanges && (
                <div className="absolute top-4 right-4 z-20">
                  <EnhancedLiquidGlass intensity="subtle" className="px-3 py-2">
                    <div className="flex items-center space-x-2 text-sm text-white/70">
                      <div className="w-2 h-2 bg-amber-400 rounded-full animate-pulse" />
                      <span>Auto-saving...</span>
                    </div>
                  </EnhancedLiquidGlass>
                </div>
              )}
              
              {/* Stats overlay */}
              {stats.totalImages > 0 && (
                <div className="absolute bottom-4 left-4 z-20">
                  <EnhancedLiquidGlass intensity="subtle" className="px-4 py-2">
                    <div className="text-xs text-white/60 space-y-1">
                      <div>{stats.totalImages} creations forged</div>
                      <div>{stats.favorites} favorites ❤️</div>
                    </div>
                  </EnhancedLiquidGlass>
                </div>
              )}
              
              <Canvas 
                currentImage={currentImage}
                isGenerating={isGenerating}
                animationsEnabled={animationsEnabled}
              />
            </div>
          </main>
        </div>
      </div>
    </div>
  );
};

export default Index;
