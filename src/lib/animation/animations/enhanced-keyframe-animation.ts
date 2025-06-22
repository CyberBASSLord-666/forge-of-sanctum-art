
import { IMuseAnimation, MotionConfig, Transform3D } from '../motion-types';
import { EnhancedEasingLibrary } from '../core/enhanced-easing-library';
import { TransformProcessor } from '../core/transform-processor';

export interface KeyframeConfig {
  offset: number; // 0 to 1
  easing?: string;
  transform: Transform3D;
}

export interface EnhancedKeyframeConfig extends MotionConfig {
  interpolation?: 'linear' | 'spline' | 'bezier';
  smoothing?: number;
  loop?: boolean | number;
  reverse?: boolean;
  alternateDirection?: boolean;
}

export class EnhancedKeyframeAnimation implements IMuseAnimation {
  private startTime: number | null = null;
  private pausedTime: number | null = null;
  private rafId: number | null = null;
  public isActive = false;
  private isPaused = false;
  private processor: TransformProcessor;
  private easingLibrary: EnhancedEasingLibrary;
  private normalizedKeyframes: KeyframeConfig[];
  private config: EnhancedKeyframeConfig;
  private currentLoop = 0;
  private isReversed = false;
  private isDisposed = false;

  constructor(
    private element: HTMLElement,
    keyframes: Transform3D[],
    config: EnhancedKeyframeConfig,
    private onComplete: () => void,
    private onError: (error: Error) => void
  ) {
    this.processor = new TransformProcessor();
    this.easingLibrary = new EnhancedEasingLibrary();
    this.config = this.processConfig(config);
    this.normalizedKeyframes = this.normalizeKeyframes(keyframes);
    this.validateInputs();
  }

  private processConfig(config: EnhancedKeyframeConfig): EnhancedKeyframeConfig {
    return {
      duration: 1000,
      easing: 'easeOutCubic',
      interpolation: 'spline',
      smoothing: 0.5,
      loop: false,
      reverse: false,
      alternateDirection: false,
      ...config,
    };
  }

  private normalizeKeyframes(keyframes: Transform3D[]): KeyframeConfig[] {
    if (keyframes.length < 2) {
      throw new Error('At least 2 keyframes are required');
    }

    return keyframes.map((transform, index) => ({
      offset: index / (keyframes.length - 1),
      transform,
      easing: this.config.easing as string,
    }));
  }

  private validateInputs(): void {
    if (!this.element || !(this.element instanceof HTMLElement)) {
      throw new Error('Invalid element provided to keyframe animation');
    }

    if (!document.body.contains(this.element)) {
      throw new Error('Element not in DOM');
    }

    if (this.normalizedKeyframes.length < 2) {
      throw new Error('Invalid keyframe configuration');
    }

    if (this.config.duration <= 0) {
      throw new Error('Animation duration must be positive');
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
      this.currentLoop = 0;
      this.isReversed = false;
      
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
      if (!this.startTime) {
        this.handleError(new Error('Animation started without start time'));
        return;
      }

      if (!document.body.contains(this.element)) {
        this.handleError(new Error('Element removed from DOM during animation'));
        return;
      }

      const currentTime = performance.now();
      const elapsed = currentTime - this.startTime - (this.config.delay || 0);

      if (elapsed < 0) {
        this.rafId = requestAnimationFrame(this.tick);
        return;
      }

      let progress = elapsed / this.config.duration;
      
      // Handle reverse direction
      if (this.isReversed) {
        progress = 1 - progress;
      }

      // Handle looping
      if (progress >= 1) {
        if (this.shouldContinueLoop()) {
          this.handleLoopCompletion();
          progress = 0;
          this.startTime = currentTime;
        } else {
          progress = 1;
        }
      }

      const interpolatedTransform = this.interpolateAtProgress(progress);
      this.processor.applyTransform(this.element, interpolatedTransform);

      if (progress >= 1 && !this.shouldContinueLoop()) {
        this.handleComplete();
      } else {
        this.rafId = requestAnimationFrame(this.tick);
      }
    } catch (error) {
      this.handleError(error as Error);
    }
  };

  private shouldContinueLoop(): boolean {
    if (!this.config.loop) return false;
    
    if (typeof this.config.loop === 'boolean') {
      return this.config.loop;
    }
    
    return this.currentLoop < this.config.loop;
  }

  private handleLoopCompletion(): void {
    this.currentLoop++;
    
    if (this.config.alternateDirection) {
      this.isReversed = !this.isReversed;
    }
  }

  private interpolateAtProgress(progress: number): Transform3D {
    progress = Math.max(0, Math.min(1, progress));

    // Find the current segment
    const segment = this.findCurrentSegment(progress);
    if (!segment) {
      return this.normalizedKeyframes[this.normalizedKeyframes.length - 1].transform;
    }

    const { startFrame, endFrame, localProgress } = segment;

    switch (this.config.interpolation) {
      case 'linear':
        return this.linearInterpolation(startFrame.transform, endFrame.transform, localProgress);
      case 'spline':
        return this.splineInterpolation(startFrame, endFrame, localProgress);
      case 'bezier':
        return this.bezierInterpolation(startFrame.transform, endFrame.transform, localProgress);
      default:
        return this.linearInterpolation(startFrame.transform, endFrame.transform, localProgress);
    }
  }

