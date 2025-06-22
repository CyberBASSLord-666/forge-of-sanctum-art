
export interface AnimationError {
  id: string;
  type: 'animation' | 'engine' | 'transform' | 'performance';
  message: string;
  element?: HTMLElement;
  timestamp: number;
  stack?: string;
  recoveryAttempts: number;
  severity: 'low' | 'medium' | 'high' | 'critical';
}

export interface RecoveryStrategy {
  maxAttempts: number;
  backoffDelay: number;
  fallbackAction: 'skip' | 'simplified' | 'instant' | 'remove';
  notifyUser: boolean;
}

export class ErrorRecoveryManager {
  private errors = new Map<string, AnimationError>();
  private recoveryStrategies = new Map<string, RecoveryStrategy>();
  private errorListeners: Array<(error: AnimationError) => void> = [];
  private maxErrorHistory = 100;
  private recoveryInProgress = new Set<string>();

  constructor() {
    this.setupDefaultStrategies();
    this.setupGlobalErrorHandling();
  }

  private setupDefaultStrategies(): void {
    this.recoveryStrategies.set('animation', {
      maxAttempts: 3,
      backoffDelay: 1000,
      fallbackAction: 'simplified',
      notifyUser: false,
    });

    this.recoveryStrategies.set('engine', {
      maxAttempts: 2,
      backoffDelay: 2000,
      fallbackAction: 'skip',
      notifyUser: true,
    });

    this.recoveryStrategies.set('transform', {
      maxAttempts: 5,
      backoffDelay: 500,
      fallbackAction: 'instant',
      notifyUser: false,
    });

    this.recoveryStrategies.set('performance', {
      maxAttempts: 1,
      backoffDelay: 0,
      fallbackAction: 'simplified',
      notifyUser: false,
    });
  }

  private setupGlobalErrorHandling(): void {
    window.addEventListener('error', (event) => {
      if (event.filename?.includes('animation') || event.message?.includes('animation')) {
        this.handleEngineError(new Error(event.message));
      }
    });

    window.addEventListener('unhandledrejection', (event) => {
      if (event.reason?.message?.includes('animation')) {
        this.handleEngineError(event.reason);
      }
    });
  }

  public handleAnimationError(error: Error, animationId: string, element?: HTMLElement): void {
    const errorId = `${animationId}_${Date.now()}`;
    const animationError: AnimationError = {
      id: errorId,
      type: 'animation',
      message: error.message,
      element,
      timestamp: performance.now(),
      stack: error.stack,
      recoveryAttempts: 0,
      severity: this.determineSeverity(error),
    };

    this.logError(animationError);
    this.attemptRecovery(animationError);
  }

  public handleEngineError(error: Error): void {
    const errorId = `engine_${Date.now()}`;
    const engineError: AnimationError = {
      id: errorId,
      type: 'engine',
      message: error.message,
      timestamp: performance.now(),
      stack: error.stack,
      recoveryAttempts: 0,
      severity: 'high',
    };

    this.logError(engineError);
    this.attemptRecovery(engineError);
  }

  public handleTransformError(error: Error, element: HTMLElement): void {
    const errorId = `transform_${Date.now()}`;
    const transformError: AnimationError = {
      id: errorId,
      type: 'transform',
      message: error.message,
      element,
      timestamp: performance.now(),
      stack: error.stack,
      recoveryAttempts: 0,
      severity: this.determineSeverity(error),
    };

    this.logError(transformError);
    this.attemptRecovery(transformError);
  }

  public handlePerformanceError(message: string, context?: any): void {
    const errorId = `performance_${Date.now()}`;
    const performanceError: AnimationError = {
      id: errorId,
      type: 'performance',
      message,
      timestamp: performance.now(),
      recoveryAttempts: 0,
      severity: 'medium',
    };

    this.logError(performanceError);
    this.attemptRecovery(performanceError);
  }

  private determineSeverity(error: Error): AnimationError['severity'] {
    const message = error.message.toLowerCase();
    
    if (message.includes('critical') || message.includes('fatal')) {
      return 'critical';
    } else if (message.includes('memory') || message.includes('performance')) {
      return 'high';
    } else if (message.includes('transform') || message.includes('timing')) {
      return 'medium';
    } else {
      return 'low';
    }
  }

  private logError(error: AnimationError): void {
    this.errors.set(error.id, error);
    
    // Maintain error history limit
    if (this.errors.size > this.maxErrorHistory) {
      const oldestError = Array.from(this.errors.keys())[0];
      this.errors.delete(oldestError);
    }

    // Log to console based on severity
    const logLevel = error.severity === 'critical' || error.severity === 'high' ? 'error' : 'warn';
    console[logLevel](`Animation ${error.type} error:`, error.message, error);

    // Notify listeners
    this.notifyErrorListeners(error);
  }

  private async attemptRecovery(error: AnimationError): Promise<void> {
    if (this.recoveryInProgress.has(error.id)) {
      return;
    }

    this.recoveryInProgress.add(error.id);
    const strategy = this.recoveryStrategies.get(error.type);
    
    if (!strategy) {
      console.warn(`No recovery strategy for error type: ${error.type}`);
      return;
    }

    try {
      if (error.recoveryAttempts < strategy.maxAttempts) {
        await this.executeRecoveryStrategy(error, strategy);
      } else {
        await this.executeFallbackAction(error, strategy);
      }
    } catch (recoveryError) {
      console.error('Recovery attempt failed:', recoveryError);
      await this.executeFallbackAction(error, strategy);
    } finally {
      this.recoveryInProgress.delete(error.id);
    }
  }

