
import { RefObject, useEffect, useRef, useCallback, useState } from 'react';

export interface GestureState {
  isActive: boolean;
  startPoint: { x: number; y: number };
  currentPoint: { x: number; y: number };
  deltaX: number;
  deltaY: number;
  distance: number;
  angle: number;
  velocity: { x: number; y: number };
  acceleration: { x: number; y: number };
  duration: number;
}

export interface MultiTouchState {
  touches: TouchPoint[];
  centroid: { x: number; y: number };
  scale: number;
  rotation: number;
  isMultiTouch: boolean;
}

export interface TouchPoint {
  id: number;
  x: number;
  y: number;
  force?: number;
  radiusX?: number;
  radiusY?: number;
}

export interface GestureConfig {
  enablePan?: boolean;
  enablePinch?: boolean;
  enableRotate?: boolean;
  enableSwipe?: boolean;
  enableLongPress?: boolean;
  enableDoubleTap?: boolean;
  threshold?: {
    pan: number;
    swipe: number;
    pinch: number;
    rotation: number;
  };
  timing?: {
    longPress: number;
    doubleTap: number;
  };
}

export interface GestureHandlers {
  onPanStart?: (state: GestureState) => void;
  onPan?: (state: GestureState) => void;
  onPanEnd?: (state: GestureState) => void;
  onPinchStart?: (state: MultiTouchState) => void;
  onPinch?: (state: MultiTouchState) => void;
  onPinchEnd?: (state: MultiTouchState) => void;
  onRotateStart?: (state: MultiTouchState) => void;
  onRotate?: (state: MultiTouchState) => void;
  onRotateEnd?: (state: MultiTouchState) => void;
  onSwipe?: (direction: 'up' | 'down' | 'left' | 'right', state: GestureState) => void;
  onTap?: (point: { x: number; y: number }) => void;
  onDoubleTap?: (point: { x: number; y: number }) => void;
  onLongPress?: (point: { x: number; y: number }) => void;
}

class GestureRecognizer {
  private element: HTMLElement;
  private config: Required<GestureConfig>;
  private handlers: GestureHandlers;
  
  private gestureState: GestureState;
  private multiTouchState: MultiTouchState;
  private lastTouchTime = 0;
  private tapCount = 0;
  private longPressTimer: number | null = null;
  private velocityTracker: VelocityTracker;
  
  private isPointerDown = false;
  private pointerCache: PointerEvent[] = [];
  private previousTouches: TouchPoint[] = [];

  constructor(element: HTMLElement, config: GestureConfig, handlers: GestureHandlers) {
    this.element = element;
    this.config = this.mergeConfig(config);
    this.handlers = handlers;
    this.velocityTracker = new VelocityTracker();
    
    this.gestureState = {
      isActive: false,
      startPoint: { x: 0, y: 0 },
      currentPoint: { x: 0, y: 0 },
      deltaX: 0,
      deltaY: 0,
      distance: 0,
      angle: 0,
      velocity: { x: 0, y: 0 },
      acceleration: { x: 0, y: 0 },
      duration: 0,
    };
    
    this.multiTouchState = {
      touches: [],
      centroid: { x: 0, y: 0 },
      scale: 1,
      rotation: 0,
      isMultiTouch: false,
    };
    
    this.setupEventListeners();
  }

  private mergeConfig(config: GestureConfig): Required<GestureConfig> {
    return {
      enablePan: config.enablePan ?? true,
      enablePinch: config.enablePinch ?? true,
      enableRotate: config.enableRotate ?? true,
      enableSwipe: config.enableSwipe ?? true,
      enableLongPress: config.enableLongPress ?? true,
      enableDoubleTap: config.enableDoubleTap ?? true,
      threshold: {
        pan: config.threshold?.pan ?? 10,
        swipe: config.threshold?.swipe ?? 50,
        pinch: config.threshold?.pinch ?? 0.1,
        rotation: config.threshold?.rotation ?? 5,
      },
      timing: {
        longPress: config.timing?.longPress ?? 500,
        doubleTap: config.timing?.doubleTap ?? 300,
      },
    };
  }

