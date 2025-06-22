
import { GestureConfig, GestureState, GestureHandlers } from './gesture-types';
import { getSwipeDirection, getDistance, getRotation, getDefaultGestureConfig } from './gesture-utils';

export class GestureRecognizer {
  private element: HTMLElement;
  private config: Required<GestureConfig>;
  private handlers: GestureHandlers;
  private isActive = false;
  private startPos: { x: number; y: number } = { x: 0, y: 0 };
  private currentPos: { x: number; y: number } = { x: 0, y: 0 };
  private startTime = 0;
  private lastTapTime = 0;
  private longPressTimer: number | null = null;
  private initialDistance = 0;
  private initialRotation = 0;
  private pointerCache: PointerEvent[] = [];

  constructor(element: HTMLElement, config: GestureConfig, handlers: GestureHandlers) {
    this.element = element;
    this.config = { ...getDefaultGestureConfig(), ...config };
    this.handlers = handlers;
    this.attachListeners();
  }

  private attachListeners(): void {
    // Touch events
    this.element.addEventListener('touchstart', this.handleTouchStart.bind(this), { passive: false });
    this.element.addEventListener('touchmove', this.handleTouchMove.bind(this), { passive: false });
    this.element.addEventListener('touchend', this.handleTouchEnd.bind(this), { passive: false });

    // Pointer events (for better multi-touch support)
    this.element.addEventListener('pointerdown', this.handlePointerDown.bind(this));
    this.element.addEventListener('pointermove', this.handlePointerMove.bind(this));
    this.element.addEventListener('pointerup', this.handlePointerUp.bind(this));
    this.element.addEventListener('pointercancel', this.handlePointerCancel.bind(this));

    // Mouse events (fallback)
    this.element.addEventListener('mousedown', this.handleMouseDown.bind(this));
    this.element.addEventListener('mousemove', this.handleMouseMove.bind(this));
    this.element.addEventListener('mouseup', this.handleMouseUp.bind(this));
  }

  private handleTouchStart(event: TouchEvent): void {
    if (this.config.preventDefault) {
      event.preventDefault();
    }

    const touch = event.touches[0];
    this.startGesture(touch.clientX, touch.clientY, event.touches);
  }

  private handleTouchMove(event: TouchEvent): void {
    if (!this.isActive) return;

    if (this.config.preventDefault) {
      event.preventDefault();
    }

    const touch = event.touches[0];
    this.updateGesture(touch.clientX, touch.clientY, event.touches);
  }

  private handleTouchEnd(event: TouchEvent): void {
    this.endGesture();
  }

  private handlePointerDown(event: PointerEvent): void {
    this.pointerCache.push(event);
    
    if (this.pointerCache.length === 1) {
      this.startGesture(event.clientX, event.clientY, this.pointerCache);
    } else if (this.pointerCache.length === 2 && (this.config.enablePinch || this.config.enableRotation)) {
      this.handleMultiTouchStart();
    }
  }

  private handlePointerMove(event: PointerEvent): void {
    if (!this.isActive) return;

    // Update the pointer in cache
    const index = this.pointerCache.findIndex(p => p.pointerId === event.pointerId);
    if (index !== -1) {
      this.pointerCache[index] = event;
    }

    if (this.pointerCache.length === 1) {
      this.updateGesture(event.clientX, event.clientY, this.pointerCache);
    } else if (this.pointerCache.length === 2) {
      this.handleMultiTouchMove();
    }
  }

  private handlePointerUp(event: PointerEvent): void {
    this.removePointer(event.pointerId);
    
    if (this.pointerCache.length === 0) {
      this.endGesture();
    }
  }

  private handlePointerCancel(event: PointerEvent): void {
    this.removePointer(event.pointerId);
  }

  private handleMouseDown(event: MouseEvent): void {
    if (event.button !== 0) return; // Only handle left mouse button
    
    this.startGesture(event.clientX, event.clientY, [event]);
  }

  private handleMouseMove(event: MouseEvent): void {
    if (!this.isActive) return;
    
    this.updateGesture(event.clientX, event.clientY, [event]);
  }

  private handleMouseUp(event: MouseEvent): void {
    this.endGesture();
  }

  private removePointer(pointerId: number): void {
    this.pointerCache = this.pointerCache.filter(p => p.pointerId !== pointerId);
  }

  private startGesture(x: number, y: number, pointers: any): void {
    this.isActive = true;
    this.startPos = { x, y };
    this.currentPos = { x, y };
    this.startTime = performance.now();

    // Clear any existing long press timer
    if (this.longPressTimer) {
      clearTimeout(this.longPressTimer);
    }

    // Start long press detection
    if (this.config.enableLongPress) {
      this.longPressTimer = window.setTimeout(() => {
        this.handleLongPress();
      }, 500);
    }

    const state = this.createGestureState('tap', pointers);
    this.handlers.onGestureStart?.(state);
  }

