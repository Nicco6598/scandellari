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
    const frameRef = useRef<number | null>(null);

    useEffect(() => {
        return () => {
            if (frameRef.current !== null) {
                cancelAnimationFrame(frameRef.current);
            }
        };
    }, []);

    useEffect(() => {
        const el = ref.current;
        if (!el) return;

        const animateValue = (from: number, target: number) => {
            if (frameRef.current !== null) {
                cancelAnimationFrame(frameRef.current);
            }

            const start = performance.now();

            const tick = (now: number) => {
                const elapsed = now - start;
                const progress = Math.min(elapsed / duration, 1);
                const nextValue = Math.round(from + ((target - from) * easeOutQuart(progress)));
                setValue(nextValue);

                if (progress < 1) {
                    frameRef.current = requestAnimationFrame(tick);
                } else {
                    frameRef.current = null;
                }
            };

            frameRef.current = requestAnimationFrame(tick);
        };

        if (started.current) {
            animateValue(value, to);
            return;
        }

        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting && !started.current) {
                    started.current = true;
                    animateValue(0, to);
                    observer.disconnect();
                }
            },
            { threshold: 0.5 }
        );

        observer.observe(el);
        return () => observer.disconnect();
    }, [to, duration]);

    return (
        <span
            ref={ref}
            className={`inline-block ${className}`.trim()}
            style={{ minWidth: `${Math.max(String(to).length, 1)}ch` }}
        >
            {prefix}{value}{suffix}
        </span>
    );
};

export default AnimatedCounter;
