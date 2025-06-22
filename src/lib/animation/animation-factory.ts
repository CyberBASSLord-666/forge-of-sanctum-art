
import { MotionConfig, SpringConfig } from './motion-types';

export interface DeviceCapabilities {
  maxAnimations: number;
  preferredFPS: number;
  supportsHardwareAcceleration: boolean;
  deviceType: 'mobile' | 'tablet' | 'desktop' | 'ultrawide';
}

export interface AnimationProfile {
  complexity: 'basic' | 'medium' | 'advanced';
  particleCount: number;
  duration: number;
  fps: number;
}

class AnimationFactory {
  private profile: AnimationProfile;
  private capabilities: DeviceCapabilities;

  constructor() {
    this.capabilities = this.detectDeviceCapabilities();
    this.profile = this.createDefaultProfile();
  }

  private detectDeviceCapabilities(): DeviceCapabilities {
    const userAgent = navigator.userAgent.toLowerCase();
    const isMobile = /mobile|android|ios/.test(userAgent);
    const isTablet = /tablet|ipad/.test(userAgent);
    
    const deviceType = isMobile ? 'mobile' : 
                      isTablet ? 'tablet' :
                      window.innerWidth > 2560 ? 'ultrawide' : 'desktop';

    return {
      maxAnimations: deviceType === 'mobile' ? 3 : deviceType === 'tablet' ? 5 : 8,
      preferredFPS: deviceType === 'mobile' ? 30 : 60,
      supportsHardwareAcceleration: 'CSS' in window && 'supports' in (window as any).CSS,
      deviceType,
    };
  }

  private createDefaultProfile(): AnimationProfile {
    const { deviceType } = this.capabilities;
    
    switch (deviceType) {
      case 'mobile':
        return { complexity: 'basic', particleCount: 8, duration: 300, fps: 30 };
      case 'tablet':
        return { complexity: 'medium', particleCount: 16, duration: 400, fps: 45 };
      default:
        return { complexity: 'advanced', particleCount: 24, duration: 500, fps: 60 };
    }
  }

  public createMotionConfig(intensity: 'subtle' | 'medium' | 'strong' | 'immersive'): MotionConfig {
    const baseDuration = this.profile.duration;
    
    const configs = {
      subtle: { duration: baseDuration * 0.7, easing: 'easeOutQuad' },
      medium: { duration: baseDuration, easing: 'easeOutCubic' },
      strong: { duration: baseDuration * 1.3, easing: 'easeOutQuart' },
      immersive: { duration: baseDuration * 1.6, easing: 'easeOutElastic' },
    };

    return configs[intensity];
  }

  public createSpringConfig(stiffness: 'soft' | 'medium' | 'stiff'): SpringConfig {
    const configs = {
      soft: { tension: 120, friction: 14, mass: 1, velocity: 0, precision: 0.01 },
      medium: { tension: 180, friction: 12, mass: 1, velocity: 0, precision: 0.01 },
      stiff: { tension: 300, friction: 10, mass: 1, velocity: 0, precision: 0.01 },
    };

    return configs[stiffness];
  }

  public getDeviceCapabilities(): DeviceCapabilities {
    return this.capabilities;
  }

  public getCurrentProfile(): AnimationProfile {
    return this.profile;
  }

  public updateProfile(updates: Partial<AnimationProfile>): void {
    this.profile = { ...this.profile, ...updates };
  }
}

export const animationFactory = new AnimationFactory();
