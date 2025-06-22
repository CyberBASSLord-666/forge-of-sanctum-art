
import React from 'react';
import { useBackgroundEffects } from '@/hooks/useBackgroundEffects';

interface BackgroundSystemProps {
  animationsEnabled: boolean;
  animationConfig: any;
}

export const BackgroundSystem: React.FC<BackgroundSystemProps> = ({
  animationsEnabled,
  animationConfig,
}) => {
  const { backgroundEffects, viewport } = useBackgroundEffects(animationsEnabled, animationConfig);

  return (
    <div className="absolute inset-0">
      {/* Primary gradient with device optimization */}
      <div 
        className="absolute inset-0"
        style={{
          background: viewport?.deviceType === 'mobile' 
            ? 'radial-gradient(ellipse at center, rgba(139, 92, 246, 0.15), rgba(15, 23, 42, 0.8))'
            : 'radial-gradient(ellipse at top, rgba(139, 92, 246, 0.3), rgba(15, 23, 42, 0.5), rgba(0, 0, 0, 0.7))'
        }}
      />
      
      {/* Animated aurora effect - complexity based on device */}
      {animationsEnabled && animationConfig.complexity !== 'basic' && (
        <div className="absolute inset-0 opacity-20">
          <div 
            className="absolute inset-0 bg-gradient-to-r from-purple-500/20 via-blue-500/20 to-purple-500/20"
            style={{
              animation: `aurora ${20 + (viewport?.width || 1920) / 100}s ease-in-out infinite`,
              filter: `blur(${viewport?.deviceType === 'mobile' ? '50px' : '100px'})`,
            }}
          />
        </div>
      )}
      
      {/* Performance-optimized particle system */}
      {animationsEnabled && (
        <div className="absolute inset-0 pointer-events-none">
          {backgroundEffects.map((particle) => (
            <div
              key={particle.id}
              className="absolute rounded-full animate-pulse"
              style={{
                left: `${particle.x}%`,
                top: `${particle.y}%`,
                width: `${particle.size}px`,
                height: `${particle.size}px`,
                backgroundColor: particle.id % 3 === 0 ? '#8B5CF6' : 
                                 particle.id % 3 === 1 ? '#3B82F6' : '#A855F7',
                animationDelay: `${particle.delay}s`,
                animationDuration: `${particle.duration}s`,
              }}
            />
          ))}
        </div>
      )}
      
      {/* Responsive dot pattern */}
      <div 
        className="absolute inset-0 opacity-30" 
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='${viewport?.deviceType === 'mobile' ? 40 : 60}' height='${viewport?.deviceType === 'mobile' ? 40 : 60}' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%239C92AC' fill-opacity='0.03'%3E%3Ccircle cx='30' cy='30' r='1'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
        }}
      />
    </div>
  );
};
