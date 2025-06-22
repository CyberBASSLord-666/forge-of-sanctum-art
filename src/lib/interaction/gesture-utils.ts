
import { GestureConfig } from './gesture-types';

export const getDefaultGestureConfig = (): Required<GestureConfig> => ({
  enablePan: true,
  enableSwipe: true,
  enablePinch: true,
  enableRotation: true,
  enableDoubleTap: true,
  enableLongPress: true,
  threshold: {
    pan: 10,
    swipe: 50,
    pinch: 0.1,
    rotation: 5,
  },
  preventDefault: true,
});

export const getDistance = (p1: { clientX: number; clientY: number }, p2: { clientX: number; clientY: number }): number => {
  const dx = p2.clientX - p1.clientX;
  const dy = p2.clientY - p1.clientY;
  return Math.sqrt(dx * dx + dy * dy);
};

export const getRotation = (p1: { clientX: number; clientY: number }, p2: { clientX: number; clientY: number }): number => {
  return Math.atan2(p2.clientY - p1.clientY, p2.clientX - p1.clientX) * (180 / Math.PI);
};

export const getSwipeDirection = (deltaX: number, deltaY: number): 'up' | 'down' | 'left' | 'right' | null => {
  const absDeltaX = Math.abs(deltaX);
  const absDeltaY = Math.abs(deltaY);
  
  if (absDeltaX > absDeltaY) {
    return deltaX > 0 ? 'right' : 'left';
  } else if (absDeltaY > absDeltaX) {
    return deltaY > 0 ? 'down' : 'up';
  }
  
  return null;
};

export const getSwipeDirectionFromDeltas = (deltaX: number, deltaY: number): 'up' | 'down' | 'left' | 'right' | null => {
  return getSwipeDirection(deltaX, deltaY);
};

export const clamp = (value: number, min: number, max: number): number => {
  return Math.min(Math.max(value, min), max);
};

export const lerp = (start: number, end: number, factor: number): number => {
  return start + (end - start) * factor;
};

export const debounce = <T extends (...args: any[]) => void>(
  func: T,
  wait: number
): ((...args: Parameters<T>) => void) => {
  let timeoutId: number | undefined;
  
  return (...args: Parameters<T>) => {
    clearTimeout(timeoutId);
    timeoutId = window.setTimeout(() => func.apply(null, args), wait);
  };
};

export const throttle = <T extends (...args: any[]) => void>(
  func: T,
  limit: number
): ((...args: Parameters<T>) => void) => {
  let inThrottle: boolean;
  
  return (...args: Parameters<T>) => {
    if (!inThrottle) {
      func.apply(null, args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, limit);
    }
  };
};
