
import React from 'react';
import { Settings2 } from 'lucide-react';
import { Slider } from '@/components/ui/slider';
import { Badge } from '@/components/ui/badge';

interface AdvancedParametersProps {
  showAdvanced: boolean;
  onToggleAdvanced: () => void;
  steps: number[];
  onStepsChange: (steps: number[]) => void;
  guidance: number[];
  onGuidanceChange: (guidance: number[]) => void;
}

export const AdvancedParameters = ({
  showAdvanced,
  onToggleAdvanced,
  steps,
  onStepsChange,
  guidance,
  onGuidanceChange,
}: AdvancedParametersProps) => {
  return (
    <div className="space-y-4">
      <div 
        className="flex items-center justify-between cursor-pointer"
        onClick={onToggleAdvanced}
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
              onValueChange={onStepsChange}
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
              onValueChange={onGuidanceChange}
              min={1}
              max={20}
              step={0.5}
              className="w-full"
            />
            <p className="text-xs text-white/50">Higher values = closer to prompt, lower = more creative freedom</p>
          </div>
        </div>
      )}
    </div>
  );
};
