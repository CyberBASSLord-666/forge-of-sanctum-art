import { toast } from '@/hooks/use-toast';

export enum ErrorSeverity {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  CRITICAL = 'critical',
}

export interface ErrorDetails {
  code: string;
  message: string;
  severity: ErrorSeverity;
  context?: Record<string, any>;
  stack?: string;
}

export class ErrorHandler {
  private static instance: ErrorHandler;
  private errorLog: ErrorDetails[] = [];

  static getInstance(): ErrorHandler {
    if (!ErrorHandler.instance) {
      ErrorHandler.instance = new ErrorHandler();
    }
    return ErrorHandler.instance;
  }

  handleError(error: Error | ErrorDetails, context?: Record<string, any>) {
    const errorDetails: ErrorDetails = error instanceof Error ? {
      code: 'RUNTIME_ERROR',
      message: error.message,
      severity: ErrorSeverity.MEDIUM,
      context,
      stack: error.stack,
    } : error;

    this.errorLog.push({
      ...errorDetails,
      context: { ...errorDetails.context, timestamp: new Date().toISOString() },
    });

    this.displayError(errorDetails);
    this.logError(errorDetails);

    // Cleanup old errors (keep only last 100)
    if (this.errorLog.length > 100) {
      this.errorLog = this.errorLog.slice(-100);
    }
  }

  private displayError(error: ErrorDetails) {
    const title = this.getErrorTitle(error.severity);
    const description = this.formatErrorMessage(error.message);

    toast({
      title,
      description,
      variant: error.severity === ErrorSeverity.CRITICAL ? 'destructive' : 'default',
    });
  }

  private logError(error: ErrorDetails) {
    const logLevel = error.severity === ErrorSeverity.CRITICAL ? 'error' : 'warn';
    console[logLevel](`[${error.code}] ${error.message}`, error.context);
  }

  private getErrorTitle(severity: ErrorSeverity): string {
    switch (severity) {
      case ErrorSeverity.LOW:
        return '💭 Notice';
      case ErrorSeverity.MEDIUM:
        return '⚠️ Warning';
      case ErrorSeverity.HIGH:
        return '🚨 Error';
      case ErrorSeverity.CRITICAL:
        return '💥 Critical Error';
      default:
        return '⚠️ Error';
    }
  }

  private formatErrorMessage(message: string): string {
    // Convert technical error messages to user-friendly ones
    const errorMappings: Record<string, string> = {
      'Network request failed': 'Connection issue - please check your internet',
      'Failed to fetch': 'Unable to connect to server',
      'IndexedDB error': 'Local storage issue - try refreshing the page',
      'Quota exceeded': 'Storage is full - please free up some space',
    };

    for (const [technical, friendly] of Object.entries(errorMappings)) {
      if (message.includes(technical)) {
        return friendly;
      }
    }

    return message;
  }

  getRecentErrors(count: number = 10): ErrorDetails[] {
    return this.errorLog.slice(-count);
  }

  clearErrorLog() {
    this.errorLog = [];
  }
}

export const errorHandler = ErrorHandler.getInstance();
