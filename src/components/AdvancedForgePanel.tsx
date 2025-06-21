
import React, { useState, useCallback } from 'react';
import { Wand2 } from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import { LiquidGlass } from '@/components/ui/liquid-glass';
import { PromptInput } from '@/components/forge/PromptInput';
import { StyleSelector } from '@/components/forge/StyleSelector';
import { AdvancedParameters } from '@/components/forge/AdvancedParameters';
import { GenerateButton } from '@/components/forge/GenerateButton';
import { museForgeAPI } from '@/lib/museforge-api';
import { toast } from '@/hooks/use-toast';

interface AdvancedForgePanelProps {
  onGenerate: (prompt: string, parameters: any) => Promise<void>;
  isGenerating: boolean;
}

export const AdvancedForgePanel = ({ onGenerate, isGenerating }: AdvancedForgePanelProps) => {
  const [prompt, setPrompt] = useState('');
  const [style, setStyle] = useState('photorealistic');
  const [steps, setSteps] = useState([30]);
  const [guidance, setGuidance] = useState([7.5]);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [isEnhancing, setIsEnhancing] = useState(false);
  const [promptSuggestions, setPromptSuggestions] = useState<string[]>([]);

  const handleEnhancePrompt = useCallback(async () => {
    if (!prompt.trim()) return;
    
    setIsEnhancing(true);
    try {
      const assistance = await museForgeAPI.getAssistance({
        type: 'prompt-enhance',
        input: prompt,
        context: { currentStyle: style },
      });
      
      setPrompt(assistance.enhanced);
      setPromptSuggestions(assistance.suggestions || []);
      
      toast({
        title: '✨ Prompt Enhanced',
        description: 'Your creative vision has been amplified',
      });
    } catch (error) {
      console.error('Prompt enhancement failed:', error);
      toast({
        title: '⚠️ Enhancement Failed',
        description: 'Unable to enhance prompt at this time',
        variant: 'destructive',
      });
    } finally {
      setIsEnhancing(false);
    }
  }, [prompt, style]);

  const handleGenerate = useCallback(() => {
    if (!prompt.trim()) return;
    
    onGenerate(prompt, {
      style,
      steps: steps[0],
      guidance: guidance[0],
      width: 512,
      height: 512,
    });
  }, [prompt, style, steps, guidance, onGenerate]);

  return (
    <div className="p-6 space-y-6">
      <div className="space-y-2">
        <h2 className="text-xl font-semibold text-white flex items-center">
          <Wand2 className="w-5 h-5 mr-2 text-purple-400" />
          Digital Forge
        </h2>
        <p className="text-sm text-white/60">
          Co-create with AI to manifest your imagination
        </p>
      </div>

      <LiquidGlass intensity="medium" className="space-y-4 p-4">
        <PromptInput
          prompt={prompt}
          onPromptChange={setPrompt}
          onEnhance={handleEnhancePrompt}
          isEnhancing={isEnhancing}
          suggestions={promptSuggestions}
        />
        
        <StyleSelector
          style={style}
          onStyleChange={setStyle}
        />
      </LiquidGlass>

      <LiquidGlass intensity="subtle" className="space-y-4 p-4">
        <AdvancedParameters
          showAdvanced={showAdvanced}
          onToggleAdvanced={() => setShowAdvanced(!showAdvanced)}
          steps={steps}
          onStepsChange={setSteps}
          guidance={guidance}
          onGuidanceChange={setGuidance}
        />
      </LiquidGlass>

      <Separator className="bg-white/10" />

      <GenerateButton
        onGenerate={handleGenerate}
        disabled={!prompt.trim() || isGenerating}
        isGenerating={isGenerating}
      />
    </div>
  );
};
