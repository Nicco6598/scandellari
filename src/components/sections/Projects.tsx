import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRightIcon } from '@heroicons/react/24/outline';
import { progettiService } from '../../supabase/services';
import { ProgettoData } from '../../types/supabaseTypes';

const Projects: React.FC = () => {
  const [projects, setProjects] = useState<ProgettoData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const data = await progettiService.getAllProjects();
        setProjects(data.slice(0, 4));
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchProjects();
  }, []);

  if (loading) return null;

  return (
    <section id="projects" className="py-24 md:py-48 bg-gray-50 dark:bg-black overflow-hidden">
      <div className="container mx-auto px-6 max-w-7xl">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-12 mb-32 border-b border-black/5 dark:border-white/5 pb-20">
          <div className="max-w-2xl">
            <div className="space-y-8" data-animate="fade-up" data-animate-distance="20">
              <div className="flex items-center gap-4">
                <div className="w-12 h-[1px] bg-primary shadow-[0_0_8px_rgba(37,99,235,0.5)]" />
                <span className="text-[10px] font-black uppercase tracking-[0.4em] text-black/70 dark:text-white/60">
                  Portfolio & Expertise
                </span>
              </div>
              <h2 className="text-6xl md:text-8xl lg:text-9xl font-black text-black dark:text-white tracking-tighter leading-[0.8] font-heading">
                Progetti
              </h2>
            </div>
          </div>
          <Link
            to="/progetti"
            className="text-[10px] font-black uppercase tracking-[0.3em] text-black/70 dark:text-white/60 hover:text-black dark:hover:text-white transition-colors group flex items-center gap-4"
          >
            Tutti i Progetti
            <ArrowRightIcon className="w-5 h-5 transition-transform group-hover:translate-x-2 text-primary" />
          </Link>
        </div>

        {/* Projects Grid */}
        <div 
          data-animate-stagger
          className="grid md:grid-cols-2 gap-x-24 gap-y-32"
        >
          {projects.map((project, index) => (
            <div
              key={project.id}
              className="group"
            >
              <Link to={`/progetti/${project.id}`} className="block space-y-10">
                <div className="aspect-[4/5] md:aspect-[16/10] overflow-hidden bg-gray-100 dark:bg-dark-surface relative border border-black/5 dark:border-white/5 group-hover:border-primary/30 transition-all duration-700" data-animate="scale">
                  {project.immagini && project.immagini[0]?.url ? (
                    <img
                      src={project.immagini[0].url}
                      alt={project.titolo ?? ''}
                      data-parallax="0.1"
                      className="w-full h-full object-cover grayscale transition-all duration-1000 group-hover:grayscale-0 group-hover:scale-110"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-[10px] font-black uppercase tracking-widest opacity-20">Image Placeholder</div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-br from-black/10 via-transparent to-primary/5 opacity-60 group-hover:opacity-0 transition-opacity duration-700" />
                </div>

                <div className="flex flex-col gap-6">
                  <div className="flex items-center gap-4">
                    <span className="text-[10px] font-black text-primary uppercase tracking-[0.3em]">{project.anno}</span>
                    <div className="w-8 h-[1px] bg-black/10 dark:bg-white/10" />
                    <span className="text-[10px] font-black text-black/60 dark:text-white/50 uppercase tracking-[0.3em]">{project.localita}</span>
                  </div>
                  <h3 className="text-4xl lg:text-5xl font-black text-black dark:text-white tracking-tighter leading-none font-heading group-hover:text-primary transition-colors duration-300">
                    {project.titolo}
                  </h3>
                  <p className="text-base text-black/70 dark:text-white/60 font-medium leading-relaxed line-clamp-2 max-w-xl">
                    {project.descrizione}
                  </p>
                  <div className="flex items-center gap-3 pt-2">
                    <span className="text-[10px] font-black uppercase tracking-[0.3em] text-black/60 dark:text-white/50 group-hover:text-primary transition-colors">
                      Scopri Progetto
                    </span>
                    <ArrowRightIcon className="w-5 h-5 text-primary group-hover:translate-x-2 transition-all duration-300" />
                  </div>
                </div>
              </Link>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Projects;
