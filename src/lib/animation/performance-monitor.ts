export interface PerformanceMetrics {
  fps: number;
  animationCount: number;
  memoryUsage: number;
  cpuUsage: number;
  timestamp: number;
}

class PerformanceMonitor {
  private metrics: PerformanceMetrics[] = [];
  private animationFrameId: number | null = null;
  private lastFrameTime = 0;
  private frameCount = 0;
  private isMonitoring = false;
  private subscribers: ((metrics: PerformanceMetrics) => void)[] = [];

  public startMonitoring(): void {
    if (this.isMonitoring) return;
    
    this.isMonitoring = true;
    this.lastFrameTime = performance.now();
    this.frameCount = 0;
    this.tick();
  }

  public stopMonitoring(): void {
    this.isMonitoring = false;
    if (this.animationFrameId) {
      cancelAnimationFrame(this.animationFrameId);
      this.animationFrameId = null;
    }
  }

  private tick = (): void => {
    if (!this.isMonitoring) return;

    const currentTime = performance.now();
    this.frameCount++;

    // Calculate FPS every second
    if (currentTime - this.lastFrameTime >= 1000) {
      const fps = Math.round((this.frameCount * 1000) / (currentTime - this.lastFrameTime));
      
      const metrics: PerformanceMetrics = {
        fps,
        animationCount: 0, // Will be updated externally
        memoryUsage: this.getMemoryUsage(),
        cpuUsage: 0, // Approximated
        timestamp: currentTime,
      };

      this.metrics.push(metrics);
      
      // Keep only last 60 seconds of data
      if (this.metrics.length > 60) {
        this.metrics.shift();
      }

      // Notify subscribers
      this.subscribers.forEach(callback => callback(metrics));

      this.frameCount = 0;
      this.lastFrameTime = currentTime;
    }

    this.animationFrameId = requestAnimationFrame(this.tick);
  };

  private getMemoryUsage(): number {
    if ('memory' in performance) {
      return (performance as any).memory.usedJSHeapSize / 1024 / 1024; // MB
    }
    return 0;
  }

  public updateAnimationCount(count: number): void {
    if (this.metrics.length > 0) {
      this.metrics[this.metrics.length - 1].animationCount = count;
    }
  }

  public recordGestureResponseTime(responseTime: number): void {
    console.log(`Gesture response time: ${responseTime.toFixed(2)}ms`);
  }

  public getMetrics(): PerformanceMetrics[] {
    return [...this.metrics];
  }

  public isPerformanceGood(): boolean {
    if (this.metrics.length === 0) return true;
    
    const recent = this.metrics.slice(-5); // Last 5 seconds
    const avgFps = recent.reduce((sum, m) => sum + m.fps, 0) / recent.length;
    const avgMemory = recent.reduce((sum, m) => sum + m.memoryUsage, 0) / recent.length;
    
    return avgFps > 30 && avgMemory < 100; // 30+ FPS and <100MB memory
  }

  public subscribe(callback: (metrics: PerformanceMetrics) => void): () => void {
    this.subscribers.push(callback);
    return () => {
      const index = this.subscribers.indexOf(callback);
      if (index > -1) {
        this.subscribers.splice(index, 1);
      }
    };
  }
}

export const performanceMonitor = new PerformanceMonitor();
