import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

const ScrollToTop: React.FC = () => {
  const { pathname } = useLocation();

  useEffect(() => {
    // Usiamo requestAnimationFrame per assicurarci che il reset avvenga 
    // dopo che React ha completato il ciclo di rendering della nuova pagina
    const scrollReset = () => {
      // 1. Reset nativo del browser
      window.scrollTo(0, 0);
      
      // 2. Reset di Lenis (se presente)
      if (window.lenis) {
        window.lenis.scrollTo(0, { immediate: true });
      }

      // 3. Reset forzato del body/html per sicurezza in caso di CSS overflow
      document.documentElement.scrollTo(0, 0);
      document.body.scrollTo(0, 0);
    };

    // Eseguiamo al prossimo frame e anche con un piccolo delay 
    // per gestire i casi in cui il loader scompare
    const rafId = requestAnimationFrame(scrollReset);
    const timeoutId = setTimeout(scrollReset, 50);

    return () => {
      cancelAnimationFrame(rafId);
      clearTimeout(timeoutId);
    };
  }, [pathname]);

  return null;
};

export default ScrollToTop;