  private updateGesture(x: number, y: number, pointers: any): void {
    if (!this.isActive) return;

    this.currentPos = { x, y };

    const deltaX = x - this.startPos.x;
    const deltaY = y - this.startPos.y;
    const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);

    // Cancel long press if movement detected
    if (distance > this.config.threshold.pan && this.longPressTimer) {
      clearTimeout(this.longPressTimer);
      this.longPressTimer = null;
    }

    // Handle pan gesture
    if (this.config.enablePan && distance > this.config.threshold.pan) {
      const state = this.createGestureState('pan', pointers);
      this.handlers.onPan?.(state);
    }
  }

  private endGesture(): void {
    if (!this.isActive) return;

    const deltaX = this.currentPos.x - this.startPos.x;
    const deltaY = this.currentPos.y - this.startPos.y;
    const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
    const duration = performance.now() - this.startTime;

    // Clear long press timer
    if (this.longPressTimer) {
      clearTimeout(this.longPressTimer);
      this.longPressTimer = null;
    }

    // Handle swipe gesture
    if (this.config.enableSwipe && distance > this.config.threshold.swipe && duration < 300) {
      const direction = getSwipeDirection(deltaX, deltaY);
      const state = this.createGestureState('swipe', []);
      this.handlers.onSwipe?.(direction, state);
    }

    // Handle tap gesture
    if (distance < this.config.threshold.pan && duration < 300) {
      const now = performance.now();
      const timeSinceLastTap = now - this.lastTapTime;

      if (this.config.enableDoubleTap && timeSinceLastTap < 300) {
        const state = this.createGestureState('tap', []);
        this.handlers.onDoubleTap?.(state);
      } else {
        const state = this.createGestureState('tap', []);
        this.handlers.onTap?.(state);
      }

      this.lastTapTime = now;
    }

    const state = this.createGestureState('tap', []);
    this.handlers.onGestureEnd?.(state);

    this.isActive = false;
    this.pointerCache = [];
  }

  private handleMultiTouchStart(): void {
    if (this.pointerCache.length !== 2) return;

    const p1 = this.pointerCache[0];
    const p2 = this.pointerCache[1];

    this.initialDistance = getDistance(p1, p2);
    this.initialRotation = getRotation(p1, p2);
  }

  private handleMultiTouchMove(): void {
    if (this.pointerCache.length !== 2) return;

    const p1 = this.pointerCache[0];
    const p2 = this.pointerCache[1];

    const currentDistance = getDistance(p1, p2);
    const currentRotation = getRotation(p1, p2);

    // Handle pinch gesture
    if (this.config.enablePinch) {
      const scale = currentDistance / this.initialDistance;
      const state = this.createGestureState('pinch', this.pointerCache);
      state.scale = scale;
      this.handlers.onPinch?.(state);
    }

    // Handle rotation gesture
    if (this.config.enableRotation) {
      const rotation = currentRotation - this.initialRotation;
      if (Math.abs(rotation) > this.config.threshold.rotation) {
        const state = this.createGestureState('rotation', this.pointerCache);
        state.rotation = rotation;
        this.handlers.onRotation?.(state);
      }
    }
  }

  private handleLongPress(): void {
    if (this.isActive) {
      const state = this.createGestureState('longpress', []);
      this.handlers.onLongPress?.(state);
    }
    this.longPressTimer = null;
  }

  private createGestureState(type: GestureState['type'], pointers: any): GestureState {
    const deltaX = this.currentPos.x - this.startPos.x;
    const deltaY = this.currentPos.y - this.startPos.y;
    const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
    const duration = performance.now() - this.startTime;

    return {
      type,
      isActive: this.isActive,
      startTime: this.startTime,
      deltaX,
      deltaY,
      distance,
      scale: 1,
      rotation: 0,
      velocity: {
        x: duration > 0 ? deltaX / duration : 0,
        y: duration > 0 ? deltaY / duration : 0,
      },
      center: {
        x: (this.startPos.x + this.currentPos.x) / 2,
        y: (this.startPos.y + this.currentPos.y) / 2,
      },
      pointers,
    };
  }

  public destroy(): void {
    // Remove all event listeners
    this.element.removeEventListener('touchstart', this.handleTouchStart.bind(this));
    this.element.removeEventListener('touchmove', this.handleTouchMove.bind(this));
    this.element.removeEventListener('touchend', this.handleTouchEnd.bind(this));
    this.element.removeEventListener('pointerdown', this.handlePointerDown.bind(this));
    this.element.removeEventListener('pointermove', this.handlePointerMove.bind(this));
    this.element.removeEventListener('pointerup', this.handlePointerUp.bind(this));
    this.element.removeEventListener('pointercancel', this.handlePointerCancel.bind(this));
    this.element.removeEventListener('mousedown', this.handleMouseDown.bind(this));
    this.element.removeEventListener('mousemove', this.handleMouseMove.bind(this));
    this.element.removeEventListener('mouseup', this.handleMouseUp.bind(this));

    if (this.longPressTimer) {
      clearTimeout(this.longPressTimer);
    }
  }
}
