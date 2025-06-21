
import { RefObject, useEffect, useRef, useCallback, useMemo } from 'react';

export interface MotionConfig {
  duration: number;
  easing: string | number[];
  delay?: number;
  repeat?: number | 'infinite';
  direction?: 'normal' | 'reverse' | 'alternate' | 'alternate-reverse';
  fillMode?: 'none' | 'forwards' | 'backwards' | 'both';
  playState?: 'running' | 'paused';
}

export interface Transform3D {
  translateX?: number;
  translateY?: number;
  translateZ?: number;
  rotateX?: number;
  rotateY?: number;
  rotateZ?: number;
  scaleX?: number;
  scaleY?: number;
  scaleZ?: number;
  skewX?: number;
  skewY?: number;
  perspective?: number;
}

export interface MotionState {
  isAnimating: boolean;
  progress: number;
  velocity: { x: number; y: number };
  acceleration: { x: number; y: number };
}

export interface SpringConfig {
  tension: number;
  friction: number;
  mass: number;
  velocity: number;
  precision: number;
}

export interface PhysicsConfig {
  gravity: number;
  friction: number;
  elasticity: number;
  boundaries?: {
    top?: number;
    right?: number;
    bottom?: number;
    left?: number;
  };
}

// Core animation interface for all custom animations
export interface IMuseAnimation {
  start(): void;
  stop(): void;
  pause?(): void;
  resume?(): void;
  isActive: boolean;
}

class MotionEngine {
  private animationFrame: number | null = null;
  private startTime: number | null = null;
  private activeAnimations: Map<string, IMuseAnimation> = new Map();
  private springAnimations: Map<string, MuseSpringAnimation> = new Map();
  private physicsObjects: Map<string, MusePhysicsObject> = new Map();
  
  // High-performance easing functions
  private readonly easingFunctions = {
    linear: (t: number) => t,
    easeInQuad: (t: number) => t * t,
    easeOutQuad: (t: number) => t * (2 - t),
    easeInOutQuad: (t: number) => t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t,
    easeInCubic: (t: number) => t * t * t,
    easeOutCubic: (t: number) => --t * t * t + 1,
    easeInOutCubic: (t: number) => t < 0.5 ? 4 * t * t * t : (t - 1) * (2 * t - 2) * (2 * t - 2) + 1,
    easeInQuart: (t: number) => t * t * t * t,
    easeOutQuart: (t: number) => 1 - --t * t * t * t,
    easeInOutQuart: (t: number) => t < 0.5 ? 8 * t * t * t * t : 1 - 8 * --t * t * t * t,
    easeInQuint: (t: number) => t * t * t * t * t,
    easeOutQuint: (t: number) => 1 + --t * t * t * t * t,
    easeInOutQuint: (t: number) => t < 0.5 ? 16 * t * t * t * t * t : 1 + 16 * --t * t * t * t * t,
    easeInExpo: (t: number) => t === 0 ? 0 : Math.pow(2, 10 * (t - 1)),
    easeOutExpo: (t: number) => t === 1 ? 1 : 1 - Math.pow(2, -10 * t),
    easeInOutExpo: (t: number) => {
      if (t === 0) return 0;
      if (t === 1) return 1;
      if (t < 0.5) return Math.pow(2, 20 * t - 10) / 2;
      return (2 - Math.pow(2, -20 * t + 10)) / 2;
    },
    elasticOut: (t: number) => {
      const p = 0.3;
      return Math.pow(2, -10 * t) * Math.sin((t - p / 4) * (2 * Math.PI) / p) + 1;
    },
    bounceOut: (t: number) => {
      if (t < 1 / 2.75) return 7.5625 * t * t;
      if (t < 2 / 2.75) return 7.5625 * (t -= 1.5 / 2.75) * t + 0.75;
      if (t < 2.5 / 2.75) return 7.5625 * (t -= 2.25 / 2.75) * t + 0.9375;
      return 7.5625 * (t -= 2.625 / 2.75) * t + 0.984375;
    }
  };

  public createSpringAnimation(
    element: HTMLElement,
    target: Transform3D,
    config: SpringConfig
  ): string {
    const id = this.generateId();
    const spring = new MuseSpringAnimation(element, target, config);
    this.springAnimations.set(id, spring);
    spring.start();
    return id;
  }

