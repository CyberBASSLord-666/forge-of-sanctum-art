
import React, { useState, useEffect } from 'react';
import { Header } from '@/components/Header';
import { AdvancedForgePanel } from '@/components/AdvancedForgePanel';
import { Canvas } from '@/components/Canvas';
import { Gallery } from '@/components/Gallery';
import { Sidebar } from '@/components/Sidebar';
import { useGallery, useSessionPersistence } from '@/hooks/useMuseForgeDB';
import { toast } from '@/hooks/use-toast';

const Index = () => {
  const [activePanel, setActivePanel] = useState<'forge' | 'gallery'>('forge');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [currentImage, setCurrentImage] = useState<string>();
  
  const { images, isGenerating, generateAndSave } = useGallery();
  const { isLoading: sessionLoading, saveSession, loadSession } = useSessionPersistence();

  // Load session on mount
  useEffect(() => {
    const initializeSession = async () => {
      const session = await loadSession();
      if (session) {
        setActivePanel(session.activePanel);
        setSidebarOpen(session.uiState.sidebarOpen);
        
        toast({
          title: '🔮 Session Restored',
          description: 'Welcome back to your creative sanctuary',
        });
      }
    };
    
    initializeSession();
  }, [loadSession]);

  // Auto-save session state
  useEffect(() => {
    if (!sessionLoading) {
      const saveCurrentState = () => {
        saveSession({
          activePanel,
          forgeState: {
            prompt: '',
            style: 'photorealistic',
            steps: 30,
            guidance: 7.5,
            showAdvanced: false,
          },
          galleryState: {
            searchQuery: '',
            viewMode: 'grid' as const,
          },
          uiState: {
            sidebarOpen,
            theme: 'dark' as const,
          },
        });
      };

      const timeoutId = setTimeout(saveCurrentState, 1000);
      return () => clearTimeout(timeoutId);
    }
  }, [activePanel, sidebarOpen, sessionLoading, saveSession]);

  const handleGenerate = async (prompt: string, parameters: any) => {
    try {
      const generatedImage = await generateAndSave({
        prompt,
        ...parameters,
      });
      
      if (generatedImage) {
        setCurrentImage(generatedImage.url);
      }
    } catch (error) {
      console.error('Generation failed:', error);
    }
  };

  const backgroundImageStyle = {
    backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%239C92AC' fill-opacity='0.05'%3E%3Ccircle cx='30' cy='30' r='1'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
  };

  return (
    <>
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 relative overflow-hidden">
        {/* Ambient background effects */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-purple-900/20 via-slate-900/40 to-black/60" />
        <div className="absolute inset-0 opacity-40" style={backgroundImageStyle} />
        
        <div className="relative z-10 flex flex-col h-screen">
          <Header 
            activePanel={activePanel}
            setActivePanel={setActivePanel}
            sidebarOpen={sidebarOpen}
            setSidebarOpen={setSidebarOpen}
          />
          
          <div className="flex-1 flex overflow-hidden">
            <Sidebar 
              isOpen={sidebarOpen}
              onClose={() => setSidebarOpen(false)}
              activePanel={activePanel}
              setActivePanel={setActivePanel}
            />
            
            <main className="flex-1 flex overflow-hidden">
              {/* Left Panel */}
              <div className="w-96 border-r border-white/10 backdrop-blur-xl bg-white/5 overflow-y-auto">
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
              </div>
              
              {/* Main Canvas Area */}
              <div className="flex-1 flex items-center justify-center p-8">
                <Canvas 
                  currentImage={currentImage}
                  isGenerating={isGenerating}
                />
              </div>
            </main>
          </div>
        </div>
      </div>
    </>
  );
};

export default Index;