  private setupEventListeners(): void {
    // Pointer Events (unified touch/mouse handling)
    this.element.addEventListener('pointerdown', this.handlePointerDown, { passive: false });
    this.element.addEventListener('pointermove', this.handlePointerMove, { passive: false });
    this.element.addEventListener('pointerup', this.handlePointerUp, { passive: false });
    this.element.addEventListener('pointercancel', this.handlePointerCancel, { passive: false });
    
    // Touch Events for advanced multi-touch
    this.element.addEventListener('touchstart', this.handleTouchStart, { passive: false });
    this.element.addEventListener('touchmove', this.handleTouchMove, { passive: false });
    this.element.addEventListener('touchend', this.handleTouchEnd, { passive: false });
    this.element.addEventListener('touchcancel', this.handleTouchCancel, { passive: false });
    
    // Mouse Events for desktop
    this.element.addEventListener('mousedown', this.handleMouseDown, { passive: false });
    this.element.addEventListener('mousemove', this.handleMouseMove, { passive: false });
    this.element.addEventListener('mouseup', this.handleMouseUp, { passive: false });
    this.element.addEventListener('mouseleave', this.handleMouseLeave, { passive: false });
    
    // Wheel Events for zoom
    this.element.addEventListener('wheel', this.handleWheel, { passive: false });
    
    // Context menu prevention for better gesture handling
    this.element.addEventListener('contextmenu', this.handleContextMenu, { passive: false });
  }

  private handlePointerDown = (event: PointerEvent): void => {
    this.pointerCache.push(event);
    this.isPointerDown = true;
    
    const point = { x: event.clientX, y: event.clientY };
    this.startGesture(point);
    
    if (this.config.enableLongPress) {
      this.startLongPressTimer(point);
    }
    
    // Prevent default to avoid interference
    event.preventDefault();
  };

  private handlePointerMove = (event: PointerEvent): void => {
    const index = this.pointerCache.findIndex(p => p.pointerId === event.pointerId);
    if (index >= 0) {
      this.pointerCache[index] = event;
    }
    
    if (this.isPointerDown) {
      const point = { x: event.clientX, y: event.clientY };
      this.updateGesture(point);
      this.clearLongPressTimer();
    }
  };

  private handlePointerUp = (event: PointerEvent): void => {
    this.removePointer(event.pointerId);
    
    if (this.pointerCache.length === 0) {
      this.isPointerDown = false;
      const point = { x: event.clientX, y: event.clientY };
      this.endGesture(point);
      this.clearLongPressTimer();
      this.handleTap(point);
    }
  };

  private handlePointerCancel = (event: PointerEvent): void => {
    this.removePointer(event.pointerId);
    this.isPointerDown = false;
    this.clearLongPressTimer();
    this.cancelGesture();
  };

  private handleTouchStart = (event: TouchEvent): void => {
    const touches = this.extractTouchPoints(event.touches);
    this.multiTouchState.touches = touches;
    
    if (touches.length > 1) {
      this.multiTouchState.isMultiTouch = true;
      this.startMultiTouch();
    }
    
    event.preventDefault();
  };

  private handleTouchMove = (event: TouchEvent): void => {
    const touches = this.extractTouchPoints(event.touches);
    this.multiTouchState.touches = touches;
    
    if (this.multiTouchState.isMultiTouch && touches.length > 1) {
      this.updateMultiTouch();
    }
    
    event.preventDefault();
  };

  private handleTouchEnd = (event: TouchEvent): void => {
    const touches = this.extractTouchPoints(event.touches);
    this.multiTouchState.touches = touches;
    
    if (touches.length < 2) {
      this.multiTouchState.isMultiTouch = false;
      this.endMultiTouch();
    }
  };

  private handleTouchCancel = (event: TouchEvent): void => {
    this.multiTouchState.isMultiTouch = false;
    this.multiTouchState.touches = [];
    this.endMultiTouch();
  };

