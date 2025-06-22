
export interface TouchData {
  clientX: number;
  clientY: number;
  identifier?: number;
}

export interface GestureConfig {
  enablePan?: boolean;
  enableSwipe?: boolean;
  enablePinch?: boolean;
  enableRotation?: boolean;
  enableDoubleTap?: boolean;
  enableLongPress?: boolean;
  threshold?: {
    pan?: number;
    swipe?: number;
    pinch?: number;
    rotation?: number;
  };
  preventDefault?: boolean;
}

export interface GestureState {
  type: 'pan' | 'swipe' | 'pinch' | 'rotation' | 'tap' | 'longpress';
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
  touches: TouchData[];
}

export interface GestureCallbacks {
  onPan?: (state: GestureState) => void;
  onSwipe?: (direction: 'up' | 'down' | 'left' | 'right', state: GestureState) => void;
  onPinch?: (state: GestureState) => void;
  onRotation?: (state: GestureState) => void;
  onTap?: (state: GestureState) => void;
  onDoubleTap?: (state: GestureState) => void;
  onLongPress?: (state: GestureState) => void;
  onGestureStart?: (state: GestureState) => void;
  onGestureEnd?: (state: GestureState) => void;
}

export interface GestureHandlers {
  onPan?: (state: GestureState) => void;
  onSwipe?: (direction: 'up' | 'down' | 'left' | 'right', state: GestureState) => void;
  onPinch?: (state: GestureState) => void;
  onRotation?: (state: GestureState) => void;
  onTap?: (state: GestureState) => void;
  onDoubleTap?: (state: GestureState) => void;
  onLongPress?: (state: GestureState) => void;
  onGestureStart?: (state: GestureState) => void;
  onGestureEnd?: (state: GestureState) => void;
}
