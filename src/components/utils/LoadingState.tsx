import React from 'react';

interface LoadingStateProps {
  description?: string;
  label: string;
  variant?: 'page' | 'section';
}

const LoadingState: React.FC<LoadingStateProps> = ({
  description = 'Stiamo preparando i contenuti.',
  label,
  variant = 'page',
}) => {
  const isPage = variant === 'page';

  return (
    <section
      className={`bg-stone-50 dark:bg-black ${isPage ? 'min-h-[60vh] pt-32 pb-20' : 'py-24 md:py-48'}`}
      aria-live="polite"
      role="status"
    >
      <div className="container mx-auto max-w-7xl px-6">
        <div className="border border-black/10 bg-white/70 p-8 md:p-12 dark:border-white/5 dark:bg-white/[0.03]">
          <div className="mb-6 flex items-center gap-4">
            <div className="h-[1px] w-12 bg-primary shadow-[0_0_8px_rgba(37,99,235,0.35)]" />
            <span className="text-[10px] font-black uppercase tracking-[0.35em] text-black/60 dark:text-white/40">
              Caricamento
            </span>
          </div>

          <div className="mb-4 h-10 w-full max-w-md animate-pulse bg-black/5 dark:bg-white/5" />
          <div className="mb-3 h-4 w-full max-w-2xl animate-pulse bg-black/5 dark:bg-white/5" />
          <div className="mb-8 h-4 w-full max-w-xl animate-pulse bg-black/5 dark:bg-white/5" />

          <p className="text-sm font-black uppercase tracking-[0.25em] text-black/65 dark:text-white/45">
            {label}
          </p>
          <p className="mt-3 max-w-2xl text-sm font-medium leading-relaxed text-black/60 dark:text-white/45">
            {description}
          </p>
        </div>
      </div>
    </section>
  );
};

export default LoadingState;