  private handleMouseDown = (event: MouseEvent): void => {
    if (event.button === 0) { // Left button only
      const point = { x: event.clientX, y: event.clientY };
      this.startGesture(point);
      this.isPointerDown = true;
    }
  };

  private handleMouseMove = (event: MouseEvent): void => {
    if (this.isPointerDown) {
      const point = { x: event.clientX, y: event.clientY };
      this.updateGesture(point);
    }
  };

  private handleMouseUp = (event: MouseEvent): void => {
    if (event.button === 0) {
      const point = { x: event.clientX, y: event.clientY };
      this.endGesture(point);
      this.isPointerDown = false;
      this.handleTap(point);
    }
  };

  private handleMouseLeave = (): void => {
    if (this.isPointerDown) {
      this.cancelGesture();
      this.isPointerDown = false;
    }
  };

  private handleWheel = (event: WheelEvent): void => {
    if (this.config.enablePinch) {
      const scale = event.deltaY > 0 ? 0.9 : 1.1;
      const syntheticMultiTouch: MultiTouchState = {
        ...this.multiTouchState,
        scale,
        centroid: { x: event.clientX, y: event.clientY },
        isMultiTouch: true,
      };
      
      this.handlers.onPinch?.(syntheticMultiTouch);
    }
    
    event.preventDefault();
  };

  private handleContextMenu = (event: Event): void => {
    event.preventDefault();
  };

  private startGesture(point: { x: number; y: number }): void {
    this.gestureState = {
      isActive: true,
      startPoint: { ...point },
      currentPoint: { ...point },
      deltaX: 0,
      deltaY: 0,
      distance: 0,
      angle: 0,
      velocity: { x: 0, y: 0 },
      acceleration: { x: 0, y: 0 },
      duration: 0,
    };
    
    this.velocityTracker.reset();
    this.velocityTracker.addPoint(point.x, point.y, performance.now());
    
    if (this.config.enablePan) {
      this.handlers.onPanStart?.(this.gestureState);
    }
  }

  private updateGesture(point: { x: number; y: number }): void {
    if (!this.gestureState.isActive) return;
    
    const deltaX = point.x - this.gestureState.startPoint.x;
    const deltaY = point.y - this.gestureState.startPoint.y;
    const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
    const angle = Math.atan2(deltaY, deltaX) * (180 / Math.PI);
    
    this.velocityTracker.addPoint(point.x, point.y, performance.now());
    const velocity = this.velocityTracker.getVelocity();
    const acceleration = this.velocityTracker.getAcceleration();
    
    this.gestureState = {
      ...this.gestureState,
      currentPoint: { ...point },
      deltaX,
      deltaY,
      distance,
      angle,
      velocity,
      acceleration,
      duration: performance.now() - this.velocityTracker.getStartTime(),
    };
    
    if (this.config.enablePan && distance > this.config.threshold.pan) {
      this.handlers.onPan?.(this.gestureState);
    }
  }

  private endGesture(point: { x: number; y: number }): void {
    if (!this.gestureState.isActive) return;
    
    this.updateGesture(point);
    
    if (this.config.enableSwipe) {
      this.detectSwipe();
    }
    
    if (this.config.enablePan) {
      this.handlers.onPanEnd?.(this.gestureState);
    }
    
    this.gestureState.isActive = false;
  }

  private cancelGesture(): void {
    this.gestureState.isActive = false;
    this.velocityTracker.reset();
  }

  private startMultiTouch(): void {
    this.calculateMultiTouchState();
    this.previousTouches = [...this.multiTouchState.touches];
    
    if (this.config.enablePinch) {
      this.handlers.onPinchStart?.(this.multiTouchState);
    }
    
    if (this.config.enableRotate) {
      this.handlers.onRotateStart?.(this.multiTouchState);
    }
  }

