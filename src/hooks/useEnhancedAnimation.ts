import { useEffect, useRef, useCallback } from 'react';
import { enhancedMotionEngine, EnhancedMotionConfig } from '@/lib/animation/enhanced-motion-engine';
import { Transform3D, SpringConfig, PhysicsConfig } from '@/lib/animation/motion-types';
import { useViewport } from '@/lib/responsive/viewport-system';

export interface EnhancedAnimationOptions {
  intensity?: 'subtle' | 'medium' | 'strong' | 'immersive';
  respectPerformance?: boolean;
  monitorPerformance?: boolean;
  autoOptimize?: boolean;
  reducedMotion?: boolean;
  errorRecovery?: boolean;
}

export const useEnhancedAnimation = (options: EnhancedAnimationOptions = {}) => {
  const viewport = useViewport();
  const performanceRef = useRef<{ animationCount: number }>({ animationCount: 0 });
  
  const {
    intensity = 'medium',
    respectPerformance = true,
    monitorPerformance = true,
    autoOptimize = true,
    reducedMotion = false,
    errorRecovery = true
  } = options;

  useEffect(() => {
    // Cleanup on unmount
    return () => {
      enhancedMotionEngine.dispose();
    };
  }, []);

  const animate = useCallback(async (
    element: HTMLElement,
    transform: Transform3D,
    customConfig?: Partial<EnhancedMotionConfig>
  ) => {
    if (!element || !document.body.contains(element)) {
      throw new Error('Invalid or detached element provided to animation');
    }

    const config: EnhancedMotionConfig = {
      duration: getIntensityDuration(intensity),
      easing: getIntensityEasing(intensity),
      priority: getIntensityPriority(intensity),
      gpuAcceleration: true,
      errorRecovery,
      performanceMode: 'balanced',
      reducedMotion: reducedMotion || detectReducedMotionPreference(),
      ...customConfig,
    };

    performanceRef.current.animationCount++;

    try {
      await enhancedMotionEngine.animateElement(element, transform, config);
    } finally {
      performanceRef.current.animationCount--;
    }
  }, [intensity, errorRecovery, reducedMotion]);

  const spring = useCallback(async (
    element: HTMLElement,
    transform: Transform3D,
    stiffness: 'soft' | 'medium' | 'stiff' = 'medium',
    customConfig?: Partial<SpringConfig & EnhancedMotionConfig>
  ) => {
    if (!element || !document.body.contains(element)) {
      throw new Error('Invalid or detached element provided to spring animation');
    }

    const springConfig = getSpringConfig(stiffness);
    const config: SpringConfig & EnhancedMotionConfig = {
      ...springConfig,
      duration: getIntensityDuration(intensity),
      easing: getIntensityEasing(intensity),
      priority: getIntensityPriority(intensity),
      gpuAcceleration: true,
      errorRecovery,
      performanceMode: 'balanced',
      reducedMotion: reducedMotion || detectReducedMotionPreference(),
      ...customConfig,
    };

    return enhancedMotionEngine.createSpringAnimation(element, transform, config);
  }, [intensity, errorRecovery, reducedMotion]);

  const keyframe = useCallback(async (
    element: HTMLElement,
    keyframes: Transform3D[],
    customConfig?: Partial<EnhancedMotionConfig>
  ) => {
    if (!element || !document.body.contains(element)) {
      throw new Error('Invalid or detached element provided to keyframe animation');
    }

    const config: EnhancedMotionConfig = {
      duration: getIntensityDuration(intensity) * 1.5, // Keyframes typically longer
      easing: getIntensityEasing(intensity),
      priority: getIntensityPriority(intensity),
      gpuAcceleration: true,
      errorRecovery,
      performanceMode: 'balanced',
      reducedMotion: reducedMotion || detectReducedMotionPreference(),
      ...customConfig,
    };

    return enhancedMotionEngine.createKeyframeAnimation(element, keyframes, config);
  }, [intensity, errorRecovery, reducedMotion]);

  const physics = useCallback(async (
    element: HTMLElement,
    initialVelocity: { x: number; y: number },
    customConfig?: Partial<PhysicsConfig & EnhancedMotionConfig>
  ) => {
    if (!element || !document.body.contains(element)) {
      throw new Error('Invalid or detached element provided to physics animation');
    }

    const config: PhysicsConfig & EnhancedMotionConfig = {
      gravity: 980,
      friction: 0.1,
      elasticity: 0.7,
      boundaries: {
        top: 0,
        right: viewport?.width || window.innerWidth,
        bottom: viewport?.height || window.innerHeight,
        left: 0,
      },
      duration: getIntensityDuration(intensity),
      easing: getIntensityEasing(intensity),
      priority: getIntensityPriority(intensity),
      gpuAcceleration: true,
      errorRecovery,
      performanceMode: 'balanced',
      reducedMotion: reducedMotion || detectReducedMotionPreference(),
      ...customConfig,
    };

    return enhancedMotionEngine.createPhysicsAnimation(element, initialVelocity, config);
  }, [intensity, errorRecovery, reducedMotion, viewport]);

  const sequence = useCallback(async (animations: Array<{
    element: HTMLElement;
    transform: Transform3D;
    config?: Partial<EnhancedMotionConfig>;
  }>) => {
    const sequenceAnimations = animations.map(({ element, transform, config }) => ({
      element,
      transform,
      config: {
        duration: getIntensityDuration(intensity),
        easing: getIntensityEasing(intensity),
        priority: getIntensityPriority(intensity),
        gpuAcceleration: true,
        errorRecovery,
        performanceMode: 'balanced' as const,
        reducedMotion: reducedMotion || detectReducedMotionPreference(),
        ...config,
      },
    }));

    // Execute animations sequentially
    for (const animation of sequenceAnimations) {
      await enhancedMotionEngine.animateElement(
        animation.element, 
        animation.transform, 
        animation.config
      );
    }
  }, [intensity, errorRecovery, reducedMotion]);

  const parallel = useCallback(async (animations: Array<{
    element: HTMLElement;
    transform: Transform3D;
    config?: Partial<EnhancedMotionConfig>;
  }>) => {
    const promises = animations.map(({ element, transform, config }) =>
      enhancedMotionEngine.animateElement(element, transform, {
        duration: getIntensityDuration(intensity),
        easing: getIntensityEasing(intensity),
        priority: getIntensityPriority(intensity),
        gpuAcceleration: true,
        errorRecovery,
        performanceMode: 'balanced',
        reducedMotion: reducedMotion || detectReducedMotionPreference(),
        ...config,
      })
    );

    return Promise.all(promises);
  }, [intensity, errorRecovery, reducedMotion]);

  const stopAll = useCallback(() => {
    enhancedMotionEngine.stopAllAnimations();
  }, []);

  const getPerformanceMetrics = useCallback(() => {
    return enhancedMotionEngine.getPerformanceMetrics();
  }, []);

  const getActiveAnimationCount = useCallback(() => {
    return enhancedMotionEngine.getActiveAnimationCount();
  }, []);

  return {
    animate,
    spring,
    keyframe,
    physics,
    sequence,
    parallel,
    stopAll,
    getPerformanceMetrics,
    getActiveAnimationCount,
    viewport,
    isReducedMotion: reducedMotion || detectReducedMotionPreference(),
  };
};

