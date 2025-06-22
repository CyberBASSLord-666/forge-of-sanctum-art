
import { IMuseAnimation, PhysicsConfig } from '../motion-types';

export interface EnhancedPhysicsConfig extends PhysicsConfig {
  airResistance?: number;
  restitution?: number;
  staticFriction?: number;
  kineticFriction?: number;
  maxVelocity?: number;
  minVelocity?: number;
  integrationMethod?: 'euler' | 'verlet' | 'rk4';
  collisionDetection?: boolean;
  constraintSolver?: boolean;
  timeStep?: number;
}

export interface Vector2D {
  x: number;
  y: number;
}

export interface PhysicsState {
  position: Vector2D;
  velocity: Vector2D;
  acceleration: Vector2D;
  force: Vector2D;
  mass: number;
  timestamp: number;
}

export class EnhancedPhysicsAnimation implements IMuseAnimation {
  private rafId: number | null = null;
  public isActive = false;
  private isPaused = false;
  private pausedTime: number | null = null;
  private startTime: number = 0;
  private state: PhysicsState;
  private config: EnhancedPhysicsConfig;
  private previousStates: PhysicsState[] = [];
  private constraints: Array<(state: PhysicsState) => PhysicsState> = [];
  private isDisposed = false;

  constructor(
    private element: HTMLElement,
    initialVelocity: Vector2D,
    config: EnhancedPhysicsConfig,
    private onComplete: () => void,
    private onError: (error: Error) => void
  ) {
    this.config = this.processConfig(config);
    this.state = this.initializeState(initialVelocity);
    this.setupConstraints();
    this.validateInputs();
  }

  private processConfig(config: EnhancedPhysicsConfig): EnhancedPhysicsConfig {
    return {
      gravity: 980, // pixels/s²
      friction: 0.1,
      elasticity: 0.7,
      airResistance: 0.01,
      restitution: 0.8,
      staticFriction: 0.6,
      kineticFriction: 0.4,
      maxVelocity: 2000,
      minVelocity: 0.1,
      integrationMethod: 'verlet',
      collisionDetection: true,
      constraintSolver: true,
      timeStep: 1/60, // 60 FPS
      boundaries: {
        top: 0,
        right: window.innerWidth,
        bottom: window.innerHeight,
        left: 0,
      },
      ...config,
    };
  }

  private initializeState(initialVelocity: Vector2D): PhysicsState {
    const rect = this.element.getBoundingClientRect();
    
    return {
      position: { x: rect.left, y: rect.top },
      velocity: { ...initialVelocity },
      acceleration: { x: 0, y: 0 },
      force: { x: 0, y: 0 },
      mass: 1,
      timestamp: performance.now(),
    };
  }

  private setupConstraints(): void {
    // Add boundary constraint
    if (this.config.boundaries) {
      this.constraints.push(this.createBoundaryConstraint());
    }

    // Add velocity constraint
    this.constraints.push(this.createVelocityConstraint());
  }

  private createBoundaryConstraint() {
    return (state: PhysicsState): PhysicsState => {
      const bounds = this.config.boundaries!;
      const elementRect = this.element.getBoundingClientRect();
      const width = elementRect.width;
      const height = elementRect.height;

      let { position, velocity } = state;
      let collisionOccurred = false;

      // Left boundary
      if (bounds.left !== undefined && position.x < bounds.left) {
        position.x = bounds.left;
        velocity.x = Math.abs(velocity.x) * this.config.restitution!;
        collisionOccurred = true;
      }

      // Right boundary
      if (bounds.right !== undefined && position.x + width > bounds.right) {
        position.x = bounds.right - width;
        velocity.x = -Math.abs(velocity.x) * this.config.restitution!;
        collisionOccurred = true;
      }

      // Top boundary
      if (bounds.top !== undefined && position.y < bounds.top) {
        position.y = bounds.top;
        velocity.y = Math.abs(velocity.y) * this.config.restitution!;
        collisionOccurred = true;
      }

      // Bottom boundary
      if (bounds.bottom !== undefined && position.y + height > bounds.bottom) {
        position.y = bounds.bottom - height;
        velocity.y = -Math.abs(velocity.y) * this.config.restitution!;
        collisionOccurred = true;
      }

      // Apply friction on collision
      if (collisionOccurred) {
        const frictionCoeff = this.getMagnitude(velocity) > 0.1 ? 
          this.config.kineticFriction! : this.config.staticFriction!;
        
        velocity.x *= (1 - frictionCoeff);
        velocity.y *= (1 - frictionCoeff);
      }

      return { ...state, position, velocity };
    };
  }

