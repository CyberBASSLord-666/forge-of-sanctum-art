
import { useState } from 'react';
import { Wand2, Sparkles, Settings2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Slider } from '@/components/ui/slider';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';

interface ForgePanelProps {
  onGenerate: (prompt: string, parameters: any) => Promise<void>;
  isGenerating: boolean;
}

export const ForgePanel = ({ onGenerate, isGenerating }: ForgePanelProps) => {
  const [prompt, setPrompt] = useState('');
  const [style, setStyle] = useState('photorealistic');
  const [steps, setSteps] = useState([30]);
  const [guidance, setGuidance] = useState([7.5]);
  const [showAdvanced, setShowAdvanced] = useState(false);

  const handleGenerate = () => {
    if (!prompt.trim()) return;
    
    onGenerate(prompt, {
      style,
      steps: steps[0],
      guidance: guidance[0],
    });
  };

  return (
    <div className="p-6 space-y-6">
      <div className="space-y-2">
        <h2 className="text-xl font-semibold text-white flex items-center">
          <Wand2 className="w-5 h-5 mr-2 text-purple-400" />
          Digital Forge
        </h2>
        <p className="text-sm text-white/60">
          Weave your imagination into reality with AI
        </p>
      </div>

      <Card className="bg-white/5 border-white/10 backdrop-blur-sm">
        <CardHeader className="pb-3">
          <CardTitle className="text-white flex items-center text-sm">
            <Sparkles className="w-4 h-4 mr-2 text-purple-400" />
            Creative Vision
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Textarea
            placeholder="Describe your vision... (e.g., 'A mystical forest with glowing crystals, ethereal lighting, fantasy art style')"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            className="min-h-24 bg-white/5 border-white/20 text-white placeholder:text-white/40 resize-none"
          />
          
          <div className="space-y-3">
            <label className="text-sm font-medium text-white/80">Art Style</label>
            <Select value={style} onValueChange={setStyle}>
              <SelectTrigger className="bg-white/5 border-white/20 text-white">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-slate-800 border-white/20">
                <SelectItem value="photorealistic">Photorealistic</SelectItem>
                <SelectItem value="digital-art">Digital Art</SelectItem>
                <SelectItem value="fantasy">Fantasy</SelectItem>
                <SelectItem value="anime">Anime</SelectItem>
                <SelectItem value="oil-painting">Oil Painting</SelectItem>
                <SelectItem value="watercolor">Watercolor</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-white/5 border-white/10 backdrop-blur-sm">
        <CardHeader className="pb-3">
          <CardTitle 
            className="text-white flex items-center justify-between text-sm cursor-pointer"
            onClick={() => setShowAdvanced(!showAdvanced)}
          >
            <span className="flex items-center">
              <Settings2 className="w-4 h-4 mr-2 text-purple-400" />
              Advanced Parameters
            </span>
            <span className="text-xs text-white/60">
              {showAdvanced ? 'Hide' : 'Show'}
            </span>
          </CardTitle>
        </CardHeader>
        {showAdvanced && (
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <label className="text-sm font-medium text-white/80">Steps</label>
                <span className="text-sm text-white/60">{steps[0]}</span>
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
            
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <label className="text-sm font-medium text-white/80">Guidance Scale</label>
                <span className="text-sm text-white/60">{guidance[0]}</span>
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
          </CardContent>
        )}
      </Card>

      <Separator className="bg-white/10" />

      <Button
        onClick={handleGenerate}
        disabled={!prompt.trim() || isGenerating}
        className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-medium py-3 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
      >
        {isGenerating ? (
          <>
            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" />
            Forging Creation...
          </>
        ) : (
          <>
            <Wand2 className="w-4 h-4 mr-2" />
            Begin Forging
          </>
        )}
      </Button>
    </div>
  );
};
