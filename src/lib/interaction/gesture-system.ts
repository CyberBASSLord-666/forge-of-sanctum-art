
// Re-export everything from the modular files for backward compatibility
export type { GestureConfig, GestureState, GestureHandlers } from './gesture-types';
export { GestureRecognizer } from './gesture-recognizer';
export { useGestures } from './use-gestures';
export { 
  getSwipeDirection, 
  getDistance, 
  getRotation, 
  getDefaultGestureConfig 
} from './gesture-utils';
