
import { IMuseAnimation, MotionConfig, Transform3D } from '../motion-types';
import { easingFunctions } from '../easing-functions';
import { applyTransform } from '../transform-utils';

export class MuseAnimation implements IMuseAnimation {
  private startTime: number | null = null;
  private rafId: number | null = null;
  public isActive = false;

  constructor(
    protected element: HTMLElement,
    protected startTransform: Transform3D,
    protected targetTransform: Transform3D,
    protected config: MotionConfig,
    protected onComplete: () => void,
    protected onError: (error: Error) => void
  ) {}

  public start(): void {
    this.isActive = true;
    this.startTime = performance.now();
    this.tick();
  }

  public stop(): void {
    this.isActive = false;
    if (this.rafId) {
      cancelAnimationFrame(this.rafId);
      this.rafId = null;
    }
  }

  private tick = (): void => {
    if (!this.isActive || !this.startTime) return;

    const currentTime = performance.now();
    const elapsed = currentTime - this.startTime - (this.config.delay || 0);

    if (elapsed < 0) {
      this.rafId = requestAnimationFrame(this.tick);
      return;
    }

    const progress = Math.min(elapsed / this.config.duration, 1);
    const easingName = typeof this.config.easing === 'string' ? this.config.easing : 'linear';
    const easingFunction = easingFunctions[easingName] || easingFunctions.linear;
    const easedProgress = easingFunction(progress);

    this.updateTransform(easedProgress);

    if (progress >= 1) {
      this.handleComplete();
    } else {
      this.rafId = requestAnimationFrame(this.tick);
    }
  };

  protected updateTransform(progress: number): void {
    const currentTransform: Transform3D = {};

    Object.keys(this.targetTransform).forEach(key => {
      const transformKey = key as keyof Transform3D;
      const start = this.startTransform[transformKey] || 0;
      const target = this.targetTransform[transformKey] || 0;
      currentTransform[transformKey] = start + (target - start) * progress;
    });

    applyTransform(this.element, currentTransform);
  }

  private handleComplete(): void {
    this.stop();
    this.element.style.willChange = 'auto';
    this.onComplete();
  }
}
