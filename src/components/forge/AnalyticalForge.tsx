
import React, { useState } from 'react';
import { Settings2, Eye, Zap } from 'lucide-react';
import { MuseForgeLiquidGlass } from '@/components/ui/museforge-liquid-glass';
import { Slider } from '@/components/ui/slider';

interface AnalyticalForgeProps {
  onGenerate: (prompt: string, parameters: any) => Promise<void>;
  isGenerating: boolean;
}

export const AnalyticalForge = ({ onGenerate, isGenerating }: AnalyticalForgeProps) => {
  const [prompt, setPrompt] = useState('');
  const [steps, setSteps] = useState([30]);
  const [guidance, setGuidance] = useState([7.5]);
  const [seed, setSeed] = useState(['']);
  const [width, setWidth] = useState([512]);
  const [height, setHeight] = useState([512]);

  // Real-time prompt analysis
  const analyzePrompt = (text: string) => {
    const words = text.split(' ').filter(word => word.length > 0);
    const tokens = words.length;
    const quality = tokens > 5 ? 'Good' : tokens > 2 ? 'Fair' : 'Poor';
    
    return {
      tokens,
      quality,
      suggestions: tokens < 5 ? ['Add more descriptive words', 'Include style keywords'] : [],
    };
  };

  const promptAnalysis = analyzePrompt(prompt);

  const handleGenerate = () => {
    if (!prompt.trim()) return;
    
    onGenerate(prompt, {
      steps: steps[0],
      guidance: guidance[0],
      seed: seed[0] || undefined,
      width: width[0],
      height: height[0],
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <MuseForgeLiquidGlass variant="subtle" className="p-4">
        <div className="flex items-center">
          <Settings2 className="w-6 h-6 text-mf-primary-accent mr-3" />
          <div>
            <h2 className="text-lg font-semibold mf-text-gradient">Analytical Forge</h2>
            <p className="text-sm text-mf-text-secondary">Precision control for experts</p>
          </div>
        </div>
      </MuseForgeLiquidGlass>

      {/* Prompt Input with Real-time Analysis */}
      <MuseForgeLiquidGlass className="p-6 space-y-4">
        <div className="space-y-3">
          <label className="block text-sm font-medium text-mf-text-primary">
            Prompt Engineering
          </label>
          <textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="A detailed, technical prompt with specific parameters..."
            className="w-full h-32 bg-white/5 border border-white/20 rounded-lg p-3 text-mf-text-primary placeholder:text-mf-text-tertiary resize-none mf-focus-ring"
          />
        </div>

        {/* Real-time Analysis Panel */}
        <MuseForgeLiquidGlass variant="subtle" className="p-4">
          <div className="flex items-center mb-3">
            <Eye className="w-4 h-4 text-mf-secondary-accent mr-2" />
            <span className="text-sm font-medium text-mf-text-primary">Real-time Analysis</span>
          </div>
          <div className="grid grid-cols-3 gap-4 text-sm">
            <div>
              <span className="text-mf-text-secondary">Tokens:</span>
              <span className="ml-2 text-mf-text-primary font-mono">{promptAnalysis.tokens}</span>
            </div>
            <div>
              <span className="text-mf-text-secondary">Quality:</span>
              <span className={`ml-2 font-medium ${
                promptAnalysis.quality === 'Good' ? 'text-green-400' :
                promptAnalysis.quality === 'Fair' ? 'text-yellow-400' : 'text-red-400'
              }`}>
                {promptAnalysis.quality}
              </span>
            </div>
            <div>
              <span className="text-mf-text-secondary">Structure:</span>
              <span className="ml-2 text-mf-text-primary">Valid</span>
            </div>
          </div>
          {promptAnalysis.suggestions.length > 0 && (
            <div className="mt-3 p-2 bg-yellow-400/10 border border-yellow-400/20 rounded text-xs text-yellow-200">
              Suggestions: {promptAnalysis.suggestions.join(', ')}
            </div>
          )}
        </MuseForgeLiquidGlass>
      </MuseForgeLiquidGlass>

      {/* Advanced Parameters */}
      <MuseForgeLiquidGlass className="p-6 space-y-6">
        <h3 className="text-lg font-semibold text-mf-text-primary flex items-center">
          <Zap className="w-5 h-5 text-mf-secondary-accent mr-2" />
          Generation Parameters
        </h3>

        <div className="grid grid-cols-2 gap-6">
          {/* Steps */}
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <label className="text-sm font-medium text-mf-text-primary">Steps</label>
              <span className="text-sm text-mf-text-secondary font-mono">{steps[0]}</span>
            </div>
            <Slider
              value={steps}
              onValueChange={setSteps}
              min={10}
              max={50}
              step={1}
              className="w-full"
            />
          </div>

          {/* Guidance Scale */}
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <label className="text-sm font-medium text-mf-text-primary">Guidance Scale</label>
              <span className="text-sm text-mf-text-secondary font-mono">{guidance[0]}</span>
            </div>
            <Slider
              value={guidance}
              onValueChange={setGuidance}
              min={1}
              max={20}
              step={0.5}
              className="w-full"
            />
          </div>

          {/* Width */}
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <label className="text-sm font-medium text-mf-text-primary">Width</label>
              <span className="text-sm text-mf-text-secondary font-mono">{width[0]}px</span>
            </div>
            <Slider
              value={width}
              onValueChange={setWidth}
              min={256}
              max={1024}
              step={64}
              className="w-full"
            />
          </div>

          {/* Height */}
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <label className="text-sm font-medium text-mf-text-primary">Height</label>
              <span className="text-sm text-mf-text-secondary font-mono">{height[0]}px</span>
            </div>
            <Slider
              value={height}
              onValueChange={setHeight}
              min={256}
              max={1024}
              step={64}
              className="w-full"
            />
          </div>
        </div>

        {/* Seed */}
        <div className="space-y-3">
          <label className="block text-sm font-medium text-mf-text-primary">
            Seed (optional - for reproducible results)
          </label>
          <input
            type="text"
            value={seed[0]}
            onChange={(e) => setSeed([e.target.value])}
            placeholder="Leave empty for random seed"
            className="w-full bg-white/5 border border-white/20 rounded-lg p-3 text-mf-text-primary placeholder:text-mf-text-tertiary mf-focus-ring"
          />
        </div>
      </MuseForgeLiquidGlass>

      {/* Generate Button */}
      <MuseForgeLiquidGlass variant="immersive" className="p-6">
        <button
          onClick={handleGenerate}
          disabled={!prompt.trim() || isGenerating}
          className="w-full mf-button-primary py-4 text-lg font-bold disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isGenerating ? (
            <>
              <div className="w-5 h-5 border-2 border-mf-primary-bg/30 border-t-mf-primary-bg rounded-full animate-spin mr-3" />
              Processing...
            </>
          ) : (
            <>
              <Settings2 className="w-5 h-5 mr-3" />
              Generate
            </>
          )}
        </button>
      </MuseForgeLiquidGlass>
    </div>
  );
};
