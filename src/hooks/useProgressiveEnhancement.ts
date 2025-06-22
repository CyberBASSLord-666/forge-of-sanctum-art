
import { useState, useEffect, useCallback } from 'react';
import { errorHandler, ErrorSeverity } from '@/lib/error/error-boundary';

interface ProgressiveState<T> {
  data: T | null;
  isLoading: boolean;
  error: Error | null;
  retry: () => void;
  reset: () => void;
}

export const useProgressiveEnhancement = <T>(
  asyncFunction: () => Promise<T>,
  dependencies: any[] = [],
  options: {
    retryAttempts?: number;
    retryDelay?: number;
    fallbackValue?: T;
    immediate?: boolean;
  } = {}
): ProgressiveState<T> => {
  const {
    retryAttempts = 3,
    retryDelay = 1000,
    fallbackValue = null,
    immediate = true,
  } = options;

  const [data, setData] = useState<T | null>(fallbackValue);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [attemptCount, setAttemptCount] = useState(0);

  const execute = useCallback(async () => {
    if (attemptCount >= retryAttempts) {
      errorHandler.handleError({
        code: 'MAX_RETRY_EXCEEDED',
        message: `Maximum retry attempts (${retryAttempts}) exceeded`,
        severity: ErrorSeverity.MEDIUM,
        context: { attemptCount, retryAttempts },
      });
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const result = await asyncFunction();
      setData(result);
      setAttemptCount(0);
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Unknown error');
      setError(error);
      setAttemptCount(prev => prev + 1);

      errorHandler.handleError({
        code: 'PROGRESSIVE_ENHANCEMENT_ERROR',
        message: error.message,
        severity: ErrorSeverity.LOW,
        context: { attemptCount: attemptCount + 1, retryAttempts },
      });

      // Auto-retry with exponential backoff
      if (attemptCount + 1 < retryAttempts) {
        setTimeout(() => {
          execute();
        }, retryDelay * Math.pow(2, attemptCount));
      }
    } finally {
      setIsLoading(false);
    }
  }, [asyncFunction, attemptCount, retryAttempts, retryDelay]);

  const retry = useCallback(() => {
    setAttemptCount(0);
    execute();
  }, [execute]);

  const reset = useCallback(() => {
    setData(fallbackValue);
    setError(null);
    setAttemptCount(0);
    setIsLoading(false);
  }, [fallbackValue]);

  useEffect(() => {
    if (immediate) {
      execute();
    }
  }, [...dependencies, immediate]);

  return {
    data,
    isLoading,
    error,
    retry,
    reset,
  };
};
