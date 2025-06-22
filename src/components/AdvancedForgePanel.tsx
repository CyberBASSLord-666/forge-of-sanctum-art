
import React from 'react';
import { BimodalForgeInterface } from './forge/BimodalForgeInterface';

interface AdvancedForgePanelProps {
  onGenerate: (prompt: string, parameters: any) => Promise<void>;
  isGenerating: boolean;
}

export const AdvancedForgePanel = ({ onGenerate, isGenerating }: AdvancedForgePanelProps) => {
  return (
    <div className="h-full p-6">
      <BimodalForgeInterface onGenerate={onGenerate} isGenerating={isGenerating} />
    </div>
  );
};
