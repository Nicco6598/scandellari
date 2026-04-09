import {
  FunnelIcon,
  ListBulletIcon,
  MapIcon,
} from '@heroicons/react/24/outline';
import { metaTextClasses } from '../utils/ColorStyles';

type ProjectsToolbarProps = {
  activeCategory: string;
  categoryCounts: Record<string, number>;
  categories: string[];
  onOpenMobileFilters: () => void;
  onSelectCategory: (category: string) => void;
  onSelectView: (view: 'lista' | 'mappa') => void;
  view: 'lista' | 'mappa';
};

function ProjectsToolbar({
  activeCategory,
  categories,
  categoryCounts,
  onOpenMobileFilters,
  onSelectCategory,
  onSelectView,
  view,
}: ProjectsToolbarProps) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 mb-16">
      <div className="hidden sm:flex bg-black/5 dark:bg-white/5 p-1 overflow-x-auto no-scrollbar">
        {categories.map((category) => (
          <button
            key={category}
            onClick={() => onSelectCategory(category)}
            className={`px-5 py-3 text-xs font-black uppercase tracking-widest whitespace-nowrap transition-all flex items-center gap-2 ${activeCategory === category
              ? 'bg-black dark:bg-white text-white dark:text-black'
              : `${metaTextClasses} hover:text-black dark:hover:text-white`
              }`}
          >
            {category === 'tutti' ? 'Tutti' : category}
            <span className={`text-[9px] tabular-nums transition-all ${activeCategory === category ? 'opacity-60' : 'opacity-40'}`}>
              {categoryCounts[category] ?? 0}
            </span>
          </button>
        ))}
      </div>

      <button
        onClick={onOpenMobileFilters}
        className="sm:hidden flex items-center justify-center gap-2 px-6 py-3 border border-black/20 dark:border-white/20 text-[10px] font-black uppercase tracking-widest hover:bg-black dark:hover:bg-white hover:text-white dark:hover:text-black transition-all"
      >
        <FunnelIcon className="w-4 h-4" />
        {activeCategory === 'tutti' ? 'Filtri' : activeCategory}
      </button>

      <div className="flex items-center gap-3 shrink-0">
        <div className="flex bg-black/5 dark:bg-white/5 p-1">
          <button
            onClick={() => onSelectView('lista')}
            className={`flex items-center gap-2 px-5 py-3 text-[10px] font-black uppercase tracking-widest transition-all ${view === 'lista'
              ? 'bg-black dark:bg-white text-white dark:text-black shadow-lg'
              : `${metaTextClasses} hover:text-black dark:hover:text-white`
              }`}
          >
            <ListBulletIcon className="w-4 h-4" />
            <span className="hidden md:inline">Lista</span>
          </button>
          <button
            onClick={() => onSelectView('mappa')}
            className={`flex items-center gap-2 px-5 py-3 text-[10px] font-black uppercase tracking-widest transition-all ${view === 'mappa'
              ? 'bg-black dark:bg-white text-white dark:text-black shadow-lg'
              : `${metaTextClasses} hover:text-black dark:hover:text-white`
              }`}
          >
            <MapIcon className="w-4 h-4" />
            <span className="hidden md:inline">Mappa</span>
          </button>
        </div>
      </div>
    </div>
  );
}

export default ProjectsToolbar;