// Helper functions
function detectReducedMotionPreference(): boolean {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

function getIntensityDuration(intensity: string): number {
  const durations = {
    subtle: 200,
    medium: 350,
    strong: 500,
    immersive: 750,
  };
  return durations[intensity as keyof typeof durations] || 350;
}

function getIntensityEasing(intensity: string): string {
  const easings = {
    subtle: 'easeOutQuad',
    medium: 'easeOutCubic',
    strong: 'easeOutQuart',
    immersive: 'easeOutElastic',
  };
  return easings[intensity as keyof typeof easings] || 'easeOutCubic';
}

function getIntensityPriority(intensity: string): number {
  const priorities = {
    subtle: 1,
    medium: 3,
    strong: 5,
    immersive: 8,
  };
  return priorities[intensity as keyof typeof priorities] || 3;
}

function getSpringConfig(stiffness: string): SpringConfig {
  const configs = {
    soft: { tension: 120, friction: 14, mass: 1, velocity: 0, precision: 0.01 },
    medium: { tension: 180, friction: 12, mass: 1, velocity: 0, precision: 0.01 },
    stiff: { tension: 300, friction: 10, mass: 1, velocity: 0, precision: 0.01 },
  };
  return configs[stiffness as keyof typeof configs] || configs.medium;
}
