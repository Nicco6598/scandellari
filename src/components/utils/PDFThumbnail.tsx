import React, { useMemo, useState, useRef, useEffect } from 'react';
import { Document, Page, pdfjs } from 'react-pdf';
import { DocumentTextIcon } from '@heroicons/react/24/outline';

pdfjs.GlobalWorkerOptions.workerSrc = '/pdf-worker/pdf.worker.min.js';

interface PDFThumbnailProps {
    pdfUrl: string;
    className?: string;
}

const PDFThumbnail: React.FC<PDFThumbnailProps> = ({ pdfUrl, className = '' }) => {
    const [status, setStatus] = useState<'loading' | 'ready' | 'error'>('loading');
    const [containerWidth, setContainerWidth] = useState<number>(0);
    const containerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const el = containerRef.current;
        if (!el) return;

        const observer = new ResizeObserver(entries => {
            const width = entries[0]?.contentRect.width;
            if (width) setContainerWidth(Math.round(width));
        });
        observer.observe(el);
        return () => observer.disconnect();
    }, []);

    // Reset status when URL changes
    useEffect(() => {
        setStatus('loading');
    }, [pdfUrl]);

    const options = useMemo(() => ({
        cMapUrl: `https://unpkg.com/pdfjs-dist@${pdfjs.version}/cmaps/`,
        cMapPacked: true,
        standardFontDataUrl: `https://unpkg.com/pdfjs-dist@${pdfjs.version}/standard_fonts/`,
    }), []);

    return (
        <div ref={containerRef} className={`relative w-full h-full overflow-hidden ${className}`}>
            {/* Spinner */}
            {status === 'loading' && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/5 dark:bg-black/40 z-10">
                    <div className="w-6 h-6 border-2 border-primary border-t-transparent animate-spin" />
                </div>
            )}

            {/* Errore */}
            {status === 'error' && (
                <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/5 dark:bg-black/40 gap-3">
                    <DocumentTextIcon className="w-10 h-10 text-black/20 dark:text-white/20" />
                    <span className="text-[9px] font-black uppercase tracking-widest text-black/30 dark:text-white/30">
                        Anteprima non disponibile
                    </span>
                </div>
            )}

            {containerWidth > 0 && (
                <Document
                    file={pdfUrl}
                    options={options}
                    onLoadSuccess={() => setStatus('ready')}
                    onLoadError={() => setStatus('error')}
                    loading={null}
                    error={null}
                >
                    <Page
                        pageNumber={1}
                        width={containerWidth}
                        renderTextLayer={false}
                        renderAnnotationLayer={false}
                        className="block"
                        onRenderSuccess={() => setStatus('ready')}
                        onRenderError={() => setStatus('error')}
                    />
                </Document>
            )}
        </div>
    );
};

export default PDFThumbnail;
