
import { useMemo } from 'react';
import { useResponsiveValue, useViewport } from '@/lib/responsive/viewport-system';
import { animationFactory } from '@/lib/animation/animation-factory';

export const useLayoutConfig = () => {
  const viewport = useViewport();

  // Responsive layout configuration with performance optimization
  const layoutConfig = useResponsiveValue({
    mobile: {
      panelWidth: '100vw',
      canvasHeight: '60vh',
      headerHeight: '64px',
      sidebarMode: 'overlay',
      panelPosition: 'bottom',
    },
    tablet: {
      panelWidth: '50vw',
      canvasHeight: '70vh',
      headerHeight: '72px',
      sidebarMode: 'push',
      panelPosition: 'side',
    },
    desktop: {
      panelWidth: '384px',
      canvasHeight: '100vh',
      headerHeight: '80px',
      sidebarMode: 'sidebar',
      panelPosition: 'side',
    },
    ultrawide: {
      panelWidth: '420px',
      canvasHeight: '100vh',
      headerHeight: '88px',
      sidebarMode: 'sidebar',
      panelPosition: 'side',
    },
  }, {
    panelWidth: '384px',
    canvasHeight: '100vh',
    headerHeight: '80px',
    sidebarMode: 'sidebar',
    panelPosition: 'side',
  });

  // Dynamic animation configuration using factory
  const animationConfig = useMemo(() => {
    const deviceCapabilities = animationFactory.getDeviceCapabilities();
    const currentProfile = animationFactory.getCurrentProfile();
    
    return {
      intensity: currentProfile.complexity === 'basic' ? 'subtle' :
                currentProfile.complexity === 'intermediate' ? 'medium' :
                currentProfile.complexity === 'advanced' ? 'strong' : 'immersive',
      duration: currentProfile.duration,
      complexity: currentProfile.complexity,
      particleCount: currentProfile.particleCount
    };
  }, []);

  return { layoutConfig, animationConfig, viewport };
};
