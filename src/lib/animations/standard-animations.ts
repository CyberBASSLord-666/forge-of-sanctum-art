
// Clean, modern CSS-based animation system
export const standardAnimations = {
  // Fade animations
  fadeIn: 'animate-in fade-in duration-300',
  fadeOut: 'animate-out fade-out duration-200',
  
  // Slide animations
  slideInFromTop: 'animate-in slide-in-from-top duration-300',
  slideInFromBottom: 'animate-in slide-in-from-bottom duration-300',
  slideInFromLeft: 'animate-in slide-in-from-left duration-300',
  slideInFromRight: 'animate-in slide-in-from-right duration-300',
  
  // Scale animations
  scaleIn: 'animate-in zoom-in-95 duration-200',
  scaleOut: 'animate-out zoom-out-95 duration-150',
  
  // Hover effects
  hoverScale: 'transition-transform duration-200 hover:scale-105',
  hoverLift: 'transition-all duration-200 hover:-translate-y-1 hover:shadow-lg',
  hoverFade: 'transition-opacity duration-200 hover:opacity-80',
};

export const loadingAnimations = {
  spin: 'animate-spin',
  pulse: 'animate-pulse',
  bounce: 'animate-bounce',
};

// Original geometric loading pattern
export const GeometricLoader = () => (
  <div className="relative w-12 h-12">
    <div className="absolute inset-0 border-2 border-blue-500/20 rounded-full"></div>
    <div className="absolute inset-1 border-2 border-blue-500/40 rounded-full animate-spin"></div>
    <div className="absolute inset-2 border-2 border-blue-500/60 rounded-full animate-spin" style={{ animationDirection: 'reverse' }}></div>
    <div className="absolute inset-3 w-6 h-6 bg-blue-500 rounded-full animate-pulse"></div>
  </div>
);
