/**
 * Questa utility previene il comportamento di zoom provocato dal double-tap
 * sui dispositivi touch, che può causare problemi di layout nelle form view.
 */
export const preventDoubleTapZoom = () => {
  if (typeof document === 'undefined') return;

  // Applica solo una volta
  if ((window as any).__preventedDoubleTapZoom) return;
  (window as any).__preventedDoubleTapZoom = true;

  // Trova tutti gli elementi di input e seleziona che potrebbero scatenare il double-tap zoom
  const targetElements = document.querySelectorAll(
    'input, select, textarea, button, a, [role="button"]'
  );

  // Imposta un tempo massimo tra due click per considerarli un "double-tap"
  const DOUBLE_TAP_THRESHOLD = 300; // milliseconds
  let lastTap = 0;

  targetElements.forEach(element => {
    element.addEventListener('touchend', (e) => {
      const currentTime = new Date().getTime();
      const tapLength = currentTime - lastTap;
      
      // Se il tap è abbastanza veloce da essere un doppio tap
      if (tapLength < DOUBLE_TAP_THRESHOLD && tapLength > 0) {
        e.preventDefault();
      }
      
      lastTap = currentTime;
    });
  });

  // Previeni anche gestuale di pinch-to-zoom
  document.addEventListener('touchmove', (e) => {
    if (e.touches.length > 1) {
      e.preventDefault();
    }
  }, { passive: false });
}; 
