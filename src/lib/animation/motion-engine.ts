
import { useMemo } from 'react';
import { MotionConfig, Transform3D, SpringConfig, PhysicsConfig, IMuseAnimation } from './motion-types';
import { getCurrentTransform } from './transform-utils';
import { MuseAnimation } from './animations/base-animation';
import { MuseSpringAnimation } from './animations/spring-animation';
import { MuseKeyframeAnimation } from './animations/keyframe-animation';
import { MusePhysicsObject } from './animations/physics-animation';

class MotionEngine {
  private activeAnimations: Map<string, IMuseAnimation> = new Map();
  private springAnimations: Map<string, MuseSpringAnimation> = new Map();
  private physicsObjects: Map<string, MusePhysicsObject> = new Map();

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
      const startTransform = getCurrentTransform(element);
      const animation = new MuseAnimation(
        element,
        startTransform,
        targetTransform,
        config,
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

  private generateId(): string {
    return `motion_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
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

// Re-export types
export * from './motion-types';
