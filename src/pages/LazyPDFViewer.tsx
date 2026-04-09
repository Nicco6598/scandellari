import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import { Document, Page, pdfjs } from 'react-pdf';
import { XCircleIcon } from '@heroicons/react/24/outline';
import { logger } from '../utils/logger';
import { metaTextClasses } from '../components/utils/ColorStyles';

pdfjs.GlobalWorkerOptions.workerSrc = '/pdf-worker/pdf.worker.min.js';

interface LazyPDFViewerProps {
    pdfUrl: string;
    pageNumber: number;
    scale: number;
    onLoadSuccess: (data: { numPages: number }) => void;
    onLoadError: (error: Error) => void;
    onPageChange?: (page: number) => void;
    numPages?: number | null;
}

const LazyPDFViewer: React.FC<LazyPDFViewerProps> = ({
    pdfUrl,
    pageNumber,
    scale,
    onLoadSuccess,
    onLoadError,
    onPageChange,
    numPages,
}) => {
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [direction, setDirection] = useState<'left' | 'right' | null>(null);
    const [animating, setAnimating] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);
    const lastWheelTime = useRef(0);
    const touchStartX = useRef(0);
    const touchStartY = useRef(0);
    const dragStartX = useRef(0);
    const isDragging = useRef(false);

    const options = useMemo(() => ({
        cMapUrl: `https://unpkg.com/pdfjs-dist@${pdfjs.version}/cmaps/`,
        cMapPacked: true,
        standardFontDataUrl: `https://unpkg.com/pdfjs-dist@${pdfjs.version}/standard_fonts/`,
    }), []);

    useEffect(() => {
        setLoading(true);
        setError(null);
    }, [pdfUrl]);

    const goTo = useCallback((dir: 'left' | 'right') => {
        if (!onPageChange || !numPages || animating) return;
        if (dir === 'right' && pageNumber >= numPages) return;
        if (dir === 'left' && pageNumber <= 1) return;

        setDirection(dir);
        setAnimating(true);
        setTimeout(() => {
            onPageChange(dir === 'right' ? pageNumber + 1 : pageNumber - 1);
            setDirection(null);
            setAnimating(false);
        }, 280);
    }, [onPageChange, numPages, pageNumber, animating]);

    // Scroll wheel → cambia pagina (debounced 350ms)
    useEffect(() => {
        const el = containerRef.current;
        if (!el) return;
        const handler = (e: WheelEvent) => {
            // Se sta scrollando prevalentemente in verticale sulla pagina stessa, lascia passare
            // Solo se è scroll orizzontale o se il PDF è più corto del container, cambia pagina
            const now = Date.now();
            if (now - lastWheelTime.current < 350) return;
            lastWheelTime.current = now;

            const isHorizontal = Math.abs(e.deltaX) > Math.abs(e.deltaY);
            const delta = isHorizontal ? e.deltaX : e.deltaY;

            if (delta > 0) goTo('right');
            else if (delta < 0) goTo('left');
        };
        el.addEventListener('wheel', handler, { passive: true });
        return () => el.removeEventListener('wheel', handler);
    }, [goTo]);

    // Touch swipe orizzontale
    useEffect(() => {
        const el = containerRef.current;
        if (!el) return;

        const onTouchStart = (e: TouchEvent) => {
            touchStartX.current = e.touches[0].clientX;
            touchStartY.current = e.touches[0].clientY;
        };
        const onTouchEnd = (e: TouchEvent) => {
            const dx = e.changedTouches[0].clientX - touchStartX.current;
            const dy = e.changedTouches[0].clientY - touchStartY.current;
            if (Math.abs(dx) < 40 || Math.abs(dy) > Math.abs(dx)) return; // ignora swipe verticali
            goTo(dx < 0 ? 'right' : 'left');
        };

        el.addEventListener('touchstart', onTouchStart, { passive: true });
        el.addEventListener('touchend', onTouchEnd, { passive: true });
        return () => {
            el.removeEventListener('touchstart', onTouchStart);
            el.removeEventListener('touchend', onTouchEnd);
        };
    }, [goTo]);

    // Mouse drag orizzontale
    useEffect(() => {
        const el = containerRef.current;
        if (!el) return;

        const onMouseDown = (e: MouseEvent) => {
            dragStartX.current = e.clientX;
            isDragging.current = true;
        };
        const onMouseUp = (e: MouseEvent) => {
            if (!isDragging.current) return;
            isDragging.current = false;
            const dx = e.clientX - dragStartX.current;
            if (Math.abs(dx) < 40) return;
            goTo(dx < 0 ? 'right' : 'left');
        };
        const onMouseLeave = () => { isDragging.current = false; };

        el.addEventListener('mousedown', onMouseDown);
        el.addEventListener('mouseup', onMouseUp);
        el.addEventListener('mouseleave', onMouseLeave);
        return () => {
            el.removeEventListener('mousedown', onMouseDown);
            el.removeEventListener('mouseup', onMouseUp);
            el.removeEventListener('mouseleave', onMouseLeave);
        };
    }, [goTo]);

    // Frecce tastiera
    useEffect(() => {
        const handler = (e: KeyboardEvent) => {
            if (e.key === 'ArrowRight') goTo('right');
            if (e.key === 'ArrowLeft') goTo('left');
        };
        window.addEventListener('keydown', handler);
        return () => window.removeEventListener('keydown', handler);
    }, [goTo]);

    const slideStyle: React.CSSProperties = animating
        ? {
            opacity: 0,
            transform: `translateX(${direction === 'right' ? '-40px' : '40px'})`,
            transition: 'opacity 0.28s ease, transform 0.28s ease',
        }
        : {
            opacity: 1,
            transform: 'translateX(0)',
            transition: 'opacity 0.28s ease, transform 0.28s ease',
        };

    return (
        <div
            ref={containerRef}
            className="flex justify-center items-start w-full h-full bg-white dark:bg-zinc-950 select-none"
            style={{ cursor: numPages && numPages > 1 ? 'grab' : 'default' }}
        >
            {error ? (
                <div className="flex flex-col items-center justify-center p-10 text-center space-y-4">
                    <XCircleIcon className="w-12 h-12 text-red-500" />
                    <p className="text-xs font-black uppercase tracking-widest text-red-500">{error}</p>
                    <p className={`text-[10px] ${metaTextClasses}`}>Verifica che il file PDF esista e sia accessibile.</p>
                </div>
            ) : (
                <div style={slideStyle}>
                    <Document
                        file={pdfUrl}
                        onLoadSuccess={(data) => {
                            setLoading(false);
                            onLoadSuccess(data);
                        }}
                        onLoadError={(err) => {
                            logger.error('PDF Load Error:', err);
                            setLoading(false);
                            setError("Impossibile caricare il documento PDF.");
                            onLoadError(err);
                        }}
                        loading={
                            <div className="flex items-center justify-center p-20">
                                <div className="text-center space-y-4">
                                    <div className="w-8 h-8 border-2 border-primary border-t-transparent animate-spin mx-auto" />
                                    <p className={`text-xs font-black uppercase tracking-widest ${metaTextClasses}`}>Caricamento...</p>
                                </div>
                            </div>
                        }
                        error={
                            <div className="flex flex-col items-center justify-center p-10 text-center space-y-4">
                                <XCircleIcon className="w-12 h-12 text-red-500" />
                                <p className="text-xs font-black uppercase tracking-widest text-red-500">Errore caricamento PDF</p>
                            </div>
                        }
                        options={options}
                    >
                        <Page
                            pageNumber={pageNumber}
                            scale={scale}
                            renderTextLayer={false}
                            renderAnnotationLayer={false}
                            className="shadow-2xl"
                        />
                    </Document>
                </div>
            )}
        </div>
    );
};

export default LazyPDFViewer;
