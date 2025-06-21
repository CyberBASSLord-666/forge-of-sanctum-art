
import React from 'react';
import { Sparkles, Brain } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';

interface PromptInputProps {
  prompt: string;
  onPromptChange: (prompt: string) => void;
  onEnhance: () => void;
  isEnhancing: boolean;
  suggestions: string[];
}

export const PromptInput = ({ 
  prompt, 
  onPromptChange, 
  onEnhance, 
  isEnhancing, 
  suggestions 
}: PromptInputProps) => {
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <label className="text-sm font-medium text-white/80 flex items-center">
          <Sparkles className="w-4 h-4 mr-2 text-purple-400" />
          Creative Vision
        </label>
        <Button
          size="sm"
          variant="outline"
          onClick={onEnhance}
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
        onChange={(e) => onPromptChange(e.target.value)}
        className="min-h-24 bg-white/5 border-white/20 text-white placeholder:text-white/40 resize-none focus:ring-purple-500/50"
      />
      
      {suggestions.length > 0 && (
        <div className="flex flex-wrap gap-2 mt-2">
          {suggestions.map((suggestion, index) => (
            <Badge
              key={index}
              variant="outline"
              className="bg-purple-500/10 border-purple-500/30 text-purple-200 cursor-pointer hover:bg-purple-500/20"
              onClick={() => onPromptChange(prev => `${prev}, ${suggestion.toLowerCase()}`)}
            >
              {suggestion}
            </Badge>
          ))}
        </div>
      )}
    </div>
  );
};
