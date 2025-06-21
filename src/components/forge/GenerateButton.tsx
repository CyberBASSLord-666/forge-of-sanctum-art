
import React from 'react';
import { Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface GenerateButtonProps {
  onGenerate: () => void;
  disabled: boolean;
  isGenerating: boolean;
}

export const GenerateButton = ({ onGenerate, disabled, isGenerating }: GenerateButtonProps) => {
  return (
    <Button
      onClick={onGenerate}
      disabled={disabled}
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
  );
};
