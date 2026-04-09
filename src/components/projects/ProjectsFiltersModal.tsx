import { XMarkIcon } from '@heroicons/react/24/outline';
import { metaTextClasses } from '../utils/ColorStyles';

type ProjectsFiltersModalProps = {
  activeCategory: string;
  categoryCounts: Record<string, number>;
  categories: string[];
  isOpen: boolean;
  onClose: () => void;
  onSelectCategory: (category: string) => void;
};

function ProjectsFiltersModal({
  activeCategory,
  categories,
  categoryCounts,
  isOpen,
  onClose,
  onSelectCategory,
}: ProjectsFiltersModalProps) {
  return (
    <div
      className={`fixed inset-0 z-[100] bg-white dark:bg-black p-6 flex flex-col transition-opacity duration-300 ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
      aria-hidden={!isOpen}
    >
      <div className="flex justify-between items-center mb-12">
        <span className="text-xs font-black uppercase tracking-[0.4em]">Filtri</span>
        <button onClick={onClose}>
          <XMarkIcon className="w-8 h-8" />
        </button>
      </div>
      <div className="flex-grow flex flex-col gap-8">
        {categories.map((category) => (
          <button
            key={category}
            onClick={() => {
              onSelectCategory(category);
              onClose();
            }}
            className={`text-3xl font-black tracking-tighter text-left flex items-center gap-4 ${activeCategory === category ? 'text-primary' : metaTextClasses}`}
          >
            {category === 'tutti' ? 'Tutti i Progetti' : category}
            <span className="text-base font-black opacity-50 tabular-nums">
              {categoryCounts[category] ?? 0}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}

export default ProjectsFiltersModal;