  private async executeRecoveryStrategy(error: AnimationError, strategy: RecoveryStrategy): Promise<void> {
    error.recoveryAttempts++;
    
    // Wait for backoff delay
    if (strategy.backoffDelay > 0) {
      await this.delay(strategy.backoffDelay * error.recoveryAttempts);
    }

    switch (error.type) {
      case 'animation':
        await this.recoverAnimation(error);
        break;
      case 'engine':
        await this.recoverEngine(error);
        break;
      case 'transform':
        await this.recoverTransform(error);
        break;
      case 'performance':
        await this.recoverPerformance(error);
        break;
    }
  }

  private async recoverAnimation(error: AnimationError): Promise<void> {
    if (error.element && document.body.contains(error.element)) {
      // Reset element's animation state
      error.element.style.animation = 'none';
      error.element.style.transform = '';
      error.element.style.willChange = 'auto';
      
      // Force reflow
      error.element.offsetHeight;
      
      console.log(`Recovered animation for element:`, error.element);
    }
  }

  private async recoverEngine(error: AnimationError): Promise<void> {
    // Reset global animation state
    const allAnimatedElements = document.querySelectorAll('[style*="animation"], [style*="transform"]');
    allAnimatedElements.forEach((element) => {
      if (element instanceof HTMLElement) {
        element.style.willChange = 'auto';
      }
    });
    
    console.log('Recovered animation engine state');
  }

  private async recoverTransform(error: AnimationError): Promise<void> {
    if (error.element && document.body.contains(error.element)) {
      // Apply a safe, identity transform
      error.element.style.transform = 'translate3d(0,0,0) scale(1) rotate(0deg)';
      error.element.style.willChange = 'auto';
      
      console.log(`Recovered transform for element:`, error.element);
    }
  }

  private async recoverPerformance(error: AnimationError): Promise<void> {
    // Reduce animation complexity globally
    const style = document.createElement('style');
    style.textContent = `
      *, *::before, *::after {
        animation-duration: 0.01ms !important;
        animation-delay: -0.01ms !important;
        transition-duration: 0.01ms !important;
        transition-delay: -0.01ms !important;
      }
    `;
    style.setAttribute('data-animation-recovery', 'true');
    document.head.appendChild(style);
    
    // Remove after a short delay
    setTimeout(() => {
      style.remove();
    }, 5000);
    
    console.log('Applied performance recovery measures');
  }

  private async executeFallbackAction(error: AnimationError, strategy: RecoveryStrategy): Promise<void> {
    switch (strategy.fallbackAction) {
      case 'skip':
        console.log(`Skipping failed animation: ${error.id}`);
        break;
      case 'simplified':
        await this.applySimplifiedAnimation(error);
        break;
      case 'instant':
        await this.applyInstantAnimation(error);
        break;
      case 'remove':
        await this.removeFailedAnimation(error);
        break;
    }

    if (strategy.notifyUser) {
      this.notifyUser(error);
    }
  }

  private async applySimplifiedAnimation(error: AnimationError): Promise<void> {
    if (error.element && document.body.contains(error.element)) {
      error.element.style.transition = 'opacity 0.3s ease';
      error.element.style.opacity = '1';
    }
  }

  private async applyInstantAnimation(error: AnimationError): Promise<void> {
    if (error.element && document.body.contains(error.element)) {
      error.element.style.transition = 'none';
      error.element.style.transform = '';
      error.element.offsetHeight; // Force reflow
    }
  }

  private async removeFailedAnimation(error: AnimationError): Promise<void> {
    if (error.element && document.body.contains(error.element)) {
      error.element.style.animation = 'none';
      error.element.style.transform = 'none';
      error.element.style.transition = 'none';
      error.element.style.willChange = 'auto';
    }
  }

  private notifyUser(error: AnimationError): void {
    console.warn(`Animation system encountered an issue: ${error.message}`);
    // In a real application, you might show a toast notification here
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  public onError(callback: (error: AnimationError) => void): () => void {
    this.errorListeners.push(callback);
    return () => {
      const index = this.errorListeners.indexOf(callback);
      if (index > -1) {
        this.errorListeners.splice(index, 1);
      }
    };
  }

  private notifyErrorListeners(error: AnimationError): void {
    this.errorListeners.forEach(listener => {
      try {
        listener(error);
      } catch (listenerError) {
        console.error('Error listener failed:', listenerError);
      }
    });
  }

  public getErrorHistory(): AnimationError[] {
    return Array.from(this.errors.values()).sort((a, b) => b.timestamp - a.timestamp);
  }

  public getErrorStats(): { total: number; byType: Record<string, number>; bySeverity: Record<string, number> } {
    const errors = Array.from(this.errors.values());
    const byType: Record<string, number> = {};
    const bySeverity: Record<string, number> = {};

    errors.forEach(error => {
      byType[error.type] = (byType[error.type] || 0) + 1;
      bySeverity[error.severity] = (bySeverity[error.severity] || 0) + 1;
    });

    return {
      total: errors.length,
      byType,
      bySeverity,
    };
  }

  public clearErrors(): void {
    this.errors.clear();
    this.recoveryInProgress.clear();
  }

  public dispose(): void {
    this.clearErrors();
    this.errorListeners.length = 0;
  }
}
