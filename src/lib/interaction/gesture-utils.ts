
import { GestureConfig, GestureState, TouchData, GestureCallbacks } from './gesture-types';

export const calculateDistance = (touch1: TouchData, touch2: TouchData): number => {
  const dx = touch1.clientX - touch2.clientX;
  const dy = touch1.clientY - touch2.clientY;
  return Math.sqrt(dx * dx + dy * dy);
};

export const calculateAngle = (touch1: TouchData, touch2: TouchData): number => {
  const dx = touch1.clientX - touch2.clientX;
  const dy = touch1.clientY - touch2.clientY;
  return Math.atan2(dy, dx) * (180 / Math.PI);
};

export const calculateCenter = (touches: TouchData[]): { x: number; y: number } => {
  const sum = touches.reduce(
    (acc, touch) => ({
      x: acc.x + touch.clientX,
      y: acc.y + touch.clientY,
    }),
    { x: 0, y: 0 }
  );
  return {
    x: sum.x / touches.length,
    y: sum.y / touches.length,
  };
};

export const calculateVelocity = (
  currentPos: { x: number; y: number },
  lastPos: { x: number; y: number },
  deltaTime: number
): { x: number; y: number } => {
  if (deltaTime === 0) return { x: 0, y: 0 };
  
  return {
    x: (currentPos.x - lastPos.x) / deltaTime,
    y: (currentPos.y - lastPos.y) / deltaTime,
  };
};

export const normalizeAngle = (angle: number): number => {
  let normalized = angle % 360;
  if (normalized < 0) normalized += 360;
  return normalized;
};

export const getSwipeDirection = (
  startPos: { x: number; y: number },
  endPos: { x: number; y: number },
  threshold: number = 50
): 'up' | 'down' | 'left' | 'right' | null => {
  const deltaX = endPos.x - startPos.x;
  const deltaY = endPos.y - startPos.y;
  
  const absX = Math.abs(deltaX);
  const absY = Math.abs(deltaY);
  
  if (Math.max(absX, absY) < threshold) return null;
  
  if (absX > absY) {
    return deltaX > 0 ? 'right' : 'left';
  } else {
    return deltaY > 0 ? 'down' : 'up';
  }
};

// Overloaded version for backward compatibility
export const getSwipeDirectionFromDeltas = (
  deltaX: number,
  deltaY: number
): 'up' | 'down' | 'left' | 'right' | null => {
  return getSwipeDirection({ x: 0, y: 0 }, { x: deltaX, y: deltaY });
};

export const getDistance = (touch1: any, touch2: any): number => {
  return calculateDistance(touch1, touch2);
};

export const getRotation = (touch1: any, touch2: any): number => {
  return calculateAngle(touch1, touch2);
};

export const getDefaultGestureConfig = (): GestureConfig => ({
  enablePan: true,
  enableSwipe: true,
  enablePinch: false,
  enableRotation: false,
  enableDoubleTap: false,
  enableLongPress: false,
  threshold: {
    pan: 10,
    swipe: 50,
    pinch: 0.1,
    rotation: 5,
  },
  preventDefault: true,
});

export const isWithinThreshold = (
  current: number,
  target: number,
  threshold: number
): boolean => {
  return Math.abs(current - target) <= threshold;
};

export const clamp = (value: number, min: number, max: number): number => {
  return Math.min(Math.max(value, min), max);
};

export const lerp = (start: number, end: number, factor: number): number => {
  return start + (end - start) * factor;
};

export const createGestureState = (): GestureState => ({
  type: 'tap',
  isActive: false,
  startTime: 0,
  startPosition: { x: 0, y: 0 },
  currentPosition: { x: 0, y: 0 },
  deltaX: 0,
  deltaY: 0,
  distance: 0,
  velocity: { x: 0, y: 0 },
  scale: 1,
  rotation: 0,
  center: { x: 0, y: 0 },
  touches: [],
});

export const mergeGestureConfigs = (
  defaultConfig: GestureConfig,
  userConfig: Partial<GestureConfig>
): GestureConfig => {
  return {
    ...defaultConfig,
    ...userConfig,
    threshold: {
      ...defaultConfig.threshold,
      ...userConfig.threshold,
    },
  };
};
