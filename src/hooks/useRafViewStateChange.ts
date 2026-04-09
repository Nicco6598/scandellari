import { useEffect, useRef } from 'react';

type ViewStateLike = {
  latitude: number;
  longitude: number;
  zoom: number;
};

export function useRafViewStateChange<T extends ViewStateLike>(
  onChange: (next: T) => void
) {
  const frameRef = useRef<number | null>(null);
  const pendingValueRef = useRef<T | null>(null);
  const onChangeRef = useRef(onChange);

  useEffect(() => {
    onChangeRef.current = onChange;
  }, [onChange]);

  useEffect(() => (
    () => {
      if (frameRef.current !== null) {
        cancelAnimationFrame(frameRef.current);
      }
    }
  ), []);

  return (next: T) => {
    pendingValueRef.current = next;
    if (frameRef.current !== null) return;

    frameRef.current = requestAnimationFrame(() => {
      frameRef.current = null;
      if (!pendingValueRef.current) return;
      onChangeRef.current(pendingValueRef.current);
    });
  };
}
