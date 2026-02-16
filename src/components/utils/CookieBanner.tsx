// src/components/utils/CookieBanner.tsx
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowTopRightOnSquareIcon } from '@heroicons/react/24/outline';

const CookieBanner: React.FC = () => {
  const [showBanner, setShowBanner] = useState(false);

  useEffect(() => {
    const cookiesAccepted = localStorage.getItem('cookiesAccepted');
    if (!cookiesAccepted) {
      const timer = setTimeout(() => {
        setShowBanner(true);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, []);

  const acceptCookies = () => {
    localStorage.setItem('cookiesAccepted', 'true');
    setShowBanner(false);
  };

  const declineCookies = () => {
    localStorage.setItem('cookiesAccepted', 'minimal');
    setShowBanner(false);
  };

  return (
    <div
      className={`fixed bottom-0 left-0 right-0 z-50 p-4 md:p-6 transition-all duration-300 ${showBanner ? 'translate-y-0 opacity-100' : 'translate-y-24 opacity-0 pointer-events-none'}`}
      aria-hidden={!showBanner}
    >
      <div className="container mx-auto max-w-7xl">
        <div className="bg-white dark:bg-dark-surface border border-black/10 dark:border-white/10 shadow-2xl shadow-black/10 dark:shadow-primary/5 backdrop-blur-sm relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-transparent via-transparent to-primary/5 dark:to-accent/5 pointer-events-none" />

          <div className="relative z-10 p-6 md:p-8">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-8 h-[1px] bg-primary shadow-[0_0_6px_rgba(37,99,235,0.4)]" />
                  <h3 className="text-xs font-black uppercase tracking-[0.3em] text-black dark:text-white">
                    Utilizziamo i Cookie
                  </h3>
                </div>
                <p className="text-sm font-medium text-black/70 dark:text-white/60 leading-relaxed max-w-2xl">
                  Questo sito utilizza cookie tecnici e analitici per migliorare la tua esperienza di navigazione.
                  {' '}
                  <Link
                    to="/cookie-policy"
                    className="text-primary hover:text-primary-dark font-bold uppercase tracking-wider inline-flex items-center gap-1 group transition-colors"
                  >
                    Cookie Policy
                    <ArrowTopRightOnSquareIcon className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-all group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                  </Link>
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-3 md:flex-shrink-0">
                <button
                  onClick={declineCookies}
                  className="px-6 py-3 border-2 border-black dark:border-white text-[10px] font-black uppercase tracking-widest hover:bg-black dark:hover:bg-white hover:text-white dark:hover:text-black transition-all text-black dark:text-white"
                >
                  Solo Essenziali
                </button>
                <button
                  onClick={acceptCookies}
                  className="px-6 py-3 bg-primary text-white text-[10px] font-black uppercase tracking-widest border-2 border-primary hover:bg-primary-dark hover:border-primary-dark transition-all shadow-lg shadow-primary/20"
                >
                  Accetta Tutti
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CookieBanner;
