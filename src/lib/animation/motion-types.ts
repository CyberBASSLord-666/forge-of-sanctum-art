
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

export interface IMuseAnimation {
  start(): void;
  stop(): void;
  pause?(): void;
  resume?(): void;
  isActive: boolean;
}
