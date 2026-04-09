import { RefObject, useEffect } from 'react';

export function usePreventWheelScroll<T extends HTMLElement>(
  ref: RefObject<T | null>,
  enabled: boolean = true
) {
  useEffect(() => {
    if (!enabled) return;

    const element = ref.current;
    if (!element) return;

    const handleWheel = (event: WheelEvent) => {
      event.preventDefault();
      event.stopPropagation();
    };

    element.addEventListener('wheel', handleWheel, { passive: false });

    return () => {
      element.removeEventListener('wheel', handleWheel);
    };
  }, [enabled, ref]);
}
