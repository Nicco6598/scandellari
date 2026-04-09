import React from 'react';
import { Link } from 'react-router-dom';
import Layout from '../components/layout/Layout';
import SEO from '../components/utils/SEO';
import {
    HomeIcon,
    ArrowRightIcon
} from '@heroicons/react/24/outline';
import { metaTextClasses, secondaryTextClasses } from '../components/utils/ColorStyles';

const NotFoundPage: React.FC = () => {
    return (
        <Layout>
            <SEO
                title="Pagina Non Trovata - 404 | Scandellari"
                description="La pagina che stai cercando non esiste o è stata spostata."
                url="/404"
            />
            <div className="bg-stone-50 dark:bg-black min-h-screen pt-32 pb-20 font-sans flex items-center">
                <div className="container mx-auto max-w-7xl px-6">
                    <div
                        className="text-center max-w-3xl mx-auto"
                        data-animate="fade-up"
                        data-animate-distance="20"
                    >
                        {/* Error Icon - Modern Geometric Design */}
                        <div className="mb-12 flex justify-center" data-animate="scale" data-animate-delay="0.1">
                            <div className="relative w-40 h-40">
                                {/* Glow effect */}
                                <div className="absolute inset-0 bg-primary/10 blur-3xl" />

                                {/* Animated concentric squares */}
                                <div className="absolute inset-0 border-2 border-black/10 dark:border-white/10 animate-spin-slow-scale" />

                                <div className="absolute inset-4 border-2 border-black/20 dark:border-white/20 animate-spin-reverse-scale" />

                                {/* Center square with glitch effect */}
                                <div className="absolute inset-8 bg-black dark:bg-white flex items-center justify-center animate-tilt">
                                    {/* 404 in center */}
                                    <div className="text-white dark:text-black font-black text-2xl font-heading tracking-tighter animate-pulse-soft">
                                        404
                                    </div>
                                </div>

                                {/* Corner accents */}
                                <div className="absolute top-0 left-0 w-4 h-4 border-t-2 border-l-2 border-primary" />
                                <div className="absolute top-0 right-0 w-4 h-4 border-t-2 border-r-2 border-primary" />
                                <div className="absolute bottom-0 left-0 w-4 h-4 border-b-2 border-l-2 border-primary" />
                                <div className="absolute bottom-0 right-0 w-4 h-4 border-b-2 border-r-2 border-primary" />
                            </div>
                        </div>

                        {/* Error Code */}
                        <div className="mb-8" data-animate="fade" data-animate-delay="0.2">
                            <div className="text-[120px] md:text-[200px] font-black text-black/5 dark:text-white/5 leading-none font-heading">
                                404
                            </div>
                        </div>

                        {/* Title */}
                        <h1
                            className="text-4xl md:text-6xl lg:text-7xl font-black text-black dark:text-white tracking-tighter leading-tight font-heading mb-8"
                            data-animate="fade-up"
                            data-animate-delay="0.3"
                        >
                            Pagina Non Trovata
                        </h1>

                        {/* Description */}
                        <p
                            className={`text-base md:text-xl max-w-2xl mx-auto font-medium leading-relaxed mb-16 ${secondaryTextClasses}`}
                            data-animate="fade-up"
                            data-animate-delay="0.4"
                        >
                            La pagina che stai cercando non esiste o è stata spostata.
                            Torna alla home page o esplora le nostre sezioni principali.
                        </p>

                        {/* Action Buttons */}
                        <div
                            className="flex flex-col sm:flex-row gap-6 justify-center items-center"
                            data-animate="fade-up"
                            data-animate-delay="0.5"
                        >
                            <Link
                                to="/"
                                className="group flex items-center gap-4 px-10 py-5 bg-black dark:bg-white text-white dark:text-black text-xs font-black uppercase tracking-[0.3em] hover:bg-primary dark:hover:bg-primary hover:text-white transition-all"
                            >
                                <HomeIcon className="w-5 h-5" />
                                Torna alla Home
                                <ArrowRightIcon className="w-5 h-5 group-hover:translate-x-2 transition-transform" />
                            </Link>
                        </div>

                        {/* Quick Links */}
                        <div
                            className="mt-20 pt-12 border-t border-black/5 dark:border-white/5"
                            data-animate="fade"
                            data-animate-delay="0.6"
                        >
                            <h2 className={`text-xs font-black uppercase tracking-[0.4em] mb-8 ${metaTextClasses}`}>
                                Link Utili
                            </h2>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                                {[
                                    { to: '/progetti', label: 'Progetti' },
                                    { to: '/competenze', label: 'Competenze' },
                                    { to: '/certificazioni', label: 'Certificazioni' },
                                    { to: '/contatti', label: 'Contatti' }
                                ].map((link, i) => (
                                    <Link
                                        key={i}
                                        to={link.to}
                                        className="group p-6 bg-white dark:bg-dark-surface border border-black/5 dark:border-white/5 hover:border-primary/30 transition-all"
                                    >
                                        <span className={`text-sm font-black uppercase tracking-tight group-hover:text-primary transition-colors ${metaTextClasses}`}>
                                            {link.label}
                                        </span>
                                    </Link>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </Layout>
    );
};

export default NotFoundPage;
