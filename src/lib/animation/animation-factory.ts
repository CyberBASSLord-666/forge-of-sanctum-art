
import { MotionConfig, Transform3D, SpringConfig, PhysicsConfig } from './motion-engine';

export interface DeviceCapabilities {
  maxAnimations: number;
  preferredFPS: number;
  supportsHardwareAcceleration: boolean;
  memoryConstraints: 'low' | 'medium' | 'high';
  processingPower: 'low' | 'medium' | 'high';
}

export interface AnimationProfile {
  duration: number;
  easing: string;
  complexity: 'basic' | 'intermediate' | 'advanced' | 'ultra';
  particleCount: number;
  layerCount: number;
}

export class AnimationFactory {
  private static instance: AnimationFactory;
  private deviceCapabilities: DeviceCapabilities;
  private currentProfile: AnimationProfile;

  private constructor() {
    this.deviceCapabilities = this.detectDeviceCapabilities();
    this.currentProfile = this.createOptimalProfile();
  }

  public static getInstance(): AnimationFactory {
    if (!AnimationFactory.instance) {
      AnimationFactory.instance = new AnimationFactory();
    }
    return AnimationFactory.instance;
  }

  private detectDeviceCapabilities(): DeviceCapabilities {
    const canvas = document.createElement('canvas');
    const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
    
    // Memory estimation based on device characteristics
    const memory = (navigator as any).deviceMemory || 4;
    const cores = navigator.hardwareConcurrency || 4;
    const pixelRatio = window.devicePixelRatio || 1;
    
    return {
      maxAnimations: cores * 2,
      preferredFPS: pixelRatio > 2 ? 60 : 30,
      supportsHardwareAcceleration: !!gl,
      memoryConstraints: memory < 4 ? 'low' : memory < 8 ? 'medium' : 'high',
      processingPower: cores < 4 ? 'low' : cores < 8 ? 'medium' : 'high'
    };
  }

  private createOptimalProfile(): AnimationProfile {
    const { memoryConstraints, processingPower } = this.deviceCapabilities;
    
    if (memoryConstraints === 'low' || processingPower === 'low') {
      return {
        duration: 200,
        easing: 'easeOutQuad',
        complexity: 'basic',
        particleCount: 6,
        layerCount: 2
      };
    }
    
    if (memoryConstraints === 'medium' || processingPower === 'medium') {
      return {
        duration: 300,
        easing: 'easeOutCubic',
        complexity: 'intermediate',
        particleCount: 12,
        layerCount: 3
      };
    }
    
    return {
      duration: 400,
      easing: 'elasticOut',
      complexity: 'advanced',
      particleCount: 24,
      layerCount: 4
    };
  }

  public createMotionConfig(intensity: 'subtle' | 'medium' | 'strong' | 'immersive'): MotionConfig {
    const baseConfig = this.currentProfile;
    
    const intensityMultipliers = {
      subtle: 0.7,
      medium: 1.0,
      strong: 1.3,
      immersive: 1.6
    };
    
    const multiplier = intensityMultipliers[intensity];
    
    return {
      duration: baseConfig.duration * multiplier,
      easing: baseConfig.easing,
      fillMode: 'forwards'
    };
  }

  public createSpringConfig(stiffness: 'soft' | 'medium' | 'stiff'): SpringConfig {
    const configs = {
      soft: { tension: 120, friction: 14, mass: 1, velocity: 0, precision: 0.01 },
      medium: { tension: 180, friction: 12, mass: 1, velocity: 0, precision: 0.01 },
      stiff: { tension: 300, friction: 10, mass: 1, velocity: 0, precision: 0.01 }
    };
    
    return configs[stiffness];
  }

  public getDeviceCapabilities(): DeviceCapabilities {
    return { ...this.deviceCapabilities };
  }

  public getCurrentProfile(): AnimationProfile {
    return { ...this.currentProfile };
  }

  public updateProfile(overrides: Partial<AnimationProfile>): void {
    this.currentProfile = { ...this.currentProfile, ...overrides };
  }
}

export const animationFactory = AnimationFactory.getInstance();
