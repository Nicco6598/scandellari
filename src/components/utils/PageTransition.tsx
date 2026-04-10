import { useLayoutEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { useTheme } from '../../context/ThemeContext';

const PageTransition: React.FC = () => {
    const overlayRef = useRef<HTMLDivElement>(null);
    const lineRef = useRef<HTMLDivElement>(null);
    const isFirstRenderRef = useRef(true);
    const location = useLocation();
    const { theme } = useTheme();

    useLayoutEffect(() => {
        const overlay = overlayRef.current;
        const line = lineRef.current;
        if (!overlay || !line) return;

        const bgColor = theme === 'dark' ? '#000000' : '#f5f5f4';
        let isDisposed = false;
        let timeline: { kill: () => void } | undefined;

        const initializeTransition = async () => {
            const { default: gsap } = await import('gsap');
            if (isDisposed) return;

            if (isFirstRenderRef.current) {
                isFirstRenderRef.current = false;
                gsap.set(overlay, { display: 'none', opacity: 0, backgroundColor: bgColor });
                gsap.set(line, { scaleY: 0, opacity: 0 });
                return;
            }

            const tl = gsap.timeline();
            timeline = tl;

            tl
                .set(overlay, { display: 'block', opacity: 0, backgroundColor: bgColor })
                .set(line, { scaleY: 0.2, opacity: 0, transformOrigin: 'center center' })
                .to(overlay, {
                    opacity: 0.18,
                    duration: 0.18,
                    ease: 'power2.out'
                })
                .to(line, {
                    opacity: 1,
                    scaleY: 1,
                    duration: 0.28,
                    ease: 'expo.out'
                }, 0)
                .to(line, {
                    opacity: 0,
                    duration: 0.16,
                    ease: 'power2.in'
                })
                .to(overlay, {
                    opacity: 0,
                    duration: 0.28,
                    ease: 'power2.inOut',
                    onComplete: () => {
                        gsap.set(overlay, { display: 'none' });
                        gsap.set(line, { scaleY: 0 });
                    }
                }, '<');
        };

        void initializeTransition();

        return () => {
            isDisposed = true;
            timeline?.kill();
        };
    }, [location.pathname, theme]);

    return (
        <div
            ref={overlayRef}
            className="fixed inset-0 z-[9000] pointer-events-none"
            style={{ display: 'none', opacity: 0 }}
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
