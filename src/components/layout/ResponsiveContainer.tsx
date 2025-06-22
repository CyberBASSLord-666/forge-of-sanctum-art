
import React from 'react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';

interface ResponsiveContainerProps {
  children: React.ReactNode;
  className?: string;
  maxHeight?: string;
  enableHorizontalScroll?: boolean;
  adaptiveSpacing?: boolean;
}

export const ResponsiveContainer: React.FC<ResponsiveContainerProps> = ({
  children,
  className,
  maxHeight = '100vh',
  enableHorizontalScroll = false,
  adaptiveSpacing = true,
}) => {
  return (
    <div 
      className={cn(
        'relative w-full',
        adaptiveSpacing && 'p-2 sm:p-4 md:p-6 lg:p-8',
        className
      )}
      style={{ maxHeight }}
    >
      <ScrollArea 
        className={cn(
          'h-full w-full',
          enableHorizontalScroll && 'overflow-x-auto'
        )}
      >
        <div className={cn(
          'min-h-full',
          enableHorizontalScroll && 'min-w-max'
        )}>
          {children}
        </div>
      </ScrollArea>
    </div>
  );
};
