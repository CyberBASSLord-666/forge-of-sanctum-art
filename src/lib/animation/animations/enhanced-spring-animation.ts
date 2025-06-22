
import { IMuseAnimation, SpringConfig, Transform3D } from '../motion-types';
import { TransformProcessor } from '../core/transform-processor';

export interface EnhancedSpringConfig extends SpringConfig {
  clamp?: boolean;
  restVelocityThreshold?: number;
  restDisplacementThreshold?: number;
  maxIterations?: number;
  dampingRatio?: number;
  frequencyResponse?: number;
}

export class EnhancedSpringAnimation implements IMuseAnimation {
  private rafId: number | null = null;
  public isActive = false;
  private isPaused = false;
  private pausedTime: number | null = null;
  private startTime: number = 0;
  private processor: TransformProcessor;
  private currentTransform: Transform3D;
  private velocity: Record<keyof Transform3D, number> = {} as any;
  private config: EnhancedSpringConfig;
  private iterations = 0;
  private isDisposed = false;

  constructor(
    private element: HTMLElement,
    private targetTransform: Transform3D,
    config: EnhancedSpringConfig,
    private onComplete: () => void,
    private onError: (error: Error) => void
  ) {
    this.processor = new TransformProcessor();
    this.config = this.processConfig(config);
    this.currentTransform = this.processor.getCurrentTransform(this.element);
    this.initializeVelocity();
    this.validateInputs();
  }

  private processConfig(config: EnhancedSpringConfig): EnhancedSpringConfig {
    return {
      tension: 180,
      friction: 12,
      mass: 1,
      velocity: 0,
      precision: 0.01,
      clamp: false,
      restVelocityThreshold: 0.1,
      restDisplacementThreshold: 0.1,
      maxIterations: 10000,
      dampingRatio: 0.8,
      frequencyResponse: 1,
      ...config,
    };
  }

  private validateInputs(): void {
    if (!this.element || !(this.element instanceof HTMLElement)) {
      throw new Error('Invalid element provided to spring animation');
    }

    if (!document.body.contains(this.element)) {
      throw new Error('Element not in DOM');
    }

    if (this.config.mass <= 0) {
      throw new Error('Spring mass must be positive');
    }

    if (this.config.tension < 0) {
      throw new Error('Spring tension cannot be negative');
    }
  }

  private initializeVelocity(): void {
    Object.keys(this.targetTransform).forEach(key => {
      this.velocity[key as keyof Transform3D] = this.config.velocity;
    });
  }

  public start(): void {
    if (this.isDisposed) {
      throw new Error('Cannot start disposed spring animation');
    }

    try {
      this.isActive = true;
      this.isPaused = false;
      this.startTime = performance.now();
      this.iterations = 0;
      
      this.optimizeElement();
      this.tick();
    } catch (error) {
      this.handleError(error as Error);
    }
  }

  public pause(): void {
    if (!this.isActive || this.isPaused) return;
    
    this.isPaused = true;
    this.pausedTime = performance.now();
    
    if (this.rafId) {
      cancelAnimationFrame(this.rafId);
      this.rafId = null;
    }
  }

  public resume(): void {
    if (!this.isPaused || !this.pausedTime) return;
    
    const pauseDuration = performance.now() - this.pausedTime;
    this.startTime += pauseDuration;
    this.isPaused = false;
    this.pausedTime = null;
    
    this.tick();
  }

  public stop(): void {
    this.isActive = false;
    this.isPaused = false;
    
    if (this.rafId) {
      cancelAnimationFrame(this.rafId);
      this.rafId = null;
    }
    
    this.cleanupElement();
  }

  private optimizeElement(): void {
    const style = this.element.style;
    style.willChange = 'transform';
    style.backfaceVisibility = 'hidden';
    style.perspective = '1000px';
  }

  private cleanupElement(): void {
    const style = this.element.style;
    style.willChange = 'auto';
    style.backfaceVisibility = '';
    style.perspective = '';
  }

