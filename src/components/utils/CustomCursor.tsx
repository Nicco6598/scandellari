import { useEffect, useRef } from 'react';

const INTERACTIVE = 'a, button, [role="button"], input, textarea, select, label, [data-cursor]';

const CustomCursor: React.FC = () => {
    const dotRef = useRef<HTMLDivElement>(null);
    const ringRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        // Hide on touch devices
        if (window.matchMedia('(pointer: coarse)').matches) return;

        const dot = dotRef.current;
        const ring = ringRef.current;
        if (!dot || !ring) return;

        let mouseX = -100;
        let mouseY = -100;
        let ringX = -100;
        let ringY = -100;
        let raf = 0;
        let isHovering = false;

        const onMove = (e: MouseEvent) => {
            mouseX = e.clientX;
            mouseY = e.clientY;
        };

        const onOver = (e: MouseEvent) => {
            if ((e.target as Element)?.closest(INTERACTIVE)) {
                isHovering = true;
                ring.style.width = '48px';
                ring.style.height = '48px';
                ring.style.opacity = '0.3';
                ring.style.borderColor = 'var(--color-primary, #2563eb)';
                dot.style.opacity = '0';
            }
        };

        const onOut = (e: MouseEvent) => {
            if ((e.target as Element)?.closest(INTERACTIVE)) {
                isHovering = false;
                ring.style.width = '28px';
                ring.style.height = '28px';
                ring.style.opacity = '1';
                ring.style.borderColor = '';
                dot.style.opacity = '1';
            }
        };

        const tick = () => {
            // Dot: instant
            dot.style.transform = `translate(${mouseX - 3}px, ${mouseY - 3}px)`;

            // Ring: lerp toward dot
            ringX += (mouseX - ringX) * 0.12;
            ringY += (mouseY - ringY) * 0.12;
            ring.style.transform = `translate(${ringX - 14}px, ${ringY - 14}px)`;

            raf = requestAnimationFrame(tick);
        };

        document.addEventListener('mousemove', onMove);
        document.addEventListener('mouseover', onOver);
        document.addEventListener('mouseout', onOut);
        raf = requestAnimationFrame(tick);

        return () => {
            document.removeEventListener('mousemove', onMove);
            document.removeEventListener('mouseover', onOver);
            document.removeEventListener('mouseout', onOut);
            cancelAnimationFrame(raf);
        };
    }, []);

    return (
        <>
            {/* Dot */}
            <div
                ref={dotRef}
                className="fixed top-0 left-0 w-1.5 h-1.5 bg-black dark:bg-white rounded-full pointer-events-none z-[9999] mix-blend-difference"
                style={{ willChange: 'transform' }}
            />
            {/* Ring */}
            <div
                ref={ringRef}
                className="fixed top-0 left-0 w-7 h-7 border border-black/40 dark:border-white/40 rounded-full pointer-events-none z-[9998] transition-[width,height,opacity,border-color] duration-200"
                style={{ willChange: 'transform' }}
            />
        </>
    );
};

export default CustomCursor;
