import { useEffect, useRef } from 'react';

const ScrollProgress: React.FC = () => {
    const barRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const onScroll = () => {
            const scrolled = window.scrollY;
            const total = document.documentElement.scrollHeight - window.innerHeight;
            const progress = total > 0 ? scrolled / total : 0;
            if (barRef.current) {
                barRef.current.style.transform = `scaleX(${progress})`;
            }
        };

        window.addEventListener('scroll', onScroll, { passive: true });
        return () => window.removeEventListener('scroll', onScroll);
    }, []);

    return (
        <div className="fixed top-0 left-0 right-0 z-[200] h-[2px] bg-black/10 dark:bg-white/10 pointer-events-none backdrop-blur-sm">
            <div
                ref={barRef}
                className="h-full bg-primary dark:bg-primary-light origin-left shadow-[0_0_10px_rgba(37,99,235,0.25)] dark:shadow-[0_0_12px_rgba(96,165,250,0.35)]"
                style={{ transform: 'scaleX(0)', willChange: 'transform' }}
            />
        </div>
    );
};

export default ScrollProgress;
