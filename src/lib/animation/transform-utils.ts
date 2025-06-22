
import { Transform3D } from './motion-types';

export const buildTransformString = (transform: Transform3D): string => {
  const parts: string[] = [];

  if (transform.perspective) parts.push(`perspective(${transform.perspective}px)`);
  if (transform.translateX !== undefined) parts.push(`translateX(${transform.translateX}px)`);
  if (transform.translateY !== undefined) parts.push(`translateY(${transform.translateY}px)`);
  if (transform.translateZ !== undefined) parts.push(`translateZ(${transform.translateZ}px)`);
  if (transform.rotateX !== undefined) parts.push(`rotateX(${transform.rotateX}deg)`);
  if (transform.rotateY !== undefined) parts.push(`rotateY(${transform.rotateY}deg)`);
  if (transform.rotateZ !== undefined) parts.push(`rotateZ(${transform.rotateZ}deg)`);
  if (transform.scaleX !== undefined) parts.push(`scaleX(${transform.scaleX})`);
  if (transform.scaleY !== undefined) parts.push(`scaleY(${transform.scaleY})`);
  if (transform.scaleZ !== undefined) parts.push(`scaleZ(${transform.scaleZ})`);
  if (transform.skewX !== undefined) parts.push(`skewX(${transform.skewX}deg)`);
  if (transform.skewY !== undefined) parts.push(`skewY(${transform.skewY}deg)`);

  return parts.join(' ');
};

export const getCurrentTransform = (element: HTMLElement): Transform3D => {
  const computedStyle = getComputedStyle(element);
  const transform = computedStyle.transform;
  
  if (transform === 'none') {
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
  
  return parseTransformMatrix(transform);
};

export const parseTransformMatrix = (transform: string): Transform3D => {
  const values = transform.match(/matrix.*\((.+)\)/)?.[1]?.split(', ') || [];
  
  if (values.length === 6) {
    // 2D matrix
    const [a, b, c, d, e, f] = values.map(Number);
    return {
      translateX: e,
      translateY: f,
      scaleX: Math.sqrt(a * a + b * b),
      scaleY: Math.sqrt(c * c + d * d),
      rotateZ: Math.atan2(b, a) * (180 / Math.PI),
      translateZ: 0,
      rotateX: 0,
      rotateY: 0,
      scaleZ: 1,
      skewX: 0,
      skewY: 0,
    };
  } else if (values.length === 16) {
    // 3D matrix
    const matrix = values.map(Number);
    return decompose3DMatrix(matrix);
  }
  
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

export const decompose3DMatrix = (matrix: number[]): Transform3D => {
  const [m11, m12, m13, m14, m21, m22, m23, m24, m31, m32, m33, m34, m41, m42, m43, m44] = matrix;
  
  // Extract translation
  const translateX = m41;
  const translateY = m42;
  const translateZ = m43;
  
  // Extract scale
  const scaleX = Math.sqrt(m11 * m11 + m12 * m12 + m13 * m13);
  const scaleY = Math.sqrt(m21 * m21 + m22 * m22 + m23 * m23);
  const scaleZ = Math.sqrt(m31 * m31 + m32 * m32 + m33 * m33);
  
  // Extract rotation (simplified)
  const rotateX = Math.atan2(m32 / scaleZ, m33 / scaleZ) * (180 / Math.PI);
  const rotateY = Math.atan2(-m31 / scaleZ, Math.sqrt(m32 * m32 + m33 * m33) / scaleZ) * (180 / Math.PI);
  const rotateZ = Math.atan2(m21 / scaleY, m11 / scaleX) * (180 / Math.PI);
  
  return {
    translateX,
    translateY,
    translateZ,
    rotateX,
    rotateY,
    rotateZ,
    scaleX,
    scaleY,
    scaleZ,
    skewX: 0, // Simplified
    skewY: 0, // Simplified
  };
};

export const applyTransform = (element: HTMLElement, transform: Transform3D): void => {
  const transformString = buildTransformString(transform);
  element.style.transform = transformString;
  
  // Enable hardware acceleration
  element.style.willChange = 'transform';
  element.style.backfaceVisibility = 'hidden';
  element.style.perspective = '1000px';
};
