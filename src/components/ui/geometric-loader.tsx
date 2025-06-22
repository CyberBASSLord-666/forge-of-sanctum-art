
import React from 'react';

export const GeometricLoader: React.FC = () => (
  <div className="relative w-12 h-12">
    <div className="absolute inset-0 border-2 border-blue-500/20 rounded-full"></div>
    <div className="absolute inset-1 border-2 border-blue-500/40 rounded-full animate-spin"></div>
    <div className="absolute inset-2 border-2 border-blue-500/60 rounded-full animate-spin" style={{ animationDirection: 'reverse' }}></div>
    <div className="absolute inset-3 w-6 h-6 bg-blue-500 rounded-full animate-pulse"></div>
  </div>
);
