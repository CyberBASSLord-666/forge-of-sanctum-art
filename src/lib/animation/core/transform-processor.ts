
import { Transform3D } from '../motion-types';

export interface TransformCache {
  element: HTMLElement;
  transform: Transform3D;
  timestamp: number;
  computedStyle: string;
}

export class TransformProcessor {
  private transformCache = new Map<HTMLElement, TransformCache>();
  private cacheTimeout = 100; // 100ms cache validity
  private matrixParser: DOMMatrix | null = null;

  constructor() {
    this.initializeMatrixParser();
  }

  private initializeMatrixParser(): void {
    try {
      this.matrixParser = new DOMMatrix();
    } catch (error) {
      console.warn('DOMMatrix not supported, falling back to manual parsing');
    }
  }

  public getCurrentTransform(element: HTMLElement): Transform3D {
    const cached = this.getCachedTransform(element);
    if (cached) {
      return cached.transform;
    }

    const transform = this.parseElementTransform(element);
    this.cacheTransform(element, transform);
    return transform;
  }

  private getCachedTransform(element: HTMLElement): TransformCache | null {
    const cached = this.transformCache.get(element);
    if (cached && performance.now() - cached.timestamp < this.cacheTimeout) {
      return cached;
    }
    return null;
  }

  private cacheTransform(element: HTMLElement, transform: Transform3D): void {
    const computedStyle = window.getComputedStyle(element).transform;
    this.transformCache.set(element, {
      element,
      transform,
      timestamp: performance.now(),
      computedStyle,
    });
  }

  private parseElementTransform(element: HTMLElement): Transform3D {
    const style = window.getComputedStyle(element);
    const matrix = style.transform;
    
    if (matrix === 'none') {
      return this.getIdentityTransform();
    }

    if (this.matrixParser) {
      return this.parseWithDOMMatrix(matrix);
    } else {
      return this.parseManually(matrix);
    }
  }

  private parseWithDOMMatrix(matrix: string): Transform3D {
    try {
      const domMatrix = new DOMMatrix(matrix);
      
      return {
        translateX: domMatrix.m41,
        translateY: domMatrix.m42,
        translateZ: domMatrix.m43,
        scaleX: Math.sqrt(domMatrix.m11 * domMatrix.m11 + domMatrix.m12 * domMatrix.m12),
        scaleY: Math.sqrt(domMatrix.m21 * domMatrix.m21 + domMatrix.m22 * domMatrix.m22),
        scaleZ: Math.sqrt(domMatrix.m31 * domMatrix.m31 + domMatrix.m32 * domMatrix.m32),
        rotateX: Math.atan2(domMatrix.m32, domMatrix.m33) * (180 / Math.PI),
        rotateY: Math.atan2(-domMatrix.m31, Math.sqrt(domMatrix.m32 * domMatrix.m32 + domMatrix.m33 * domMatrix.m33)) * (180 / Math.PI),
        rotateZ: Math.atan2(domMatrix.m12, domMatrix.m11) * (180 / Math.PI),
        skewX: 0, // Complex calculation, simplified for now
        skewY: 0, // Complex calculation, simplified for now
      };
    } catch (error) {
      console.warn('DOMMatrix parsing failed, falling back to manual parsing');
      return this.parseManually(matrix);
    }
  }

  private parseManually(matrix: string): Transform3D {
    // Parse matrix(a, b, c, d, e, f) or matrix3d(...)
    const is3D = matrix.startsWith('matrix3d');
    const values = matrix.match(/-?[\d.]+/g);
    
    if (!values) {
      return this.getIdentityTransform();
    }

    const nums = values.map(Number);
    
    if (is3D && nums.length >= 16) {
      // matrix3d(m11, m12, m13, m14, m21, m22, m23, m24, m31, m32, m33, m34, m41, m42, m43, m44)
      return {
        translateX: nums[12],
        translateY: nums[13],
        translateZ: nums[14],
        scaleX: Math.sqrt(nums[0] * nums[0] + nums[1] * nums[1]),
        scaleY: Math.sqrt(nums[4] * nums[4] + nums[5] * nums[5]),
        scaleZ: Math.sqrt(nums[8] * nums[8] + nums[9] * nums[9]),
        rotateX: Math.atan2(nums[9], nums[10]) * (180 / Math.PI),
        rotateY: Math.atan2(-nums[8], Math.sqrt(nums[9] * nums[9] + nums[10] * nums[10])) * (180 / Math.PI),
        rotateZ: Math.atan2(nums[1], nums[0]) * (180 / Math.PI),
        skewX: 0,
        skewY: 0,
      };
    } else if (nums.length >= 6) {
      // matrix(a, b, c, d, e, f)
      const [a, b, c, d, e, f] = nums;
      return {
        translateX: e,
        translateY: f,
        translateZ: 0,
        scaleX: Math.sqrt(a * a + b * b),
        scaleY: Math.sqrt(c * c + d * d),
        scaleZ: 1,
        rotateX: 0,
        rotateY: 0,
        rotateZ: Math.atan2(b, a) * (180 / Math.PI),
        skewX: Math.atan2(a * c + b * d, a * a + b * b) * (180 / Math.PI),
        skewY: 0,
      };
    }

    return this.getIdentityTransform();
  }

  private getIdentityTransform(): Transform3D {
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

  public applyTransform(element: HTMLElement, transform: Transform3D): void {
    const transformString = this.buildTransformString(transform);
    
    // Use GPU acceleration hints
    element.style.willChange = 'transform';
    element.style.transform = transformString;
    
    // Update cache
    this.cacheTransform(element, transform);
  }

  public applyTransformInstantly(element: HTMLElement, transform: Transform3D): void {
    const transformString = this.buildTransformString(transform);
    element.style.transition = 'none';
    element.style.transform = transformString;
    
    // Force reflow
    element.offsetHeight;
    
    // Restore transitions
    element.style.transition = '';
    element.style.willChange = 'auto';
    
    this.cacheTransform(element, transform);
  }

  private buildTransformString(transform: Transform3D): string {
    const parts: string[] = [];
    
    // Order matters for transform composition
    if (transform.perspective !== undefined && transform.perspective !== 0) {
      parts.push(`perspective(${transform.perspective}px)`);
    }
    
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
    
    return parts.join(' ');
  }

  public interpolateTransform(
    start: Transform3D,
    end: Transform3D,
    progress: number
  ): Transform3D {
    const result: Transform3D = {};
    
    const keys = new Set([...Object.keys(start), ...Object.keys(end)]) as Set<keyof Transform3D>;
    
    keys.forEach(key => {
      const startValue = start[key] || (key.includes('scale') ? 1 : 0);
      const endValue = end[key] || (key.includes('scale') ? 1 : 0);
      
      // Use smooth interpolation for scales to avoid jarring transitions
      if (key.includes('scale')) {
        result[key] = startValue + (endValue - startValue) * this.smoothStep(progress);
      } else {
        result[key] = startValue + (endValue - startValue) * progress;
      }
    });
    
    return result;
  }

  private smoothStep(t: number): number {
    return t * t * (3 - 2 * t);
  }

  public invalidateCache(): void {
    this.transformCache.clear();
  }

  public clearCacheForElement(element: HTMLElement): void {
    this.transformCache.delete(element);
  }

  public getCacheSize(): number {
    return this.transformCache.size;
  }

  public cleanup(): void {
    // Remove cache entries for elements no longer in DOM
    for (const [element, cache] of this.transformCache.entries()) {
      if (!document.body.contains(element)) {
        this.transformCache.delete(element);
      }
    }
  }
}
