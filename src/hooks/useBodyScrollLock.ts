import { useEffect } from 'react';

type ScrollLockSnapshot = {
  bodyOverflow: string;
  bodyPaddingRight: string;
  htmlOverflow: string;
  htmlOverscrollBehavior: string;
};

let activeLocks = 0;
let snapshot: ScrollLockSnapshot | null = null;

export function useBodyScrollLock(locked: boolean) {
  useEffect(() => {
    if (!locked || typeof window === 'undefined') return;

    const html = document.documentElement;
    const body = document.body;

    activeLocks += 1;

    if (activeLocks === 1) {
      snapshot = {
        bodyOverflow: body.style.overflow,
        bodyPaddingRight: body.style.paddingRight,
        htmlOverflow: html.style.overflow,
        htmlOverscrollBehavior: html.style.overscrollBehavior,
      };

      const scrollbarWidth = Math.max(0, window.innerWidth - html.clientWidth);

      html.style.overflow = 'hidden';
      html.style.overscrollBehavior = 'none';
      body.style.overflow = 'hidden';

      if (scrollbarWidth > 0) {
        body.style.paddingRight = `${scrollbarWidth}px`;
      }
    }

    return () => {
      activeLocks = Math.max(0, activeLocks - 1);

      if (activeLocks > 0 || !snapshot) return;

      html.style.overflow = snapshot.htmlOverflow;
      html.style.overscrollBehavior = snapshot.htmlOverscrollBehavior;
      body.style.overflow = snapshot.bodyOverflow;
      body.style.paddingRight = snapshot.bodyPaddingRight;

      snapshot = null;
    };
  }, [locked]);
}
