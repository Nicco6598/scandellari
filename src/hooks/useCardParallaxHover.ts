import { RefObject, useEffect } from 'react';

type UseCardParallaxHoverOptions = {
  childMoveDuration?: number;
  childResetDuration?: number;
  childX?: number;
  childY?: number;
  childRef?: RefObject<HTMLElement | null>;
  childSelector?: string;
  liftY?: number;
  moveDuration?: number;
  resetDuration?: number;
};

export function useCardParallaxHover<T extends HTMLElement>(
  containerRef: RefObject<T | null>,
  {
    childMoveDuration = 0.4,
    childResetDuration = 0.5,
    childX = 0,
    childY = 0,
    childRef,
    childSelector,
    liftY = 12,
    moveDuration = 0.3,
    resetDuration = 0.5,
  }: UseCardParallaxHoverOptions = {}
) {
  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (!window.matchMedia('(hover: hover) and (pointer: fine)').matches) return;

    const container = containerRef.current;
    if (!container) return;

    const child = childRef?.current ?? (
      childSelector ? container.querySelector<HTMLElement>(childSelector) : null
    );
    let isDisposed = false;
    let removeListeners: (() => void) | undefined;

    const initializeHoverAnimation = async () => {
      const { default: gsap } = await import('gsap');
      if (isDisposed) return;

      const handleMouseMove = (event: MouseEvent) => {
        const rect = container.getBoundingClientRect();
        const x = (event.clientX - rect.left) / rect.width - 0.5;
        const y = (event.clientY - rect.top) / rect.height - 0.5;

        gsap.to(container, {
          y: y * -liftY,
          duration: moveDuration,
          ease: 'power2.out',
          overwrite: 'auto',
        });

        if (child) {
          gsap.to(child, {
            x: x * childX,
            y: y * childY,
            duration: childMoveDuration,
            ease: 'power2.out',
            overwrite: 'auto',
          });
        }
      };

      const handleMouseLeave = () => {
        gsap.to(container, {
          y: 0,
          duration: resetDuration,
          ease: 'elastic.out(1, 0.5)',
          overwrite: 'auto',
        });

        if (child) {
          gsap.to(child, {
            x: 0,
            y: 0,
            duration: childResetDuration,
            ease: 'elastic.out(1, 0.5)',
            overwrite: 'auto',
          });
        }
      };

      container.addEventListener('mousemove', handleMouseMove);
      container.addEventListener('mouseleave', handleMouseLeave);

      removeListeners = () => {
        container.removeEventListener('mousemove', handleMouseMove);
        container.removeEventListener('mouseleave', handleMouseLeave);
      };
    };

    void initializeHoverAnimation();

    return () => {
      isDisposed = true;
      removeListeners?.();
    };
  }, [
    childMoveDuration,
    childRef,
    childResetDuration,
    childSelector,
    childX,
    childY,
    containerRef,
    liftY,
    moveDuration,
    resetDuration,
  ]);
}
