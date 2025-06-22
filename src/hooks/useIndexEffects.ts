
import { useEffect, useMemo } from 'react';
import { performanceMonitor } from '@/lib/animation/performance-monitor';
import { animationFactory } from '@/lib/animation/animation-factory';
import { useGestures } from '@/lib/interaction/gesture-system';
import { toast } from '@/hooks/use-toast';

interface UseIndexEffectsProps {
  sessionLoading: boolean;
  sessionState: any;
  viewport: any;
  activePanel: string;
  gestureStateMachine: any;
  handlePanelChange: (panel: 'forge' | 'gallery') => void;
  handleSidebarToggle: (open: boolean) => void;
  mainRef: React.RefObject<HTMLDivElement>;
}

export const useIndexEffects = ({
  sessionLoading,
  sessionState,
  viewport,
  activePanel,
  gestureStateMachine,
  handlePanelChange,
  handleSidebarToggle,
  mainRef,
}: UseIndexEffectsProps) => {

  // Performance monitoring effect
  useEffect(() => {
    performanceMonitor.startMonitoring();
    
    const unsubscribe = performanceMonitor.subscribe((metrics) => {
      if (!performanceMonitor.isPerformanceGood()) {
        const currentProfile = animationFactory.getCurrentProfile();
        if (metrics.fps < 30) {
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
  }, []);

  // Welcome message effect
  useEffect(() => {
    if (sessionLoading || !sessionState || !viewport) return;
    
    const now = new Date();
    const lastSession = sessionState.lastUpdated;
    const timeDiff = now.getTime() - lastSession.getTime();
    const daysDiff = Math.floor(timeDiff / (1000 * 60 * 60 * 24));
    
    if (daysDiff > 0) {
      const deviceGreeting = viewport.deviceType === 'mobile' ? '📱' :
                            viewport.deviceType === 'tablet' ? '📋' :
                            viewport.deviceType === 'ultrawide' ? '🖥️' : '💻';
      
      const capabilities = animationFactory.getDeviceCapabilities();
      
      toast({
        title: `${deviceGreeting} Welcome Back, Master Creator`,
        description: `${daysDiff} day${daysDiff > 1 ? 's' : ''} since your last forging session. Your ${viewport.deviceType} forge awaits (${capabilities.maxAnimations} concurrent animations, ${capabilities.preferredFPS}fps).`,
      });
    }
  }, [sessionLoading, sessionState, viewport]);

  // Gesture handlers
  const gestureHandlers = useMemo(() => ({
    onPan: (state: any) => {
      const gestureStart = performance.now();
      const newState = gestureStateMachine.transition({ type: 'move', ...state });
      
      if (newState === 'pan') {
        if (state.deltaX > 50 && activePanel === 'gallery') {
          handlePanelChange('forge');
        } else if (state.deltaX < -50 && activePanel === 'forge') {
          handlePanelChange('gallery');
        }
      }
      
      performanceMonitor.recordGestureResponseTime(performance.now() - gestureStart);
    },
    onSwipe: (direction: 'up' | 'down' | 'left' | 'right') => {
      const gestureStart = performance.now();
      gestureStateMachine.transition({ type: 'swipe', direction });
      
      switch (direction) {
        case 'left':
          if (activePanel === 'forge') handlePanelChange('gallery');
          break;
        case 'right':
          if (activePanel === 'gallery') handlePanelChange('forge');
          break;
        case 'up':
          if (viewport?.deviceType === 'mobile') {
            handleSidebarToggle(true);
          }
          break;
        case 'down':
          if (viewport?.deviceType === 'mobile') {
            handleSidebarToggle(false);
          }
          break;
      }
      
      performanceMonitor.recordGestureResponseTime(performance.now() - gestureStart);
    },
    onPinch: (state: any) => {
      gestureStateMachine.transition({ type: 'pinch', scale: state.scale });
    },
    onDoubleTap: () => {
      gestureStateMachine.transition({ type: 'doubletap' });
    },
    onLongPress: () => {
      gestureStateMachine.transition({ type: 'longpress' });
    },
  }), [activePanel, viewport, gestureStateMachine, handlePanelChange, handleSidebarToggle]);

  // Gesture system integration
  useGestures(mainRef, {
    enablePan: true,
    enableSwipe: true,
    enablePinch: true,
    enableDoubleTap: true,
    enableLongPress: true,
    threshold: {
      pan: viewport?.deviceType === 'mobile' ? 20 : 10,
      swipe: viewport?.deviceType === 'mobile' ? 75 : 50,
      pinch: 0.1,
      rotation: 5,
    },
  }, gestureHandlers);

  return {
    gestureHandlers,
  };
};