  private createVelocityConstraint() {
    return (state: PhysicsState): PhysicsState => {
      const { velocity } = state;
      const magnitude = this.getMagnitude(velocity);
      
      if (magnitude > this.config.maxVelocity!) {
        const scale = this.config.maxVelocity! / magnitude;
        velocity.x *= scale;
        velocity.y *= scale;
      }
      
      if (magnitude < this.config.minVelocity! && magnitude > 0) {
        velocity.x = 0;
        velocity.y = 0;
      }
      
      return { ...state, velocity };
    };
  }

  private validateInputs(): void {
    if (!this.element || !(this.element instanceof HTMLElement)) {
      throw new Error('Invalid element provided to physics animation');
    }

    if (!document.body.contains(this.element)) {
      throw new Error('Element not in DOM');
    }

    if (this.config.timeStep! <= 0) {
      throw new Error('Time step must be positive');
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
      this.state.timestamp = this.startTime;
      
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
    this.state.timestamp += pauseDuration;
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
    style.position = 'absolute';
    style.backfaceVisibility = 'hidden';
  }

  private cleanupElement(): void {
    const style = this.element.style;
    style.willChange = 'auto';
    style.backfaceVisibility = '';
  }

  private tick = (): void => {
    if (!this.isActive || this.isPaused || this.isDisposed) return;

    try {
      if (!document.body.contains(this.element)) {
        this.handleError(new Error('Element removed from DOM during physics animation'));
        return;
      }

      const currentTime = performance.now();
      const deltaTime = Math.min((currentTime - this.state.timestamp) / 1000, this.config.timeStep!);
      
      // Store previous state for Verlet integration
      this.previousStates.push({ ...this.state });
      if (this.previousStates.length > 3) {
        this.previousStates.shift();
      }

      // Calculate forces
      this.calculateForces();

      // Integrate motion
      this.integrateMotion(deltaTime);

      // Apply constraints
      if (this.config.constraintSolver) {
        this.applyConstraints();
      }

      // Update element position
      this.updateElementPosition();

      // Check for rest state
      if (this.isAtRest()) {
        this.handleComplete();
        return;
      }

      this.state.timestamp = currentTime;
      this.rafId = requestAnimationFrame(this.tick);
    } catch (error) {
      this.handleError(error as Error);
    }
  };

  private calculateForces(): void {
    const { velocity } = this.state;
    
    // Reset forces
    this.state.force = { x: 0, y: 0 };

    // Gravity
    this.state.force.y += this.config.gravity * this.state.mass;

    // Air resistance (quadratic drag)
    const velocityMagnitude = this.getMagnitude(velocity);
    if (velocityMagnitude > 0) {
      const dragMagnitude = this.config.airResistance! * velocityMagnitude * velocityMagnitude;
      const dragDirection = this.normalize(velocity);
      
      this.state.force.x -= dragDirection.x * dragMagnitude;
      this.state.force.y -= dragDirection.y * dragMagnitude;
    }

    // General friction
    this.state.force.x -= velocity.x * this.config.friction;
    this.state.force.y -= velocity.y * this.config.friction;

    // Calculate acceleration from force
    this.state.acceleration.x = this.state.force.x / this.state.mass;
    this.state.acceleration.y = this.state.force.y / this.state.mass;
  }

  private integrateMotion(deltaTime: number): void {
    switch (this.config.integrationMethod) {
      case 'euler':
        this.integrateEuler(deltaTime);
        break;
      case 'verlet':
        this.integrateVerlet(deltaTime);
        break;
      case 'rk4':
        this.integrateRK4(deltaTime);
        break;
      default:
        this.integrateVerlet(deltaTime);
    }
  }

  private integrateEuler(deltaTime: number): void {
    // Simple Euler integration
    this.state.velocity.x += this.state.acceleration.x * deltaTime;
    this.state.velocity.y += this.state.acceleration.y * deltaTime;
    
    this.state.position.x += this.state.velocity.x * deltaTime;
    this.state.position.y += this.state.velocity.y * deltaTime;
  }

  private integrateVerlet(deltaTime: number): void {
    if (this.previousStates.length < 1) {
      // Fall back to Euler for first frame
      this.integrateEuler(deltaTime);
      return;
    }

    const prevState = this.previousStates[this.previousStates.length - 1];
    const dt2 = deltaTime * deltaTime;

    // Verlet integration for better stability
    const newPosX = 2 * this.state.position.x - prevState.position.x + this.state.acceleration.x * dt2;
    const newPosY = 2 * this.state.position.y - prevState.position.y + this.state.acceleration.y * dt2;

    // Update velocity based on position change
    this.state.velocity.x = (newPosX - prevState.position.x) / (2 * deltaTime);
    this.state.velocity.y = (newPosY - prevState.position.y) / (2 * deltaTime);

    this.state.position.x = newPosX;
    this.state.position.y = newPosY;
  }

  private integrateRK4(deltaTime: number): void {
    // Runge-Kutta 4th order integration for high accuracy
    const k1v = { x: this.state.acceleration.x, y: this.state.acceleration.y };
    const k1p = { x: this.state.velocity.x, y: this.state.velocity.y };

    const k2v = { x: this.state.acceleration.x, y: this.state.acceleration.y };
    const k2p = { 
      x: this.state.velocity.x + k1v.x * deltaTime / 2, 
      y: this.state.velocity.y + k1v.y * deltaTime / 2 
    };

    const k3v = { x: this.state.acceleration.x, y: this.state.acceleration.y };
    const k3p = { 
      x: this.state.velocity.x + k2v.x * deltaTime / 2, 
      y: this.state.velocity.y + k2v.y * deltaTime / 2 
    };

    const k4v = { x: this.state.acceleration.x, y: this.state.acceleration.y };
    const k4p = { 
      x: this.state.velocity.x + k3v.x * deltaTime, 
      y: this.state.velocity.y + k3v.y * deltaTime 
    };

    this.state.velocity.x += (k1v.x + 2*k2v.x + 2*k3v.x + k4v.x) * deltaTime / 6;
    this.state.velocity.y += (k1v.y + 2*k2v.y + 2*k3v.y + k4v.y) * deltaTime / 6;

    this.state.position.x += (k1p.x + 2*k2p.x + 2*k3p.x + k4p.x) * deltaTime / 6;
    this.state.position.y += (k1p.y + 2*k2p.y + 2*k3p.y + k4p.y) * deltaTime / 6;
  }

  private applyConstraints(): void {
    this.constraints.forEach(constraint => {
      this.state = constraint(this.state);
    });
  }

  private updateElementPosition(): void {
    const transform = `translate3d(${this.state.position.x}px, ${this.state.position.y}px, 0)`;
    this.element.style.transform = transform;
  }

  private isAtRest(): boolean {
    const velocityMagnitude = this.getMagnitude(this.state.velocity);
    const accelerationMagnitude = this.getMagnitude(this.state.acceleration);
    
    return velocityMagnitude < this.config.minVelocity! && 
           accelerationMagnitude < 10; // Small acceleration threshold
  }

  private getMagnitude(vector: Vector2D): number {
    return Math.sqrt(vector.x * vector.x + vector.y * vector.y);
  }

  private normalize(vector: Vector2D): Vector2D {
    const magnitude = this.getMagnitude(vector);
    if (magnitude === 0) return { x: 0, y: 0 };
    return { x: vector.x / magnitude, y: vector.y / magnitude };
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
      console.error('Physics animation error callback failed:', callbackError);
    }
  }

  public getState(): PhysicsState {
    return { ...this.state };
  }

  public setVelocity(velocity: Vector2D): void {
    this.state.velocity = { ...velocity };
  }

  public addForce(force: Vector2D): void {
    this.state.force.x += force.x;
    this.state.force.y += force.y;
  }

  public setPosition(position: Vector2D): void {
    this.state.position = { ...position };
    this.updateElementPosition();
  }

  public addConstraint(constraint: (state: PhysicsState) => PhysicsState): void {
    this.constraints.push(constraint);
  }

  public dispose(): void {
    if (this.isDisposed) return;
    
    this.stop();
    this.isDisposed = true;
    this.cleanupElement();
    this.previousStates.length = 0;
    this.constraints.length = 0;
  }
}
