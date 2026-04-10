type LoadingStateProps = {
  description?: string;
  label: string;
  variant?: 'overlay' | 'page' | 'section';
};

function LoadingSkeletonLine({
  className,
}: {
  className: string;
}) {
  return <div className={`animate-pulse bg-black/5 dark:bg-white/5 ${className}`} />;
}

function LoadingState({
  description = 'Stiamo preparando i contenuti.',
  label,
  variant = 'page',
}: LoadingStateProps) {
  const isPage = variant === 'page';
  const isOverlay = variant === 'overlay';

  if (isOverlay) {
    return (
      <div
        className="fixed inset-0 z-[8800] bg-stone-50/88 backdrop-blur-sm dark:bg-black/88"
        aria-live="polite"
        role="status"
      >
        <div className="absolute inset-x-0 top-0 h-[2px] overflow-hidden bg-black/5 dark:bg-white/5">
          <div className="h-full w-1/3 animate-pulse bg-primary shadow-[0_0_20px_rgba(37,99,235,0.45)]" />
        </div>

        <div className="flex min-h-screen items-center justify-center px-6 py-20">
          <div className="w-full max-w-2xl border border-black/10 bg-white/80 p-8 md:p-12 dark:border-white/10 dark:bg-white/[0.05]">
            <div className="mb-6 flex items-center gap-4">
              <div className="h-[1px] w-12 bg-primary shadow-[0_0_8px_rgba(37,99,235,0.35)]" />
              <span className="text-[10px] font-black uppercase tracking-[0.35em] text-black/60 dark:text-white/40">
                Caricamento
              </span>
            </div>

            <div className="mb-5 h-10 w-full max-w-sm animate-pulse bg-black/5 dark:bg-white/5" />
            <div className="mb-3 h-4 w-full max-w-xl animate-pulse bg-black/5 dark:bg-white/5" />
            <div className="mb-8 h-4 w-full max-w-lg animate-pulse bg-black/5 dark:bg-white/5" />

            <p className="text-sm font-black uppercase tracking-[0.25em] text-black/65 dark:text-white/45">
              {label}
            </p>
            <p className="mt-3 max-w-xl text-sm font-medium leading-relaxed text-black/60 dark:text-white/45">
              {description}
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <section
      className={`bg-stone-50 dark:bg-black ${isPage ? 'min-h-[60vh] pt-32 pb-20' : 'py-24 md:py-48'}`}
      aria-live="polite"
      role="status"
    >
      <div className="container mx-auto max-w-7xl px-6">
        {isPage ? (
          <div className="space-y-20">
            <section className="mb-20">
              <div className="border-b border-black/10 dark:border-white/5 pb-20">
                <div className="mb-12 flex items-center gap-4">
                  <div className="h-[1px] w-12 bg-primary shadow-[0_0_8px_rgba(37,99,235,0.35)]" />
                  <span className="text-[10px] font-black uppercase tracking-[0.35em] text-black/60 dark:text-white/40">
                    Caricamento
                  </span>
                </div>

                <div className="flex flex-col justify-between gap-12 md:flex-row md:items-end">
                  <div className="w-full max-w-3xl space-y-6">
                    <LoadingSkeletonLine className="h-24 max-w-2xl md:h-32 lg:h-40" />
                    <LoadingSkeletonLine className="h-4 max-w-2xl" />
                    <LoadingSkeletonLine className="h-4 max-w-xl" />
                  </div>

                  <div className="shrink-0 space-y-3 text-right">
                    <LoadingSkeletonLine className="ml-auto h-16 w-28 md:h-20 md:w-36" />
                    <LoadingSkeletonLine className="ml-auto h-3 w-24" />
                  </div>
                </div>
              </div>
            </section>

            <section className="space-y-6">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <LoadingSkeletonLine className="h-12 w-full max-w-2xl" />
                <LoadingSkeletonLine className="h-12 w-32" />
              </div>

              <div className="space-y-6">
                {Array.from({ length: 3 }).map((_, index) => (
                  <div
                    key={index}
                    className="overflow-hidden border border-black/10 bg-white/70 dark:border-white/5 dark:bg-white/[0.03]"
                  >
                    <div className="flex flex-col md:flex-row">
                      <LoadingSkeletonLine className="aspect-[4/3] w-full md:w-2/5 md:aspect-auto md:min-h-[18rem]" />
                      <div className="flex-1 space-y-5 p-8 md:p-12">
                        <LoadingSkeletonLine className="h-3 w-48" />
                        <LoadingSkeletonLine className="h-10 w-full max-w-xl" />
                        <LoadingSkeletonLine className="h-4 w-full" />
                        <LoadingSkeletonLine className="h-4 w-5/6" />
                        <div className="flex gap-2 pt-2">
                          <LoadingSkeletonLine className="h-8 w-20" />
                          <LoadingSkeletonLine className="h-8 w-20" />
                          <LoadingSkeletonLine className="h-8 w-20" />
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            <div>
              <p className="text-sm font-black uppercase tracking-[0.25em] text-black/65 dark:text-white/45">
                {label}
              </p>
              <p className="mt-3 max-w-2xl text-sm font-medium leading-relaxed text-black/60 dark:text-white/45">
                {description}
              </p>
            </div>
          </div>
        ) : (
          <div className="border border-black/10 bg-white/70 p-8 md:p-12 dark:border-white/5 dark:bg-white/[0.03]">
            <div className="mb-6 flex items-center gap-4">
              <div className="h-[1px] w-12 bg-primary shadow-[0_0_8px_rgba(37,99,235,0.35)]" />
              <span className="text-[10px] font-black uppercase tracking-[0.35em] text-black/60 dark:text-white/40">
                Caricamento
              </span>
            </div>

            <LoadingSkeletonLine className="mb-4 h-10 w-full max-w-md" />
            <LoadingSkeletonLine className="mb-3 h-4 w-full max-w-2xl" />
            <LoadingSkeletonLine className="mb-8 h-4 w-full max-w-xl" />

            <p className="text-sm font-black uppercase tracking-[0.25em] text-black/65 dark:text-white/45">
              {label}
            </p>
            <p className="mt-3 max-w-2xl text-sm font-medium leading-relaxed text-black/60 dark:text-white/45">
              {description}
            </p>
          </div>
        )}
      </div>
    </section>
  );
}

export default LoadingState;
