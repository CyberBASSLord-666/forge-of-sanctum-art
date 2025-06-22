
export interface PerformanceMetrics {
  fps: number;
  frameTime: number;
  memoryUsage: number;
  animationCount: number;
  droppedFrames: number;
  averageFrameTime: number;
}

export class PerformanceProfiler {
  private frameCount = 0;
  private lastSecond = 0;
  private currentFPS = 60;
  private frameStartTime = 0;
  private frameTimes: number[] = [];
  private maxFrameTimeHistory = 60;
  private droppedFrames = 0;
  private listeners: ((metrics: PerformanceMetrics) => void)[] = [];
  private isMonitoring = false;

  public startFrame(): void {
    this.frameStartTime = performance.now();
  }

  public endFrame(): void {
    const frameTime = performance.now() - this.frameStartTime;
    this.frameTimes.push(frameTime);
    
    if (this.frameTimes.length > this.maxFrameTimeHistory) {
      this.frameTimes.shift();
    }

    // Track dropped frames (>16.67ms for 60fps)
    if (frameTime > 16.67) {
      this.droppedFrames++;
    }

    this.frameCount++;
    const currentTime = performance.now();
    
    if (currentTime - this.lastSecond >= 1000) {
      this.currentFPS = this.frameCount;
      this.frameCount = 0;
      this.lastSecond = currentTime;
      
      // Reset dropped frames counter
      this.droppedFrames = 0;
      
      this.notifyListeners();
    }
  }

  public getMetrics(): PerformanceMetrics {
    const averageFrameTime = this.frameTimes.length > 0 
      ? this.frameTimes.reduce((a, b) => a + b, 0) / this.frameTimes.length 
      : 0;

    return {
      fps: this.currentFPS,
      frameTime: this.frameTimes[this.frameTimes.length - 1] || 0,
      memoryUsage: this.getMemoryUsage(),
      animationCount: 0, // Will be set by the engine
      droppedFrames: this.droppedFrames,
      averageFrameTime,
    };
  }

  private getMemoryUsage(): number {
    if ('memory' in performance) {
      const memory = (performance as any).memory;
      return memory.usedJSHeapSize / 1024 / 1024; // MB
    }
    return 0;
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

  private notifyListeners(): void {
    const metrics = this.getMetrics();
    this.listeners.forEach(listener => {
      try {
        listener(metrics);
      } catch (error) {
        console.warn('Performance listener error:', error);
      }
    });
  }

  public dispose(): void {
    this.listeners = [];
    this.frameTimes = [];
    this.isMonitoring = false;
  }
}
