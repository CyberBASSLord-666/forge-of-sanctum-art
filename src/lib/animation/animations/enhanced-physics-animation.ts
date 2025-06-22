
import { IMuseAnimation, PhysicsConfig, Transform3D } from '../motion-types';
import { TransformProcessor } from '../core/transform-processor';

export interface EnhancedPhysicsConfig extends PhysicsConfig {
  airResistance?: number;
  restitution?: number;
  maxVelocity?: number;
  minVelocity?: number;
}

export class EnhancedPhysicsAnimation implements IMuseAnimation {
  private rafId: number | null = null;
  public isActive = false;
  private isPaused = false;
  private pausedTime: number | null = null;
  private startTime: number = 0;
  private processor: TransformProcessor;
  private currentTransform: Transform3D;
  private velocity: { x: number; y: number };
  private config: EnhancedPhysicsConfig;
  private isDisposed = false;
  private maxDuration = 10000; // 10 seconds max

  constructor(
    private element: HTMLElement,
    initialVelocity: { x: number; y: number },
    config: EnhancedPhysicsConfig,
    private onComplete: () => void,
    private onError: (error: Error) => void
  ) {
    this.processor = new TransformProcessor();
    this.config = this.processConfig(config);
    this.currentTransform = this.processor.getCurrentTransform(this.element);
    this.velocity = { ...initialVelocity };
    this.validateInputs();
  }

  private processConfig(config: EnhancedPhysicsConfig): EnhancedPhysicsConfig {
    return {
      gravity: 980,
      friction: 0.1,
      elasticity: 0.7,
      airResistance: 0.01,
      restitution: 0.8,
      maxVelocity: 2000,
      minVelocity: 0.1,
      boundaries: {
        top: 0,
        right: window.innerWidth,
        bottom: window.innerHeight,
        left: 0,
      },
      ...config,
    };
  }

  private validateInputs(): void {
    if (!this.element || !(this.element instanceof HTMLElement)) {
      throw new Error('Invalid element provided to physics animation');
    }

    if (!document.body.contains(this.element)) {
      throw new Error('Element not in DOM');
    }

    if (this.config.gravity < 0) {
      throw new Error('Gravity cannot be negative');
    }
  }

  public start(): void {
    if (this.isDisposed) {
      throw new Error('Cannot start disposed physics animation');
    }

    try {
      this.isActive = true;
      this.isPaused = false;
      this.startTime = performance.now();
      
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
        this.handleError(new Error('Element removed from DOM during physics animation'));
        return;
      }

      const currentTime = performance.now();
      const elapsed = currentTime - this.startTime;
      
      // Auto-stop after max duration
      if (elapsed > this.maxDuration) {
        this.handleComplete();
        return;
      }

      const deltaTime = Math.min(0.016, elapsed / 1000); // Cap at 16ms

      // Apply gravity
      this.velocity.y += this.config.gravity * deltaTime;

      // Apply air resistance
      const airResistance = this.config.airResistance || 0;
      this.velocity.x *= (1 - airResistance);
      this.velocity.y *= (1 - airResistance);

      // Clamp velocity
      const maxVel = this.config.maxVelocity || 2000;
      const minVel = this.config.minVelocity || 0.1;
      
      const velocityMagnitude = Math.sqrt(this.velocity.x ** 2 + this.velocity.y ** 2);
      if (velocityMagnitude > maxVel) {
        const scale = maxVel / velocityMagnitude;
        this.velocity.x *= scale;
        this.velocity.y *= scale;
      }

      // Update position
      const currentX = this.currentTransform.translateX || 0;
      const currentY = this.currentTransform.translateY || 0;
      
      let newX = currentX + this.velocity.x * deltaTime;
      let newY = currentY + this.velocity.y * deltaTime;

      // Handle boundaries
      const boundaries = this.config.boundaries;
      if (boundaries) {
        // Left boundary
        if (newX < (boundaries.left || 0)) {
          newX = boundaries.left || 0;
          this.velocity.x = -this.velocity.x * (this.config.restitution || 0.8);
        }
        
        // Right boundary
        if (newX > (boundaries.right || window.innerWidth)) {
          newX = boundaries.right || window.innerWidth;
          this.velocity.x = -this.velocity.x * (this.config.restitution || 0.8);
        }
        
        // Top boundary
        if (newY < (boundaries.top || 0)) {
          newY = boundaries.top || 0;
          this.velocity.y = -this.velocity.y * (this.config.restitution || 0.8);
        }
        
        // Bottom boundary
        if (newY > (boundaries.bottom || window.innerHeight)) {
          newY = boundaries.bottom || window.innerHeight;
          this.velocity.y = -this.velocity.y * (this.config.restitution || 0.8);
          
          // Apply ground friction
          this.velocity.x *= (1 - this.config.friction);
        }
      }

      this.currentTransform.translateX = newX;
      this.currentTransform.translateY = newY;

      this.processor.applyTransform(this.element, this.currentTransform);

      // Check if animation should stop (very low velocity)
      if (velocityMagnitude < minVel && newY >= (boundaries?.bottom || window.innerHeight) - 1) {
        this.handleComplete();
      } else {
        this.startTime = currentTime;
        this.rafId = requestAnimationFrame(this.tick);
      }
    } catch (error) {
      this.handleError(error as Error);
    }
  };

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
      console.error('Physics animation error callback failed:', callbackError);
    }
  }

  public getProgress(): number {
    // For physics animations, progress is harder to define
    // We'll use time-based progress with a maximum duration
    if (!this.isActive || !this.startTime) return 0;
    
    const elapsed = performance.now() - this.startTime;
    return Math.min(elapsed / this.maxDuration, 1);
  }

  public getCurrentVelocity(): { x: number; y: number } {
    return { ...this.velocity };
  }

  public setVelocity(newVelocity: { x: number; y: number }): void {
    this.velocity = { ...newVelocity };
  }

  public addForce(force: { x: number; y: number }): void {
    this.velocity.x += force.x;
    this.velocity.y += force.y;
  }

  public dispose(): void {
    if (this.isDisposed) return;
    
    this.stop();
    this.isDisposed = true;
    this.cleanupElement();
  }
}