  public createPhysicsObject(
    element: HTMLElement,
    initialVelocity: { x: number; y: number },
    config: PhysicsConfig
  ): string {
    const id = this.generateId();
    const physics = new MusePhysicsObject(element, initialVelocity, config);
    this.physicsObjects.set(id, physics);
    physics.start();
    return id;
  }

  public createSequentialAnimation(
    animations: Array<{ element: HTMLElement; config: MotionConfig; transform: Transform3D }>
  ): Promise<void> {
    return animations.reduce(
      (promise, { element, config, transform }) =>
        promise.then(() => this.animateElement(element, transform, config)),
      Promise.resolve()
    );
  }

  public createParallelAnimation(
    animations: Array<{ element: HTMLElement; config: MotionConfig; transform: Transform3D }>
  ): Promise<void[]> {
    return Promise.all(
      animations.map(({ element, config, transform }) =>
        this.animateElement(element, transform, config)
      )
    );
  }

  public animateElement(
    element: HTMLElement,
    targetTransform: Transform3D,
    config: MotionConfig
  ): Promise<void> {
    return new Promise((resolve, reject) => {
      const id = this.generateId();
      const startTransform = this.getCurrentTransform(element);
      const animation = new MuseAnimation(
        element,
        startTransform,
        targetTransform,
        config,
        this.easingFunctions,
        resolve,
        reject
      );
      
      this.activeAnimations.set(id, animation);
      animation.start();
    });
  }

  public createMorphingAnimation(
    element: HTMLElement,
    keyframes: Transform3D[],
    config: MotionConfig
  ): Promise<void> {
    return new Promise((resolve, reject) => {
      const id = this.generateId();
      const morphAnimation = new MuseKeyframeAnimation(
        element,
        keyframes,
        config,
        this.easingFunctions,
        resolve,
        reject
      );
      
      this.activeAnimations.set(id, morphAnimation);
      morphAnimation.start();
    });
  }

  public stopAnimation(id: string): void {
    const animation = this.activeAnimations.get(id);
    const spring = this.springAnimations.get(id);
    const physics = this.physicsObjects.get(id);
    
    if (animation) {
      animation.stop();
      this.activeAnimations.delete(id);
    }
    
    if (spring) {
      spring.stop();
      this.springAnimations.delete(id);
    }
    
    if (physics) {
      physics.stop();
      this.physicsObjects.delete(id);
    }
  }

  public stopAllAnimations(): void {
    this.activeAnimations.forEach(animation => animation.stop());
    this.springAnimations.forEach(spring => spring.stop());
    this.physicsObjects.forEach(physics => physics.stop());
    
    this.activeAnimations.clear();
    this.springAnimations.clear();
    this.physicsObjects.clear();
  }

  private getCurrentTransform(element: HTMLElement): Transform3D {
    const computedStyle = getComputedStyle(element);
    const transform = computedStyle.transform;
    
    if (transform === 'none') {
      return {
        translateX: 0,
        translateY: 0,
        translateZ: 0,
        rotateX: 0,
        rotateY: 0,
        rotateZ: 0,
        scaleX: 1,
        scaleY: 1,
        scaleZ: 1,
        skewX: 0,
        skewY: 0,
      };
    }
    
    // Parse transform matrix and extract values
    return this.parseTransformMatrix(transform);
  }

  private parseTransformMatrix(transform: string): Transform3D {
    // Advanced matrix parsing implementation
    const values = transform.match(/matrix.*\((.+)\)/)?.[1]?.split(', ') || [];
    
    if (values.length === 6) {
      // 2D matrix
      const [a, b, c, d, e, f] = values.map(Number);
      return {
        translateX: e,
        translateY: f,
        scaleX: Math.sqrt(a * a + b * b),
        scaleY: Math.sqrt(c * c + d * d),
        rotateZ: Math.atan2(b, a) * (180 / Math.PI),
        translateZ: 0,
        rotateX: 0,
        rotateY: 0,
        scaleZ: 1,
        skewX: 0,
        skewY: 0,
      };
    } else if (values.length === 16) {
      // 3D matrix
      const matrix = values.map(Number);
      return this.decompose3DMatrix(matrix);
    }
    
    return {
      translateX: 0,
      translateY: 0,
      translateZ: 0,
      rotateX: 0,
      rotateY: 0,
      rotateZ: 0,
      scaleX: 1,
      scaleY: 1,
      scaleZ: 1,
      skewX: 0,
      skewY: 0,
    };
  }

