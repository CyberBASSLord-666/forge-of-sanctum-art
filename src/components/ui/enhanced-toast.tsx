
import React from 'react';
import { Toast, ToastClose, ToastDescription, ToastProvider, ToastTitle, ToastViewport } from './toast';
import { useToast } from '@/hooks/use-toast';
import { CheckCircle, AlertCircle, Info, XCircle } from 'lucide-react';

const ToastIcon = ({ variant }: { variant?: 'default' | 'destructive' | 'success' | 'info' }) => {
  switch (variant) {
    case 'success':
      return <CheckCircle className="w-5 h-5 text-green-400" />;
    case 'destructive':
      return <XCircle className="w-5 h-5 text-red-400" />;
    case 'info':
      return <Info className="w-5 h-5 text-blue-400" />;
    default:
      return <AlertCircle className="w-5 h-5 text-yellow-400" />;
  }
};

export function EnhancedToaster() {
  const { toasts } = useToast();

  return (
    <ToastProvider>
      {toasts.map(function ({ id, title, description, action, variant, ...props }) {
        return (
          <Toast 
            key={id} 
            {...props}
            className="bg-black/90 backdrop-blur-sm border-white/10 text-white shadow-xl"
          >
            <div className="flex items-start gap-3">
              <ToastIcon variant={variant as any} />
              <div className="grid gap-1 flex-1">
                {title && (
                  <ToastTitle className="text-white font-medium">
                    {title}
                  </ToastTitle>
                )}
                {description && (
                  <ToastDescription className="text-white/70 text-sm">
                    {description}
                  </ToastDescription>
                )}
              </div>
            </div>
            {action}
            <ToastClose className="text-white/60 hover:text-white" />
          </Toast>
        );
      })}
      <ToastViewport className="fixed top-0 right-0 flex flex-col p-4 gap-2 w-full max-w-sm z-[100]" />
    </ToastProvider>
  );
}

// Enhanced toast function with better defaults
export const enhancedToast = {
  success: (title: string, description?: string) => {
    return (window as any).toast?.({
      title: `✅ ${title}`,
      description,
      variant: 'success',
    });
  },
  error: (title: string, description?: string) => {
    return (window as any).toast?.({
      title: `❌ ${title}`,
      description,
      variant: 'destructive',
    });
  },
  info: (title: string, description?: string) => {
    return (window as any).toast?.({
      title: `ℹ️ ${title}`,
      description,
      variant: 'info',
    });
  },
  loading: (title: string, description?: string) => {
    return (window as any).toast?.({
      title: `⏳ ${title}`,
      description,
      variant: 'default',
    });
  },
};
