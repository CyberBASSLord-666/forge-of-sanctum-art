
import { IMuseAnimation, SpringConfig, Transform3D } from '../motion-types';
import { getCurrentTransform, buildTransformString } from '../transform-utils';

export class MuseSpringAnimation implements IMuseAnimation {
  private rafId: number | null = null;
  public isActive = false;
  private currentTransform: Transform3D;
  private velocity: Record<keyof Transform3D, number> = {} as any;

  constructor(
    private element: HTMLElement,
    private targetTransform: Transform3D,
    private config: SpringConfig
  ) {
    this.currentTransform = getCurrentTransform(this.element);
    this.initializeVelocity();
  }

  public start(): void {
    this.isActive = true;
    this.tick();
  }

  public stop(): void {
    this.isActive = false;
    if (this.rafId) {
      cancelAnimationFrame(this.rafId);
    }
  }

  private tick = (): void => {
    if (!this.isActive) return;

    let hasMovement = false;
    const dt = 1 / 60; // 60 FPS

    Object.keys(this.targetTransform).forEach(key => {
      const transformKey = key as keyof Transform3D;
      const current = this.currentTransform[transformKey] || 0;
      const target = this.targetTransform[transformKey] || 0;
      const currentVelocity = this.velocity[transformKey] || 0;

      // Spring physics calculation
      const displacement = current - target;
      const springForce = -this.config.tension * displacement;
      const dampingForce = -this.config.friction * currentVelocity;
      const acceleration = (springForce + dampingForce) / this.config.mass;

      this.velocity[transformKey] = currentVelocity + acceleration * dt;
      this.currentTransform[transformKey] = current + this.velocity[transformKey] * dt;

      // Check if still moving
      if (Math.abs(displacement) > this.config.precision || Math.abs(this.velocity[transformKey]) > this.config.precision) {
        hasMovement = true;
      }
    });

    this.applyTransform();

    if (hasMovement) {
      this.rafId = requestAnimationFrame(this.tick);
    } else {
      this.stop();
    }
  };

  private initializeVelocity(): void {
    Object.keys(this.targetTransform).forEach(key => {
      this.velocity[key as keyof Transform3D] = this.config.velocity;
    });
  }

  private applyTransform(): void {
    const transformString = buildTransformString(this.currentTransform);
    this.element.style.transform = transformString;
  }
}
