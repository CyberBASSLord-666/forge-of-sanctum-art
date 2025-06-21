
import { useEffect, useRef, useCallback } from 'react';
import { useMotionEngine } from '@/lib/animation/motion-engine';
import { animationFactory } from '@/lib/animation/animation-factory';
import { performanceMonitor } from '@/lib/animation/performance-monitor';
import { useViewport } from '@/lib/responsive/viewport-system';

export interface EnhancedAnimationOptions {
  intensity?: 'subtle' | 'medium' | 'strong' | 'immersive';
  respectPerformance?: boolean;
  monitorPerformance?: boolean;
  autoOptimize?: boolean;
}

export const useEnhancedAnimation = (options: EnhancedAnimationOptions = {}) => {
  const motionEngine = useMotionEngine();
  const viewport = useViewport();
  const performanceRef = useRef<{ animationCount: number }>({ animationCount: 0 });
  
  const {
    intensity = 'medium',
    respectPerformance = true,
    monitorPerformance = true,
    autoOptimize = true
  } = options;

  useEffect(() => {
    if (monitorPerformance) {
      performanceMonitor.startMonitoring();
      
      const unsubscribe = performanceMonitor.subscribe((metrics) => {
        if (autoOptimize && !performanceMonitor.isPerformanceGood()) {
          const currentProfile = animationFactory.getCurrentProfile();
          
          // Auto-reduce complexity if performance is poor
          if (metrics.fps < 30 && currentProfile.complexity !== 'basic') {
            animationFactory.updateProfile({
              complexity: 'basic',
              particleCount: Math.max(6, currentProfile.particleCount / 2)
            });
          }
        }
      });

      return () => {
        performanceMonitor.stopMonitoring();
        unsubscribe();
      };
    }
  }, [monitorPerformance, autoOptimize]);

  const animate = useCallback(async (
    element: HTMLElement,
    transform: any,
    customIntensity?: typeof intensity
  ) => {
    const effectiveIntensity = customIntensity || intensity;
    
    // Check performance constraints
    if (respectPerformance && !performanceMonitor.isPerformanceGood()) {
      console.warn('Animation skipped due to performance constraints');
      return;
    }

    performanceRef.current.animationCount++;
    performanceMonitor.updateAnimationCount(performanceRef.current.animationCount);

    try {
      const config = animationFactory.createMotionConfig(effectiveIntensity);
      await motionEngine.animate(element, transform, config);
    } finally {
      performanceRef.current.animationCount--;
      performanceMonitor.updateAnimationCount(performanceRef.current.animationCount);
    }
  }, [motionEngine, intensity, respectPerformance]);

  const spring = useCallback(async (
    element: HTMLElement,
    transform: any,
    stiffness: 'soft' | 'medium' | 'stiff' = 'medium'
  ) => {
    if (respectPerformance && !performanceMonitor.isPerformanceGood()) {
      console.warn('Spring animation skipped due to performance constraints');
      return;
    }

    const config = animationFactory.createSpringConfig(stiffness);
    return motionEngine.spring(element, transform, config);
  }, [motionEngine, respectPerformance]);

  const sequence = useCallback(async (animations: Array<{
    element: HTMLElement;
    transform: any;
    intensity?: typeof intensity;
  }>) => {
    if (respectPerformance && !performanceMonitor.isPerformanceGood()) {
      console.warn('Animation sequence skipped due to performance constraints');
      return;
    }

    const sequenceAnimations = animations.map(({ element, transform, intensity: animIntensity }) => ({
      element,
      transform,
      config: animationFactory.createMotionConfig(animIntensity || intensity)
    }));

    return motionEngine.sequence(sequenceAnimations);
  }, [motionEngine, intensity, respectPerformance]);

  const getDeviceCapabilities = useCallback(() => {
    return animationFactory.getDeviceCapabilities();
  }, []);

  const getCurrentProfile = useCallback(() => {
    return animationFactory.getCurrentProfile();
  }, []);

  const getPerformanceMetrics = useCallback(() => {
    return performanceMonitor.getMetrics();
  }, []);

  const isPerformanceGood = useCallback(() => {
    return performanceMonitor.isPerformanceGood();
  }, []);

  return {
    animate,
    spring,
    sequence,
    getDeviceCapabilities,
    getCurrentProfile,
    getPerformanceMetrics,
    isPerformanceGood,
    viewport,
  };
};
