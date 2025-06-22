
import { IMuseAnimation, PhysicsConfig } from '../motion-types';

export class MusePhysicsObject implements IMuseAnimation {
  private rafId: number | null = null;
  public isActive = false;
  private position: { x: number; y: number };
  private velocity: { x: number; y: number };

  constructor(
    private element: HTMLElement,
    initialVelocity: { x: number; y: number },
    private config: PhysicsConfig
  ) {
    const rect = element.getBoundingClientRect();
    this.position = { x: rect.left, y: rect.top };
    this.velocity = { ...initialVelocity };
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

    const dt = 1 / 60;

    // Apply gravity
    this.velocity.y += this.config.gravity * dt;

    // Apply friction
    this.velocity.x *= (1 - this.config.friction * dt);
    this.velocity.y *= (1 - this.config.friction * dt);

    // Update position
    this.position.x += this.velocity.x * dt;
    this.position.y += this.velocity.y * dt;

    // Handle boundaries
    this.handleBoundaryCollisions();

    // Apply position to element
    this.element.style.transform = `translate(${this.position.x}px, ${this.position.y}px)`;

    this.rafId = requestAnimationFrame(this.tick);
  };

  private handleBoundaryCollisions(): void {
    const boundaries = this.config.boundaries;
    if (!boundaries) return;

    if (boundaries.left !== undefined && this.position.x < boundaries.left) {
      this.position.x = boundaries.left;
      this.velocity.x *= -this.config.elasticity;
    }

    if (boundaries.right !== undefined && this.position.x > boundaries.right) {
      this.position.x = boundaries.right;
      this.velocity.x *= -this.config.elasticity;
    }

    if (boundaries.top !== undefined && this.position.y < boundaries.top) {
      this.position.y = boundaries.top;
      this.velocity.y *= -this.config.elasticity;
    }

    if (boundaries.bottom !== undefined && this.position.y > boundaries.bottom) {
      this.position.y = boundaries.bottom;
      this.velocity.y *= -this.config.elasticity;
    }
  }
}
