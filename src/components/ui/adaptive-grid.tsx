
import React from 'react';
import { cn } from '@/lib/utils';

interface AdaptiveGridProps {
  children: React.ReactNode;
  className?: string;
  minItemWidth?: string;
  gap?: string;
  autoFit?: boolean;
}

export const AdaptiveGrid: React.FC<AdaptiveGridProps> = ({
  children,
  className,
  minItemWidth = '280px',
  gap = '1rem',
  autoFit = true,
}) => {
  const gridStyle = {
    display: 'grid',
    gridTemplateColumns: autoFit 
      ? `repeat(auto-fit, minmax(${minItemWidth}, 1fr))`
      : `repeat(auto-fill, minmax(${minItemWidth}, 1fr))`,
    gap,
  };

  return (
    <div 
      className={cn('w-full', className)}
      style={gridStyle}
    >
      {children}
    </div>
  );
};
