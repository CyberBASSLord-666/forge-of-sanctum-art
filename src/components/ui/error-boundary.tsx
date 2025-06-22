
import React, { Component, ErrorInfo, ReactNode } from 'react';
import { Alert, AlertDescription, AlertTitle } from './alert';
import { Button } from './button';
import { errorHandler, ErrorSeverity } from '@/lib/error/error-boundary';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    errorHandler.handleError({
      code: 'REACT_ERROR_BOUNDARY',
      message: error.message,
      severity: ErrorSeverity.HIGH,
      context: {
        componentStack: errorInfo.componentStack,
        errorBoundary: true,
      },
      stack: error.stack,
    });

    this.props.onError?.(error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center p-4">
          <div className="max-w-md w-full">
            <Alert variant="destructive" className="bg-red-900/20 border-red-500/30 backdrop-blur-sm">
              <AlertTitle className="text-red-300">
                🚨 Something went wrong
              </AlertTitle>
              <AlertDescription className="text-red-200/80 mt-2">
                The forge encountered an unexpected error. Your work is safe, but we need to restart the creative process.
              </AlertDescription>
              <div className="flex gap-2 mt-4">
                <Button
                  onClick={() => window.location.reload()}
                  className="bg-red-600 hover:bg-red-700 text-white"
                >
                  Restart Forge
                </Button>
                <Button
                  variant="outline"
                  onClick={() => this.setState({ hasError: false })}
                  className="border-red-500/30 text-red-300 hover:bg-red-500/10"
                >
                  Try Again
                </Button>
              </div>
            </Alert>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
