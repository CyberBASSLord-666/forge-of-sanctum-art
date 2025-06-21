
import { useState, useEffect, useCallback, useRef } from 'react';

export interface ViewportDimensions {
  width: number;
  height: number;
  ratio: number;
  orientation: 'portrait' | 'landscape';
  deviceType: 'mobile' | 'tablet' | 'desktop' | 'ultrawide' | 'tv';
  pixelDensity: number;
  availableSpace: {
    width: number;
    height: number;
  };
}

export interface ResponsiveBreakpoints {
  xs: number;
  sm: number;
  md: number;
  lg: number;
  xl: number;
  xxl: number;
  ultrawide: number;
}

export interface FluidGrid {
  columns: number;
  gutters: number;
  margins: number;
  baseFontSize: number;
  lineHeight: number;
  modularScale: number;
}

class ViewportManager {
  private observers: Set<(viewport: ViewportDimensions) => void> = new Set();
  private resizeObserver: ResizeObserver | null = null;
  private rafId: number | null = null;
  private lastKnownViewport: ViewportDimensions | null = null;

  private readonly breakpoints: ResponsiveBreakpoints = {
    xs: 320,
    sm: 576,
    md: 768,
    lg: 992,
    xl: 1200,
    xxl: 1400,
    ultrawide: 2560,
  };

  constructor() {
    this.initializeViewportTracking();
    this.setupResponsiveObserver();
  }

  private initializeViewportTracking(): void {
    const updateViewport = () => {
      if (this.rafId) {
        cancelAnimationFrame(this.rafId);
      }

      this.rafId = requestAnimationFrame(() => {
        const viewport = this.calculateViewportDimensions();
        
        if (!this.lastKnownViewport || this.hasSignificantChange(viewport)) {
          this.lastKnownViewport = viewport;
          this.notifyObservers(viewport);
          this.updateCSSCustomProperties(viewport);
        }
      });
    };

    window.addEventListener('resize', updateViewport, { passive: true });
    window.addEventListener('orientationchange', updateViewport, { passive: true });
    document.addEventListener('fullscreenchange', updateViewport, { passive: true });
    
    // Initial calculation
    updateViewport();
  }

  private setupResponsiveObserver(): void {
    if ('ResizeObserver' in window) {
      this.resizeObserver = new ResizeObserver((entries) => {
        for (const entry of entries) {
          if (entry.target === document.documentElement) {
            const viewport = this.calculateViewportDimensions();
            this.updateCSSCustomProperties(viewport);
          }
        }
      });

      this.resizeObserver.observe(document.documentElement);
    }
  }

  private calculateViewportDimensions(): ViewportDimensions {
    const width = window.innerWidth;
    const height = window.innerHeight;
    const ratio = width / height;
    const pixelDensity = window.devicePixelRatio || 1;

    // Advanced device type detection
    const deviceType = this.determineDeviceType(width, height, pixelDensity);
    
    // Calculate available space (accounting for browser chrome, notches, etc.)
    const availableSpace = this.calculateAvailableSpace();

    return {
      width,
      height,
      ratio,
      orientation: width > height ? 'landscape' : 'portrait',
      deviceType,
      pixelDensity,
      availableSpace,
    };
  }

  private determineDeviceType(width: number, height: number, pixelDensity: number): ViewportDimensions['deviceType'] {
    const effectiveWidth = width * pixelDensity;
    
    if (width >= this.breakpoints.ultrawide) return 'ultrawide';
    if (width >= this.breakpoints.xl) return 'desktop';
    if (width >= this.breakpoints.md && (effectiveWidth >= 1536 || pixelDensity < 2)) return 'desktop';
    if (width >= this.breakpoints.sm) return 'tablet';
    return 'mobile';
  }

  private calculateAvailableSpace(): { width: number; height: number } {
    // Account for potential browser chrome, system UI, notches, etc.
    const safeAreaInsets = this.getSafeAreaInsets();
    
    return {
      width: window.innerWidth - safeAreaInsets.left - safeAreaInsets.right,
      height: window.innerHeight - safeAreaInsets.top - safeAreaInsets.bottom,
    };
  }

  private getSafeAreaInsets(): { top: number; right: number; bottom: number; left: number } {
    const style = getComputedStyle(document.documentElement);
    
    return {
      top: parseInt(style.getPropertyValue('env(safe-area-inset-top)') || '0'),
      right: parseInt(style.getPropertyValue('env(safe-area-inset-right)') || '0'),
      bottom: parseInt(style.getPropertyValue('env(safe-area-inset-bottom)') || '0'),
      left: parseInt(style.getPropertyValue('env(safe-area-inset-left)') || '0'),
    };
  }

  private hasSignificantChange(newViewport: ViewportDimensions): boolean {
    if (!this.lastKnownViewport) return true;
    
    const widthChange = Math.abs(newViewport.width - this.lastKnownViewport.width);
    const heightChange = Math.abs(newViewport.height - this.lastKnownViewport.height);
    
    // Consider significant if change is > 1% or device type changed
    return (
      widthChange / this.lastKnownViewport.width > 0.01 ||
      heightChange / this.lastKnownViewport.height > 0.01 ||
      newViewport.deviceType !== this.lastKnownViewport.deviceType ||
      newViewport.orientation !== this.lastKnownViewport.orientation
    );
  }

