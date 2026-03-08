import { useLayoutEffect, useRef, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { useTheme } from '../../context/ThemeContext';
import gsap from 'gsap';

const PageTransition: React.FC = () => {
    const overlayRef = useRef<HTMLDivElement>(null);
    const lineRef = useRef<HTMLDivElement>(null);
    const location = useLocation();
    const { theme } = useTheme();
    const [isFirst, setIsFirst] = useState(true);

    useLayoutEffect(() => {
        const overlay = overlayRef.current;
        const line = lineRef.current;
        if (!overlay || !line) return;

        const bgColor = theme === 'dark' ? '#000000' : '#f5f5f4';

        if (isFirst) {
            setIsFirst(false);
            // Prima visita: overlay già visibile, lo togliamo subito
            gsap.set(overlay, { display: 'block', opacity: 1, backgroundColor: bgColor });
            gsap.set(line, { scaleY: 0, opacity: 0 });
            gsap.to(overlay, {
                opacity: 0,
                duration: 0.3,
                ease: 'power2.in',
                onComplete: () => {
                    gsap.set(overlay, { display: 'none' });
                }
            });
            return;
        }

        // Navigazione: overlay già visibile (copre la nuova pagina), poi anima e scompare
        const tl = gsap.timeline();

        tl.set(overlay, { display: 'block', opacity: 1, backgroundColor: bgColor })
          .set(line, { scaleY: 0, opacity: 1 })
          .to(line, {
              scaleY: 1,
              duration: 0.35,
              ease: 'expo.inOut'
          })
          .to(line, {
              opacity: 0,
              duration: 0.15,
              ease: 'power2.in'
          })
          .to(overlay, {
              opacity: 0,
              duration: 0.25,
              ease: 'power2.in',
              onComplete: () => {
                  gsap.set(overlay, { display: 'none' });
                  gsap.set(line, { scaleY: 0 });
              }
          });

        return () => { tl.kill(); };
    }, [location.pathname, theme]);

    return (
        <div
            ref={overlayRef}
            className="fixed inset-0 z-[9000] pointer-events-none"
            style={{ display: 'block', opacity: 1 }}
            aria-hidden="true"
        >
            <div
                ref={lineRef}
                className="absolute top-0 left-1/2 -translate-x-1/2 w-[1.5px] h-full bg-gradient-to-b from-primary/30 via-primary to-primary/30"
            />
        </div>
    );
};

export default PageTransition;
