
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
    subtle: 'mf-glass-subtle',
    standard: 'mf-glass',
    strong: 'mf-glass-strong',
  };

  return (
    <div 
      className={cn(
        variantClasses[variant],
        interactive && 'mf-glass-interactive',
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
