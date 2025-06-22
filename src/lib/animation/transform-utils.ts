
import { Transform3D } from './motion-types';

export const getCurrentTransform = (element: HTMLElement): Transform3D => {
  const style = window.getComputedStyle(element);
  const matrix = style.transform;
  
  if (matrix === 'none') {
    return {
      translateX: 0,
      translateY: 0,
      translateZ: 0,
      rotateX: 0,
      rotateY: 0,
      rotateZ: 0,
      scaleX: 1,
      scaleY: 1,
      scaleZ: 1,
      skewX: 0,
      skewY: 0,
    };
  }

  // Basic fallback - in a real implementation, you'd parse the matrix
  return {
    translateX: 0,
    translateY: 0,
    translateZ: 0,
    rotateX: 0,
    rotateY: 0,
    rotateZ: 0,
    scaleX: 1,
    scaleY: 1,
    scaleZ: 1,
    skewX: 0,
    skewY: 0,
  };
};

export const applyTransform = (element: HTMLElement, transform: Transform3D): void => {
  const transformString = buildTransformString(transform);
  element.style.transform = transformString;
  element.style.willChange = 'transform';
};

export const buildTransformString = (transform: Transform3D): string => {
  const parts: string[] = [];
  
  if (transform.translateX !== undefined || transform.translateY !== undefined || transform.translateZ !== undefined) {
    const x = transform.translateX || 0;
    const y = transform.translateY || 0;
    const z = transform.translateZ || 0;
    parts.push(`translate3d(${x}px, ${y}px, ${z}px)`);
  }
  
  if (transform.rotateX !== undefined && transform.rotateX !== 0) {
    parts.push(`rotateX(${transform.rotateX}deg)`);
  }
  
  if (transform.rotateY !== undefined && transform.rotateY !== 0) {
    parts.push(`rotateY(${transform.rotateY}deg)`);
  }
  
  if (transform.rotateZ !== undefined && transform.rotateZ !== 0) {
    parts.push(`rotateZ(${transform.rotateZ}deg)`);
  }
  
  if (transform.scaleX !== undefined || transform.scaleY !== undefined || transform.scaleZ !== undefined) {
    const x = transform.scaleX ?? 1;
    const y = transform.scaleY ?? 1;
    const z = transform.scaleZ ?? 1;
    parts.push(`scale3d(${x}, ${y}, ${z})`);
  }
  
  if (transform.skewX !== undefined && transform.skewX !== 0) {
    parts.push(`skewX(${transform.skewX}deg)`);
  }
  
  if (transform.skewY !== undefined && transform.skewY !== 0) {
    parts.push(`skewY(${transform.skewY}deg)`);
  }
  
  if (transform.perspective !== undefined) {
    parts.unshift(`perspective(${transform.perspective}px)`);
  }
  
  return parts.join(' ');
};

export const interpolateTransform = (
  start: Transform3D,
  end: Transform3D,
  progress: number
): Transform3D => {
  const result: Transform3D = {};
  
  const keys = new Set([...Object.keys(start), ...Object.keys(end)]) as Set<keyof Transform3D>;
  
  keys.forEach(key => {
    const startValue = start[key] || 0;
    const endValue = end[key] || 0;
    result[key] = startValue + (endValue - startValue) * progress;
  });
  
  return result;
};
