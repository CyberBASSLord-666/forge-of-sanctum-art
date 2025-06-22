export interface PerformanceMetrics {
  fps: number;
  frameTime: number;
  memoryUsage: number;
  animationCount: number;
  droppedFrames: number;
  gpuMemory: number;
  cpuUsage: number;
  renderingTime: number;
  layoutThrashing: number;
  timestamp: number;
}

export interface PerformanceThresholds {
  minFPS: number;
  maxFrameTime: number;
  maxMemoryUsage: number;
  maxAnimationCount: number;
  maxRenderingTime: number;
}

export class PerformanceProfiler {
  private metrics: PerformanceMetrics[] = [];
  private currentFrame: Partial<PerformanceMetrics> = {};
  private frameStartTime = 0;
  private lastFrameTime = 0;
  private frameCount = 0;
  private droppedFrames = 0;
  private observer: PerformanceObserver | null = null;
  private memoryMonitorInterval: number | null = null;
  private isActive = false;
  private listeners: Array<(metrics: PerformanceMetrics) => void> = [];
  
  private thresholds: PerformanceThresholds = {
    minFPS: 30,
    maxFrameTime: 33.33, // 30fps = 33.33ms per frame
    maxMemoryUsage: 100, // 100MB
    maxAnimationCount: 10,
    maxRenderingTime: 16, // 16ms for 60fps
  };

  constructor() {
    this.setupPerformanceObserver();
    this.startMemoryMonitoring();
  }

  private setupPerformanceObserver(): void {
    if ('PerformanceObserver' in window) {
      try {
        this.observer = new PerformanceObserver((list) => {
          const entries = list.getEntries();
          this.processPerformanceEntries(entries);
        });

        this.observer.observe({ 
          entryTypes: ['measure', 'navigation', 'resource', 'layout-shift', 'paint'] 
        });
      } catch (error) {
        console.warn('PerformanceObserver setup failed:', error);
      }
    }
  }

  private processPerformanceEntries(entries: PerformanceEntry[]): void {
    for (const entry of entries) {
      switch (entry.entryType) {
        case 'layout-shift':
          this.trackLayoutThrashing(entry as any);
          break;
        case 'paint':
          this.trackPaintMetrics(entry);
          break;
        case 'measure':
          if (entry.name.includes('animation')) {
            this.trackAnimationPerformance(entry);
          }
          break;
      }
    }
  }

  private trackLayoutThrashing(entry: any): void {
    if (entry.value > 0.1) { // Layout shift threshold
      this.currentFrame.layoutThrashing = (this.currentFrame.layoutThrashing || 0) + entry.value;
    }
  }

  private trackPaintMetrics(entry: PerformanceEntry): void {
    if (entry.name === 'first-contentful-paint') {
      this.currentFrame.renderingTime = entry.startTime;
    }
  }

  private trackAnimationPerformance(entry: PerformanceEntry): void {
    this.currentFrame.renderingTime = (this.currentFrame.renderingTime || 0) + entry.duration;
  }

  private startMemoryMonitoring(): void {
    this.memoryMonitorInterval = window.setInterval(() => {
      if (this.isActive) {
        this.updateMemoryMetrics();
      }
    }, 1000);
  }

  private updateMemoryMetrics(): void {
    if ('memory' in performance) {
      const memory = (performance as any).memory;
      this.currentFrame.memoryUsage = memory.usedJSHeapSize / 1024 / 1024; // Convert to MB
      
      // Estimate GPU memory usage (approximation)
      this.currentFrame.gpuMemory = this.estimateGPUMemoryUsage();
    }
  }

  private estimateGPUMemoryUsage(): number {
    // Rough estimation based on active animations and texture usage
    const animationCount = this.currentFrame.animationCount || 0;
    const baseMemory = 10; // Base GPU memory usage in MB
    const perAnimationMemory = 2; // Estimated memory per animation in MB
    
    return baseMemory + (animationCount * perAnimationMemory);
  }

  public startFrame(): void {
    this.frameStartTime = performance.now();
    this.currentFrame = {
      timestamp: this.frameStartTime,
      animationCount: 0,
      layoutThrashing: 0,
      renderingTime: 0,
    };
    this.isActive = true;
  }

  public endFrame(): void {
    if (!this.isActive) return;

    const frameEndTime = performance.now();
    const frameTime = frameEndTime - this.frameStartTime;
    
    // Calculate FPS
    this.frameCount++;
    if (this.lastFrameTime > 0) {
      const deltaTime = frameEndTime - this.lastFrameTime;
      const fps = 1000 / deltaTime;
      
      // Detect dropped frames
      if (deltaTime > this.thresholds.maxFrameTime * 1.5) {
        this.droppedFrames++;
      }
      
      this.currentFrame.fps = fps;
    }
    
    this.currentFrame.frameTime = frameTime;
    this.currentFrame.droppedFrames = this.droppedFrames;
    this.currentFrame.cpuUsage = this.estimateCPUUsage(frameTime);
    
    // Complete the metrics
    const completeMetrics: PerformanceMetrics = {
      fps: this.currentFrame.fps || 0,
      frameTime: this.currentFrame.frameTime || 0,
      memoryUsage: this.currentFrame.memoryUsage || 0,
      animationCount: this.currentFrame.animationCount || 0,
      droppedFrames: this.currentFrame.droppedFrames || 0,
      gpuMemory: this.currentFrame.gpuMemory || 0,
      cpuUsage: this.currentFrame.cpuUsage || 0,
      renderingTime: this.currentFrame.renderingTime || 0,
      layoutThrashing: this.currentFrame.layoutThrashing || 0,
      timestamp: this.currentFrame.timestamp || frameEndTime,
    };
    
    this.addMetrics(completeMetrics);
    this.notifyListeners(completeMetrics);
    this.lastFrameTime = frameEndTime;
  }

