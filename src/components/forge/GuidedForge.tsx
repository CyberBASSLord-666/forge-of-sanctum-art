
import React, { useState, useMemo } from 'react';
import { Sparkles, Wand2, Palette, Lightbulb } from 'lucide-react';
import { MuseForgeLiquidGlass } from '@/components/ui/museforge-liquid-glass';
import { StyleSelector } from './StyleSelector';
import { PromptInput } from './PromptInput';
import { GenerateButton } from './GenerateButton';
import { ResponsiveContainer } from '../layout/ResponsiveContainer';

interface GuidedForgeProps {
  onGenerate: (prompt: string, parameters: any) => Promise<void>;
  isGenerating: boolean;
}

export const GuidedForge = ({ onGenerate, isGenerating }: GuidedForgeProps) => {
  const [subject, setSubject] = useState('');
  const [selectedStyle, setSelectedStyle] = useState('photorealistic');
  const defaultParameters = useMemo(() => ({
    num_inference_steps: 30,
    guidance_scale: 7.5,
  }), []);

  const combinedPrompt = useMemo(() => {
    const styleDescription = getStyleDescription(selectedStyle);
    return `${subject}, ${styleDescription}`;
  }, [subject, selectedStyle]);

  const handleEnhance = () => {
    // Placeholder for AI enhancement
    console.log('Enhancing prompt...');
  };

  const getStyleDescription = (style: string) => {
    switch (style) {
      case 'photorealistic':
        return 'in a photorealistic style';
      case 'abstract':
        return 'in an abstract style';
      case 'cyberpunk':
        return 'in a cyberpunk style';
      case 'fantasy':
        return 'in a fantasy style';
      case 'steampunk':
        return 'in a steampunk style';
      case 'impressionism':
        return 'in the style of impressionism';
      case 'popart':
        return 'in the style of pop art';
      case 'renaissance':
        return 'in the style of the Renaissance';
      case 'cartoon':
        return 'as a cartoon';
      case 'sketch':
        return 'as a sketch';
      default:
        return '';
    }
  };

  return (
    <ResponsiveContainer maxHeight="calc(100vh - 4rem)" adaptiveSpacing={true}>
      <div className="space-y-6">
        {/* Header */}
        <MuseForgeLiquidGlass variant="subtle" className="p-4">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-mf-primary-accent to-mf-secondary-accent flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-mf-primary-bg" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-mf-text-primary">Guided Forge</h2>
              <p className="text-sm text-mf-text-secondary">Step-by-step creative assistance</p>
            </div>
          </div>
        </MuseForgeLiquidGlass>

        {/* Subject Input */}
        <MuseForgeLiquidGlass variant="standard" className="p-6">
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <Wand2 className="w-4 h-4 text-mf-primary-accent" />
              <h3 className="font-medium text-mf-text-primary">What do you want to create?</h3>
            </div>
            <PromptInput 
              prompt={subject}
              onPromptChange={setSubject}
              onEnhance={handleEnhance}
              isEnhancing={false}
              suggestions={[]}
            />
          </div>
        </MuseForgeLiquidGlass>

        {/* Style Selection */}
        <MuseForgeLiquidGlass variant="standard" className="p-6">
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <Palette className="w-4 h-4 text-mf-primary-accent" />
              <h3 className="font-medium text-mf-text-primary">Choose Your Style</h3>
            </div>
            <StyleSelector 
              style={selectedStyle}
              onStyleChange={setSelectedStyle}
            />
          </div>
        </MuseForgeLiquidGlass>

        {/* AI Suggestions */}
        <MuseForgeLiquidGlass variant="standard" className="p-6">
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <Lightbulb className="w-4 h-4 text-mf-primary-accent" />
              <h3 className="font-medium text-mf-text-primary">AI Suggestions</h3>
            </div>
            <div className="text-sm text-mf-text-secondary">
              AI-powered suggestions will appear here based on your inputs...
            </div>
          </div>
        </MuseForgeLiquidGlass>

        {/* Generate Button */}
        <GenerateButton 
          onGenerate={() => onGenerate(combinedPrompt, defaultParameters)}
          isGenerating={isGenerating}
          disabled={!subject.trim()}
        />
      </div>
    </ResponsiveContainer>
  );
};
