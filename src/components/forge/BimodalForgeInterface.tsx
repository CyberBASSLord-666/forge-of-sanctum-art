
import React, { useState } from 'react';
import { Wand2, Settings2, Sparkles, Brain } from 'lucide-react';
import { MuseForgeLiquidGlass } from '@/components/ui/museforge-liquid-glass';
import { GuidedForge } from './GuidedForge';
import { AnalyticalForge } from './AnalyticalForge';

type ForgeMode = 'guided' | 'analytical';

interface BimodalForgeInterfaceProps {
  onGenerate: (prompt: string, parameters: any) => Promise<void>;
  isGenerating: boolean;
}

export const BimodalForgeInterface = ({ onGenerate, isGenerating }: BimodalForgeInterfaceProps) => {
  const [mode, setMode] = useState<ForgeMode>('guided');

  return (
    <div className="h-full flex flex-col">
      {/* Mode Selector */}
      <MuseForgeLiquidGlass variant="subtle" className="mb-6 p-1">
        <div className="flex rounded-lg">
          <button
            onClick={() => setMode('guided')}
            className={`
              flex-1 flex items-center justify-center py-3 px-4 rounded-md text-sm font-medium
              transition-all duration-300 mf-focus-ring
              ${mode === 'guided' 
                ? 'bg-gradient-to-r from-mf-primary-accent to-mf-secondary-accent text-mf-primary-bg' 
                : 'text-mf-text-secondary hover:text-mf-text-primary hover:bg-white/5'
              }
            `}
          >
            <Sparkles className="w-4 h-4 mr-2" />
            Guided Forge
          </button>
          <button
            onClick={() => setMode('analytical')}
            className={`
              flex-1 flex items-center justify-center py-3 px-4 rounded-md text-sm font-medium
              transition-all duration-300 mf-focus-ring
              ${mode === 'analytical' 
                ? 'bg-gradient-to-r from-mf-primary-accent to-mf-secondary-accent text-mf-primary-bg' 
                : 'text-mf-text-secondary hover:text-mf-text-primary hover:bg-white/5'
              }
            `}
          >
            <Brain className="w-4 h-4 mr-2" />
            Analytical Forge
          </button>
        </div>
      </MuseForgeLiquidGlass>

      {/* Mode-Specific Interface */}
      <div className="flex-1 overflow-hidden">
        {mode === 'guided' ? (
          <GuidedForge onGenerate={onGenerate} isGenerating={isGenerating} />
        ) : (
          <AnalyticalForge onGenerate={onGenerate} isGenerating={isGenerating} />
        )}
      </div>
    </div>
  );
};