  private findCurrentSegment(progress: number): {
    startFrame: KeyframeConfig;
    endFrame: KeyframeConfig;
    localProgress: number;
  } | null {
    for (let i = 0; i < this.normalizedKeyframes.length - 1; i++) {
      const startFrame = this.normalizedKeyframes[i];
      const endFrame = this.normalizedKeyframes[i + 1];
      
      if (progress >= startFrame.offset && progress <= endFrame.offset) {
        const segmentDuration = endFrame.offset - startFrame.offset;
        const localProgress = segmentDuration > 0 ? 
          (progress - startFrame.offset) / segmentDuration : 0;
        
        // Apply easing to local progress
        const easedLocalProgress = this.easingLibrary.apply(endFrame.easing || 'linear', localProgress);
        
        return { startFrame, endFrame, localProgress: easedLocalProgress };
      }
    }

    return null;
  }

  private linearInterpolation(start: Transform3D, end: Transform3D, progress: number): Transform3D {
    return this.processor.interpolateTransform(start, end, progress);
  }

  private splineInterpolation(startFrame: KeyframeConfig, endFrame: KeyframeConfig, progress: number): Transform3D {
    // Get surrounding frames for better interpolation
    const startIndex = this.normalizedKeyframes.indexOf(startFrame);
    const endIndex = this.normalizedKeyframes.indexOf(endFrame);
    
    const prevFrame = startIndex > 0 ? this.normalizedKeyframes[startIndex - 1] : startFrame;
    const nextFrame = endIndex < this.normalizedKeyframes.length - 1 ? 
      this.normalizedKeyframes[endIndex + 1] : endFrame;

    const result: Transform3D = {};
    const allKeys = new Set([
      ...Object.keys(prevFrame.transform),
      ...Object.keys(startFrame.transform),
      ...Object.keys(endFrame.transform),
      ...Object.keys(nextFrame.transform)
    ]) as Set<keyof Transform3D>;

    allKeys.forEach(key => {
      const p0 = prevFrame.transform[key] || (key.includes('scale') ? 1 : 0);
      const p1 = startFrame.transform[key] || (key.includes('scale') ? 1 : 0);
      const p2 = endFrame.transform[key] || (key.includes('scale') ? 1 : 0);
      const p3 = nextFrame.transform[key] || (key.includes('scale') ? 1 : 0);

      // Catmull-Rom spline interpolation
      const t = progress;
      const t2 = t * t;
      const t3 = t2 * t;

      result[key] = 0.5 * (
        (2 * p1) +
        (-p0 + p2) * t +
        (2 * p0 - 5 * p1 + 4 * p2 - p3) * t2 +
        (-p0 + 3 * p1 - 3 * p2 + p3) * t3
      );
    });

    return result;
  }

  private bezierInterpolation(start: Transform3D, end: Transform3D, progress: number): Transform3D {
    // Apply smoothing using bezier curves
    const smoothedProgress = this.applySmoothingCurve(progress);
    return this.processor.interpolateTransform(start, end, smoothedProgress);
  }

  private applySmoothingCurve(t: number): number {
    const smoothing = this.config.smoothing || 0.5;
    
    // Create a smooth bezier curve based on smoothing factor
    const cp1 = smoothing;
    const cp2 = 1 - smoothing;
    
    return this.easingLibrary.createBezierEasing([cp1, 0, cp2, 1])(t);
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
    let progress = elapsed / this.config.duration;
    
    if (this.isReversed) {
      progress = 1 - progress;
    }
    
    return Math.min(Math.max(progress, 0), 1);
  }

  public getCurrentKeyframeIndex(): number {
    const progress = this.getProgress();
    
    for (let i = 0; i < this.normalizedKeyframes.length - 1; i++) {
      const startFrame = this.normalizedKeyframes[i];
      const endFrame = this.normalizedKeyframes[i + 1];
      
      if (progress >= startFrame.offset && progress <= endFrame.offset) {
        return i;
      }
    }
    
    return this.normalizedKeyframes.length - 1;
  }

  public getCurrentTransform(): Transform3D {
    return this.processor.getCurrentTransform(this.element);
  }

  public addKeyframe(transform: Transform3D, offset?: number): void {
    const insertOffset = offset ?? 1;
    const newKeyframe: KeyframeConfig = {
      offset: insertOffset,
      transform,
      easing: this.config.easing as string,
    };
    
    // Insert at the correct position
    let insertIndex = this.normalizedKeyframes.length;
    for (let i = 0; i < this.normalizedKeyframes.length; i++) {
      if (this.normalizedKeyframes[i].offset > insertOffset) {
        insertIndex = i;
        break;
      }
    }
    
    this.normalizedKeyframes.splice(insertIndex, 0, newKeyframe);
  }

  public dispose(): void {
    if (this.isDisposed) return;
    
    this.stop();
    this.isDisposed = true;
    this.cleanupElement();
  }
}
