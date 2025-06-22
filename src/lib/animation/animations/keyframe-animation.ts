
import { MuseAnimation } from './base-animation';
import { MotionConfig, Transform3D } from '../motion-types';
import { applyTransform } from '../transform-utils';
import { easingFunctions } from '../easing-functions';

export class MuseKeyframeAnimation extends MuseAnimation {
  constructor(
    element: HTMLElement,
    private keyframes: Transform3D[],
    config: MotionConfig,
    onComplete: () => void,
    onError: (error: Error) => void
  ) {
    super(element, keyframes[0], keyframes[keyframes.length - 1], config, onComplete, onError);
  }

  protected updateTransform(progress: number): void {
    const segmentCount = this.keyframes.length - 1;
    const segmentProgress = progress * segmentCount;
    const currentSegment = Math.floor(segmentProgress);
    const segmentLocalProgress = segmentProgress - currentSegment;

    if (currentSegment >= segmentCount) {
      super.updateTransform(1);
      return;
    }

    const startFrame = this.keyframes[currentSegment];
    const endFrame = this.keyframes[currentSegment + 1];
    const interpolatedTransform: Transform3D = {};

    Object.keys(endFrame).forEach(key => {
      const transformKey = key as keyof Transform3D;
      const start = startFrame[transformKey] || 0;
      const end = endFrame[transformKey] || 0;
      interpolatedTransform[transformKey] = start + (end - start) * segmentLocalProgress;
    });

    applyTransform(this.element, interpolatedTransform);
  }
}
