
export const getSwipeDirection = (deltaX: number, deltaY: number): 'up' | 'down' | 'left' | 'right' => {
  if (Math.abs(deltaX) > Math.abs(deltaY)) {
    return deltaX > 0 ? 'right' : 'left';
  } else {
    return deltaY > 0 ? 'down' : 'up';
  }
};

export const getDistance = (p1: PointerEvent, p2: PointerEvent): number => {
  const dx = p2.clientX - p1.clientX;
  const dy = p2.clientY - p1.clientY;
  return Math.sqrt(dx * dx + dy * dy);
};

export const getRotation = (p1: PointerEvent, p2: PointerEvent): number => {
  return Math.atan2(p2.clientY - p1.clientY, p2.clientX - p1.clientX) * 180 / Math.PI;
};

export const getDefaultGestureConfig = (): Required<GestureConfig> => ({
  enablePan: true,
  enableSwipe: true,
  enablePinch: true,
  enableRotation: false,
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
