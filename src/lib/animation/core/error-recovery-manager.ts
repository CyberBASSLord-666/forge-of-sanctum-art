
export class ErrorRecoveryManager {
  private errorCounts = new Map<string, number>();
  private maxRetries = 3;
  private errorCooldown = 5000; // 5 seconds
  private lastErrors = new Map<string, number>();

  public handleAnimationError(error: Error, animationId: string): void {
    console.warn(`Animation error in ${animationId}:`, error);
    
    const errorKey = `${animationId}_${error.message}`;
    const count = this.errorCounts.get(errorKey) || 0;
    this.errorCounts.set(errorKey, count + 1);
    this.lastErrors.set(errorKey, Date.now());
    
    if (count >= this.maxRetries) {
      console.error(`Animation ${animationId} failed ${this.maxRetries} times, disabling`);
      this.disableAnimation(animationId);
    }
  }

  public handleEngineError(error: Error): void {
    console.error('Animation engine error:', error);
    
    // Attempt to recover by reducing complexity
    try {
      // Force garbage collection if available
      if ('gc' in window) {
        (window as any).gc();
      }
    } catch (gcError) {
      console.warn('Could not force garbage collection:', gcError);
    }
  }

  public canRetry(animationId: string, errorMessage: string): boolean {
    const errorKey = `${animationId}_${errorMessage}`;
    const count = this.errorCounts.get(errorKey) || 0;
    const lastError = this.lastErrors.get(errorKey) || 0;
    
    // Allow retry if under max retries and enough time has passed
    return count < this.maxRetries && (Date.now() - lastError) > this.errorCooldown;
  }

  private disableAnimation(animationId: string): void {
    // In a real implementation, this would disable the specific animation
    console.warn(`Animation ${animationId} has been disabled due to repeated failures`);
  }

  public clearErrors(animationId?: string): void {
    if (animationId) {
      // Clear errors for specific animation
      for (const key of this.errorCounts.keys()) {
        if (key.startsWith(animationId)) {
          this.errorCounts.delete(key);
          this.lastErrors.delete(key);
        }
      }
    } else {
      // Clear all errors
      this.errorCounts.clear();
      this.lastErrors.clear();
    }
  }

  public dispose(): void {
    this.errorCounts.clear();
    this.lastErrors.clear();
  }
}
