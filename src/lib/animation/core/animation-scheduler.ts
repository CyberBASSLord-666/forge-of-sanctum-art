
import { AnimationQueueItem } from '../enhanced-motion-engine';

export interface SchedulerMetrics {
  queueSize: number;
  processingTime: number;
  droppedFrames: number;
  averageLatency: number;
}

export class AnimationScheduler {
  private highPriorityQueue: AnimationQueueItem[] = [];
  private normalPriorityQueue: AnimationQueueItem[] = [];
  private lowPriorityQueue: AnimationQueueItem[] = [];
  private processingTimeLimit = 16; // 16ms for 60fps
  private metrics: SchedulerMetrics = {
    queueSize: 0,
    processingTime: 0,
    droppedFrames: 0,
    averageLatency: 0,
  };
  private complexityLevel = 1;
  private maxConcurrentAnimations = 8;

  public scheduleAnimation(item: AnimationQueueItem): void {
    const priority = item.priority;
    
    if (priority > 5) {
      this.highPriorityQueue.push(item);
      this.highPriorityQueue.sort((a, b) => b.priority - a.priority);
    } else if (priority > 0) {
      this.normalPriorityQueue.push(item);
    } else {
      this.lowPriorityQueue.push(item);
    }
    
    this.updateMetrics();
  }

  public removeAnimation(id: string): void {
    this.removeFromQueue(this.highPriorityQueue, id);
    this.removeFromQueue(this.normalPriorityQueue, id);
    this.removeFromQueue(this.lowPriorityQueue, id);
    this.updateMetrics();
  }

  private removeFromQueue(queue: AnimationQueueItem[], id: string): void {
    const index = queue.findIndex(item => item.id === id);
    if (index !== -1) {
      queue.splice(index, 1);
    }
  }

  public processAnimations(currentTime: number, deltaTime: number): void {
    const startTime = performance.now();
    let processedCount = 0;
    const maxProcessing = Math.min(this.maxConcurrentAnimations, this.getTotalQueueSize());

    // Process high priority animations first
    processedCount += this.processQueue(this.highPriorityQueue, currentTime, deltaTime, maxProcessing - processedCount);

    // Process normal priority if we have time and capacity
    if (processedCount < maxProcessing && performance.now() - startTime < this.processingTimeLimit * 0.7) {
      processedCount += this.processQueue(this.normalPriorityQueue, currentTime, deltaTime, maxProcessing - processedCount);
    }

    // Process low priority if we still have time and capacity
    if (processedCount < maxProcessing && performance.now() - startTime < this.processingTimeLimit * 0.9) {
      processedCount += this.processQueue(this.lowPriorityQueue, currentTime, deltaTime, maxProcessing - processedCount);
    }

    const processingTime = performance.now() - startTime;
    this.updateProcessingMetrics(processingTime, processedCount);

    // Adaptive quality control
    if (processingTime > this.processingTimeLimit) {
      this.metrics.droppedFrames++;
      this.reduceComplexity();
    }
  }

  private processQueue(
    queue: AnimationQueueItem[],
    currentTime: number,
    deltaTime: number,
    maxItems: number
  ): number {
    let processed = 0;
    const itemsToProcess = Math.min(queue.length, maxItems);

    for (let i = 0; i < itemsToProcess; i++) {
      const item = queue[i];
      
      try {
        // Check if element is still in DOM and visible
        if (this.shouldProcessAnimation(item, currentTime)) {
          if (!item.animation.isActive) {
            item.animation.start();
          }
          processed++;
        } else {
          // Remove animations for elements no longer in DOM
          queue.splice(i, 1);
          i--;
        }
      } catch (error) {
        console.error('Animation processing error:', error);
        queue.splice(i, 1);
        i--;
      }
    }

    return processed;
  }

  private shouldProcessAnimation(item: AnimationQueueItem, currentTime: number): boolean {
    // Check if element is still in DOM
    if (!document.body.contains(item.element)) {
      return false;
    }

    // Check if element is visible (performance optimization)
    const rect = item.element.getBoundingClientRect();
    const isVisible = rect.width > 0 && rect.height > 0 && 
                     rect.bottom > 0 && rect.right > 0 && 
                     rect.top < window.innerHeight && rect.left < window.innerWidth;

    // For non-visible elements, only process high priority animations
    if (!isVisible && item.priority <= 5) {
      return false;
    }

    return true;
  }

  public reduceComplexity(): void {
    this.complexityLevel = Math.max(0.3, this.complexityLevel * 0.8);
    this.maxConcurrentAnimations = Math.max(3, Math.floor(this.maxConcurrentAnimations * 0.8));
    this.processingTimeLimit = Math.max(8, this.processingTimeLimit * 0.9);
  }

  public increaseComplexity(): void {
    this.complexityLevel = Math.min(1, this.complexityLevel * 1.1);
    this.maxConcurrentAnimations = Math.min(12, Math.floor(this.maxConcurrentAnimations * 1.1));
    this.processingTimeLimit = Math.min(16, this.processingTimeLimit * 1.05);
  }

  private updateMetrics(): void {
    this.metrics.queueSize = this.getTotalQueueSize();
  }

  private updateProcessingMetrics(processingTime: number, processedCount: number): void {
    this.metrics.processingTime = processingTime;
    
    // Calculate average latency
    const currentLatency = processedCount > 0 ? processingTime / processedCount : 0;
    this.metrics.averageLatency = (this.metrics.averageLatency * 0.9) + (currentLatency * 0.1);
  }

  private getTotalQueueSize(): number {
    return this.highPriorityQueue.length + this.normalPriorityQueue.length + this.lowPriorityQueue.length;
  }

  public getMetrics(): SchedulerMetrics {
    return { ...this.metrics };
  }

  public getComplexityLevel(): number {
    return this.complexityLevel;
  }

  public setMaxConcurrentAnimations(max: number): void {
    this.maxConcurrentAnimations = Math.max(1, Math.min(20, max));
  }

  public clear(): void {
    this.highPriorityQueue.length = 0;
    this.normalPriorityQueue.length = 0;
    this.lowPriorityQueue.length = 0;
    this.updateMetrics();
  }
}
