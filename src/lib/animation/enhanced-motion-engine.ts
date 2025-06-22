
import { MotionConfig, Transform3D, SpringConfig, PhysicsConfig, IMuseAnimation } from './motion-types';
import { EnhancedBaseAnimation } from './animations/enhanced-base-animation';
import { EnhancedSpringAnimation } from './animations/enhanced-spring-animation';
import { EnhancedKeyframeAnimation } from './animations/enhanced-keyframe-animation';
import { EnhancedPhysicsAnimation } from './animations/enhanced-physics-animation';
import { AnimationScheduler } from './core/animation-scheduler';
import { TransformProcessor } from './core/transform-processor';
import { PerformanceProfiler } from './core/performance-profiler';
import { ErrorRecoveryManager } from './core/error-recovery-manager';

export interface AnimationQueueItem {
  id: string;
  animation: IMuseAnimation;
  priority: number;
  startTime: number;
  element: HTMLElement;
  config: MotionConfig;
}

export interface EnhancedMotionConfig extends MotionConfig {
  priority?: number;
  gpuAcceleration?: boolean;
  errorRecovery?: boolean;
  performanceMode?: 'quality' | 'performance' | 'balanced';
  reducedMotion?: boolean;
}

class EnhancedMotionEngine {
  private scheduler: AnimationScheduler;
  private transformProcessor: TransformProcessor;
  private profiler: PerformanceProfiler;
  private errorManager: ErrorRecoveryManager;
  private animationQueue = new Map<string, AnimationQueueItem>();
  private activeAnimations = new Set<string>();
  private isRunning = false;
  private frameId: number | null = null;
  private lastFrameTime = 0;
  private targetFPS = 60;
  private adaptiveQuality = true;

  constructor() {
    this.scheduler = new AnimationScheduler();
    this.transformProcessor = new TransformProcessor();
    this.profiler = new PerformanceProfiler();
    this.errorManager = new ErrorRecoveryManager();
    
    this.bindMethods();
    this.setupPerformanceMonitoring();
    this.detectReducedMotionPreference();
  }

  private bindMethods(): void {
    this.tick = this.tick.bind(this);
    this.handleVisibilityChange = this.handleVisibilityChange.bind(this);
    this.handleResize = this.handleResize.bind(this);
  }

  private setupPerformanceMonitoring(): void {
    document.addEventListener('visibilitychange', this.handleVisibilityChange);
    window.addEventListener('resize', this.handleResize);
    
    this.profiler.onPerformanceChange((metrics) => {
      if (this.adaptiveQuality) {
        this.adjustQualityBasedOnPerformance(metrics);
      }
    });
  }

  private detectReducedMotionPreference(): boolean {
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  }

  private adjustQualityBasedOnPerformance(metrics: any): void {
    if (metrics.fps < 30) {
      this.targetFPS = 30;
      this.scheduler.reduceComplexity();
    } else if (metrics.fps > 55) {
      this.targetFPS = 60;
      this.scheduler.increaseComplexity();
    }
  }

  public async animateElement(
    element: HTMLElement,
    targetTransform: Transform3D,
    config: EnhancedMotionConfig
  ): Promise<void> {
    return new Promise((resolve, reject) => {
      try {
        const animationId = this.generateId();
        const processedConfig = this.processConfig(config);
        const startTransform = this.transformProcessor.getCurrentTransform(element);
        
        if (processedConfig.reducedMotion && this.detectReducedMotionPreference()) {
          this.transformProcessor.applyTransformInstantly(element, targetTransform);
          resolve();
          return;
        }

        const animation = new EnhancedBaseAnimation(
          element,
          startTransform,
          targetTransform,
          processedConfig,
          () => {
            this.removeAnimation(animationId);
            resolve();
          },
          (error) => {
            this.errorManager.handleAnimationError(error, animationId);
            this.removeAnimation(animationId);
            reject(error);
          }
        );

        this.addAnimation(animationId, animation, element, processedConfig);
        this.startEngine();
      } catch (error) {
        this.errorManager.handleAnimationError(error as Error, 'setup');
        reject(error);
      }
    });
  }

  public async createSpringAnimation(
    element: HTMLElement,
    target: Transform3D,
    config: SpringConfig & EnhancedMotionConfig
  ): Promise<string> {
    return new Promise((resolve, reject) => {
      try {
        const animationId = this.generateId();
        const processedConfig = this.processConfig(config);
        
        const animation = new EnhancedSpringAnimation(
          element,
          target,
          { ...config, ...processedConfig },
          () => {
            this.removeAnimation(animationId);
            resolve(animationId);
          },
          (error) => {
            this.errorManager.handleAnimationError(error, animationId);
            this.removeAnimation(animationId);
            reject(error);
          }
        );

        this.addAnimation(animationId, animation, element, processedConfig);
        this.startEngine();
      } catch (error) {
        this.errorManager.handleAnimationError(error as Error, 'spring_setup');
        reject(error);
      }
    });
  }

