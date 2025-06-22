
export interface GestureConfig {
  enablePan?: boolean;
  enableSwipe?: boolean;
  enablePinch?: boolean;
  enableRotation?: boolean;
  enableDoubleTap?: boolean;
  enableLongPress?: boolean;
  threshold?: {
    pan: number;
    swipe: number;
    pinch: number;
    rotation: number;
  };
  preventDefault?: boolean;
}

export interface GestureState {
  type: 'tap' | 'pan' | 'swipe' | 'pinch' | 'rotation' | 'longpress';
  isActive: boolean;
  startTime: number;
  startPosition: { x: number; y: number };
  currentPosition: { x: number; y: number };
  deltaX: number;
  deltaY: number;
  distance: number;
  scale: number;
  rotation: number;
  velocity: { x: number; y: number };
  center: { x: number; y: number };
  touches: Touch[];
}

export interface GestureHandlers {
  onTap?: (state: GestureState) => void;
  onDoubleTap?: (state: GestureState) => void;
  onLongPress?: (state: GestureState) => void;
  onPan?: (state: GestureState) => void;
  onSwipe?: (direction: 'up' | 'down' | 'left' | 'right', state: GestureState) => void;
  onPinch?: (state: GestureState) => void;
  onRotation?: (state: GestureState) => void;
  onGestureStart?: (state: GestureState) => void;
  onGestureEnd?: (state: GestureState) => void;
}
