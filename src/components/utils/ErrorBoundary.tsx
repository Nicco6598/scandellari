import React, { Component, ErrorInfo, ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { logger } from '../../utils/logger';
import {
    ExclamationTriangleIcon,
    ArrowPathIcon,
    HomeIcon
} from '@heroicons/react/24/outline';

interface Props {
    children: ReactNode;
    fallback?: ReactNode;
}

interface State {
    hasError: boolean;
    error: Error | null;
    errorInfo: ErrorInfo | null;
}

class ErrorBoundary extends Component<Props, State> {
    public state: State = {
        hasError: false,
        error: null,
        errorInfo: null
    };

    public static getDerivedStateFromError(error: Error): State {
        return { hasError: true, error, errorInfo: null };
    }

    public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
        logger.error('ErrorBoundary caught an error', { error, errorInfo });
        this.setState({
            error,
            errorInfo
        });

        // Here you could send error to logging service
        // logErrorToService(error, errorInfo);
    }

    private handleReset = () => {
        this.setState({
            hasError: false,
            error: null,
            errorInfo: null
        });
    };

    public render() {
        if (this.state.hasError) {
            // Custom fallback UI
            if (this.props.fallback) {
                return this.props.fallback;
            }

            // Default error UI
            return (
                <div className="min-h-screen bg-white dark:bg-black flex items-center justify-center p-6 font-sans">
                    <div className="max-w-2xl w-full text-center">
                        {/* Error Icon */}
                        <div className="mb-12 flex justify-center">
                            <div className="relative">
                                <div className="absolute inset-0 bg-red-500/10 blur-3xl" />
                                <div className="relative w-32 h-32 border-4 border-red-500 flex items-center justify-center">
                                    <ExclamationTriangleIcon className="w-16 h-16 text-red-500" />
                                </div>
                            </div>
                        </div>

                        {/* Title */}
                        <h1 className="text-4xl md:text-6xl font-black text-black dark:text-white tracking-tighter leading-tight font-heading mb-6">
                            Qualcosa è Andato Storto
                        </h1>

                        {/* Description */}
                        <p className="text-base md:text-lg text-black/50 dark:text-white/40 max-w-xl mx-auto font-medium leading-relaxed mb-12">
                            Si è verificato un errore imprevisto. Il nostro team è stato notificato e stiamo lavorando per risolvere il problema.
                        </p>

                        {/* Error Details (only in development) */}
                        {process.env.NODE_ENV === 'development' && this.state.error && (
                            <details className="mb-12 text-left bg-black/5 dark:bg-white/5 p-6 border border-black/10 dark:border-white/10">
                                <summary className="cursor-pointer text-xs font-black uppercase tracking-widest text-black/60 dark:text-white/60 mb-4">
                                    Dettagli Tecnici (Solo Sviluppo)
                                </summary>
                                <pre className="text-xs text-red-500 overflow-auto max-h-64 font-mono">
                                    {this.state.error.toString()}
                                    {this.state.errorInfo && this.state.errorInfo.componentStack}
                                </pre>
                            </details>
                        )}

                        {/* Action Buttons */}
                        <div className="flex flex-col sm:flex-row gap-4 justify-center">
                            <button
                                onClick={this.handleReset}
                                className="group flex items-center justify-center gap-3 px-8 py-4 bg-black dark:bg-white text-white dark:text-black text-xs font-black uppercase tracking-[0.3em] hover:bg-primary dark:hover:bg-primary hover:text-white transition-all"
                            >
                                <ArrowPathIcon className="w-5 h-5 group-hover:rotate-180 transition-transform duration-500" />
                                Riprova
                            </button>
                            <Link
                                to="/"
                                className="group flex items-center justify-center gap-3 px-8 py-4 border-2 border-black dark:border-white text-black dark:text-white text-xs font-black uppercase tracking-[0.3em] hover:bg-black dark:hover:bg-white hover:text-white dark:hover:text-black transition-all"
                            >
                                <HomeIcon className="w-5 h-5" />
                                Torna alla Home
                            </Link>
                        </div>

                        {/* Support Info */}
                        <div className="mt-16 pt-8 border-t border-black/5 dark:border-white/5">
                            <p className="text-xs font-medium text-black/40 dark:text-white/30">
                                Se il problema persiste, contattaci a{' '}
                                <a
                                    href="mailto:info@scandellarigiacintosnc.it"
                                    className="text-primary hover:underline font-black"
                                >
                                    info@scandellarigiacintosnc.it
                                </a>
                            </p>
                        </div>
                    </div>
                </div>
            );
        }

        return this.props.children;
    }
}

export default ErrorBoundary;
