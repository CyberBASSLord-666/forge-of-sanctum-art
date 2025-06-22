
import { IMuseAnimation, MotionConfig, Transform3D } from '../motion-types';
import { TransformProcessor } from '../core/transform-processor';
import { EnhancedEasingLibrary } from '../core/enhanced-easing-library';

export class EnhancedKeyframeAnimation implements IMuseAnimation {
  private rafId: number | null = null;
  public isActive = false;
  private isPaused = false;
  private pausedTime: number | null = null;
  private startTime: number = 0;
  private processor: TransformProcessor;
  private easingLibrary: EnhancedEasingLibrary;
  private currentKeyframeIndex = 0;
  private isDisposed = false;

  constructor(
    private element: HTMLElement,
    private keyframes: Transform3D[],
    private config: MotionConfig,
    private onComplete: () => void,
    private onError: (error: Error) => void
  ) {
    this.processor = new TransformProcessor();
    this.easingLibrary = new EnhancedEasingLibrary();
    this.validateInputs();
  }

  private validateInputs(): void {
    if (!this.element || !(this.element instanceof HTMLElement)) {
      throw new Error('Invalid element provided to keyframe animation');
    }

    if (!this.keyframes || this.keyframes.length < 2) {
      throw new Error('At least 2 keyframes are required');
    }

    if (!document.body.contains(this.element)) {
      throw new Error('Element not in DOM');
    }
  }

  public start(): void {
    if (this.isDisposed) {
      throw new Error('Cannot start disposed keyframe animation');
    }

    try {
      this.isActive = true;
      this.isPaused = false;
      this.startTime = performance.now();
      this.currentKeyframeIndex = 0;
      
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
        this.handleError(new Error('Element removed from DOM during keyframe animation'));
        return;
      }

      const elapsed = performance.now() - this.startTime - (this.config.delay || 0);

      if (elapsed < 0) {
        this.rafId = requestAnimationFrame(this.tick);
        return;
      }

      const totalProgress = Math.min(elapsed / this.config.duration, 1);
      
      // Calculate which keyframes we're between
      const segmentCount = this.keyframes.length - 1;
      const segmentDuration = 1 / segmentCount;
      const currentSegment = Math.floor(totalProgress / segmentDuration);
      const segmentProgress = (totalProgress % segmentDuration) / segmentDuration;

      const fromIndex = Math.min(currentSegment, this.keyframes.length - 2);
      const toIndex = fromIndex + 1;

      const easedProgress = this.applyEasing(segmentProgress);
      
      const currentTransform = this.processor.interpolateTransform(
        this.keyframes[fromIndex],
        this.keyframes[toIndex],
        easedProgress
      );

      this.processor.applyTransform(this.element, currentTransform);

      if (totalProgress >= 1) {
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
      console.error('Keyframe animation error callback failed:', callbackError);
    }
  }

  public getProgress(): number {
    if (!this.isActive || !this.startTime) return 0;
    
    const elapsed = performance.now() - this.startTime - (this.config.delay || 0);
    return Math.min(Math.max(elapsed / this.config.duration, 0), 1);
  }

  public getCurrentKeyframe(): number {
    const progress = this.getProgress();
    const segmentCount = this.keyframes.length - 1;
    return Math.floor(progress * segmentCount);
  }

  public dispose(): void {
    if (this.isDisposed) return;
    
    this.stop();
    this.isDisposed = true;
    this.cleanupElement();
  }
}