  public async createKeyframeAnimation(
    element: HTMLElement,
    keyframes: Transform3D[],
    config: EnhancedMotionConfig
  ): Promise<string> {
    return new Promise((resolve, reject) => {
      try {
        const animationId = this.generateId();
        const processedConfig = this.processConfig(config);
        
        const animation = new EnhancedKeyframeAnimation(
          element,
          keyframes,
          processedConfig,
          () => {
            this.removeAnimation(animationId);
            resolve(animationId);
          },
          (error) => {
            this.errorManager.handleAnimationError(error, animationId);
            this.removeAnimation(animationId);
            reject(error);
          }
        );

        this.addAnimation(animationId, animation, element, processedConfig);
        this.startEngine();
      } catch (error) {
        this.errorManager.handleAnimationError(error as Error, 'keyframe_setup');
        reject(error);
      }
    });
  }

  public async createPhysicsAnimation(
    element: HTMLElement,
    initialVelocity: { x: number; y: number },
    config: PhysicsConfig & EnhancedMotionConfig
  ): Promise<string> {
    return new Promise((resolve, reject) => {
      try {
        const animationId = this.generateId();
        const processedConfig = this.processConfig(config);
        
        const animation = new EnhancedPhysicsAnimation(
          element,
          initialVelocity,
          { ...config, ...processedConfig },
          () => {
            this.removeAnimation(animationId);
            resolve(animationId);
          },
          (error) => {
            this.errorManager.handleAnimationError(error, animationId);
            this.removeAnimation(animationId);
            reject(error);
          }
        );

        this.addAnimation(animationId, animation, element, processedConfig);
        this.startEngine();
      } catch (error) {
        this.errorManager.handleAnimationError(error as Error, 'physics_setup');
        reject(error);
      }
    });
  }

  private processConfig(config: EnhancedMotionConfig): EnhancedMotionConfig {
    const defaultConfig: EnhancedMotionConfig = {
      duration: 300,
      easing: 'easeOutCubic',
      priority: 0,
      gpuAcceleration: true,
      errorRecovery: true,
      performanceMode: 'balanced',
      reducedMotion: false,
    };

    return { ...defaultConfig, ...config };
  }

  private addAnimation(
    id: string,
    animation: IMuseAnimation,
    element: HTMLElement,
    config: EnhancedMotionConfig
  ): void {
    const queueItem: AnimationQueueItem = {
      id,
      animation,
      priority: config.priority || 0,
      startTime: performance.now(),
      element,
      config,
    };

    this.animationQueue.set(id, queueItem);
    this.scheduler.scheduleAnimation(queueItem);
  }

  private removeAnimation(id: string): void {
    this.animationQueue.delete(id);
    this.activeAnimations.delete(id);
    this.scheduler.removeAnimation(id);

    if (this.animationQueue.size === 0) {
      this.stopEngine();
    }
  }

  private startEngine(): void {
    if (!this.isRunning) {
      this.isRunning = true;
      this.lastFrameTime = performance.now();
      this.tick();
    }
  }

  private stopEngine(): void {
    this.isRunning = false;
    if (this.frameId) {
      cancelAnimationFrame(this.frameId);
      this.frameId = null;
    }
  }

  private tick(): void {
    if (!this.isRunning) return;

    const currentTime = performance.now();
    const deltaTime = currentTime - this.lastFrameTime;
    const targetFrameTime = 1000 / this.targetFPS;

    if (deltaTime >= targetFrameTime) {
      this.profiler.startFrame();
      
      try {
        this.scheduler.processAnimations(currentTime, deltaTime);
        this.lastFrameTime = currentTime - (deltaTime % targetFrameTime);
      } catch (error) {
        this.errorManager.handleEngineError(error as Error);
      }
      
      this.profiler.endFrame();
    }

    this.frameId = requestAnimationFrame(this.tick);
  }

  private handleVisibilityChange(): void {
    if (document.hidden) {
      this.pauseAllAnimations();
    } else {
      this.resumeAllAnimations();
    }
  }

  private handleResize(): void {
    this.transformProcessor.invalidateCache();
  }

  private pauseAllAnimations(): void {
    this.animationQueue.forEach(({ animation }) => {
      if (animation.pause) animation.pause();
    });
  }

  private resumeAllAnimations(): void {
    this.animationQueue.forEach(({ animation }) => {
      if (animation.resume) animation.resume();
    });
  }

  public stopAnimation(id: string): void {
    const queueItem = this.animationQueue.get(id);
    if (queueItem) {
      queueItem.animation.stop();
      this.removeAnimation(id);
    }
  }

  public stopAllAnimations(): void {
    this.animationQueue.forEach(({ animation }) => animation.stop());
    this.animationQueue.clear();
    this.activeAnimations.clear();
    this.stopEngine();
  }

  public getPerformanceMetrics() {
    return this.profiler.getMetrics();
  }

  public getActiveAnimationCount(): number {
    return this.activeAnimations.size;
  }

  private generateId(): string {
    return `enhanced_motion_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  public dispose(): void {
    this.stopAllAnimations();
    document.removeEventListener('visibilitychange', this.handleVisibilityChange);
    window.removeEventListener('resize', this.handleResize);
    this.profiler.dispose();
    this.errorManager.dispose();
  }
}

export const enhancedMotionEngine = new EnhancedMotionEngine();
