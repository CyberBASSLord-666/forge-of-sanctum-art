export interface PerformanceMetrics {
  fps: number;
  frameTime: number;
  droppedFrames: number;
  memoryUsage: number;
  animationCount: number;
  gestureResponseTime: number;
}

export interface PerformanceThresholds {
  minFPS: number;
  maxFrameTime: number;
  maxMemoryUsage: number;
  maxAnimationCount: number;
}

export class PerformanceMonitor {
  private metrics: PerformanceMetrics;
  private thresholds: PerformanceThresholds;
  private frameTimestamps: number[] = [];
  private isMonitoring = false;
  private rafId: number | null = null;
  private observers: ((metrics: PerformanceMetrics) => void)[] = [];

  constructor(thresholds?: Partial<PerformanceThresholds>) {
    this.metrics = {
      fps: 60,
      frameTime: 0,
      droppedFrames: 0,
      memoryUsage: 0,
      animationCount: 0,
      gestureResponseTime: 0
    };

    this.thresholds = {
      minFPS: 30,
      maxFrameTime: 16.67, // 60 FPS
      maxMemoryUsage: 100, // MB
      maxAnimationCount: 10,
      ...thresholds
    };
  }

  public startMonitoring(): void {
    if (this.isMonitoring) return;
    
    this.isMonitoring = true;
    this.monitor();
  }

  public stopMonitoring(): void {
    this.isMonitoring = false;
    if (this.rafId) {
      cancelAnimationFrame(this.rafId);
      this.rafId = null;
    }
  }

  private monitor = (): void => {
    if (!this.isMonitoring) return;

    const now = performance.now();
    this.frameTimestamps.push(now);

    // Keep only last 60 frames for FPS calculation
    if (this.frameTimestamps.length > 60) {
      this.frameTimestamps.shift();
    }

    this.updateMetrics(now);
    this.notifyObservers();
    
    this.rafId = requestAnimationFrame(this.monitor);
  };

  private updateMetrics(now: number): void {
    if (this.frameTimestamps.length < 2) return;

    // Calculate FPS
    const timeSpan = now - this.frameTimestamps[0];
    this.metrics.fps = Math.round((this.frameTimestamps.length - 1) * 1000 / timeSpan);

    // Calculate frame time
    const lastFrameTime = this.frameTimestamps[this.frameTimestamps.length - 2];
    this.metrics.frameTime = now - lastFrameTime;

    // Calculate dropped frames
    const expectedFrames = Math.round(timeSpan / 16.67);
    this.metrics.droppedFrames = Math.max(0, expectedFrames - (this.frameTimestamps.length - 1));

    // Memory usage (if available)
    if ('memory' in performance) {
      const memory = (performance as any).memory;
      this.metrics.memoryUsage = memory.usedJSHeapSize / 1048576; // Convert to MB
    }
  }

  public updateAnimationCount(count: number): void {
    this.metrics.animationCount = count;
  }

  public recordGestureResponseTime(time: number): void {
    this.metrics.gestureResponseTime = time;
  }

  public getMetrics(): PerformanceMetrics {
    return { ...this.metrics };
  }

  public isPerformanceGood(): boolean {
    return (
      this.metrics.fps >= this.thresholds.minFPS &&
      this.metrics.frameTime <= this.thresholds.maxFrameTime &&
      this.metrics.memoryUsage <= this.thresholds.maxMemoryUsage &&
      this.metrics.animationCount <= this.thresholds.maxAnimationCount
    );
  }

  public subscribe(callback: (metrics: PerformanceMetrics) => void): () => void {
    this.observers.push(callback);
    return () => {
      const index = this.observers.indexOf(callback);
      if (index > -1) {
        this.observers.splice(index, 1);
      }
    };
  }

  private notifyObservers(): void {
    this.observers.forEach(callback => callback(this.metrics));
  }

  public getRecommendations(): string[] {
    const recommendations: string[] = [];

    if (this.metrics.fps < this.thresholds.minFPS) {
      recommendations.push('Reduce animation complexity or particle count');
    }

    if (this.metrics.frameTime > this.thresholds.maxFrameTime) {
      recommendations.push('Optimize animation calculations or use requestIdleCallback');
    }

    if (this.metrics.memoryUsage > this.thresholds.maxMemoryUsage) {
      recommendations.push('Clean up unused animations or reduce memory footprint');
    }

    if (this.metrics.animationCount > this.thresholds.maxAnimationCount) {
      recommendations.push('Limit concurrent animations');
    }

    return recommendations;
  }
}

export const performanceMonitor = new PerformanceMonitor();
