import { MagnifyingGlassIcon } from '@heroicons/react/24/outline';
import { ProgettoData } from '../../types/supabaseTypes';
import { metaTextClasses } from '../utils/ColorStyles';
import ProjectItemCard from './ProjectItemCard';

type ProjectsListProps = {
  activeCategory: string;
  onResetFilters: () => void;
  projects: ProgettoData[];
};

function ProjectsList({ activeCategory, onResetFilters, projects }: ProjectsListProps) {
  if (projects.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-32 gap-6 text-center">
        <MagnifyingGlassIcon className="w-10 h-10 text-black/40 dark:text-white/15" />
        <div>
          <p className={`text-sm font-black uppercase tracking-widest mb-2 ${metaTextClasses}`}>
            Nessun progetto trovato
          </p>
          <p className={`text-xs font-medium ${metaTextClasses}`}>
            {activeCategory === 'tutti'
              ? 'Non ci sono opere disponibili in questo momento.'
              : 'Nessuna opera in questa categoria.'}
          </p>
        </div>
        <button
          onClick={onResetFilters}
          className="text-[10px] font-black uppercase tracking-widest text-primary border border-primary/30 px-6 py-3 hover:bg-primary hover:text-white transition-all"
        >
          Vedi tutti i progetti
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {projects.map((project, index) => (
        <ProjectItemCard key={project.id} project={project} index={index} />
      ))}
    </div>
  );
}

export default ProjectsList;