  private decompose3DMatrix(matrix: number[]): Transform3D {
    // Advanced 3D matrix decomposition
    const [m11, m12, m13, m14, m21, m22, m23, m24, m31, m32, m33, m34, m41, m42, m43, m44] = matrix;
    
    // Extract translation
    const translateX = m41;
    const translateY = m42;
    const translateZ = m43;
    
    // Extract scale
    const scaleX = Math.sqrt(m11 * m11 + m12 * m12 + m13 * m13);
    const scaleY = Math.sqrt(m21 * m21 + m22 * m22 + m23 * m23);
    const scaleZ = Math.sqrt(m31 * m31 + m32 * m32 + m33 * m33);
    
    // Extract rotation (simplified)
    const rotateX = Math.atan2(m32 / scaleZ, m33 / scaleZ) * (180 / Math.PI);
    const rotateY = Math.atan2(-m31 / scaleZ, Math.sqrt(m32 * m32 + m33 * m33) / scaleZ) * (180 / Math.PI);
    const rotateZ = Math.atan2(m21 / scaleY, m11 / scaleX) * (180 / Math.PI);
    
    return {
      translateX,
      translateY,
      translateZ,
      rotateX,
      rotateY,
      rotateZ,
      scaleX,
      scaleY,
      scaleZ,
      skewX: 0, // Simplified
      skewY: 0, // Simplified
    };
  }

