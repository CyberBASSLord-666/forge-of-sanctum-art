
import React, { useState, useCallback } from 'react';
import { Wand2, Sparkles, Settings2, Brain, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Slider } from '@/components/ui/slider';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { LiquidGlass } from '@/components/ui/liquid-glass';
import { api } from '@/lib/api';
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
      const assistance = await api.getAssistance({
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
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium text-white/80 flex items-center">
              <Sparkles className="w-4 h-4 mr-2 text-purple-400" />
              Creative Vision
            </label>
            <Button
              size="sm"
              variant="outline"
              onClick={handleEnhancePrompt}
              disabled={!prompt.trim() || isEnhancing}
              className="bg-white/5 border-white/20 text-white hover:bg-white/10"
            >
              {isEnhancing ? (
                <>
                  <div className="w-3 h-3 border border-white/30 border-t-white rounded-full animate-spin mr-2" />
                  Enhancing...
                </>
              ) : (
                <>
                  <Brain className="w-3 h-3 mr-2" />
                  Enhance
                </>
              )}
            </Button>
          </div>
          
          <Textarea
            placeholder="Describe your vision... (e.g., 'A mystical forest with glowing crystals, ethereal lighting, fantasy art style')"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            className="min-h-24 bg-white/5 border-white/20 text-white placeholder:text-white/40 resize-none focus:ring-purple-500/50"
          />
          
          {promptSuggestions.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-2">
              {promptSuggestions.map((suggestion, index) => (
                <Badge
                  key={index}
                  variant="outline"
                  className="bg-purple-500/10 border-purple-500/30 text-purple-200 cursor-pointer hover:bg-purple-500/20"
                  onClick={() => setPrompt(prev => `${prev}, ${suggestion.toLowerCase()}`)}
                >
                  {suggestion}
                </Badge>
              ))}
            </div>
          )}
        </div>
        
        <div className="space-y-3">
          <label className="text-sm font-medium text-white/80">Art Style</label>
          <Select value={style} onValueChange={setStyle}>
            <SelectTrigger className="bg-white/5 border-white/20 text-white focus:ring-purple-500/50">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-slate-800 border-white/20">
              <SelectItem value="photorealistic">📷 Photorealistic</SelectItem>
              <SelectItem value="digital-art">🎨 Digital Art</SelectItem>
              <SelectItem value="fantasy">🧙‍♂️ Fantasy</SelectItem>
              <SelectItem value="anime">🌸 Anime</SelectItem>
              <SelectItem value="oil-painting">🖼️ Oil Painting</SelectItem>
              <SelectItem value="watercolor">💧 Watercolor</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </LiquidGlass>

      <LiquidGlass intensity="subtle" className="space-y-4 p-4">
        <div 
          className="flex items-center justify-between cursor-pointer"
          onClick={() => setShowAdvanced(!showAdvanced)}
        >
          <span className="text-sm font-medium text-white/80 flex items-center">
            <Settings2 className="w-4 h-4 mr-2 text-purple-400" />
            Advanced Parameters
          </span>
          <div className="flex items-center space-x-2">
            <Badge variant="outline" className="bg-white/5 border-white/20 text-white/60">
              {showAdvanced ? 'Hide' : 'Show'}
            </Badge>
          </div>
        </div>
        
        {showAdvanced && (
          <div className="space-y-4 pt-2">
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <label className="text-sm font-medium text-white/80">Generation Steps</label>
                <span className="text-sm text-purple-300 font-mono">{steps[0]}</span>
              </div>
              <Slider
                value={steps}
                onValueChange={setSteps}
                min={10}
                max={50}
                step={1}
                className="w-full"
              />
              <p className="text-xs text-white/50">Higher values = more detail, longer generation time</p>
            </div>
            
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <label className="text-sm font-medium text-white/80">Guidance Scale</label>
                <span className="text-sm text-purple-300 font-mono">{guidance[0]}</span>
              </div>
              <Slider
                value={guidance}
                onValueChange={setGuidance}
                min={1}
                max={20}
                step={0.5}
                className="w-full"
              />
              <p className="text-xs text-white/50">Higher values = closer to prompt, lower = more creative freedom</p>
            </div>
          </div>
        )}
      </LiquidGlass>

      <Separator className="bg-white/10" />

      <Button
        onClick={handleGenerate}
        disabled={!prompt.trim() || isGenerating}
        className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-medium py-4 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 text-lg"
      >
        {isGenerating ? (
          <>
            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin mr-3" />
            Forging Creation...
          </>
        ) : (
          <>
            <Zap className="w-5 h-5 mr-3" />
            Begin Forging
          </>
        )}
      </Button>
    </div>
  );
};
