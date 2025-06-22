
export interface AnimationQueueItem {
  id: string;
  animation: any;
  priority: number;
  startTime: number;
  element: HTMLElement;
  config: any;
}

export class AnimationScheduler {
  private queue = new Map<string, AnimationQueueItem>();
  private activeAnimations = new Set<string>();
  private maxConcurrentAnimations = 16;
  private frameSkipThreshold = 33; // Skip frames if over 33ms
  private lastFrameTime = 0;

  public scheduleAnimation(item: AnimationQueueItem): void {
    // Remove existing animation for the same element if present
    this.removeAnimationsForElement(item.element);
    
    this.queue.set(item.id, item);
    this.activeAnimations.add(item.id);
  }

  public removeAnimation(id: string): void {
    this.queue.delete(id);
    this.activeAnimations.delete(id);
  }

  public removeAnimationsForElement(element: HTMLElement): void {
    for (const [id, item] of this.queue.entries()) {
      if (item.element === element) {
        this.removeAnimation(id);
      }
    }
  }

  public processAnimations(currentTime: number, deltaTime: number): void {
    const frameTime = currentTime - this.lastFrameTime;
    
    // Skip frame if we're behind schedule
    if (frameTime > this.frameSkipThreshold) {
      this.lastFrameTime = currentTime;
      return;
    }

    // Sort by priority and process
    const sortedAnimations = Array.from(this.queue.values())
      .sort((a, b) => b.priority - a.priority)
      .slice(0, this.maxConcurrentAnimations);

    for (const item of sortedAnimations) {
      try {
        if (item.animation.isActive) {
          // Animation is handled by its own tick method
        }
      } catch (error) {
        console.warn('Animation processing error:', error);
        this.removeAnimation(item.id);
      }
    }

    this.lastFrameTime = currentTime;
  }

  public reduceComplexity(): void {
    this.maxConcurrentAnimations = Math.max(4, this.maxConcurrentAnimations - 2);
  }

  public increaseComplexity(): void {
    this.maxConcurrentAnimations = Math.min(24, this.maxConcurrentAnimations + 2);
  }

  public getActiveCount(): number {
    return this.activeAnimations.size;
  }

  public dispose(): void {
    this.queue.clear();
    this.activeAnimations.clear();
  }
}