  private generateId(): string {
    return `motion_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}

class MuseAnimation implements IMuseAnimation {
  private startTime: number | null = null;
  private rafId: number | null = null;
  public isActive = false;

  constructor(
    private element: HTMLElement,
    private startTransform: Transform3D,
    private targetTransform: Transform3D,
    private config: MotionConfig,
    private easingFunctions: Record<string, (t: number) => number>,
    private onComplete: () => void,
    private onError: (error: Error) => void
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
    const easingFunction = this.easingFunctions[easingName] || this.easingFunctions.linear;
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

    this.applyTransform(currentTransform);
  }

  protected applyTransform(transform: Transform3D): void {
    const transformString = this.buildTransformString(transform);
    this.element.style.transform = transformString;
    
    // Enable hardware acceleration
    this.element.style.willChange = 'transform';
    this.element.style.backfaceVisibility = 'hidden';
    this.element.style.perspective = '1000px';
  }

  protected buildTransformString(transform: Transform3D): string {
    const parts: string[] = [];

    if (transform.perspective) parts.push(`perspective(${transform.perspective}px)`);
    if (transform.translateX !== undefined) parts.push(`translateX(${transform.translateX}px)`);
    if (transform.translateY !== undefined) parts.push(`translateY(${transform.translateY}px)`);
    if (transform.translateZ !== undefined) parts.push(`translateZ(${transform.translateZ}px)`);
    if (transform.rotateX !== undefined) parts.push(`rotateX(${transform.rotateX}deg)`);
    if (transform.rotateY !== undefined) parts.push(`rotateY(${transform.rotateY}deg)`);
    if (transform.rotateZ !== undefined) parts.push(`rotateZ(${transform.rotateZ}deg)`);
    if (transform.scaleX !== undefined) parts.push(`scaleX(${transform.scaleX})`);
    if (transform.scaleY !== undefined) parts.push(`scaleY(${transform.scaleY})`);
    if (transform.scaleZ !== undefined) parts.push(`scaleZ(${transform.scaleZ})`);
    if (transform.skewX !== undefined) parts.push(`skewX(${transform.skewX}deg)`);
    if (transform.skewY !== undefined) parts.push(`skewY(${transform.skewY}deg)`);

    return parts.join(' ');
  }

  private handleComplete(): void {
    this.stop();
    this.element.style.willChange = 'auto';
    this.onComplete();
  }
}

class MuseSpringAnimation implements IMuseAnimation {
  private rafId: number | null = null;
  public isActive = false;
  private currentTransform: Transform3D;
  private velocity: Record<keyof Transform3D, number> = {} as any;

  constructor(
    private element: HTMLElement,
    private targetTransform: Transform3D,
    private config: SpringConfig
  ) {
    this.currentTransform = this.getCurrentTransform();
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

  private getCurrentTransform(): Transform3D {
    const computedStyle = getComputedStyle(this.element);
    const transform = computedStyle.transform;
    
    if (transform === 'none') {
      return {
        translateX: 0,
        translateY: 0,
        translateZ: 0,
        rotateX: 0,
        rotateY: 0,
        rotateZ: 0,
        scaleX: 1,
        scaleY: 1,
        scaleZ: 1,
        skewX: 0,
        skewY: 0,
      };
    }
    
    // Simplified transform parsing for spring animations
    return {
      translateX: 0,
      translateY: 0,
      translateZ: 0,
      rotateX: 0,
      rotateY: 0,
      rotateZ: 0,
      scaleX: 1,
      scaleY: 1,
      scaleZ: 1,
      skewX: 0,
      skewY: 0,
    };
  }

  private initializeVelocity(): void {
    Object.keys(this.targetTransform).forEach(key => {
      this.velocity[key as keyof Transform3D] = this.config.velocity;
    });
  }

  private applyTransform(): void {
    const transformString = this.buildTransformString();
    this.element.style.transform = transformString;
  }

  private buildTransformString(): string {
    const parts: string[] = [];

    if (this.currentTransform.perspective) parts.push(`perspective(${this.currentTransform.perspective}px)`);
    if (this.currentTransform.translateX !== undefined) parts.push(`translateX(${this.currentTransform.translateX}px)`);
    if (this.currentTransform.translateY !== undefined) parts.push(`translateY(${this.currentTransform.translateY}px)`);
    if (this.currentTransform.translateZ !== undefined) parts.push(`translateZ(${this.currentTransform.translateZ}px)`);
    if (this.currentTransform.rotateX !== undefined) parts.push(`rotateX(${this.currentTransform.rotateX}deg)`);
    if (this.currentTransform.rotateY !== undefined) parts.push(`rotateY(${this.currentTransform.rotateY}deg)`);
    if (this.currentTransform.rotateZ !== undefined) parts.push(`rotateZ(${this.currentTransform.rotateZ}deg)`);
    if (this.currentTransform.scaleX !== undefined) parts.push(`scaleX(${this.currentTransform.scaleX})`);
    if (this.currentTransform.scaleY !== undefined) parts.push(`scaleY(${this.currentTransform.scaleY})`);
    if (this.currentTransform.scaleZ !== undefined) parts.push(`scaleZ(${this.currentTransform.scaleZ})`);
    if (this.currentTransform.skewX !== undefined) parts.push(`skewX(${this.currentTransform.skewX}deg)`);
    if (this.currentTransform.skewY !== undefined) parts.push(`skewY(${this.currentTransform.skewY}deg)`);

    return parts.join(' ');
  }
}

class MuseKeyframeAnimation extends MuseAnimation {
  constructor(
    element: HTMLElement,
    private keyframes: Transform3D[],
    config: MotionConfig,
    easingFunctions: Record<string, (t: number) => number>,
    onComplete: () => void,
    onError: (error: Error) => void
  ) {
    super(element, keyframes[0], keyframes[keyframes.length - 1], config, easingFunctions, onComplete, onError);
  }

  protected updateTransform(progress: number): void {
    const segmentCount = this.keyframes.length - 1;
    const segmentProgress = progress * segmentCount;
    const currentSegment = Math.floor(segmentProgress);
    const segmentLocalProgress = segmentProgress - currentSegment;

    if (currentSegment >= segmentCount) {
      super.updateTransform(1);
      return;
    }

    const startFrame = this.keyframes[currentSegment];
    const endFrame = this.keyframes[currentSegment + 1];
    const interpolatedTransform: Transform3D = {};

    Object.keys(endFrame).forEach(key => {
      const transformKey = key as keyof Transform3D;
      const start = startFrame[transformKey] || 0;
      const end = endFrame[transformKey] || 0;
      interpolatedTransform[transformKey] = start + (end - start) * segmentLocalProgress;
    });

    this.applyTransform(interpolatedTransform);
  }
}

class MusePhysicsObject implements IMuseAnimation {
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

export const motionEngine = new MotionEngine();

export const useMotionEngine = () => {
  return useMemo(() => ({
    animate: motionEngine.animateElement.bind(motionEngine),
    spring: motionEngine.createSpringAnimation.bind(motionEngine),
    physics: motionEngine.createPhysicsObject.bind(motionEngine),
    sequence: motionEngine.createSequentialAnimation.bind(motionEngine),
    parallel: motionEngine.createParallelAnimation.bind(motionEngine),
    morph: motionEngine.createMorphingAnimation.bind(motionEngine),
    stop: motionEngine.stopAnimation.bind(motionEngine),
    stopAll: motionEngine.stopAllAnimations.bind(motionEngine),
  }), []);
};
