
import { useMemo } from 'react';
import { useViewport } from '@/lib/responsive/viewport-system';

export const useBackgroundEffects = (animationsEnabled: boolean, animationConfig: any) => {
  const viewport = useViewport();

  const backgroundEffects = useMemo(() => {
    if (!viewport || !animationsEnabled) return [];
    
    const particleCount = animationConfig.particleCount;
    
    return Array.from({ length: particleCount }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: Math.random() * 3 + 1,
      duration: Math.random() * 4 + 2,
      delay: Math.random() * 3,
    }));
  }, [viewport, animationsEnabled, animationConfig.particleCount]);

  return { backgroundEffects, viewport };
};
