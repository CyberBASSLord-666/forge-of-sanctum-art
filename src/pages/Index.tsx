
import { useState, useEffect } from 'react';
import { Header } from '@/components/Header';
import { ForgePanel } from '@/components/ForgePanel';
import { Canvas } from '@/components/Canvas';
import { Gallery } from '@/components/Gallery';
import { Sidebar } from '@/components/Sidebar';
import { useGallery } from '@/hooks/useGallery';
import { useForge } from '@/hooks/useForge';

const Index = () => {
  const [activePanel, setActivePanel] = useState<'forge' | 'gallery'>('forge');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { images, addImage, loading: galleryLoading } = useGallery();
  const { generateImage, isGenerating, currentImage } = useForge();

  const handleGenerate = async (prompt: string, parameters: any) => {
    try {
      const generatedImage = await generateImage(prompt, parameters);
      if (generatedImage) {
        await addImage(generatedImage);
      }
    } catch (error) {
      console.error('Generation failed:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 relative overflow-hidden">
      {/* Ambient background effects */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-purple-900/20 via-slate-900/40 to-black/60" />
      <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg width="60" height="60" viewBox="0 0 60 60" xmlns="http://www.w3.org/2000/svg"%3E%3Cg fill="none" fill-rule="evenodd"%3E%3Cg fill="%239C92AC" fill-opacity="0.05"%3E%3Ccircle cx="30" cy="30" r="1"/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')] opacity-40" />
      
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
                <ForgePanel 
                  onGenerate={handleGenerate}
                  isGenerating={isGenerating}
                />
              ) : (
                <Gallery 
                  images={images}
                  loading={galleryLoading}
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
  );
};

export default Index;
