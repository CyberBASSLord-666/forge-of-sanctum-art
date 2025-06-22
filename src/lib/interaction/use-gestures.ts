
import { useEffect, RefObject } from 'react';
import { GestureConfig, GestureHandlers } from './gesture-types';
import { GestureRecognizer } from './gesture-recognizer';

export const useGestures = (
  elementRef: RefObject<HTMLElement>,
  config: GestureConfig,
  handlers: GestureHandlers
): void => {
  useEffect(() => {
    const element = elementRef.current;
    if (!element) return;

    const recognizer = new GestureRecognizer(element, config, handlers);

    return () => {
      recognizer.destroy();
    };
  }, [elementRef, config, handlers]);
};
