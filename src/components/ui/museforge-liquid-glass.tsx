
import React, { useRef, useEffect, useState } from 'react';
import { cn } from '@/lib/utils';

interface MuseForgeLiquidGlassProps {
  children: React.ReactNode;
  className?: string;
  variant?: 'subtle' | 'standard' | 'strong' | 'immersive';
  interactive?: boolean;
  animated?: boolean;
  glowColor?: string;
}

export const MuseForgeLiquidGlass = ({ 
  children, 
  className, 
  variant = 'standard',
  interactive = true,
  animated = true,
  glowColor = '#19F0D8',
}: MuseForgeLiquidGlassProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [mousePosition, setMousePosition] = useState({ x: 0.5, y: 0.5 });
  const turbulenceId = `turbulence-${Math.random().toString(36).substr(2, 9)}`;
  const displacementId = `displacement-${Math.random().toString(36).substr(2, 9)}`;

  // Mouse tracking for interactive refraction
  useEffect(() => {
    if (!interactive || !containerRef.current) return;
    
    const container = containerRef.current;
    
    const handleMouseMove = (e: MouseEvent) => {
      const rect = container.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width;
      const y = (e.clientY - rect.top) / rect.height;
      setMousePosition({ x, y });
    };
    
    const handleMouseLeave = () => {
      setMousePosition({ x: 0.5, y: 0.5 });
    };
    
    container.addEventListener('mousemove', handleMouseMove);
    container.addEventListener('mouseleave', handleMouseLeave);
    
    return () => {
      container.removeEventListener('mousemove', handleMouseMove);
      container.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, [interactive]);

  const variantClasses = {
    subtle: 'mf-liquid-glass--subtle',
    standard: '',
    strong: 'mf-liquid-glass--strong',
    immersive: 'mf-liquid-glass--immersive',
  };

  return (
    <div 
      ref={containerRef}
      className={cn(
        'mf-liquid-glass',
        variantClasses[variant],
        interactive && 'mf-liquid-glass-interactive',
        className
      )}
      style={{
        '--mouse-x': mousePosition.x,
        '--mouse-y': mousePosition.y,
      } as React.CSSProperties}
    >
      {/* SVG Liquid Effects */}
      {animated && (
        <div className="absolute inset-0 pointer-events-none">
          <svg className="absolute inset-0 w-full h-full opacity-60">
            <defs>
              {/* Animated Turbulence Filter */}
              <filter id={turbulenceId} x="0%" y="0%" width="100%" height="100%">
                <feTurbulence
                  baseFrequency="0.01 0.02"
                  numOctaves="2"
                  seed="1"
                  stitchTiles="stitch"
                  type="fractalNoise"
                >
                  <animate
                    attributeName="baseFrequency"
                    values="0.01 0.02;0.02 0.04;0.01 0.02"
                    dur="20s"
                    repeatCount="indefinite"
                  />
                  <animate
                    attributeName="seed"
                    values="1;5;9;1"
                    dur="30s"
                    repeatCount="indefinite"
                  />
                </feTurbulence>
                <feColorMatrix
                  values="0 0 0 0 0.6 0 0 0 0 0.4 0 0 0 0 1 0 0 0 0.1 0"
                />
              </filter>

              {/* Interactive Displacement Map */}
              <filter id={displacementId} x="-20%" y="-20%" width="140%" height="140%">
                <feTurbulence
                  baseFrequency="0.05"
                  numOctaves="1"
                  result="noise"
                />
                <feDisplacementMap
                  in="SourceGraphic"
                  in2="noise"
                  scale="3"
                >
                  <animate
                    attributeName="scale"
                    values="3;8;3"
                    dur="15s"
                    repeatCount="indefinite"
                  />
                </feDisplacementMap>
              </filter>
            </defs>
            
            {/* Liquid Turbulence Layer */}
            <rect
              width="100%"
              height="100%"
              filter={`url(#${turbulenceId})`}
              opacity="0.3"
            />
            
            {/* Interactive Glow */}
            {interactive && (
              <circle
                r="80"
                fill={glowColor}
                opacity="0.08"
                style={{
                  transform: `translate(${mousePosition.x * 100}%, ${mousePosition.y * 100}%)`,
                  transition: 'transform 0.3s ease-out',
                }}
              />
            )}
          </svg>
        </div>
      )}
      
      {/* Content */}
      <div className="relative z-10">
        {children}
      </div>
    </div>
  );
};
