import { useEffect, useRef, useState } from 'react';

const INTERACTIVE = 'a, button, [role="button"], input, textarea, select, label, [data-cursor]';

const CustomCursor: React.FC = () => {
    const dotRef = useRef<HTMLDivElement>(null);
    const ringRef = useRef<HTMLDivElement>(null);
    const [visible, setVisible] = useState(false);

    useEffect(() => {
        // Only activate on true fine-pointer (mouse) devices.
        // Also listen for touchstart: if a touch is detected at any point, hide permanently.
        if (!window.matchMedia('(pointer: fine)').matches) return;

        const dot = dotRef.current;
        const ring = ringRef.current;
        if (!dot || !ring) return;

        let mouseX = -200;
        let mouseY = -200;
        let ringX = -200;
        let ringY = -200;
        let raf = 0;
        let active = true;

        const show = () => {
            if (!active) return;
            dot.style.opacity = '1';
            ring.style.opacity = '1';
            setVisible(true);
        };

        const hideForever = () => {
            // Touch detected on a "fine pointer" device (hybrid/tablet) — hide and stop
            active = false;
            dot.style.opacity = '0';
            ring.style.opacity = '0';
            cancelAnimationFrame(raf);
        };

        const onMove = (e: MouseEvent) => {
            if (!active) return;
            mouseX = e.clientX;
            mouseY = e.clientY;
            show();
        };

        const onOver = (e: MouseEvent) => {
            if (!active) return;
            if ((e.target as Element)?.closest(INTERACTIVE)) {
                dot.style.width = '8px';
                dot.style.height = '8px';
                dot.style.backgroundColor = 'var(--color-primary, #2563eb)';
                ring.style.width = '44px';
                ring.style.height = '44px';
                ring.style.borderColor = 'var(--color-primary, #2563eb)';
                ring.style.opacity = '0.6';
            }
        };

        const onOut = (e: MouseEvent) => {
            if (!active) return;
            if ((e.target as Element)?.closest(INTERACTIVE)) {
                dot.style.width = '6px';
                dot.style.height = '6px';
                dot.style.backgroundColor = '';
                ring.style.width = '28px';
                ring.style.height = '28px';
                ring.style.borderColor = '';
                ring.style.opacity = '1';
            }
        };

        const onTouch = () => hideForever();

        const tick = () => {
            if (!active) return;
            dot.style.transform = `translate(${mouseX - 3}px, ${mouseY - 3}px)`;
            ringX += (mouseX - ringX) * 0.12;
            ringY += (mouseY - ringY) * 0.12;
            ring.style.transform = `translate(${ringX - 14}px, ${ringY - 14}px)`;
            raf = requestAnimationFrame(tick);
        };

        document.addEventListener('mousemove', onMove);
        document.addEventListener('mouseover', onOver);
        document.addEventListener('mouseout', onOut);
        document.addEventListener('touchstart', onTouch, { passive: true });
        raf = requestAnimationFrame(tick);

        return () => {
            active = false;
            document.removeEventListener('mousemove', onMove);
            document.removeEventListener('mouseover', onOver);
            document.removeEventListener('mouseout', onOut);
            document.removeEventListener('touchstart', onTouch);
            cancelAnimationFrame(raf);
        };
    }, []);

    return (
        <>
            <div
                ref={dotRef}
                className="fixed top-0 left-0 w-1.5 h-1.5 bg-black dark:bg-white rounded-full pointer-events-none z-[9999] mix-blend-difference transition-[width,height,background-color] duration-150"
                style={{ willChange: 'transform', opacity: 0 }}
            />
            <div
                ref={ringRef}
                className="fixed top-0 left-0 w-7 h-7 border border-black/50 dark:border-white/50 rounded-full pointer-events-none z-[9998] transition-[width,height,opacity,border-color] duration-200"
                style={{ willChange: 'transform', opacity: 0 }}
            />
        </>
    );
};

export default CustomCursor;
