import { XMarkIcon } from '@heroicons/react/24/outline';
import { metaTextClasses, primaryTextClasses } from '../utils/ColorStyles';

export type FullscreenFilterOption = {
  count?: number;
  id: string;
  isActive: boolean;
  label: string;
};

export type FullscreenFilterSection = {
  options: FullscreenFilterOption[];
  title?: string;
};

type FullscreenFiltersModalProps = {
  actionDisabled?: boolean;
  actionLabel?: string;
  ariaLabel: string;
  description?: string;
  isOpen: boolean;
  onAction?: () => void;
  onClose: () => void;
  onPrimaryAction?: () => void;
  onSelect: (optionId: string) => void;
  primaryActionDisabled?: boolean;
  primaryActionLabel?: string;
  sections: FullscreenFilterSection[];
  statusLabel?: string;
  summaryTags?: string[];
  title?: string;
};

function FullscreenFiltersModal({
  actionDisabled = false,
  actionLabel,
  ariaLabel,
  description,
  isOpen,
  onAction,
  onClose,
  onPrimaryAction,
  onSelect,
  primaryActionDisabled = false,
  primaryActionLabel,
  sections,
  statusLabel,
  summaryTags,
  title = 'Filtri',
}: FullscreenFiltersModalProps) {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-[100] flex flex-col overflow-x-hidden bg-stone-50 p-6 dark:bg-black"
      role="dialog"
      aria-modal="true"
      aria-label={ariaLabel}
    >
      <div className="mb-12">
        <div className="flex justify-between items-center gap-4">
          <span className="text-xs font-black uppercase tracking-[0.4em]">
            {title}
          </span>
          <button type="button" onClick={onClose} aria-label="Chiudi filtri">
            <XMarkIcon className="w-8 h-8" />
          </button>
        </div>

        {description ? (
          <p className={`mt-4 max-w-sm text-sm font-medium leading-relaxed ${metaTextClasses}`}>
            {description}
          </p>
        ) : null}

        {(statusLabel || (actionLabel && onAction)) ? (
          <div className="mt-6 flex items-center justify-between gap-4">
            {statusLabel ? (
              <span className={`text-[10px] font-black uppercase tracking-[0.3em] ${metaTextClasses}`}>
                {statusLabel}
              </span>
            ) : <span />}
            {actionLabel && onAction ? (
              <button
                type="button"
                onClick={onAction}
                disabled={actionDisabled}
                className="border border-red-500/30 bg-red-500/8 px-4 py-3 text-[10px] font-black uppercase tracking-[0.28em] text-red-600 transition-colors hover:border-red-500 hover:bg-red-500 hover:text-white disabled:opacity-40 disabled:hover:border-red-500/30 disabled:hover:bg-red-500/8 disabled:hover:text-red-600 dark:text-red-400 dark:hover:text-white"
              >
                {actionLabel}
              </button>
            ) : null}
          </div>
        ) : null}

        {summaryTags?.length ? (
          <div className="mt-5 flex flex-wrap gap-2">
            {summaryTags.map((tag) => (
              <span
                key={tag}
                className="inline-flex items-center border border-primary/20 bg-primary/10 px-3 py-2 text-[10px] font-black uppercase tracking-[0.22em] text-primary"
              >
                {tag}
              </span>
            ))}
          </div>
        ) : null}
      </div>

      <div className="flex-grow overflow-y-auto overflow-x-hidden space-y-12">
        {sections.map((section, sectionIndex) => (
          <div key={`${section.title ?? 'section'}-${sectionIndex}`} className="space-y-6">
            {section.title ? (
              <p className={`text-[10px] font-black uppercase tracking-[0.35em] ${metaTextClasses}`}>
                {section.title}
              </p>
            ) : null}

            <div className="space-y-5">
              {section.options.map((option, optionIndex) => (
                <div
                  key={option.id}
                  className="relative pb-5 last:pb-0"
                >
                  <button
                    type="button"
                    onClick={() => {
                      onSelect(option.id);
                    }}
                    className={`flex w-full min-w-0 items-end justify-between gap-4 text-left ${
                      option.isActive ? 'text-primary' : primaryTextClasses
                    }`}
                  >
                    <span className="min-w-0 text-3xl font-black tracking-tighter">
                      {option.label}
                    </span>
                    {typeof option.count === 'number' ? (
                      <span className={`shrink-0 text-base font-black tabular-nums ${option.isActive ? 'opacity-60' : metaTextClasses}`}>
                        {option.count}
                      </span>
                    ) : null}
                  </button>

                  {optionIndex < section.options.length - 1 ? (
                    <div className="pointer-events-none absolute bottom-0 left-0 h-px w-full bg-gradient-to-r from-black/28 via-black/20 to-transparent dark:from-white/30 dark:via-white/22 dark:to-transparent" />
                  ) : null}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {primaryActionLabel && onPrimaryAction ? (
        <div className="mt-8 border-t border-black/10 pt-6 dark:border-white/10">
          <button
            type="button"
            onClick={onPrimaryAction}
            disabled={primaryActionDisabled}
            className="w-full bg-black px-6 py-4 text-[11px] font-black uppercase tracking-[0.32em] text-white transition-colors hover:bg-primary disabled:opacity-40 disabled:hover:bg-black dark:bg-white dark:text-black dark:hover:bg-primary dark:hover:text-white dark:disabled:hover:bg-white dark:disabled:hover:text-black"
          >
            {primaryActionLabel}
          </button>
        </div>
      ) : null}
    </div>
  );
}

export default FullscreenFiltersModal;
