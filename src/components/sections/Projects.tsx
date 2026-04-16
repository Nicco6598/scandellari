import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRightIcon } from '@heroicons/react/24/outline';
import { publicProgettiService } from '../../supabase/publicData';
import { logger } from '../../utils/logger';
import { ProgettoData } from '../../types/supabaseTypes';
import LoadingState from '../utils/LoadingState';
import ProjectItemCard from '../projects/ProjectItemCard';
import { metaTextClasses, secondaryTextClasses } from '../utils/ColorStyles';

const FEATURED_PROJECT_LIMIT = 4;

function Projects() {
  const [projects, setProjects] = useState<ProgettoData[]>([]);
  const [totalProjects, setTotalProjects] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isActive = true;

    const fetchProjects = async () => {
      try {
        const [featuredProjects, projectsCount] = await Promise.all([
          publicProgettiService.getFeaturedProjects(FEATURED_PROJECT_LIMIT),
          publicProgettiService.getProjectsCount(),
        ]);

        if (!isActive) return;
        setProjects(featuredProjects);
        setTotalProjects(projectsCount);
      } catch (err) {
        logger.error('Fetch error', err);
      } finally {
        if (isActive) {
          setLoading(false);
        }
      }
    };

    void fetchProjects();

    return () => {
      isActive = false;
    };
  }, []);

  if (loading) {
    return (
      <LoadingState
        variant="section"
        label="Progetti"
        description="Stiamo caricando i lavori più rappresentativi."
      />
    );
  }

  return (
    <section id="projects" className="overflow-hidden bg-stone-50 py-24 dark:bg-black md:py-48">
      <div className="container mx-auto max-w-7xl px-6">
        <div className="mb-20 flex flex-col justify-between gap-12 border-b border-black/5 pb-20 dark:border-white/5 md:mb-24 md:flex-row md:items-end">
          <div className="max-w-2xl">
            <div className="space-y-8" data-animate="fade-up" data-animate-distance="20">
              <div className="flex items-center gap-4">
                <div className="h-[1px] w-12 bg-primary shadow-[0_0_8px_rgba(37,99,235,0.5)]" />
                <span className={`text-[10px] font-black uppercase tracking-[0.4em] ${metaTextClasses}`}>
                  Portfolio & Expertise
                </span>
              </div>
              <h2 className="font-heading text-6xl font-black leading-[0.8] tracking-tighter text-black dark:text-white md:text-8xl lg:text-9xl">
                Progetti
              </h2>
            </div>
          </div>
          <div className="flex flex-col gap-8 md:text-right">
            <p className={`max-w-xs text-base font-medium leading-relaxed md:ml-auto md:text-lg ${secondaryTextClasses}`}>
              Una selezione di cantieri e installazioni che sintetizza il nostro approccio operativo su reti, stazioni e sistemi ferroviari.
            </p>
            <Link
              to="/progetti"
              className={`group flex items-center gap-4 text-[10px] font-black uppercase tracking-[0.3em] transition-colors hover:text-black dark:hover:text-white md:justify-end ${metaTextClasses}`}
            >
              Tutti i Progetti{totalProjects > 0 ? ` (${totalProjects})` : ''}
              <ArrowRightIcon className="h-5 w-5 text-primary transition-transform group-hover:translate-x-2" />
            </Link>
          </div>
        </div>

        {projects.length > 0 ? (
          <div aria-label="Progetti in evidenza" className="space-y-6 md:space-y-8">
            {projects.map((project, index) => (
              <ProjectItemCard key={project.id} index={index} project={project} />
            ))}
          </div>
        ) : (
          <div className="border border-black/8 px-8 py-16 text-center dark:border-white/6">
            <p className={`text-[10px] font-black uppercase tracking-[0.35em] ${metaTextClasses}`}>
              Portfolio in aggiornamento
            </p>
            <p className={`mx-auto mt-4 max-w-xl text-sm font-medium leading-relaxed md:text-base ${secondaryTextClasses}`}>
              Nessun progetto in evidenza disponibile in questo momento.
            </p>
          </div>
        )}
      </div>
    </section>
  );
}

export default Projects;
