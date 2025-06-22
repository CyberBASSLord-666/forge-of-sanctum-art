
import React from 'react';
import { cn } from '@/lib/utils';

interface MuseForgeLiquidGlassProps {
  children: React.ReactNode;
  className?: string;
  variant?: 'subtle' | 'standard' | 'strong';
  interactive?: boolean;
  glowColor?: string;
}

export const MuseForgeLiquidGlass = ({ 
  children, 
  className, 
  variant = 'standard',
  interactive = false,
  glowColor = '#19F0D8',
}: MuseForgeLiquidGlassProps) => {
  const variantClasses = {
    subtle: 'glass-subtle',
    standard: 'glass',
    strong: 'glass-strong',
  };

  return (
    <div 
      className={cn(
        variantClasses[variant],
        interactive && 'glass-interactive',
        className
      )}
      style={{
        '--glow-color': glowColor,
      } as React.CSSProperties}
    >
      {children}
    </div>
  );
};
