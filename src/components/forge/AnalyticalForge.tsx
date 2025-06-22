
import React, { useState } from 'react';
import { Brain, Sliders, Image, Palette } from 'lucide-react';
import { MuseForgeLiquidGlass } from '@/components/ui/museforge-liquid-glass';
import { PromptInput } from './PromptInput';
import { AdvancedParameters } from './AdvancedParameters';
import { GenerateButton } from './GenerateButton';
import { ResponsiveContainer } from '../layout/ResponsiveContainer';

interface AnalyticalForgeProps {
  onGenerate: (prompt: string, parameters: any) => Promise<void>;
  isGenerating: boolean;
}

export const AnalyticalForge = ({ onGenerate, isGenerating }: AnalyticalForgeProps) => {
  const [prompt, setPrompt] = useState('');
  const [showAdvanced, setShowAdvanced] = useState(true);
  const [steps, setSteps] = useState([30]);
  const [guidance, setGuidance] = useState([7.5]);

  const handleEnhance = () => {
    // Placeholder for AI enhancement
    console.log('Enhancing prompt...');
  };

  return (
    <ResponsiveContainer maxHeight="calc(100vh - 4rem)" adaptiveSpacing={true}>
      <div className="space-y-6">
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
              prompt={prompt}
              onPromptChange={setPrompt}
              onEnhance={handleEnhance}
              isEnhancing={false}
              suggestions={[]}
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
              showAdvanced={showAdvanced}
              onToggleAdvanced={() => setShowAdvanced(!showAdvanced)}
              steps={steps}
              onStepsChange={setSteps}
              guidance={guidance}
              onGuidanceChange={setGuidance}
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
            <div className="text-sm text-mf-text-secondary">
              Image upload functionality coming soon...
            </div>
          </div>
        </MuseForgeLiquidGlass>

        {/* Generate Button */}
        <GenerateButton 
          onGenerate={() => onGenerate(prompt, { steps: steps[0], guidance: guidance[0] })}
          isGenerating={isGenerating}
          disabled={!prompt.trim()}
        />
      </div>
    </ResponsiveContainer>
  );
};
