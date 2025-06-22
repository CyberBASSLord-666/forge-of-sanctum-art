
import { IMuseAnimation, MotionConfig, Transform3D } from '../motion-types';
import { EnhancedEasingLibrary } from '../core/enhanced-easing-library';
import { TransformProcessor } from '../core/transform-processor';

export class EnhancedBaseAnimation implements IMuseAnimation {
  private startTime: number | null = null;
  private pausedTime: number | null = null;
  private rafId: number | null = null;
  public isActive = false;
  private isPaused = false;
  private processor: TransformProcessor;
  private easingLibrary: EnhancedEasingLibrary;
  private performanceBudget = 16; // 16ms for 60fps
  private lastFrameTime = 0;
  private frameSkipThreshold = 33; // Skip frames if over 33ms
  private isDisposed = false;

  constructor(
    protected element: HTMLElement,
    protected startTransform: Transform3D,
    protected targetTransform: Transform3D,
    protected config: MotionConfig,
    protected onComplete: () => void,
    protected onError: (error: Error) => void
  ) {
    this.processor = new TransformProcessor();
    this.easingLibrary = new EnhancedEasingLibrary();
    this.validateInputs();
  }

  private validateInputs(): void {
    if (!this.element || !(this.element instanceof HTMLElement)) {
      throw new Error('Invalid element provided to animation');
    }

    if (!this.config || this.config.duration <= 0) {
      throw new Error('Invalid animation configuration');
    }

    if (!document.body.contains(this.element)) {
      throw new Error('Element not in DOM');
    }
  }

  public start(): void {
    if (this.isDisposed) {
      throw new Error('Cannot start disposed animation');
    }

    try {
      this.isActive = true;
      this.isPaused = false;
      this.startTime = performance.now();
      this.lastFrameTime = this.startTime;
      
      // Optimize element for animation
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
    if (!this.isPaused || !this.pausedTime || !this.startTime) return;
    
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
    
    // Enable hardware acceleration
    if (!style.transform.includes('translateZ')) {
      style.transform = (style.transform || '') + ' translateZ(0)';
    }
    
    // Prevent layout thrashing
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

    const currentTime = performance.now();
    const frameTime = currentTime - this.lastFrameTime;
    
    // Skip frame if we're behind schedule (performance optimization)
    if (frameTime > this.frameSkipThreshold) {
      this.lastFrameTime = currentTime;
      this.rafId = requestAnimationFrame(this.tick);
      return;
    }

    try {
      if (!this.startTime) {
        this.handleError(new Error('Animation started without start time'));
        return;
      }

      // Check if element is still in DOM
      if (!document.body.contains(this.element)) {
        this.handleError(new Error('Element removed from DOM during animation'));
        return;
      }

      const elapsed = currentTime - this.startTime - (this.config.delay || 0);

      if (elapsed < 0) {
        this.rafId = requestAnimationFrame(this.tick);
        return;
      }

      const progress = Math.min(elapsed / this.config.duration, 1);
      const easedProgress = this.applyEasing(progress);

      this.updateTransform(easedProgress);
      this.lastFrameTime = currentTime;

      if (progress >= 1) {
        this.handleComplete();
      } else {
        this.rafId = requestAnimationFrame(this.tick);
      }
    } catch (error) {
      this.handleError(error as Error);
    }
  };

  private applyEasing(progress: number): number {
    try {
      const easingName = typeof this.config.easing === 'string' ? this.config.easing : 'linear';
      return this.easingLibrary.apply(easingName, progress);
    } catch (error) {
      console.warn('Easing function failed, using linear:', error);
      return progress;
    }
  }

  protected updateTransform(progress: number): void {
    try {
      const currentTransform = this.processor.interpolateTransform(
        this.startTransform,
        this.targetTransform,
        progress
      );

      this.processor.applyTransform(this.element, currentTransform);
    } catch (error) {
      throw new Error(`Transform update failed: ${error}`);
    }
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
      console.error('Animation error callback failed:', callbackError);
    }
  }

  public getProgress(): number {
    if (!this.isActive || !this.startTime) return 0;
    
    const elapsed = performance.now() - this.startTime - (this.config.delay || 0);
    return Math.min(Math.max(elapsed / this.config.duration, 0), 1);
  }

  public getCurrentTransform(): Transform3D {
    return this.processor.getCurrentTransform(this.element);
  }

  public dispose(): void {
    if (this.isDisposed) return;
    
    this.stop();
    this.isDisposed = true;
    this.cleanupElement();
  }
}
