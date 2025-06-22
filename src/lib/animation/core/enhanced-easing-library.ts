
export class EnhancedEasingLibrary {
  private easingFunctions = new Map<string, (t: number) => number>();

  constructor() {
    this.initializeEasingFunctions();
  }

  private initializeEasingFunctions(): void {
    // Linear
    this.easingFunctions.set('linear', (t: number) => t);
    
    // Quadratic
    this.easingFunctions.set('easeInQuad', (t: number) => t * t);
    this.easingFunctions.set('easeOutQuad', (t: number) => t * (2 - t));
    this.easingFunctions.set('easeInOutQuad', (t: number) => 
      t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t
    );
    
    // Cubic
    this.easingFunctions.set('easeInCubic', (t: number) => t * t * t);
    this.easingFunctions.set('easeOutCubic', (t: number) => (--t) * t * t + 1);
    this.easingFunctions.set('easeInOutCubic', (t: number) => 
      t < 0.5 ? 4 * t * t * t : (t - 1) * (2 * t - 2) * (2 * t - 2) + 1
    );
    
    // Quartic
    this.easingFunctions.set('easeInQuart', (t: number) => t * t * t * t);
    this.easingFunctions.set('easeOutQuart', (t: number) => 1 - (--t) * t * t * t);
    this.easingFunctions.set('easeInOutQuart', (t: number) => 
      t < 0.5 ? 8 * t * t * t * t : 1 - 8 * (--t) * t * t * t
    );
    
    // Elastic
    this.easingFunctions.set('easeOutElastic', (t: number) => {
      const c4 = (2 * Math.PI) / 3;
      return t === 0 ? 0 : t === 1 ? 1 : 
        Math.pow(2, -10 * t) * Math.sin((t * 10 - 0.75) * c4) + 1;
    });
    
    // Bounce
    this.easingFunctions.set('easeOutBounce', (t: number) => {
      const n1 = 7.5625;
      const d1 = 2.75;
      
      if (t < 1 / d1) {
        return n1 * t * t;
      } else if (t < 2 / d1) {
        return n1 * (t -= 1.5 / d1) * t + 0.75;
      } else if (t < 2.5 / d1) {
        return n1 * (t -= 2.25 / d1) * t + 0.9375;
      } else {
        return n1 * (t -= 2.625 / d1) * t + 0.984375;
      }
    });
  }

  public apply(easingName: string, progress: number): number {
    const easingFn = this.easingFunctions.get(easingName);
    if (!easingFn) {
      console.warn(`Unknown easing function: ${easingName}, using linear`);
      return progress;
    }
    
    // Clamp progress to [0, 1]
    const clampedProgress = Math.max(0, Math.min(1, progress));
    
    try {
      return easingFn(clampedProgress);
    } catch (error) {
      console.warn(`Easing function ${easingName} failed:`, error);
      return clampedProgress;
    }
  }

  public addCustomEasing(name: string, fn: (t: number) => number): void {
    this.easingFunctions.set(name, fn);
  }

  public getAvailableEasings(): string[] {
    return Array.from(this.easingFunctions.keys());
  }
}
