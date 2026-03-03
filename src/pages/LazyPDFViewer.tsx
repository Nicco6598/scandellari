import React, { useState, useEffect, useMemo } from 'react';
import { Document, Page, pdfjs } from 'react-pdf';
import { XCircleIcon } from '@heroicons/react/24/outline';
import { logger } from '../utils/logger';

// Set worker source to local static file
pdfjs.GlobalWorkerOptions.workerSrc = '/pdf-worker/pdf.worker.min.js';

interface LazyPDFViewerProps {
    pdfUrl: string;
    pageNumber: number;
    scale: number;
    onLoadSuccess: (data: { numPages: number }) => void;
    onLoadError: (error: Error) => void;
}

const LazyPDFViewer: React.FC<LazyPDFViewerProps> = ({
    pdfUrl,
    pageNumber,
    scale,
    onLoadSuccess,
    onLoadError
}) => {
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Memoize options to prevent unnecessary reloads
    const options = useMemo(() => ({
        cMapUrl: `https://unpkg.com/pdfjs-dist@${pdfjs.version}/cmaps/`,
        cMapPacked: true,
        standardFontDataUrl: `https://unpkg.com/pdfjs-dist@${pdfjs.version}/standard_fonts/`,
    }), []);

    useEffect(() => {
        setLoading(true);
        setError(null);
    }, [pdfUrl]);

    return (
        <div className="flex justify-center items-start w-full h-full bg-white dark:bg-zinc-950">
            {error ? (
                <div className="flex flex-col items-center justify-center p-10 text-center space-y-4">
                    <XCircleIcon className="w-12 h-12 text-red-500" />
                    <p className="text-xs font-black uppercase tracking-widest text-red-500">{error}</p>
                    <p className="text-[10px] text-black/40 dark:text-white/40">Verifica che il file PDF esista e sia accessibile.</p>
                </div>
            ) : (
                <Document
                    file={pdfUrl}
                    onLoadSuccess={(data) => {
                        setLoading(false);
                        onLoadSuccess(data);
                    }}
                    onLoadError={(error) => {
                        logger.error('PDF Load Error:', error);
                        setLoading(false);
                        setError("Impossibile caricare il documento PDF.");
                        onLoadError(error);
                    }}
                    loading={
                        <div className="flex items-center justify-center p-20">
                            <div className="text-center space-y-4">
                                <div className="w-8 h-8 border-2 border-primary border-t-transparent animate-spin mx-auto" />
                                <p className="text-xs font-black uppercase tracking-widest text-black/40 dark:text-white/40">Caricamento...</p>
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
                        className="shadow-lg"
                    />
                </Document>
            )}
        </div>
    );
};

export default LazyPDFViewer; 