  private tick = (): void => {
    if (!this.isActive || this.isPaused || this.isDisposed) return;

    try {
      if (!document.body.contains(this.element)) {
        this.handleError(new Error('Element removed from DOM during spring animation'));
        return;
      }

      if (this.iterations >= this.config.maxIterations!) {
        console.warn('Spring animation reached maximum iterations');
        this.forceCompletion();
        return;
      }

      const currentTime = performance.now();
      const deltaTime = Math.min((currentTime - this.startTime) / 1000, 0.016); // Cap at 16ms
      
      let hasMovement = false;
      let allPropertiesAtRest = true;

      Object.keys(this.targetTransform).forEach(key => {
        const transformKey = key as keyof Transform3D;
        const current = this.currentTransform[transformKey] || 0;
        const target = this.targetTransform[transformKey] || 0;
        const currentVelocity = this.velocity[transformKey] || 0;

        // Enhanced spring physics with improved numerical stability
        const displacement = current - target;
        
        // Calculate spring force using Hooke's law
        const springForce = -this.config.tension * displacement;
        
        // Calculate damping force
        const dampingForce = -this.config.friction * currentVelocity;
        
        // Apply frequency response compensation
        const totalForce = (springForce + dampingForce) * this.config.frequencyResponse!;
        
        // Calculate acceleration using F = ma
        const acceleration = totalForce / this.config.mass;
        
        // Update velocity using Verlet integration for better stability
        const newVelocity = currentVelocity + acceleration * deltaTime;
        
        // Update position
        const newPosition = current + newVelocity * deltaTime;
        
        // Apply clamping if enabled
        if (this.config.clamp) {
          if (displacement > 0 && newPosition < target) {
            this.currentTransform[transformKey] = target;
            this.velocity[transformKey] = 0;
          } else if (displacement < 0 && newPosition > target) {
            this.currentTransform[transformKey] = target;
            this.velocity[transformKey] = 0;
          } else {
            this.currentTransform[transformKey] = newPosition;
            this.velocity[transformKey] = newVelocity;
          }
        } else {
          this.currentTransform[transformKey] = newPosition;
          this.velocity[transformKey] = newVelocity;
        }

        // Check if this property is at rest
        const isAtRest = Math.abs(displacement) <= this.config.restDisplacementThreshold! && 
                         Math.abs(currentVelocity) <= this.config.restVelocityThreshold!;
        
        if (!isAtRest) {
          allPropertiesAtRest = false;
          hasMovement = true;
        }
      });

      // Apply the transform
      this.processor.applyTransform(this.element, this.currentTransform);

      this.iterations++;
      this.startTime = currentTime;

      if (allPropertiesAtRest || !hasMovement) {
        this.handleComplete();
      } else {
        this.rafId = requestAnimationFrame(this.tick);
      }
    } catch (error) {
      this.handleError(error as Error);
    }
  };

  private forceCompletion(): void {
    // Snap to target values
    Object.keys(this.targetTransform).forEach(key => {
      const transformKey = key as keyof Transform3D;
      this.currentTransform[transformKey] = this.targetTransform[transformKey];
      this.velocity[transformKey] = 0;
    });
    
    this.processor.applyTransform(this.element, this.currentTransform);
    this.handleComplete();
  }

  private handleComplete(): void {
    try {
      this.stop();
      this.onComplete();
    } catch (error) {
      this.handleError(error as Error);
    }
  }

  private handleError(error: Error): void {
    this.stop();
    
    try {
      this.onError(error);
    } catch (callbackError) {
      console.error('Spring animation error callback failed:', callbackError);
    }
  }

  public getCurrentTransform(): Transform3D {
    return { ...this.currentTransform };
  }

  public getCurrentVelocity(): Record<keyof Transform3D, number> {
    return { ...this.velocity };
  }

  public getProgress(): number {
    let totalDisplacement = 0;
    let maxDisplacement = 0;

    Object.keys(this.targetTransform).forEach(key => {
      const transformKey = key as keyof Transform3D;
      const current = this.currentTransform[transformKey] || 0;
      const target = this.targetTransform[transformKey] || 0;
      const displacement = Math.abs(current - target);
      
      totalDisplacement += displacement;
      maxDisplacement = Math.max(maxDisplacement, displacement);
    });

    if (maxDisplacement === 0) return 1;
    return Math.max(0, 1 - (totalDisplacement / (Object.keys(this.targetTransform).length * maxDisplacement)));
  }

  public updateTarget(newTarget: Partial<Transform3D>): void {
    Object.assign(this.targetTransform, newTarget);
  }

  public setVelocity(newVelocity: Partial<Record<keyof Transform3D, number>>): void {
    Object.assign(this.velocity, newVelocity);
  }

  public dispose(): void {
    if (this.isDisposed) return;
    
    this.stop();
    this.isDisposed = true;
    this.cleanupElement();
  }
}
