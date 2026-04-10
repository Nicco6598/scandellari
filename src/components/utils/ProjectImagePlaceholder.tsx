import { PhotoIcon } from '@heroicons/react/24/outline';
import { ProgettoData } from '../../types/supabaseTypes';

type ProjectImagePlaceholderProps = {
  project: Pick<ProgettoData, 'titolo' | 'categoria' | 'localita' | 'anno'>;
  variant?: 'card' | 'feature';
  className?: string;
};

const variantClasses = {
  card: {
    shell: 'p-6 md:p-8',
    monogram: 'text-6xl md:text-7xl',
    title: 'text-lg md:text-xl',
    footer: 'gap-3'
  },
  feature: {
    shell: 'p-8 md:p-12',
    monogram: 'text-7xl md:text-8xl lg:text-9xl',
    title: 'text-2xl md:text-3xl',
    footer: 'gap-4'
  }
} as const;

function toMonogram(title?: string) {
  const words = (title || 'Progetto')
    .split(/\s+/)
    .map((word) => word.trim())
    .filter(Boolean);

  return words
    .slice(0, 2)
    .map((word) => word[0]?.toUpperCase() ?? '')
    .join('')
    .slice(0, 2) || 'PR';
}

function clampLabel(value: string | undefined, fallback: string, maxLength: number) {
  if (!value) return fallback;
  return value.length > maxLength ? `${value.slice(0, maxLength - 1)}...` : value;
}

export function getPrimaryProjectImage(project: Pick<ProgettoData, 'immagini'>) {
  return project.immagini?.find((image) => Boolean(image?.url)) ?? null;
}

function ProjectImagePlaceholder({
  project,
  variant = 'card',
  className = ''
}: ProjectImagePlaceholderProps) {
  const styles = variantClasses[variant];
  const title = clampLabel(project.titolo, 'Progetto in evidenza', variant === 'feature' ? 52 : 36);
  const category = clampLabel(project.categoria, 'Infrastruttura', 22);
  const location = clampLabel(project.localita, 'Italia', 28);
  const year = clampLabel(project.anno, 'Archivio', 12);
  const monogram = toMonogram(project.titolo);

  return (
    <div
      className={`relative isolate h-full w-full overflow-hidden bg-[linear-gradient(135deg,rgba(255,255,255,0.96),rgba(241,245,249,0.92),rgba(219,234,254,0.82))] dark:bg-[linear-gradient(135deg,rgba(2,6,23,1),rgba(10,15,30,0.99),rgba(18,30,56,0.98))] ${className}`}
      aria-label={`Anteprima placeholder del progetto ${project.titolo || ''}`.trim()}
    >
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(37,99,235,0.22),transparent_38%),radial-gradient(circle_at_bottom_left,rgba(14,165,233,0.12),transparent_42%)] dark:bg-[radial-gradient(circle_at_top_right,rgba(96,165,250,0.38),transparent_30%),radial-gradient(circle_at_bottom_left,rgba(56,189,248,0.16),transparent_40%)]" />
      <div className="absolute inset-0 opacity-60 dark:opacity-50 [background-image:linear-gradient(to_right,rgba(15,23,42,0.06)_1px,transparent_1px),linear-gradient(to_bottom,rgba(15,23,42,0.06)_1px,transparent_1px)] dark:[background-image:linear-gradient(to_right,rgba(255,255,255,0.1)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.1)_1px,transparent_1px)] [background-size:34px_34px]" />
      <div className="absolute inset-y-0 right-0 w-px bg-black/10 dark:bg-white/15" />
      <div className="absolute right-4 top-4 h-16 w-16 border border-primary/20 dark:border-primary/45" />
      <div className={`absolute bottom-4 right-4 font-black tracking-[-0.08em] text-black/[0.05] dark:text-white/[0.1] ${styles.monogram}`}>
        {monogram}
      </div>

      <div
        data-project-visual
        className={`relative z-10 flex h-full w-full flex-col justify-between ${styles.shell}`}
      >
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="h-px w-10 bg-primary/70 shadow-[0_0_12px_rgba(37,99,235,0.35)]" />
            <span className="rounded-full border border-black/10 bg-white/70 px-3 py-1 text-[10px] font-black uppercase tracking-[0.34em] text-black/75 shadow-sm backdrop-blur-sm dark:border-primary-light/40 dark:bg-black/35 dark:text-primary-lighter dark:shadow-[0_0_0_1px_rgba(147,197,253,0.12)]">
              {year}
            </span>
          </div>
          <div className="flex h-10 w-10 items-center justify-center border border-black/10 bg-white/55 text-black/55 backdrop-blur-sm dark:border-white/20 dark:bg-white/10 dark:text-white/70">
            <PhotoIcon className="h-4 w-4" />
          </div>
        </div>

        <div className="space-y-5">
          <div className="inline-flex max-w-full items-center border border-black/10 bg-white/65 px-3 py-1.5 backdrop-blur-sm dark:border-primary-light/60 dark:bg-primary/22 dark:shadow-[0_0_0_1px_rgba(96,165,250,0.18)]">
            <span className="truncate text-[10px] font-black uppercase tracking-[0.28em] text-primary dark:text-white">
              {category}
            </span>
          </div>

          <div className={`max-w-[26rem] font-black tracking-tighter leading-[0.9] text-black dark:text-white ${styles.title}`}>
            {title}
          </div>

          <div className={`flex flex-wrap items-center text-[10px] font-black uppercase tracking-[0.3em] text-black/55 dark:text-white/65 ${styles.footer}`}>
            <span>{location}</span>
            <span className="h-1 w-1 rounded-full bg-primary/70 dark:bg-primary-lighter" />
            <span className="dark:text-white/78">Anteprima in arrivo</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ProjectImagePlaceholder;
