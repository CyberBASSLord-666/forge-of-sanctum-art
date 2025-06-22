import React, { useState } from 'react';
import { Brain, Sliders, Image, Palette } from 'lucide-react';
import { MuseForgeLiquidGlass } from '@/components/ui/museforge-liquid-glass';
import { PromptInput } from './PromptInput';
import { AdvancedParameters } from './AdvancedParameters';
import { GenerateButton } from './GenerateButton';
import { ScrollArea } from '@/components/ui/scroll-area';

interface AnalyticalForgeProps {
  onGenerate: (prompt: string, parameters: any) => Promise<void>;
  isGenerating: boolean;
}

export const AnalyticalForge = ({ onGenerate, isGenerating }: AnalyticalForgeProps) => {
  const [prompt, setPrompt] = useState('');
  const [parameters, setParameters] = useState({
    steps: 30,
    guidance: 7.5,
    seed: '',
  });

  return (
    <ScrollArea className="h-full">
      <div className="p-6 space-y-6">
        {/* Header */}
        <MuseForgeLiquidGlass variant="subtle" className="p-4">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-mf-primary-accent to-mf-secondary-accent flex items-center justify-center">
              <Brain className="w-5 h-5 text-mf-primary-bg" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-mf-text-primary">Analytical Forge</h2>
              <p className="text-sm text-mf-text-secondary">Precision control for professionals</p>
            </div>
          </div>
        </MuseForgeLiquidGlass>

        {/* Prompt Section */}
        <MuseForgeLiquidGlass variant="standard" className="p-6">
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <Palette className="w-4 h-4 text-mf-primary-accent" />
              <h3 className="font-medium text-mf-text-primary">Prompt Engineering</h3>
            </div>
            <PromptInput 
              value={prompt}
              onChange={setPrompt}
              placeholder="Enter your detailed prompt..."
            />
          </div>
        </MuseForgeLiquidGlass>

        {/* Advanced Parameters */}
        <MuseForgeLiquidGlass variant="standard" className="p-6">
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <Sliders className="w-4 h-4 text-mf-primary-accent" />
              <h3 className="font-medium text-mf-text-primary">Advanced Parameters</h3>
            </div>
            <AdvancedParameters 
              parameters={parameters}
              onChange={setParameters}
            />
          </div>
        </MuseForgeLiquidGlass>

        {/* Image-to-Image Section */}
        <MuseForgeLiquidGlass variant="standard" className="p-6">
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <Image className="w-4 h-4 text-mf-primary-accent" />
              <h3 className="font-medium text-mf-text-primary">Image-to-Image</h3>
            </div>
            {/* Image upload and strength controls would go here */}
            <div className="text-sm text-mf-text-secondary">
              Image upload functionality coming soon...
            </div>
          </div>
        </MuseForgeLiquidGlass>

        {/* Generate Button */}
        <GenerateButton 
          onGenerate={() => onGenerate(prompt, parameters)}
          isGenerating={isGenerating}
          disabled={!prompt.trim()}
        />
      </div>
    </ScrollArea>
  );
};
