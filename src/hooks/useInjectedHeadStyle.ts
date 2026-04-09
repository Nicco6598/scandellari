import { useEffect } from 'react';

export function useInjectedHeadStyle(styleContent: string) {
  useEffect(() => {
    if (!styleContent) return;

    const style = document.createElement('style');
    style.textContent = styleContent;
    document.head.appendChild(style);

    return () => {
      document.head.removeChild(style);
    };
  }, [styleContent]);
}