  private updateCSSCustomProperties(viewport: ViewportDimensions): void {
    const root = document.documentElement;
    const fluidGrid = this.calculateFluidGrid(viewport);
    
    // Base viewport properties
    root.style.setProperty('--viewport-width', `${viewport.width}px`);
    root.style.setProperty('--viewport-height', `${viewport.height}px`);
    root.style.setProperty('--viewport-ratio', viewport.ratio.toString());
    root.style.setProperty('--pixel-density', viewport.pixelDensity.toString());
    
    // Fluid grid system
    root.style.setProperty('--grid-columns', fluidGrid.columns.toString());
    root.style.setProperty('--grid-gutters', `${fluidGrid.gutters}px`);
    root.style.setProperty('--grid-margins', `${fluidGrid.margins}px`);
    root.style.setProperty('--base-font-size', `${fluidGrid.baseFontSize}px`);
    root.style.setProperty('--line-height', fluidGrid.lineHeight.toString());
    root.style.setProperty('--modular-scale', fluidGrid.modularScale.toString());
    
    // Device-specific properties
    root.style.setProperty('--device-type', viewport.deviceType);
    root.style.setProperty('--orientation', viewport.orientation);
    
    // Available space
    root.style.setProperty('--available-width', `${viewport.availableSpace.width}px`);
    root.style.setProperty('--available-height', `${viewport.availableSpace.height}px`);
    
    // Responsive scaling factors
    const scalingFactors = this.calculateScalingFactors(viewport);
    Object.entries(scalingFactors).forEach(([key, value]) => {
      root.style.setProperty(`--scale-${key}`, value.toString());
    });
  }

  private calculateFluidGrid(viewport: ViewportDimensions): FluidGrid {
    const { width, deviceType } = viewport;
    
    // Base configuration
    let columns = 12;
    let baseFontSize = 16;
    let gutters = 24;
    let margins = 24;
    
    // Responsive adjustments
    switch (deviceType) {
      case 'mobile':
        columns = width < 375 ? 4 : 6;
        baseFontSize = Math.max(14, width * 0.042);
        gutters = Math.max(16, width * 0.04);
        margins = Math.max(16, width * 0.05);
        break;
        
      case 'tablet':
        columns = viewport.orientation === 'portrait' ? 8 : 12;
        baseFontSize = Math.max(15, width * 0.02);
        gutters = Math.max(20, width * 0.026);
        margins = Math.max(24, width * 0.03);
        break;
        
      case 'desktop':
        columns = 12;
        baseFontSize = Math.max(16, Math.min(18, width * 0.014));
        gutters = Math.max(24, width * 0.02);
        margins = Math.max(32, width * 0.025);
        break;
        
      case 'ultrawide':
        columns = 16;
        baseFontSize = Math.max(17, Math.min(20, width * 0.01));
        gutters = Math.max(32, width * 0.015);
        margins = Math.max(48, width * 0.02);
        break;
        
      case 'tv':
        columns = 20;
        baseFontSize = Math.max(20, width * 0.012);
        gutters = Math.max(40, width * 0.018);
        margins = Math.max(64, width * 0.025);
        break;
    }
    
    return {
      columns,
      gutters,
      margins,
      baseFontSize,
      lineHeight: 1.5,
      modularScale: 1.25,
    };
  }

  private calculateScalingFactors(viewport: ViewportDimensions): Record<string, number> {
    const baseWidth = 1920; // Reference width
    const baseHeight = 1080; // Reference height
    
    const widthScale = viewport.width / baseWidth;
    const heightScale = viewport.height / baseHeight;
    const uniformScale = Math.min(widthScale, heightScale);
    
    return {
      width: widthScale,
      height: heightScale,
      uniform: uniformScale,
      area: (viewport.width * viewport.height) / (baseWidth * baseHeight),
      density: viewport.pixelDensity,
    };
  }

  private notifyObservers(viewport: ViewportDimensions): void {
    this.observers.forEach(observer => {
      try {
        observer(viewport);
      } catch (error) {
        console.error('Error in viewport observer:', error);
      }
    });
  }

  public subscribe(observer: (viewport: ViewportDimensions) => void): () => void {
    this.observers.add(observer);
    
    // Immediately notify with current viewport if available
    if (this.lastKnownViewport) {
      observer(this.lastKnownViewport);
    }
    
    return () => {
      this.observers.delete(observer);
    };
  }

  public getCurrentViewport(): ViewportDimensions | null {
    return this.lastKnownViewport;
  }

  public destroy(): void {
    this.observers.clear();
    
    if (this.resizeObserver) {
      this.resizeObserver.disconnect();
    }
    
    if (this.rafId) {
      cancelAnimationFrame(this.rafId);
    }
  }
}

export const viewportManager = new ViewportManager();

export const useViewport = () => {
  const [viewport, setViewport] = useState<ViewportDimensions | null>(() => 
    viewportManager.getCurrentViewport()
  );

  useEffect(() => {
    const unsubscribe = viewportManager.subscribe(setViewport);
    return unsubscribe;
  }, []);

  return viewport;
};

export const useResponsiveValue = <T>(values: Record<string, T>, fallback: T): T => {
  const viewport = useViewport();
  
  if (!viewport) return fallback;
  
  const { deviceType, width } = viewport;
  
  // Priority order for value selection
  const priorities = [
    `${deviceType}-${viewport.orientation}`,
    deviceType,
    width >= 2560 ? 'ultrawide' : null,
    width >= 1400 ? 'xxl' : null,
    width >= 1200 ? 'xl' : null,
    width >= 992 ? 'lg' : null,
    width >= 768 ? 'md' : null,
    width >= 576 ? 'sm' : null,
    'xs'
  ].filter(Boolean) as string[];
  
  for (const priority of priorities) {
    if (values[priority] !== undefined) {
      return values[priority];
    }
  }
  
  return fallback;
};
