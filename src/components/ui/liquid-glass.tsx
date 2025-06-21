
import React from 'react';
import { cn } from '@/lib/utils';

interface LiquidGlassProps {
  children: React.ReactNode;
  className?: string;
  intensity?: 'subtle' | 'medium' | 'strong';
  animated?: boolean;
}

export const LiquidGlass = ({ 
  children, 
  className, 
  intensity = 'medium',
  animated = true 
}: LiquidGlassProps) => {
  const intensityClasses = {
    subtle: 'backdrop-blur-sm bg-white/5 border-white/10',
    medium: 'backdrop-blur-xl bg-white/5 border-white/10',
    strong: 'backdrop-blur-2xl bg-white/10 border-white/20',
  };

  return (
    <div className={cn(
      'relative overflow-hidden rounded-xl border',
      intensityClasses[intensity],
      animated && 'transition-all duration-300 hover:bg-white/10',
      className
    )}>
      {/* Liquid Glass Turbulence Effect */}
      {animated && (
        <div className="absolute inset-0 pointer-events-none">
          <svg className="absolute inset-0 w-full h-full opacity-30">
            <defs>
              <filter id="liquid-turbulence">
                <feTurbulence
                  baseFrequency="0.02"
                  numOctaves="3"
                  seed="1"
                  stitchTiles="stitch"
                >
                  <animate
                    attributeName="baseFrequency"
                    values="0.02;0.05;0.02"
                    dur="20s"
                    repeatCount="indefinite"
                  />
                </feTurbulence>
                <feColorMatrix values="0 0 0 0 0.6 0 0 0 0 0.4 0 0 0 0 1 0 0 0 0.1 0" />
                <feComposite in2="SourceGraphic" operator="screen" />
              </filter>
            </defs>
            <rect
              width="100%"
              height="100%"
              filter="url(#liquid-turbulence)"
            />
          </svg>
        </div>
      )}
      
      {/* Shimmer Effect */}
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full animate-shimmer" />
      
      {/* Content */}
      <div className="relative z-10">
        {children}
      </div>
    </div>
  );
};