  private updateMultiTouch(): void {
    this.calculateMultiTouchState();
    
    if (this.previousTouches.length === this.multiTouchState.touches.length) {
      // Calculate scale and rotation changes
      const prevScale = this.calculateScale(this.previousTouches);
      const currentScale = this.calculateScale(this.multiTouchState.touches);
      const scaleChange = currentScale / prevScale;
      
      const prevRotation = this.calculateRotation(this.previousTouches);
      const currentRotation = this.calculateRotation(this.multiTouchState.touches);
      const rotationChange = currentRotation - prevRotation;
      
      this.multiTouchState.scale = scaleChange;
      this.multiTouchState.rotation = rotationChange;
      
      if (this.config.enablePinch && Math.abs(scaleChange - 1) > this.config.threshold.pinch) {
        this.handlers.onPinch?.(this.multiTouchState);
      }
      
      if (this.config.enableRotate && Math.abs(rotationChange) > this.config.threshold.rotation) {
        this.handlers.onRotate?.(this.multiTouchState);
      }
    }
    
    this.previousTouches = [...this.multiTouchState.touches];
  }

  private endMultiTouch(): void {
    if (this.config.enablePinch) {
      this.handlers.onPinchEnd?.(this.multiTouchState);
    }
    
    if (this.config.enableRotate) {
      this.handlers.onRotateEnd?.(this.multiTouchState);
    }
    
    this.previousTouches = [];
  }

  private calculateMultiTouchState(): void {
    const touches = this.multiTouchState.touches;
    
    if (touches.length === 0) return;
    
    // Calculate centroid
    const centroid = touches.reduce(
      (acc, touch) => ({ x: acc.x + touch.x, y: acc.y + touch.y }),
      { x: 0, y: 0 }
    );
    centroid.x /= touches.length;
    centroid.y /= touches.length;
    
    this.multiTouchState.centroid = centroid;
  }

  private calculateScale(touches: TouchPoint[]): number {
    if (touches.length < 2) return 1;
    
    const dx = touches[1].x - touches[0].x;
    const dy = touches[1].y - touches[0].y;
    return Math.sqrt(dx * dx + dy * dy);
  }

  private calculateRotation(touches: TouchPoint[]): number {
    if (touches.length < 2) return 0;
    
    const dx = touches[1].x - touches[0].x;
    const dy = touches[1].y - touches[0].y;
    return Math.atan2(dy, dx) * (180 / Math.PI);
  }

  private detectSwipe(): void {
    const { distance, velocity, angle } = this.gestureState;
    const speed = Math.sqrt(velocity.x * velocity.x + velocity.y * velocity.y);
    
    if (distance > this.config.threshold.swipe && speed > 100) {
      let direction: 'up' | 'down' | 'left' | 'right';
      
      if (Math.abs(angle) < 45 || Math.abs(angle) > 135) {
        direction = angle > 0 ? 'right' : 'left';
      } else {
        direction = angle > 0 ? 'down' : 'up';
      }
      
      this.handlers.onSwipe?.(direction, this.gestureState);
    }
  }

  private handleTap(point: { x: number; y: number }): void {
    const now = performance.now();
    const timeSinceLastTap = now - this.lastTouchTime;
    
    if (timeSinceLastTap < this.config.timing.doubleTap) {
      this.tapCount++;
    } else {
      this.tapCount = 1;
    }
    
    this.lastTouchTime = now;
    
    if (this.tapCount === 1) {
      setTimeout(() => {
        if (this.tapCount === 1) {
          this.handlers.onTap?.(point);
        } else if (this.tapCount === 2 && this.config.enableDoubleTap) {
          this.handlers.onDoubleTap?.(point);
        }
        this.tapCount = 0;
      }, this.config.timing.doubleTap);
    }
  }

  private startLongPressTimer(point: { x: number; y: number }): void {
    this.clearLongPressTimer();
    this.longPressTimer = window.setTimeout(() => {
      this.handlers.onLongPress?.(point);
    }, this.config.timing.longPress);
  }

  private clearLongPressTimer(): void {
    if (this.longPressTimer) {
      clearTimeout(this.longPressTimer);
      this.longPressTimer = null;
    }
  }

