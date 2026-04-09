import { useRef } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRightIcon } from '@heroicons/react/24/outline';
import { ProgettoData } from '../../types/supabaseTypes';
import ProjectImagePlaceholder, { getPrimaryProjectImage } from '../utils/ProjectImagePlaceholder';
import {
  metaTextClasses,
  primaryTextClasses,
  secondaryTextClasses,
} from '../utils/ColorStyles';
import { useCardParallaxHover } from '../../hooks/useCardParallaxHover';

type ProjectItemCardProps = {
  index: number;
  project: ProgettoData;
};

function ProjectItemCard({ index, project }: ProjectItemCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const imageRef = useRef<HTMLDivElement>(null);
  const primaryImage = getPrimaryProjectImage(project);
  useCardParallaxHover(cardRef, {
    childSelector: '[data-project-visual], img',
    childX: 20,
    childY: 20,
    liftY: 15,
  });

  return (
    <div
      ref={cardRef}
      className="group bg-white dark:bg-dark-surface border border-black/8 dark:border-white/5 hover:border-primary/30 transition-all duration-500 overflow-hidden relative"
      data-animate="fade-up"
      data-animate-delay={(index * 0.04).toFixed(2)}
    >
      <span className="absolute top-4 right-6 text-7xl font-black text-black/[0.04] dark:text-white/[0.04] leading-none select-none pointer-events-none font-heading tabular-nums z-0">
        {String(index + 1).padStart(2, '0')}
      </span>
      <Link to={`/progetti/${project.id}`} className="flex flex-col md:flex-row relative z-10">
        <div
          ref={imageRef}
          className="md:w-2/5 aspect-[4/3] md:aspect-auto bg-black/5 dark:bg-dark-elevated relative overflow-hidden"
        >
          {primaryImage?.url ? (
            <>
              <img
                src={primaryImage.url}
                alt={project.titolo || ''}
                data-project-visual
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
              />
              <div className="absolute inset-0 bg-gradient-to-br from-black/10 via-transparent to-primary/5 group-hover:opacity-0 transition-opacity duration-500" />
            </>
          ) : (
            <ProjectImagePlaceholder project={project} />
          )}
        </div>
        <div className="md:w-3/5 p-8 md:p-12 flex flex-col justify-between">
          <div className="space-y-5">
            <div className="flex items-center gap-3 flex-wrap">
              {project.categoria ? (
                <span className="text-[9px] font-black uppercase tracking-[0.35em] text-primary">
                  {project.categoria}
                </span>
              ) : null}
              {project.categoria && project.anno ? (
                <span className="text-black/30 dark:text-white/15 text-[9px]">·</span>
              ) : null}
              {project.anno ? (
                <span className={`text-[9px] font-black uppercase tracking-[0.3em] ${metaTextClasses}`}>
                  {project.anno}
                </span>
              ) : null}
              <span className="text-black/30 dark:text-white/15 text-[9px]">·</span>
              <span className={`text-[9px] font-black uppercase tracking-[0.3em] ${metaTextClasses}`}>
                {project.localita}
              </span>
            </div>
            <h3 className={`text-3xl lg:text-4xl font-black tracking-tighter leading-none font-heading group-hover:text-primary transition-colors duration-300 ${primaryTextClasses}`}>
              {project.titolo}
            </h3>
            <p className={`text-sm font-medium leading-relaxed line-clamp-2 ${secondaryTextClasses}`}>
              {project.descrizione}
            </p>
            {project.tecnologie && project.tecnologie.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {project.tecnologie.slice(0, 3).map((tec, techIndex) => (
                  <span
                    key={techIndex}
                    className={`text-[9px] font-black uppercase tracking-widest px-3 py-1.5 border border-black/20 dark:border-white/10 group-hover:border-primary/20 group-hover:text-primary/60 transition-all ${metaTextClasses}`}
                  >
                    {tec}
                  </span>
                ))}
              </div>
            ) : null}
          </div>
          <div className="flex items-center gap-3 mt-8 pt-6 border-t border-black/10 dark:border-white/5">
            <span className={`text-xs font-black uppercase tracking-[0.3em] group-hover:text-primary transition-colors ${metaTextClasses}`}>
              Scopri il progetto
            </span>
            <ArrowRightIcon className={`w-4 h-4 group-hover:text-primary group-hover:translate-x-2 transition-all ${metaTextClasses}`} />
          </div>
        </div>
      </Link>
    </div>
  );
}

export default ProjectItemCard;
