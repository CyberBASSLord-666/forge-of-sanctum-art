
export type BezierCurve = [number, number, number, number];

export interface EasingFunction {
  (t: number): number;
}

export interface PhysicsEasingConfig {
  mass: number;
  stiffness: number;
  damping: number;
  velocity: number;
}

export class EnhancedEasingLibrary {
  private customEasings = new Map<string, EasingFunction>();
  private bezierCache = new Map<string, EasingFunction>();

  constructor() {
    this.registerDefaultEasings();
  }

  private registerDefaultEasings(): void {
    // Traditional easings
    this.customEasings.set('linear', (t: number) => t);
    
    // Quadratic
    this.customEasings.set('easeInQuad', (t: number) => t * t);
    this.customEasings.set('easeOutQuad', (t: number) => t * (2 - t));
    this.customEasings.set('easeInOutQuad', (t: number) => 
      t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t
    );

    // Cubic
    this.customEasings.set('easeInCubic', (t: number) => t * t * t);
    this.customEasings.set('easeOutCubic', (t: number) => --t * t * t + 1);
    this.customEasings.set('easeInOutCubic', (t: number) => 
      t < 0.5 ? 4 * t * t * t : (t - 1) * (2 * t - 2) * (2 * t - 2) + 1
    );

    // Quartic
    this.customEasings.set('easeInQuart', (t: number) => t * t * t * t);
    this.customEasings.set('easeOutQuart', (t: number) => 1 - --t * t * t * t);
    this.customEasings.set('easeInOutQuart', (t: number) => 
      t < 0.5 ? 8 * t * t * t * t : 1 - 8 * --t * t * t * t
    );

    // Quintic
    this.customEasings.set('easeInQuint', (t: number) => t * t * t * t * t);
    this.customEasings.set('easeOutQuint', (t: number) => 1 + --t * t * t * t * t);
    this.customEasings.set('easeInOutQuint', (t: number) => 
      t < 0.5 ? 16 * t * t * t * t * t : 1 + 16 * --t * t * t * t * t
    );

    // Sine
    this.customEasings.set('easeInSine', (t: number) => 
      1 - Math.cos((t * Math.PI) / 2)
    );
    this.customEasings.set('easeOutSine', (t: number) => 
      Math.sin((t * Math.PI) / 2)
    );
    this.customEasings.set('easeInOutSine', (t: number) => 
      -(Math.cos(Math.PI * t) - 1) / 2
    );

    // Exponential
    this.customEasings.set('easeInExpo', (t: number) => 
      t === 0 ? 0 : Math.pow(2, 10 * (t - 1))
    );
    this.customEasings.set('easeOutExpo', (t: number) => 
      t === 1 ? 1 : 1 - Math.pow(2, -10 * t)
    );
    this.customEasings.set('easeInOutExpo', (t: number) => {
      if (t === 0) return 0;
      if (t === 1) return 1;
      if (t < 0.5) return Math.pow(2, 20 * t - 10) / 2;
      return (2 - Math.pow(2, -20 * t + 10)) / 2;
    });

    // Circular
    this.customEasings.set('easeInCirc', (t: number) => 
      1 - Math.sqrt(1 - t * t)
    );
    this.customEasings.set('easeOutCirc', (t: number) => 
      Math.sqrt(1 - --t * t)
    );
    this.customEasings.set('easeInOutCirc', (t: number) => {
      if (t < 0.5) return (1 - Math.sqrt(1 - 2 * t * 2 * t)) / 2;
      return (Math.sqrt(1 - (-2 * t + 2) * (-2 * t + 2)) + 1) / 2;
    });

    // Back
    this.customEasings.set('easeInBack', (t: number) => {
      const c1 = 1.70158;
      const c3 = c1 + 1;
      return c3 * t * t * t - c1 * t * t;
    });
    this.customEasings.set('easeOutBack', (t: number) => {
      const c1 = 1.70158;
      const c3 = c1 + 1;
      return 1 + c3 * Math.pow(t - 1, 3) + c1 * Math.pow(t - 1, 2);
    });
    this.customEasings.set('easeInOutBack', (t: number) => {
      const c1 = 1.70158;
      const c2 = c1 * 1.525;
      return t < 0.5
        ? (Math.pow(2 * t, 2) * ((c2 + 1) * 2 * t - c2)) / 2
        : (Math.pow(2 * t - 2, 2) * ((c2 + 1) * (t * 2 - 2) + c2) + 2) / 2;
    });

    // Elastic
    this.customEasings.set('easeInElastic', (t: number) => {
      const c4 = (2 * Math.PI) / 3;
      return t === 0 ? 0 : t === 1 ? 1 : 
        -Math.pow(2, 10 * t - 10) * Math.sin((t * 10 - 10.75) * c4);
    });
    this.customEasings.set('easeOutElastic', (t: number) => {
      const c4 = (2 * Math.PI) / 3;
      return t === 0 ? 0 : t === 1 ? 1 : 
        Math.pow(2, -10 * t) * Math.sin((t * 10 - 0.75) * c4) + 1;
    });
    this.customEasings.set('easeInOutElastic', (t: number) => {
      const c5 = (2 * Math.PI) / 4.5;
      return t === 0 ? 0 : t === 1 ? 1 : t < 0.5
        ? -(Math.pow(2, 20 * t - 10) * Math.sin((20 * t - 11.125) * c5)) / 2
        : (Math.pow(2, -20 * t + 10) * Math.sin((20 * t - 11.125) * c5)) / 2 + 1;
    });

    // Bounce
    this.customEasings.set('easeOutBounce', (t: number) => {
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
    this.customEasings.set('easeInBounce', (t: number) => 
      1 - this.apply('easeOutBounce', 1 - t)
    );
    this.customEasings.set('easeInOutBounce', (t: number) => 
      t < 0.5
        ? (1 - this.apply('easeOutBounce', 1 - 2 * t)) / 2
        : (1 + this.apply('easeOutBounce', 2 * t - 1)) / 2
    );
  }

  public createBezierEasing(curve: BezierCurve): EasingFunction {
    const cacheKey = curve.join(',');
    
    if (this.bezierCache.has(cacheKey)) {
      return this.bezierCache.get(cacheKey)!;
    }

    const easing = this.bezierEasing(...curve);
    this.bezierCache.set(cacheKey, easing);
    return easing;
  }

  private bezierEasing(x1: number, y1: number, x2: number, y2: number): EasingFunction {
    return (t: number): number => {
      if (t === 0) return 0;
      if (t === 1) return 1;

      const epsilon = 1e-6;
      let start = 0;
      let end = 1;
      let mid = t;

      // Binary search for the correct t value
      while (Math.abs(this.bezierX(mid, x1, x2) - t) > epsilon) {
        if (this.bezierX(mid, x1, x2) < t) {
          start = mid;
        } else {
          end = mid;
        }
        mid = (start + end) / 2;
      }

      return this.bezierY(mid, y1, y2);
    };
  }

  private bezierX(t: number, x1: number, x2: number): number {
    return 3 * (1 - t) * (1 - t) * t * x1 + 3 * (1 - t) * t * t * x2 + t * t * t;
  }

  private bezierY(t: number, y1: number, y2: number): number {
    return 3 * (1 - t) * (1 - t) * t * y1 + 3 * (1 - t) * t * t * y2 + t * t * t;
  }

  public createPhysicsEasing(config: PhysicsEasingConfig): EasingFunction {
    const { mass, stiffness, damping, velocity } = config;
    
    return (t: number): number => {
      if (t === 0) return 0;
      if (t === 1) return 1;

      const w0 = Math.sqrt(stiffness / mass);
      const zeta = damping / (2 * Math.sqrt(stiffness * mass));
      
      if (zeta < 1) {
        // Underdamped
        const wd = w0 * Math.sqrt(1 - zeta * zeta);
        const A = 1;
        const B = (zeta * w0 + velocity) / wd;
        
        return 1 - Math.exp(-zeta * w0 * t) * (A * Math.cos(wd * t) + B * Math.sin(wd * t));
      } else if (zeta === 1) {
        // Critically damped
        return 1 - Math.exp(-w0 * t) * (1 + (w0 + velocity) * t);
      } else {
        // Overdamped
        const r1 = -w0 * (zeta - Math.sqrt(zeta * zeta - 1));
        const r2 = -w0 * (zeta + Math.sqrt(zeta * zeta - 1));
        const A = (velocity - r2) / (r1 - r2);
        const B = 1 - A;
        
        return 1 - A * Math.exp(r1 * t) - B * Math.exp(r2 * t);
      }
    };
  }

  public registerCustomEasing(name: string, easing: EasingFunction): void {
    this.customEasings.set(name, easing);
  }

  public apply(easingName: string, progress: number): number {
    const easing = this.customEasings.get(easingName);
    
    if (!easing) {
      console.warn(`Unknown easing function: ${easingName}, using linear`);
      return progress;
    }

    try {
      const result = easing(progress);
      
      // Ensure result is within bounds
      if (isNaN(result) || !isFinite(result)) {
        console.warn(`Easing function ${easingName} returned invalid value: ${result}`);
        return progress;
      }
      
      return Math.max(0, Math.min(1, result));
    } catch (error) {
      console.error(`Error applying easing function ${easingName}:`, error);
      return progress;
    }
  }

  public getAvailableEasings(): string[] {
    return Array.from(this.customEasings.keys());
  }

  public clearCache(): void {
    this.bezierCache.clear();
  }
}