  private extractTouchPoints(touches: TouchList): TouchPoint[] {
    const points: TouchPoint[] = [];
    for (let i = 0; i < touches.length; i++) {
      const touch = touches[i];
      points.push({
        id: touch.identifier,
        x: touch.clientX,
        y: touch.clientY,
        force: (touch as any).force,
        radiusX: (touch as any).radiusX,
        radiusY: (touch as any).radiusY,
      });
    }
    return points;
  }

  private removePointer(pointerId: number): void {
    const index = this.pointerCache.findIndex(p => p.pointerId === pointerId);
    if (index >= 0) {
      this.pointerCache.splice(index, 1);
    }
  }

  public destroy(): void {
    this.clearLongPressTimer();
    
    // Remove all event listeners
    this.element.removeEventListener('pointerdown', this.handlePointerDown);
    this.element.removeEventListener('pointermove', this.handlePointerMove);
    this.element.removeEventListener('pointerup', this.handlePointerUp);
    this.element.removeEventListener('pointercancel', this.handlePointerCancel);
    this.element.removeEventListener('touchstart', this.handleTouchStart);
    this.element.removeEventListener('touchmove', this.handleTouchMove);
    this.element.removeEventListener('touchend', this.handleTouchEnd);
    this.element.removeEventListener('touchcancel', this.handleTouchCancel);
    this.element.removeEventListener('mousedown', this.handleMouseDown);
    this.element.removeEventListener('mousemove', this.handleMouseMove);
    this.element.removeEventListener('mouseup', this.handleMouseUp);
    this.element.removeEventListener('mouseleave', this.handleMouseLeave);
    this.element.removeEventListener('wheel', this.handleWheel);
    this.element.removeEventListener('contextmenu', this.handleContextMenu);
  }
}

class VelocityTracker {
  private points: Array<{ x: number; y: number; time: number }> = [];
  private maxPoints = 5;
  private startTime = 0;

  public reset(): void {
    this.points = [];
    this.startTime = performance.now();
  }

  public addPoint(x: number, y: number, time: number): void {
    this.points.push({ x, y, time });
    
    if (this.points.length > this.maxPoints) {
      this.points.shift();
    }
  }

  public getVelocity(): { x: number; y: number } {
    if (this.points.length < 2) {
      return { x: 0, y: 0 };
    }
    
    const recent = this.points.slice(-2);
    const dt = recent[1].time - recent[0].time;
    
    if (dt === 0) return { x: 0, y: 0 };
    
    return {
      x: (recent[1].x - recent[0].x) / dt,
      y: (recent[1].y - recent[0].y) / dt,
    };
  }

  public getAcceleration(): { x: number; y: number } {
    if (this.points.length < 3) {
      return { x: 0, y: 0 };
    }
    
    const recent = this.points.slice(-3);
    const v1 = {
      x: (recent[1].x - recent[0].x) / (recent[1].time - recent[0].time),
      y: (recent[1].y - recent[0].y) / (recent[1].time - recent[0].time),
    };
    const v2 = {
      x: (recent[2].x - recent[1].x) / (recent[2].time - recent[1].time),
      y: (recent[2].y - recent[1].y) / (recent[2].time - recent[1].time),
    };
    const dt = recent[2].time - recent[1].time;
    
    if (dt === 0) return { x: 0, y: 0 };
    
    return {
      x: (v2.x - v1.x) / dt,
      y: (v2.y - v1.y) / dt,
    };
  }

  public getStartTime(): number {
    return this.startTime;
  }
}

export const useGestures = (
  ref: RefObject<HTMLElement>,
  config: GestureConfig = {},
  handlers: GestureHandlers = {}
) => {
  const recognizerRef = useRef<GestureRecognizer | null>(null);

  useEffect(() => {
    if (!ref.current) return;

    recognizerRef.current = new GestureRecognizer(ref.current, config, handlers);

    return () => {
      recognizerRef.current?.destroy();
    };
  }, [ref, config, handlers]);

  return recognizerRef.current;
};
