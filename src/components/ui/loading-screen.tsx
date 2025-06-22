
import React from 'react';
import { EnhancedLiquidGlass } from './enhanced-liquid-glass';

interface LoadingScreenProps {
  viewport?: {
    deviceType: string;
    width: number;
    height: number;
  } | null;
}

export const LoadingScreen: React.FC<LoadingScreenProps> = ({ viewport }) => {
  const loadingIntensity = viewport?.deviceType === 'mobile' ? 'medium' : 'immersive';
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
      <EnhancedLiquidGlass intensity={loadingIntensity} className="p-8">
        <div className="text-center space-y-4">
          <div className="relative">
            <div className="w-16 h-16 border-4 border-purple-500/30 border-t-purple-500 rounded-full animate-spin mx-auto" />
            {viewport?.deviceType !== 'mobile' && (
              <div className="absolute inset-2 w-12 h-12 border-4 border-blue-500/20 border-b-blue-500 rounded-full animate-spin mx-auto" style={{ animationDirection: 'reverse' }} />
            )}
          </div>
          <div className="space-y-2">
            <h3 className="text-xl font-semibold text-white">Awakening the Forge</h3>
            <p className="text-white/60">
              Calibrating {viewport?.deviceType || 'your'} creative sanctuary
              {viewport && ` (${viewport.width}×${viewport.height})`}...
            </p>
          </div>
        </div>
      </EnhancedLiquidGlass>
    </div>
  );
};
