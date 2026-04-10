import { RefObject, useEffect } from 'react';

type UseMagneticHoverOptions = {
  moveDuration?: number;
  resetDuration?: number;
  xFactor?: number;
  yFactor?: number;
};

export function useMagneticHover<T extends HTMLElement>(
  ref: RefObject<T | null>,
  {
    moveDuration = 0.3,
    resetDuration = 0.5,
    xFactor = 0.12,
    yFactor = 0.12,
  }: UseMagneticHoverOptions = {}
) {
  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (!window.matchMedia('(hover: hover) and (pointer: fine)').matches) return;

    const element = ref.current;
    if (!element) return;
    let isDisposed = false;
    let removeListeners: (() => void) | undefined;

    const initializeHoverAnimation = async () => {
      const { default: gsap } = await import('gsap');
      if (isDisposed) return;

      const handleMouseMove = (event: MouseEvent) => {
        const rect = element.getBoundingClientRect();
        const x = event.clientX - rect.left - rect.width / 2;
        const y = event.clientY - rect.top - rect.height / 2;

        gsap.to(element, {
          x: x * xFactor,
          y: y * yFactor,
          duration: moveDuration,
          ease: 'power2.out',
          overwrite: 'auto',
        });
      };

      const handleMouseLeave = () => {
        gsap.to(element, {
          x: 0,
          y: 0,
          duration: resetDuration,
          ease: 'elastic.out(1, 0.5)',
          overwrite: 'auto',
        });
      };

      element.addEventListener('mousemove', handleMouseMove);
      element.addEventListener('mouseleave', handleMouseLeave);

      removeListeners = () => {
        element.removeEventListener('mousemove', handleMouseMove);
        element.removeEventListener('mouseleave', handleMouseLeave);
      };
    };

    void initializeHoverAnimation();

    return () => {
      isDisposed = true;
      removeListeners?.();
    };
  }, [moveDuration, ref, resetDuration, xFactor, yFactor]);
}
