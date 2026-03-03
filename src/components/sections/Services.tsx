import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { competenzeService } from '../../supabase/services';
import { logger } from '../../utils/logger';
import { CompetenzaData } from '../../types/supabaseTypes';
import { ArrowRightIcon } from '@heroicons/react/24/outline';

const Services: React.FC = () => {
  const [services, setServices] = useState<CompetenzaData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchServices = async () => {
      try {
        const data = await competenzeService.getAllCompetenze();

        // Select the 4 specific featured competenze matching old website
        const featuredTitles = [
          'Manovre Oleodinamiche in Traversa (MOT)',
          'Sistemi Oleodinamici Ferroviari',
          'Impianti Diffusione Sonora',
          'Impianti S.C.M.T.'
        ];

        // Filter to get only these specific ones in the order we want
        const featured = featuredTitles
          .map(title => data.find(comp => comp.titolo === title))
          .filter(comp => comp !== undefined) as CompetenzaData[];

        setServices(featured);
      } catch (err) {
        logger.error('❌ Error fetching services:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchServices();
  }, []);

  if (loading) return null;

  return (
    <section id="services" className="py-24 md:py-48 bg-gray-50 dark:bg-black">
      <div className="container mx-auto px-6 max-w-7xl">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-12 mb-32 border-b border-black/5 dark:border-white/5 pb-20">
          <div className="max-w-2xl">
            <div className="space-y-8" data-animate="fade-up" data-animate-distance="20">
              <div className="flex items-center gap-4">
                <div className="w-12 h-[1px] bg-primary shadow-[0_0_8px_rgba(37,99,235,0.5)]" />
                <span className="text-[10px] font-black uppercase tracking-[0.4em] text-black/70 dark:text-white/60">
                  Engineering & Solutions
                </span>
              </div>
              <h2 className="text-6xl md:text-8xl lg:text-9xl font-black text-black dark:text-white tracking-tighter leading-[0.8] font-heading">
                Ambiti d'azione
              </h2>
            </div>
          </div>
          <div className="flex flex-col gap-8 md:text-right">
            <p className="text-base md:text-lg text-black/70 dark:text-white/60 max-w-xs font-medium leading-relaxed md:ml-auto">
              Dalla progettazione alla manutenzione, forniamo sistemi intelligenti per la mobilità nazionale su rotaia.
            </p>
            <Link
              to="/competenze"
              className="text-[10px] font-black uppercase tracking-[0.3em] text-black/70 dark:text-white/60 hover:text-black dark:hover:text-white transition-colors group flex items-center gap-4 md:justify-end"
            >
              Esplora Competenze
              <ArrowRightIcon className="w-5 h-5 transition-transform group-hover:translate-x-2 text-primary" />
            </Link>
          </div>
        </div>

        {/* Services Grid - 2x2 layout */}
        <div 
          data-animate-stagger
          className="grid md:grid-cols-2 gap-px bg-gradient-to-br from-black/5 via-black/5 to-primary/5 dark:from-white/5 dark:via-white/5 dark:to-primary/10 border border-black/5 dark:border-white/5"
        >
          {services.map((service, index) => {
            // Check if this is a core specialization (MOT or Oleodinamici Ferroviari)
            const isSpecialization = service.titolo?.includes('MOT') || service.titolo?.includes('Oleodinamici Ferroviari');

            return (
              <div
                key={service.id}
                className={`group ${isSpecialization ? 'bg-white dark:bg-dark-surface' : 'bg-white dark:bg-black'}`}
              >
                <Link
                  to={`/competenze`}
                  className={`block p-12 space-y-12 h-full transition-all duration-300 relative ${isSpecialization
                      ? 'bg-primary/5 hover:bg-primary/10 dark:bg-primary/10 dark:hover:bg-primary/20'
                      : 'hover:bg-gray-100 dark:hover:bg-dark-surface'
                    }`}
                >
                  {/* Special badge for core specializations */}
                  {isSpecialization && (
                    <div className="absolute top-6 right-6">
                      <span className="text-[8px] font-black uppercase tracking-[0.3em] text-primary bg-primary/10 dark:bg-primary/20 px-3 py-1.5 border border-primary/30">
                        Competenze
                      </span>
                    </div>
                  )}

                  <div className="text-xs font-black text-black/50 dark:text-white/40 uppercase tracking-[0.4em]">0{index + 1} /</div>

                  <div className="space-y-6">
                    <h3 className="text-3xl font-black text-black dark:text-white tracking-tight leading-none font-heading group-hover:text-primary transition-colors">
                      {service.titolo}
                    </h3>
                    <p className="text-base text-black/70 dark:text-white/60 leading-relaxed font-medium">
                      {service.descrizioneBreve}
                    </p>
                  </div>

                  <div className="flex items-center gap-3 mt-2">
                    <span className="text-xs font-black uppercase tracking-[0.3em] text-black/60 dark:text-white/50 group-hover:text-primary transition-colors">
                      Scopri
                    </span>
                    <ArrowRightIcon className="w-5 h-5 text-black/60 dark:text-white/50 group-hover:text-primary group-hover:translate-x-2 transition-all" />
                  </div>
                </Link>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default Services;
