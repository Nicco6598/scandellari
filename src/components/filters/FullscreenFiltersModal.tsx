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
  ariaLabel: string;
  isOpen: boolean;
  onClose: () => void;
  onSelect: (optionId: string) => void;
  sections: FullscreenFilterSection[];
  title?: string;
};

function FullscreenFiltersModal({
  ariaLabel,
  isOpen,
  onClose,
  onSelect,
  sections,
  title = 'Filtri',
}: FullscreenFiltersModalProps) {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-[100] flex flex-col bg-stone-50 p-6 dark:bg-black"
      role="dialog"
      aria-modal="true"
      aria-label={ariaLabel}
    >
      <div className="flex justify-between items-center mb-12">
        <span className="text-xs font-black uppercase tracking-[0.4em]">
          {title}
        </span>
        <button type="button" onClick={onClose} aria-label="Chiudi filtri">
          <XMarkIcon className="w-8 h-8" />
        </button>
      </div>

      <div className="flex-grow overflow-y-auto space-y-12">
        {sections.map((section, sectionIndex) => (
          <div key={`${section.title ?? 'section'}-${sectionIndex}`} className="space-y-6">
            {section.title ? (
              <p className={`text-[10px] font-black uppercase tracking-[0.35em] ${metaTextClasses}`}>
                {section.title}
              </p>
            ) : null}

            <div className="space-y-5">
              {section.options.map((option) => (
                <button
                  key={option.id}
                  type="button"
                  onClick={() => {
                    onSelect(option.id);
                    onClose();
                  }}
                  className={`w-full text-left flex items-end justify-between gap-4 ${
                    option.isActive ? 'text-primary' : primaryTextClasses
                  }`}
                >
                  <span className="text-3xl font-black tracking-tighter">
                    {option.label}
                  </span>
                  {typeof option.count === 'number' ? (
                    <span className={`text-base font-black tabular-nums ${option.isActive ? 'opacity-60' : metaTextClasses}`}>
                      {option.count}
                    </span>
                  ) : null}
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default FullscreenFiltersModal;
