import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { competenzeService } from '../../supabase/services';
import { logger } from '../../utils/logger';
import { CompetenzaData } from '../../types/supabaseTypes';
import { ArrowRightIcon } from '@heroicons/react/24/outline';
import gsap from 'gsap';
import LoadingState from '../utils/LoadingState';
import { metaTextClasses, primaryTextClasses, secondaryTextClasses } from '../utils/ColorStyles';

type ServiceCardProps = {
  service: CompetenzaData;
  index: number;
};

const FEATURED_SERVICE_TITLES = [
  'Manovre Oleodinamiche in Traversa (MOT)',
  'Sistemi Oleodinamici Ferroviari',
  'Impianti Diffusione Sonora',
  'Impianti S.C.M.T.'
] as const;

// ─── Service Card with Micro-interactions ──────────────────────────────────
function ServiceCard({ service, index }: ServiceCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const iconRef = useRef<HTMLDivElement>(null);

  const isSpecialization = service.titolo?.includes('MOT') || service.titolo?.includes('Oleodinamici Ferroviari');

  useEffect(() => {
    const card = cardRef.current;
    const icon = iconRef.current;
    if (!card || !icon) return;

    const handleMouseMove = (e: MouseEvent) => {
      const rect = card.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width - 0.5;
      const y = (e.clientY - rect.top) / rect.height - 0.5;

      gsap.to(card, {
        y: y * -10,
        duration: 0.3,
        ease: 'power2.out'
      });

      gsap.to(icon, {
        x: x * 20,
        y: y * 20,
        duration: 0.4,
        ease: 'power2.out'
      });
    };

    const handleMouseLeave = () => {
      gsap.to(card, { y: 0, duration: 0.5, ease: 'elastic.out(1, 0.5)' });
      gsap.to(icon, { x: 0, y: 0, duration: 0.5, ease: 'elastic.out(1, 0.5)' });
    };

    card.addEventListener('mousemove', handleMouseMove);
    card.addEventListener('mouseleave', handleMouseLeave);

    return () => {
      card.removeEventListener('mousemove', handleMouseMove);
      card.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, []);

  return (
    <div
      ref={cardRef}
      className={`group ${isSpecialization ? 'bg-white dark:bg-dark-surface' : 'bg-white dark:bg-black'}`}
    >
      <Link
        to={`/competenze`}
        className={`block p-12 space-y-12 h-full transition-all duration-300 relative ${isSpecialization
            ? 'bg-primary/5 hover:bg-primary/10 dark:bg-primary/10 dark:hover:bg-primary/20'
            : 'hover:bg-gray-100 dark:hover:bg-dark-surface'
          }`}
      >
        {isSpecialization && (
          <div className="absolute top-6 right-6">
            <span className="text-[10px] font-black uppercase tracking-[0.3em] text-white bg-primary dark:bg-primary-dark px-3 py-1.5 border border-primary/30">
              Competenze
            </span>
          </div>
        )}

        <div ref={iconRef} className={`text-xs font-black uppercase tracking-[0.4em] ${metaTextClasses}`}>0{index + 1} /</div>

        <div className="space-y-6">
          <h3 className={`text-3xl font-black tracking-tight leading-none font-heading group-hover:text-primary transition-colors ${primaryTextClasses}`}>
            {service.titolo}
          </h3>
          <p className={`text-base leading-relaxed font-medium ${secondaryTextClasses}`}>
            {service.descrizioneBreve}
          </p>
        </div>

        <div className="flex items-center gap-3 mt-2">
          <span className={`text-xs font-black uppercase tracking-[0.3em] group-hover:text-primary transition-colors ${metaTextClasses}`}>
            Scopri
          </span>
          <ArrowRightIcon className={`w-5 h-5 group-hover:text-primary group-hover:translate-x-2 transition-all ${metaTextClasses}`} />
        </div>
      </Link>
    </div>
  );
}

function Services() {
  const [services, setServices] = useState<CompetenzaData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchServices = async () => {
      try {
        const data = await competenzeService.getAllCompetenze();
        const featuredServices = FEATURED_SERVICE_TITLES.flatMap((title) => {
          const service = data.find((competenza) => competenza.titolo === title);
          return service ? [service] : [];
        });

        setServices(featuredServices);
      } catch (err) {
        logger.error('❌ Error fetching services:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchServices();
  }, []);

  if (loading) {
    return (
      <LoadingState
        variant="section"
        label="Ambiti d'azione"
        description="Stiamo caricando le competenze in evidenza."
      />
    );
  }

  return (
    <section id="services" className="py-24 md:py-48 bg-stone-50 dark:bg-black">
      <div className="container mx-auto px-6 max-w-7xl">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-12 mb-32 border-b border-black/5 dark:border-white/5 pb-20">
          <div className="max-w-2xl">
            <div className="space-y-8" data-animate="fade-up" data-animate-distance="20">
              <div className="flex items-center gap-4">
                <div className="w-12 h-[1px] bg-primary shadow-[0_0_8px_rgba(37,99,235,0.5)]" />
                <span className={`text-[10px] font-black uppercase tracking-[0.4em] ${metaTextClasses}`}>
                  Engineering & Solutions
                </span>
              </div>
              <h2 className="text-6xl md:text-8xl lg:text-9xl font-black text-black dark:text-white tracking-tighter leading-[0.8] font-heading">
                Ambiti d'azione
              </h2>
            </div>
          </div>
          <div className="flex flex-col gap-8 md:text-right">
            <p className={`text-base md:text-lg max-w-xs font-medium leading-relaxed md:ml-auto ${secondaryTextClasses}`}>
              Dalla progettazione alla manutenzione, forniamo sistemi intelligenti per la mobilità nazionale su rotaia.
            </p>
            <Link
              to="/competenze"
              className={`text-[10px] font-black uppercase tracking-[0.3em] hover:text-black dark:hover:text-white transition-colors group flex items-center gap-4 md:justify-end ${metaTextClasses}`}
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
          {services.map((service, index) => (
            <ServiceCard key={service.id} service={service} index={index} />
          ))}
        </div>
      </div>
    </section>
  );
}

export default Services;
