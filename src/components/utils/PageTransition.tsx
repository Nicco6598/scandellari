import { useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import gsap from 'gsap';

const PageTransition: React.FC = () => {
    const overlayRef = useRef<HTMLDivElement>(null);
    const location = useLocation();
    const isFirst = useRef(true);

    useEffect(() => {
        const overlay = overlayRef.current;
        if (!overlay) return;

        // Skip animation on first mount
        if (isFirst.current) {
            isFirst.current = false;
            return;
        }

        // Cover → hold → reveal
        gsap.timeline()
            .set(overlay, { scaleY: 0, transformOrigin: 'bottom center', display: 'block' })
            .to(overlay, { scaleY: 1, duration: 0.35, ease: 'power3.inOut' })
            .to(overlay, {
                scaleY: 0,
                transformOrigin: 'top center',
                duration: 0.35,
                ease: 'power3.inOut',
                delay: 0.05,
                onComplete: () => {
                    gsap.set(overlay, { display: 'none' });
                }
            });
    }, [location.pathname]);

    return (
        <div
            ref={overlayRef}
            className="fixed inset-0 z-[9000] bg-black dark:bg-white pointer-events-none hidden"
            aria-hidden="true"
        />
    );
};

export default PageTransition;
