import { useEffect, useRef, useState } from 'react';

interface AnimatedCounterProps {
    to: number;
    duration?: number; // ms
    suffix?: string;
    prefix?: string;
    className?: string;
}

const easeOutQuart = (t: number) => 1 - Math.pow(1 - t, 4);

const AnimatedCounter: React.FC<AnimatedCounterProps> = ({
    to,
    duration = 1400,
    suffix = '',
    prefix = '',
    className = '',
}) => {
    const [value, setValue] = useState(0);
    const ref = useRef<HTMLSpanElement>(null);
    const started = useRef(false);

    useEffect(() => {
        const el = ref.current;
        if (!el) return;

        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting && !started.current) {
                    started.current = true;
                    const start = performance.now();

                    const tick = (now: number) => {
                        const elapsed = now - start;
                        const progress = Math.min(elapsed / duration, 1);
                        setValue(Math.round(easeOutQuart(progress) * to));
                        if (progress < 1) requestAnimationFrame(tick);
                    };

                    requestAnimationFrame(tick);
                    observer.disconnect();
                }
            },
            { threshold: 0.5 }
        );

        observer.observe(el);
        return () => observer.disconnect();
    }, [to, duration]);

    return (
        <span ref={ref} className={className}>
            {prefix}{value}{suffix}
        </span>
    );
};

export default AnimatedCounter;