  private estimateCPUUsage(frameTime: number): number {
    // Estimate CPU usage based on frame time
    const idealFrameTime = 16.67; // 60fps ideal
    return Math.min(100, (frameTime / idealFrameTime) * 100);
  }

  private addMetrics(metrics: PerformanceMetrics): void {
    this.metrics.push(metrics);
    
    // Keep only last 300 frames (5 seconds at 60fps)
    if (this.metrics.length > 300) {
      this.metrics.shift();
    }
  }

  public updateAnimationCount(count: number): void {
    if (this.currentFrame) {
      this.currentFrame.animationCount = count;
    }
  }

  public getMetrics(): PerformanceMetrics[] {
    return [...this.metrics];
  }

  public getLatestMetrics(): PerformanceMetrics | null {
    return this.metrics[this.metrics.length - 1] || null;
  }

  public getAverageMetrics(windowSize = 60): PerformanceMetrics | null {
    if (this.metrics.length === 0) return null;
    
    const recentMetrics = this.metrics.slice(-windowSize);
    const sum = recentMetrics.reduce((acc, metric) => ({
      fps: acc.fps + metric.fps,
      frameTime: acc.frameTime + metric.frameTime,
      memoryUsage: acc.memoryUsage + metric.memoryUsage,
      animationCount: acc.animationCount + metric.animationCount,
      droppedFrames: acc.droppedFrames + metric.droppedFrames,
      gpuMemory: acc.gpuMemory + metric.gpuMemory,
      cpuUsage: acc.cpuUsage + metric.cpuUsage,
      renderingTime: acc.renderingTime + metric.renderingTime,
      layoutThrashing: acc.layoutThrashing + metric.layoutThrashing,
      timestamp: metric.timestamp, // Use latest timestamp
    }), {
      fps: 0, frameTime: 0, memoryUsage: 0, animationCount: 0,
      droppedFrames: 0, gpuMemory: 0, cpuUsage: 0, renderingTime: 0,
      layoutThrashing: 0, timestamp: 0
    });

    const count = recentMetrics.length;
    return {
      fps: sum.fps / count,
      frameTime: sum.frameTime / count,
      memoryUsage: sum.memoryUsage / count,
      animationCount: sum.animationCount / count,
      droppedFrames: sum.droppedFrames / count,
      gpuMemory: sum.gpuMemory / count,
      cpuUsage: sum.cpuUsage / count,
      renderingTime: sum.renderingTime / count,
      layoutThrashing: sum.layoutThrashing / count,
      timestamp: sum.timestamp,
    };
  }

  public isPerformanceGood(): boolean {
    const latest = this.getLatestMetrics();
    if (!latest) return true;

    return (
      latest.fps >= this.thresholds.minFPS &&
      latest.frameTime <= this.thresholds.maxFrameTime &&
      latest.memoryUsage <= this.thresholds.maxMemoryUsage &&
      latest.animationCount <= this.thresholds.maxAnimationCount &&
      latest.renderingTime <= this.thresholds.maxRenderingTime
    );
  }

  public getPerformanceScore(): number {
    const latest = this.getLatestMetrics();
    if (!latest) return 100;

    const scores = [
      Math.min(100, (latest.fps / 60) * 100),
      Math.max(0, 100 - (latest.frameTime / 33.33) * 100),
      Math.max(0, 100 - (latest.memoryUsage / 200) * 100),
      Math.max(0, 100 - (latest.animationCount / 20) * 100),
      Math.max(0, 100 - (latest.renderingTime / 33.33) * 100),
    ];

    return scores.reduce((sum, score) => sum + score, 0) / scores.length;
  }

  public onPerformanceChange(callback: (metrics: PerformanceMetrics) => void): () => void {
    this.listeners.push(callback);
    return () => {
      const index = this.listeners.indexOf(callback);
      if (index > -1) {
        this.listeners.splice(index, 1);
      }
    };
  }

  private notifyListeners(metrics: PerformanceMetrics): void {
    this.listeners.forEach(listener => {
      try {
        listener(metrics);
      } catch (error) {
        console.error('Performance listener error:', error);
      }
    });
  }

  public setThresholds(newThresholds: Partial<PerformanceThresholds>): void {
    this.thresholds = { ...this.thresholds, ...newThresholds };
  }

  public reset(): void {
    this.metrics.length = 0;
    this.frameCount = 0;
    this.droppedFrames = 0;
    this.lastFrameTime = 0;
    this.currentFrame = {};
  }

  public dispose(): void {
    this.isActive = false;
    
    if (this.observer) {
      this.observer.disconnect();
      this.observer = null;
    }
    
    if (this.memoryMonitorInterval) {
      clearInterval(this.memoryMonitorInterval);
      this.memoryMonitorInterval = null;
    }
    
    this.listeners.length = 0;
    this.reset();
  }
}
