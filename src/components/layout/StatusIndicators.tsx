
import React from 'react';
import { EnhancedLiquidGlass } from '@/components/ui/enhanced-liquid-glass';
import { useViewport } from '@/lib/responsive/viewport-system';

interface StatusIndicatorsProps {
  hasUnsavedChanges: boolean;
  stats: any;
  animationConfig: any;
  gestureStateMachine: any;
}

export const StatusIndicators: React.FC<StatusIndicatorsProps> = ({
  hasUnsavedChanges,
  stats,
  animationConfig,
  gestureStateMachine,
}) => {
  const viewport = useViewport();

  return (
    <>
      {/* Advanced session status indicator */}
      {hasUnsavedChanges && (
        <div className="absolute top-4 right-4 z-20">
          <EnhancedLiquidGlass intensity="subtle" className="px-3 py-2">
            <div className="flex items-center space-x-2 text-sm text-white/70">
              <div className="w-2 h-2 bg-amber-400 rounded-full animate-pulse" />
              <span>Quantum-saving...</span>
            </div>
          </EnhancedLiquidGlass>
        </div>
      )}
      
      {/* Enhanced stats overlay with device context and performance metrics */}
      {stats.totalImages > 0 && (
        <div className="absolute bottom-4 left-4 z-20">
          <EnhancedLiquidGlass intensity="subtle" className="px-4 py-2">
            <div className="text-xs text-white/60 space-y-1">
              <div>{stats.totalImages} creations forged</div>
              <div>{stats.favorites} favorites ❤️</div>
              {viewport && (
                <div className="text-xs opacity-50">
                  {viewport.deviceType} • {viewport.width}×{viewport.height}
                </div>
              )}
              <div className="text-xs opacity-40">
                {animationConfig.particleCount} particles • {animationConfig.complexity}
              </div>
            </div>
          </EnhancedLiquidGlass>
        </div>
      )}
      
      {/* Performance metrics for advanced users */}
      {viewport?.deviceType === 'ultrawide' && animationConfig.complexity === 'ultra' && (
        <div className="absolute top-4 left-4 z-20">
          <EnhancedLiquidGlass intensity="subtle" className="px-3 py-2">
            <div className="text-xs text-white/60 space-y-1">
              <div>Profile: {animationConfig.complexity}</div>
              <div>DPR: {viewport.pixelDensity.toFixed(1)}x</div>
              <div>Ratio: {viewport.ratio.toFixed(2)}</div>
              <div>State: {gestureStateMachine.getCurrentState()}</div>
            </div>
          </EnhancedLiquidGlass>
        </div>
      )}
    </>
  );
};
