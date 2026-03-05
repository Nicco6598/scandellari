import { useEffect, useRef, useState } from 'react';

const INTERACTIVE = 'a, button, [role="button"], input, textarea, select, label, [data-cursor]';

const CustomCursor: React.FC = () => {
    const dotRef = useRef<HTMLDivElement>(null);
    const ringRef = useRef<HTMLDivElement>(null);
    const [visible, setVisible] = useState(false);

    useEffect(() => {
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
                ring.style.width = '44px';
                ring.style.height = '44px';
                ring.style.opacity = '0.6';
            }
        };

        const onOut = (e: MouseEvent) => {
            if (!active) return;
            if ((e.target as Element)?.closest(INTERACTIVE)) {
                dot.style.width = '6px';
                dot.style.height = '6px';
                ring.style.width = '28px';
                ring.style.height = '28px';
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
            {/* 
                Dot: bg-white + mix-blend-difference
                → su sfondo chiaro: bianco XOR bianco = nero ✓
                → su sfondo scuro:  bianco XOR nero  = bianco ✓
                → su sfondo primary/blue: si inverte al complementare ✓
            */}
            <div
                ref={dotRef}
                className="fixed top-0 left-0 w-1.5 h-1.5 bg-white rounded-full pointer-events-none z-[9999] mix-blend-difference transition-[width,height] duration-150"
                style={{ willChange: 'transform', opacity: 0 }}
            />
            {/*
                Ring: niente mix-blend per non creare artefatti visivi col bordo,
                usa currentColor con opacità adattiva — visibile su entrambi i temi
                grazie al bordo semi-trasparente su colore neutro
            */}
            <div
                ref={ringRef}
                className="fixed top-0 left-0 w-7 h-7 rounded-full pointer-events-none z-[9998] transition-[width,height,opacity,border-color] duration-200"
                style={{
                    willChange: 'transform',
                    opacity: 0,
                    border: '1px solid rgba(128,128,128,0.5)',
                    mixBlendMode: 'exclusion',
                }}
            />
        </>
    );
};

export default CustomCursor;
