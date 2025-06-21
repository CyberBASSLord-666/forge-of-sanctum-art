
import React, { useRef, useEffect } from 'react';
import { cn } from '@/lib/utils';

interface EnhancedLiquidGlassProps {
  children: React.ReactNode;
  className?: string;
  intensity?: 'subtle' | 'medium' | 'strong' | 'immersive';
  animated?: boolean;
  interactive?: boolean;
  glowColor?: string;
  turbulenceScale?: number;
  shimmerSpeed?: number;
}

export const EnhancedLiquidGlass = ({ 
  children, 
  className, 
  intensity = 'medium',
  animated = true,
  interactive = true,
  glowColor = '#8B5CF6',
  turbulenceScale = 0.02,
  shimmerSpeed = 20,
}: EnhancedLiquidGlassProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const mouseRef = useRef({ x: 0, y: 0 });
  
  const intensityClasses = {
    subtle: 'backdrop-blur-sm bg-white/3 border-white/5',
    medium: 'backdrop-blur-xl bg-white/5 border-white/10',
    strong: 'backdrop-blur-2xl bg-white/10 border-white/20',
    immersive: 'backdrop-blur-3xl bg-white/15 border-white/30',
  };

  // Enhanced mouse tracking for interactive effects
  useEffect(() => {
    if (!interactive || !containerRef.current) return;
    
    const container = containerRef.current;
    
    const handleMouseMove = (e: MouseEvent) => {
      const rect = container.getBoundingClientRect();
      mouseRef.current = {
        x: (e.clientX - rect.left) / rect.width,
        y: (e.clientY - rect.top) / rect.height,
      };
      
      // Update CSS custom properties for interactive effects
      container.style.setProperty('--mouse-x', `${mouseRef.current.x}`);
      container.style.setProperty('--mouse-y', `${mouseRef.current.y}`);
    };
    
    const handleMouseLeave = () => {
      container.style.setProperty('--mouse-x', '0.5');
      container.style.setProperty('--mouse-y', '0.5');
    };
    
    container.addEventListener('mousemove', handleMouseMove);
    container.addEventListener('mouseleave', handleMouseLeave);
    
    return () => {
      container.removeEventListener('mousemove', handleMouseMove);
      container.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, [interactive]);

  const turbulenceId = `liquid-turbulence-${Math.random().toString(36).substr(2, 9)}`;
  const glowId = `liquid-glow-${Math.random().toString(36).substr(2, 9)}`;
  const shimmerGradientId = `shimmer-gradient-${Math.random().toString(36).substr(2, 9)}`;

  return (
    <div 
      ref={containerRef}
      className={cn(
        'relative overflow-hidden rounded-xl border transition-all duration-500',
        intensityClasses[intensity],
        animated && 'hover:bg-white/[0.08] hover:border-white/20',
        interactive && 'cursor-pointer transform-gpu hover:scale-[1.02]',
        className
      )}
      style={{
        '--glow-color': glowColor,
        '--turbulence-scale': turbulenceScale,
        '--shimmer-speed': `${shimmerSpeed}s`,
      } as React.CSSProperties}
    >
      {/* Advanced SVG Effects */}
      {animated && (
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <svg className="absolute inset-0 w-full h-full opacity-40">
            <defs>
              {/* Enhanced Turbulence Filter */}
              <filter id={turbulenceId} x="0%" y="0%" width="100%" height="100%">
                <feTurbulence
                  baseFrequency={turbulenceScale}
                  numOctaves="4"
                  seed="2"
                  stitchTiles="stitch"
                  type="fractalNoise"
                >
                  <animate
                    attributeName="baseFrequency"
                    values={`${turbulenceScale};${turbulenceScale * 2};${turbulenceScale}`}
                    dur={`${shimmerSpeed}s`}
                    repeatCount="indefinite"
                  />
                  <animate
                    attributeName="seed"
                    values="2;5;8;2"
                    dur={`${shimmerSpeed * 1.5}s`}
                    repeatCount="indefinite"
                  />
                </feTurbulence>
                <feColorMatrix
                  values="0 0 0 0 0.6 0 0 0 0 0.4 0 0 0 0 1 0 0 0 0.15 0"
                />
                <feComposite in2="SourceGraphic" operator="screen" />
                <feGaussianBlur stdDeviation="1" />
              </filter>

              {/* Glow Effect */}
              <filter id={glowId} x="-50%" y="-50%" width="200%" height="200%">
                <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
                <feMerge> 
                  <feMergeNode in="coloredBlur"/>
                  <feMergeNode in="SourceGraphic"/>
                </feMerge>
              </filter>

              {/* Enhanced Shimmer Gradient */}
              <linearGradient id={shimmerGradientId} x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="transparent">
                  <animate 
                    attributeName="stop-color" 
                    values="transparent;rgba(255,255,255,0.3);transparent" 
                    dur="3s" 
                    repeatCount="indefinite" 
                  />
                </stop>
                <stop offset="50%" stopColor="rgba(255,255,255,0.1)">
                  <animate 
                    attributeName="stop-color" 
                    values="rgba(255,255,255,0.1);rgba(255,255,255,0.5);rgba(255,255,255,0.1)" 
                    dur="3s" 
                    repeatCount="indefinite" 
                  />
                </stop>
                <stop offset="100%" stopColor="transparent">
                  <animate 
                    attributeName="stop-color" 
                    values="transparent;rgba(255,255,255,0.3);transparent" 
                    dur="3s" 
                    repeatCount="indefinite" 
                  />
                </stop>
              </linearGradient>
            </defs>
            
            {/* Turbulence Layer */}
            <rect
              width="100%"
              height="100%"
              filter={`url(#${turbulenceId})`}
              opacity="0.6"
            />
            
            {/* Interactive Glow */}
            {interactive && (
              <circle
                r="100"
                fill={glowColor}
                opacity="0.1"
                filter={`url(#${glowId})`}
                style={{
                  transform: 'translate(calc(var(--mouse-x, 0.5) * 100% - 50px), calc(var(--mouse-y, 0.5) * 100% - 50px))',
                  transition: 'transform 0.3s ease-out',
                }}
              />
            )}
          </svg>
        </div>
      )}
      
      {/* Enhanced Shimmer Effect */}
      {animated && (
        <div 
          className="absolute inset-0 opacity-60"
          style={{
            background: `linear-gradient(45deg, transparent 30%, ${glowColor}20 50%, transparent 70%)`,
            transform: 'translateX(-100%)',
            animation: `shimmer ${shimmerSpeed}s infinite`,
          }}
        />
      )}
      
      {/* Prismatic Edge Effect */}
      {intensity === 'immersive' && (
        <div className="absolute inset-0 rounded-xl">
          <div 
            className="absolute inset-0 rounded-xl"
            style={{
              background: `conic-gradient(from 0deg, 
                transparent, 
                ${glowColor}10, 
                transparent, 
                ${glowColor}20, 
                transparent
              )`,
              animation: 'spin 30s linear infinite',
            }}
          />
        </div>
      )}
      
      {/* Content Container */}
      <div className="relative z-10 h-full">
        {children}
      </div>
      
      {/* Noise Texture Overlay */}
      <div 
        className="absolute inset-0 opacity-[0.02] pointer-events-none mix-blend-overlay"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
        }}
      />
    </div>
  );
};

// Add custom keyframes to the CSS
const style = document.createElement('style');
style.textContent = `
  @keyframes shimmer {
    0% { transform: translateX(-100%) translateY(-100%) rotate(45deg); }
    100% { transform: translateX(200%) translateY(200%) rotate(45deg); }
  }
  
  @keyframes spin {
    from { transform: rotate(0deg); }
    to { transform: rotate(360deg); }
  }
`;
document.head.appendChild(style);
