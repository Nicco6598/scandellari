import { useEffect, useLayoutEffect, useMemo, useRef, useState, useTransition } from 'react';
import Layout from '../components/layout/Layout';
import SEO from '../components/utils/SEO';
import { logger } from '../utils/logger';
import { publicOfferteService } from '../supabase/publicData';
import { OffertaLavoroData } from '../types/supabaseTypes';
import {
  AcademicCapIcon,
  ArrowRightIcon,
  BriefcaseIcon,
  BuildingOffice2Icon,
  CheckCircleIcon,
  ClipboardDocumentCheckIcon,
  FunnelIcon,
  ListBulletIcon,
  MapPinIcon,
  Squares2X2Icon,
  ShieldCheckIcon,
  UserGroupIcon,
} from '@heroicons/react/24/outline';
import AnimatedCounter from '../components/utils/AnimatedCounter';
import LoadingState from '../components/utils/LoadingState';
import { trackEvent } from '../components/utils/Analytics';
import FullscreenFiltersModal from '../components/filters/FullscreenFiltersModal';
import CareersApplicationModal, {
  ApplicationFormData,
  CareersApplicationModalJob,
} from '../components/careers/CareersApplicationModal';
import { useBodyScrollLock } from '../hooks/useBodyScrollLock';
import {
  metaTextClasses,
  primaryTextClasses,
  secondaryTextClasses,
} from '../components/utils/ColorStyles';

type ListMode = 'detailed' | 'compact';
type CareersFilters = {
  dipartimento: string;
  tipo: string;
  sede: string;
};
type FilterKey = keyof CareersFilters;
type FilterOption = {
  value: string;
  count: number;
};
type PreparedJob = OffertaLavoroData & {
  jobKey: string;
  requisiti: string[];
  responsabilita: string[];
};

const EMPTY_FILTERS: CareersFilters = {
  dipartimento: '',
  tipo: '',
  sede: '',
};

const careerPillars = [
  {
    icon: BuildingOffice2Icon,
    title: 'Cantieri che contano',
    description: 'Entrerai su progetti ferroviari reali, con contesto tecnico chiaro e responsabilità operative concrete.',
  },
  {
    icon: AcademicCapIcon,
    title: 'Crescita tecnica continua',
    description: 'Affiancamento sul campo, trasferimento di competenze e percorsi di consolidamento per profili junior e senior.',
  },
  {
    icon: ShieldCheckIcon,
    title: 'Metodo e sicurezza',
    description: 'Lavoriamo con standard elevati di sicurezza, precisione e affidabilità in ogni fase del lavoro.',
  },
] as const;

function sanitizeKeyPart(value: string) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

function createJobKey(job: OffertaLavoroData, index: number) {
  if (job.id) return job.id;

  const titlePart = sanitizeKeyPart(job.titolo);
  const locationPart = sanitizeKeyPart(job.sede);
  return `${titlePart || 'job'}-${locationPart || 'location'}-${index}`;
}

function normalizeList(items: string[] | undefined) {
  if (!Array.isArray(items)) return [];

  return items
    .map((item) => item.trim())
    .filter(Boolean);
}

function sortFilterOptions(counts: Map<string, number>): FilterOption[] {
  return Array.from(counts.entries())
    .sort(([left], [right]) => left.localeCompare(right, 'it', { sensitivity: 'base' }))
    .map(([value, count]) => ({ value, count }));
}

function CareersPage() {
  const [offerte, setOfferte] = useState<OffertaLavoroData[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedJob, setSelectedJob] = useState<PreparedJob | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [expandedJobId, setExpandedJobId] = useState<string | null>(null);
  const [isJobDescriptionTruncated, setIsJobDescriptionTruncated] = useState<Record<string, boolean>>({});
  const [listMode, setListMode] = useState<ListMode>('detailed');
  const [filters, setFilters] = useState<CareersFilters>(EMPTY_FILTERS);
  const [showMobileFilters, setShowMobileFilters] = useState(false);
  const [isFilterPending, startFilterTransition] = useTransition();
  const jobDescriptionRefs = useRef<Record<string, HTMLParagraphElement | null>>({});
  useBodyScrollLock(isModalOpen || showMobileFilters);

  const careersCatalog = useMemo(() => {
    const departmentCounts = new Map<string, number>();
    const contractCounts = new Map<string, number>();
    const locationCounts = new Map<string, number>();
    const jobs: PreparedJob[] = [];

    for (let index = 0; index < offerte.length; index += 1) {
      const job = offerte[index];
      const dipartimento = job.dipartimento?.trim();
      const tipo = job.tipo?.trim();
      const sede = job.sede?.trim();

      if (dipartimento) departmentCounts.set(dipartimento, (departmentCounts.get(dipartimento) ?? 0) + 1);
      if (tipo) contractCounts.set(tipo, (contractCounts.get(tipo) ?? 0) + 1);
      if (sede) locationCounts.set(sede, (locationCounts.get(sede) ?? 0) + 1);

      jobs.push({
        ...job,
        jobKey: createJobKey(job, index),
        requisiti: normalizeList(job.requisiti),
        responsabilita: normalizeList(job.responsabilita),
      });
    }

    return {
      jobs,
      dipartimentoOptions: sortFilterOptions(departmentCounts),
      tipoOptions: sortFilterOptions(contractCounts),
      sedeOptions: sortFilterOptions(locationCounts),
      stats: {
        positions: jobs.length,
        departments: departmentCounts.size,
        locations: locationCounts.size,
      },
    };
  }, [offerte]);

  const focusAreas = useMemo(
    () => [...careersCatalog.dipartimentoOptions]
      .sort((left, right) => right.count - left.count || left.value.localeCompare(right.value, 'it', { sensitivity: 'base' }))
      .slice(0, 3),
    [careersCatalog.dipartimentoOptions]
  );

  const filterSections = useMemo(() => ([
    { key: 'dipartimento' as const, label: 'Dipartimento', options: careersCatalog.dipartimentoOptions },
    { key: 'tipo' as const, label: 'Contratto', options: careersCatalog.tipoOptions },
    { key: 'sede' as const, label: 'Sede', options: careersCatalog.sedeOptions },
  ]), [careersCatalog.dipartimentoOptions, careersCatalog.sedeOptions, careersCatalog.tipoOptions]);

  const mobileFilterSections = useMemo(() => (
    filterSections
      .filter((section) => section.options.length > 0)
      .map((section) => ({
        title: section.label,
        options: [
          {
            count: careersCatalog.stats.positions,
            id: `${section.key}::`,
            isActive: !filters[section.key],
            label: 'Tutti',
          },
          ...section.options.map((option) => ({
            count: option.count,
            id: `${section.key}::${option.value}`,
            isActive: filters[section.key] === option.value,
            label: option.value,
          })),
        ],
      }))
  ), [careersCatalog.stats.positions, filterSections, filters]);

  const filteredOfferte = useMemo(() => {
    const nextJobs: PreparedJob[] = [];

    for (const job of careersCatalog.jobs) {
      if (filters.dipartimento && job.dipartimento !== filters.dipartimento) continue;
      if (filters.tipo && job.tipo !== filters.tipo) continue;
      if (filters.sede && job.sede !== filters.sede) continue;
      nextJobs.push(job);
    }

    return nextJobs;
  }, [careersCatalog.jobs, filters.dipartimento, filters.sede, filters.tipo]);

  const filteredJobKeys = useMemo(
    () => filteredOfferte.map((job) => job.jobKey),
    [filteredOfferte]
  );
  const filteredJobKeysSet = useMemo(() => new Set(filteredJobKeys), [filteredJobKeys]);

  const activeFiltersCount = Number(Boolean(filters.dipartimento))
    + Number(Boolean(filters.tipo))
    + Number(Boolean(filters.sede));

  const syncTruncatedDescriptions = () => {
    setIsJobDescriptionTruncated((prev) => {
      const next = { ...prev };
      let changed = false;

      for (const key of filteredJobKeys) {
        if (expandedJobId === key) continue;
        const element = jobDescriptionRefs.current[key];
        if (!element) continue;

        const truncated = element.scrollHeight - element.clientHeight > 1;
        if (next[key] !== truncated) {
          next[key] = truncated;
          changed = true;
        }
      }

      return changed ? next : prev;
    });
  };

  useEffect(() => {
    setIsJobDescriptionTruncated((prev) => {
      const next = { ...prev };
      let changed = false;

      for (const key of Object.keys(next)) {
        if (!filteredJobKeysSet.has(key)) {
          delete next[key];
          changed = true;
        }
      }

      return changed ? next : prev;
    });

    const refs = jobDescriptionRefs.current;
    for (const key of Object.keys(refs)) {
      if (!filteredJobKeysSet.has(key)) delete refs[key];
    }
  }, [filteredJobKeysSet]);

  useLayoutEffect(() => {
    const rafId = window.requestAnimationFrame(() => {
      syncTruncatedDescriptions();
    });

    return () => window.cancelAnimationFrame(rafId);
  }, [expandedJobId, filteredJobKeys]);

  useEffect(() => {
    if (typeof ResizeObserver === 'undefined') return;

    let rafId: number | null = null;
    const observer = new ResizeObserver(() => {
      if (rafId != null) return;
      rafId = window.requestAnimationFrame(() => {
        rafId = null;
        syncTruncatedDescriptions();
      });
    });

    for (const key of filteredJobKeys) {
      const element = jobDescriptionRefs.current[key];
      if (element) observer.observe(element);
    }

    return () => {
      if (rafId != null) window.cancelAnimationFrame(rafId);
      observer.disconnect();
    };
  }, [expandedJobId, filteredJobKeys]);

  useEffect(() => {
    const controller = new AbortController();
    let isMounted = true;

    const fetchOfferte = async () => {
      try {
        const data = await publicOfferteService.getAllOfferte(controller.signal);
        if (!isMounted) return;
        setOfferte(data);
      } catch (error) {
        if (!controller.signal.aborted) {
          logger.error('Fetch error', error);
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchOfferte();

    return () => {
      isMounted = false;
      controller.abort();
    };
  }, []);

  useEffect(() => {
    setExpandedJobId(null);
  }, [filters.dipartimento, filters.sede, filters.tipo]);

  const openApplication = (job: PreparedJob | null) => {
    setSelectedJob(job);
    setIsModalOpen(true);
  };

  const updateFilter = (key: FilterKey, value: string) => {
    startFilterTransition(() => {
      setFilters((current) => ({
        ...current,
        [key]: current[key] === value ? '' : value,
      }));
    });
  };

  const clearFilters = () => {
    startFilterTransition(() => {
      setFilters(EMPTY_FILTERS);
    });
  };

  const toggleListMode = () => {
    startFilterTransition(() => {
      setListMode((current) => (current === 'detailed' ? 'compact' : 'detailed'));
    });
  };

  const handleMobileFilterSelect = (selection: string) => {
    const [key, value = ''] = selection.split('::');
    if (!key || !['dipartimento', 'tipo', 'sede'].includes(key)) return;
    updateFilter(key as FilterKey, value);
  };

  const trackApplicationSubmit = (success: boolean) => {
    trackEvent('form_submit', {
      category: 'engagement',
      label: 'job_application',
      value: success ? 1 : 0,
      success,
      job_title: selectedJob?.titolo ?? 'spontaneous'
    });
  };

  const submitApplication = async (data: ApplicationFormData, job: CareersApplicationModalJob | null) => {
    try {
      const backendUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3001';

      const formData = new FormData();
      formData.append('name', data.name);
      formData.append('email', data.email);
      formData.append('phone', data.phone);
      formData.append('subject', job?.titolo || 'Candidatura Spontanea');
      formData.append('message', job
        ? `Candidatura per la posizione: ${job.titolo}\n\nDipartimento: ${job.dipartimento}\nTipo contratto: ${job.tipo}\nSede: ${job.sede}`
        : 'Candidatura spontanea per posizioni future'
      );

      if (data.cv?.[0]) {
        formData.append('cv', data.cv[0]);
      }

      const response = await fetch(`${backendUrl}/api/applications`, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Errore durante l\'invio della candidatura');
      }

      trackApplicationSubmit(true);
    } catch (error) {
      logger.error('Error sending application:', error);
      trackApplicationSubmit(false);
      throw error;
    }
  };

  if (loading) {
    return (
      <Layout>
        <LoadingState
          label="Lavora con noi"
          description="Stiamo caricando le posizioni aperte disponibili."
        />
      </Layout>
    );
  }

  return (
    <Layout>
      <SEO
        title="Lavora con Noi | Scandellari"
        description="Scopri le posizioni aperte in Scandellari Giacinto s.n.c. e candidati per ruoli tecnici, operativi e di supporto nel settore ferroviario."
        keywords="lavora con noi, careers scandellari, posizioni aperte, lavoro settore ferroviario, candidature, ruoli tecnici ferroviari"
        url="/careers"
      />
      <div className="bg-stone-50 dark:bg-black min-h-screen pt-32 pb-20 font-sans">
        <section className="container mx-auto max-w-7xl px-6 mb-24">
          <div className="border-b border-black/10 dark:border-white/5 pb-20">
            <div className="grid lg:grid-cols-[minmax(0,1fr)_360px] gap-14 lg:gap-20 items-end">
              <div>
                <div className="flex items-center gap-4 mb-10">
                  <div className="w-12 h-[1px] bg-primary shadow-[0_0_8px_rgba(37,99,235,0.5)]" />
                  <span className={`text-[10px] font-black uppercase tracking-[0.4em] ${metaTextClasses}`}>
                    Careers & Team
                  </span>
                </div>
                <h1 className="text-5xl md:text-7xl lg:text-8xl font-black text-black dark:text-white tracking-tighter leading-[0.86] font-heading mb-8">
                  Lavora dove
                  <br />
                  la tecnica fa
                  <br />
                  la differenza
                </h1>
                <p className={`text-base md:text-xl max-w-3xl font-medium leading-relaxed ${secondaryTextClasses}`}>
                  Cerchiamo persone affidabili, competenti e pronte a crescere in un contesto ferroviario esigente.
                  Qui il lavoro non racconta progetti: costruisce impianti, sicurezza operativa e continuità di servizio.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 mt-10">
                  <a
                    href="#open-roles"
                    className="inline-flex items-center justify-center gap-3 px-7 py-4 bg-black dark:bg-white text-white dark:text-black text-[11px] font-black uppercase tracking-[0.3em] hover:bg-primary transition-colors"
                  >
                    Scopri le posizioni
                    <ArrowRightIcon className="w-4 h-4" />
                  </a>
                  <button
                    type="button"
                    onClick={() => openApplication(null)}
                    className="inline-flex items-center justify-center gap-3 px-7 py-4 border border-black/10 dark:border-white/10 text-[11px] font-black uppercase tracking-[0.3em] hover:border-primary hover:text-primary transition-colors"
                  >
                    Candidatura spontanea
                  </button>
                </div>
              </div>

              <div className="relative overflow-hidden border border-black/10 dark:border-white/5 bg-white dark:bg-dark-surface p-8 md:p-10">
                <div className="absolute inset-0 bg-gradient-to-br from-transparent via-transparent to-primary/10 dark:to-primary/15 pointer-events-none" />
                <div className="relative z-10">
                  <p className={`text-[10px] font-black uppercase tracking-[0.38em] mb-5 ${metaTextClasses}`}>
                    Focus assunzioni
                  </p>
                  <div className="space-y-5">
                    {focusAreas.length > 0 ? focusAreas.map((area) => (
                      <div key={area.value} className="flex items-start justify-between gap-4 border-b border-black/10 dark:border-white/5 pb-4 last:border-b-0 last:pb-0">
                        <div>
                          <p className={`text-lg font-black tracking-tight ${primaryTextClasses}`}>
                            {area.value}
                          </p>
                          <p className={`text-xs font-medium mt-1 ${secondaryTextClasses}`}>
                            Ruoli attivi in questo reparto
                          </p>
                        </div>
                        <span className="text-2xl font-black text-primary tabular-nums">
                          {area.count}
                        </span>
                      </div>
                    )) : (
                      <p className={`text-sm font-medium leading-relaxed ${secondaryTextClasses}`}>
                        Le nuove opportunità verranno pubblicate qui appena disponibili.
                      </p>
                    )}
                  </div>
                  <div className="mt-8 pt-6 border-t border-black/10 dark:border-white/5 flex items-end justify-between gap-4">
                    <div>
                      <p className={`text-[10px] font-black uppercase tracking-[0.35em] ${metaTextClasses}`}>
                        Posizioni attive
                      </p>
                      <p className={`text-xs font-medium mt-2 ${secondaryTextClasses}`}>
                        Ruoli pubblicati e candidabili dal sito.
                      </p>
                    </div>
                    <div className="text-5xl font-black text-black/10 dark:text-white/10 leading-none font-heading tabular-nums">
                      <AnimatedCounter to={careersCatalog.stats.positions} duration={1100} />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="container mx-auto max-w-7xl px-6 mb-32">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-px bg-black/8 dark:bg-white/5 border border-black/10 dark:border-white/5">
            {[
              { label: 'Posizioni aperte', value: careersCatalog.stats.positions },
              { label: 'Dipartimenti attivi', value: careersCatalog.stats.departments },
              { label: 'Sedi operative', value: careersCatalog.stats.locations },
            ].map((item) => (
              <div key={item.label} className="bg-white dark:bg-black px-8 py-10">
                <p className={`text-[10px] font-black uppercase tracking-[0.35em] mb-4 ${metaTextClasses}`}>
                  {item.label}
                </p>
                <div className={`text-5xl md:text-6xl font-black font-heading tabular-nums ${primaryTextClasses}`}>
                  <AnimatedCounter to={item.value} duration={1000} />
                </div>
              </div>
            ))}
          </div>

          <div className="grid lg:grid-cols-3 gap-px bg-gradient-to-br from-black/8 via-black/8 to-primary/5 dark:from-white/5 dark:via-white/5 dark:to-primary/10 border border-black/10 dark:border-white/5 mt-14">
            {careerPillars.map((pillar) => (
              <div key={pillar.title} className="bg-white dark:bg-black px-8 py-10 md:px-10 md:py-12">
                <pillar.icon className="w-6 h-6 text-primary mb-6" />
                <h2 className={`text-2xl font-black tracking-tight font-heading mb-4 ${primaryTextClasses}`}>
                  {pillar.title}
                </h2>
                <p className={`text-sm font-medium leading-relaxed ${secondaryTextClasses}`}>
                  {pillar.description}
                </p>
              </div>
            ))}
          </div>
        </section>

        <section id="open-roles" className="container mx-auto max-w-7xl px-6 mb-32 scroll-mt-32">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-14">
            <div>
              <div className="flex items-center gap-4 mb-5">
                <div className="w-10 h-[1px] bg-black/15 dark:bg-white/10" />
                <span className={`text-[10px] font-black uppercase tracking-[0.35em] ${metaTextClasses}`}>
                  Posizioni aperte
                </span>
              </div>
              <h2 className={`text-4xl md:text-5xl font-black tracking-tighter font-heading mb-4 ${primaryTextClasses}`}>
                Ruoli aperti adesso
              </h2>
              <p className={`text-sm md:text-base max-w-2xl font-medium leading-relaxed ${secondaryTextClasses}`}>
                Ogni posizione mostra subito ambito, responsabilità e requisiti essenziali, così la lettura è più vicina a una vera pagina careers e meno a un catalogo progetti.
              </p>
            </div>
            <div className="shrink-0 md:text-right flex flex-col items-start md:items-end gap-4">
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={toggleListMode}
                  aria-label={listMode === 'detailed' ? 'Passa alla vista compatta' : 'Passa alla vista espansa'}
                  title={listMode === 'detailed' ? 'Passa alla vista compatta' : 'Passa alla vista espansa'}
                  className="inline-flex h-12 w-12 items-center justify-center border border-black/10 dark:border-white/10 bg-white dark:bg-white/5 text-black dark:text-white hover:border-primary hover:text-primary transition-colors"
                >
                  {listMode === 'detailed' ? (
                    <ListBulletIcon className="w-5 h-5" />
                  ) : (
                    <Squares2X2Icon className="w-5 h-5" />
                  )}
                </button>
                <button
                  type="button"
                  onClick={() => setShowMobileFilters(true)}
                  className="lg:hidden flex items-center justify-center gap-3 px-8 py-4 bg-black dark:bg-white text-white dark:text-black text-[11px] font-black uppercase tracking-widest"
                >
                  <FunnelIcon className="w-4 h-4" />
                  {activeFiltersCount > 0 ? `Filtri (${activeFiltersCount})` : 'Filtri'}
                </button>
              </div>
              <div>
                <div className={`text-6xl md:text-7xl font-black text-black/5 dark:text-white/5 leading-none font-heading tabular-nums ${isFilterPending ? 'opacity-50' : ''}`}>
                  <AnimatedCounter to={filteredOfferte.length} duration={900} />
                </div>
                <div className={`text-[10px] font-black uppercase tracking-[0.35em] mt-2 ${metaTextClasses}`}>
                  {activeFiltersCount > 0 ? 'Ruoli filtrati' : 'Ruoli visibili'}
                </div>
              </div>
            </div>
          </div>

          <div className="flex flex-col lg:flex-row gap-16 items-start">
            <aside className="hidden lg:block w-72 shrink-0">
              <div className="sticky top-32 space-y-10">
                <div className="space-y-8 border border-black/10 dark:border-white/10 bg-white/70 dark:bg-white/[0.03] p-6">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className={`text-[10px] font-black uppercase tracking-[0.35em] mb-2 ${metaTextClasses}`}>
                        Filtra le posizioni
                      </p>
                      <p className={`text-sm font-medium leading-relaxed ${secondaryTextClasses}`}>
                        Restringi l'elenco per reparto, contratto e sede.
                      </p>
                    </div>
                    <div className="flex flex-col items-end gap-2 shrink-0">
                      {activeFiltersCount > 0 ? (
                        <span className="text-[10px] font-black uppercase tracking-[0.25em] text-primary tabular-nums">
                          {activeFiltersCount} attivi
                        </span>
                      ) : (
                        <span className={`text-[10px] font-black uppercase tracking-[0.25em] ${metaTextClasses}`}>
                          Nessun filtro
                        </span>
                      )}
                      {activeFiltersCount > 0 ? (
                        <button
                          type="button"
                          onClick={clearFilters}
                          className="text-[10px] font-black uppercase tracking-[0.25em] text-primary hover:opacity-70 transition-opacity"
                        >
                          Reset
                        </button>
                      ) : null}
                    </div>
                  </div>

                  {filterSections
                    .filter((section) => section.options.length > 0)
                    .map((section) => (
                      <div key={section.key} className="space-y-4">
                        <button
                          type="button"
                          onClick={() => updateFilter(section.key, '')}
                          className={`text-base font-black uppercase tracking-[0.2em] transition-colors ${
                            !filters[section.key]
                              ? 'text-primary'
                              : `${metaTextClasses} hover:text-primary dark:hover:text-white`
                          }`}
                        >
                          {section.label}
                        </button>

                        <div className="flex flex-col gap-3 pl-4 border-l border-black/5 dark:border-white/5">
                          {section.options.map((option) => (
                            <button
                              key={option.value}
                              type="button"
                              onClick={() => updateFilter(section.key, option.value)}
                              className={`flex items-center justify-between gap-3 text-left text-sm font-bold py-1 transition-all ${
                                filters[section.key] === option.value
                                  ? 'text-primary dark:text-white translate-x-2'
                                  : `${metaTextClasses} hover:text-primary dark:hover:text-white`
                              }`}
                            >
                              <span>{option.value}</span>
                              <span className="text-[10px] tabular-nums opacity-60">
                                {option.count}
                              </span>
                            </button>
                          ))}
                        </div>
                      </div>
                    ))}
                </div>

                <div className="space-y-5 pt-2 border-t border-black/8 dark:border-white/10">
                  <p className={`text-[10px] font-black uppercase tracking-[0.35em] ${metaTextClasses}`}>
                    Processo di selezione
                  </p>
                  <div className="space-y-4 pl-4 border-l border-black/8 dark:border-white/10">
                    {[
                      'Invio candidatura con CV aggiornato.',
                      'Primo confronto su esperienza, disponibilità e sede.',
                      'Valutazione tecnica in base al ruolo.',
                      'Definizione del percorso di inserimento.',
                    ].map((item, index) => (
                      <div key={item} className="grid grid-cols-[28px_minmax(0,1fr)] gap-4 items-start">
                        <span className="text-sm font-black text-primary tabular-nums">
                          0{index + 1}
                        </span>
                        <p className={`text-sm font-medium leading-relaxed ${secondaryTextClasses}`}>
                          {item}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </aside>

            <div className="flex-grow space-y-5 [content-visibility:auto]">
              {filteredOfferte.length > 0 ? filteredOfferte.map((job) => {
                const showResponsibilities = job.responsabilita.length > 0;
                const showRequirements = job.requisiti.length > 0;
                const previewResponsibilities = job.responsabilita.slice(0, 3);
                const previewRequirements = job.requisiti.slice(0, 3);
                const compactSummary = showResponsibilities
                  ? previewResponsibilities[0]
                  : showRequirements
                    ? previewRequirements[0]
                    : job.descrizione;

                return (
                  <article
                    key={job.jobKey}
                    className="border border-black/10 dark:border-white/5 bg-white dark:bg-dark-surface transition-colors hover:border-primary/30"
                  >
                    <div className={`p-8 md:p-10 ${listMode === 'compact' ? '' : 'grid xl:grid-cols-[minmax(0,1fr)_280px] gap-8'}`}>
                      <div className="space-y-6">
                        <div className="flex flex-wrap items-center gap-2">
                          {job.dipartimento ? (
                            <span className="inline-flex items-center gap-2 px-3 py-2 bg-primary/10 text-primary text-[10px] font-black uppercase tracking-[0.28em]">
                              <UserGroupIcon className="w-4 h-4" />
                              {job.dipartimento}
                            </span>
                          ) : null}
                          {job.tipo ? (
                            <span className={`inline-flex items-center gap-2 px-3 py-2 border border-black/10 dark:border-white/10 text-[10px] font-black uppercase tracking-[0.28em] ${metaTextClasses}`}>
                              <BriefcaseIcon className="w-4 h-4" />
                              {job.tipo}
                            </span>
                          ) : null}
                          {job.sede ? (
                            <span className={`inline-flex items-center gap-2 px-3 py-2 border border-black/10 dark:border-white/10 text-[10px] font-black uppercase tracking-[0.28em] ${metaTextClasses}`}>
                              <MapPinIcon className="w-4 h-4" />
                              {job.sede}
                            </span>
                          ) : null}
                        </div>

                        <div className={listMode === 'compact' ? 'grid md:grid-cols-[minmax(0,1fr)_220px] gap-6 items-start' : ''}>
                          <div>
                          <h3 className={`text-3xl md:text-4xl font-black tracking-tight font-heading mb-4 ${primaryTextClasses}`}>
                            {job.titolo}
                          </h3>
                          <p
                            ref={(element) => {
                              jobDescriptionRefs.current[job.jobKey] = element;
                            }}
                            className={`text-sm md:text-base font-medium leading-relaxed max-w-3xl ${secondaryTextClasses} ${
                              listMode === 'compact'
                                ? 'line-clamp-2'
                                : expandedJobId === job.jobKey ? '' : 'line-clamp-3'
                            }`}
                          >
                            {listMode === 'compact' ? compactSummary : job.descrizione}
                          </p>
                          {listMode === 'detailed' && isJobDescriptionTruncated[job.jobKey] ? (
                            <button
                              type="button"
                              onClick={() => setExpandedJobId((current) => (current === job.jobKey ? null : job.jobKey))}
                              className="mt-4 inline-flex items-center gap-2 text-primary text-[10px] font-black uppercase tracking-[0.28em] hover:opacity-70 transition-opacity"
                              aria-expanded={expandedJobId === job.jobKey}
                            >
                              {expandedJobId === job.jobKey ? 'Mostra meno' : 'Leggi dettagli'}
                            </button>
                          ) : null}
                          </div>

                          {listMode === 'compact' ? (
                            <div className="flex md:justify-end">
                              <button
                                type="button"
                                onClick={() => openApplication(job)}
                                className="inline-flex items-center justify-between gap-4 w-full md:w-auto border border-black dark:border-white px-5 py-4 text-[11px] font-black uppercase tracking-[0.32em] hover:border-primary hover:text-primary transition-colors"
                              >
                                Candidati
                                <ArrowRightIcon className="w-4 h-4" />
                              </button>
                            </div>
                          ) : null}
                        </div>

                        {listMode === 'detailed' && (showResponsibilities || showRequirements) ? (
                          <div className="grid md:grid-cols-2 gap-6 pt-6 border-t border-black/10 dark:border-white/5">
                            {showResponsibilities ? (
                              <div>
                                <p className={`text-[10px] font-black uppercase tracking-[0.32em] mb-4 ${metaTextClasses}`}>
                                  Attività principali
                                </p>
                                <div className="space-y-3">
                                  {previewResponsibilities.map((item) => (
                                    <div key={item} className="flex items-start gap-3">
                                      <CheckCircleIcon className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                                      <p className={`text-sm font-medium leading-relaxed ${secondaryTextClasses}`}>
                                        {item}
                                      </p>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            ) : null}

                            {showRequirements ? (
                              <div>
                                <p className={`text-[10px] font-black uppercase tracking-[0.32em] mb-4 ${metaTextClasses}`}>
                                  Requisiti essenziali
                                </p>
                                <div className="space-y-3">
                                  {previewRequirements.map((item) => (
                                    <div key={item} className="flex items-start gap-3">
                                      <CheckCircleIcon className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                                      <p className={`text-sm font-medium leading-relaxed ${secondaryTextClasses}`}>
                                        {item}
                                      </p>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            ) : null}
                          </div>
                        ) : null}
                      </div>

                      {listMode === 'detailed' ? (
                      <div className="flex flex-col justify-between gap-8 xl:border-l xl:border-black/10 xl:dark:border-white/5 xl:pl-8">
                        <div className="space-y-5">
                          <div className="inline-flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.35em] text-primary">
                            Posizione attiva
                          </div>
                          <p className={`text-sm font-medium leading-relaxed ${secondaryTextClasses}`}>
                            Candidatura aperta dal sito con invio diretto del CV. Il profilo viene valutato in base a esperienza, competenze richieste e disponibilità operativa.
                          </p>
                          <div className="pt-5 border-t border-black/10 dark:border-white/5">
                            <p className={`text-[10px] font-black uppercase tracking-[0.3em] mb-2 ${metaTextClasses}`}>
                              Output atteso
                            </p>
                            <p className={`text-sm font-medium leading-relaxed ${secondaryTextClasses}`}>
                              CV aggiornato e contatti completi per un primo confronto con il team.
                            </p>
                          </div>
                        </div>

                        <button
                          type="button"
                          onClick={() => openApplication(job)}
                          className="inline-flex items-center justify-between gap-4 w-full border border-black dark:border-white px-5 py-4 text-[11px] font-black uppercase tracking-[0.32em] hover:border-primary hover:text-primary transition-colors"
                        >
                          Invia candidatura
                          <ArrowRightIcon className="w-4 h-4" />
                        </button>
                      </div>
                      ) : null}
                    </div>
                  </article>
                );
              }) : (
                <div className="border border-black/10 dark:border-white/5 bg-white dark:bg-dark-surface p-10 md:p-14 text-center">
                  <BriefcaseIcon className="w-10 h-10 mx-auto text-black/30 dark:text-white/20" />
                  <p className={`text-sm font-black uppercase tracking-[0.32em] mt-6 mb-3 ${metaTextClasses}`}>
                    Nessuna posizione trovata
                  </p>
                  <p className={`text-sm md:text-base font-medium max-w-xl mx-auto leading-relaxed ${secondaryTextClasses}`}>
                    Nessuna offerta corrisponde ai filtri selezionati. Puoi ripristinare la ricerca oppure inviare una candidatura spontanea.
                  </p>
                  <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mt-8">
                    <button
                      type="button"
                      onClick={clearFilters}
                      className="px-6 py-3 bg-black dark:bg-white text-white dark:text-black text-[11px] font-black uppercase tracking-[0.28em] hover:bg-primary transition-colors"
                    >
                      Vedi tutte le posizioni
                    </button>
                    <button
                      type="button"
                      onClick={() => openApplication(null)}
                      className="px-6 py-3 border border-black/10 dark:border-white/10 text-[11px] font-black uppercase tracking-[0.28em] hover:border-primary hover:text-primary transition-colors"
                    >
                      Candidatura spontanea
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </section>

        <section className="container mx-auto max-w-7xl px-6">
          <div className="relative overflow-hidden border border-black/10 dark:border-white/5 bg-black dark:bg-dark-surface text-white px-8 py-12 md:px-14 md:py-16">
            <div className="absolute inset-0 bg-gradient-to-br from-transparent via-transparent to-primary/10 dark:to-primary/15 pointer-events-none" />
            <div className="relative z-10 grid lg:grid-cols-[minmax(0,1fr)_320px] gap-10 items-start">
              <div>
                <p className="text-[10px] font-black uppercase tracking-[0.4em] text-white/60 mb-5">
                  Candidatura spontanea
                </p>
                <h2 className="text-4xl md:text-5xl font-black tracking-tighter font-heading mb-6">
                  Non vedi il ruolo giusto?
                  <br />
                  Presentati comunque.
                </h2>
                <p className="text-base md:text-lg text-white/75 font-medium leading-relaxed max-w-2xl">
                  Se il tuo profilo è coerente con attività ferroviarie, segnalamento, supporto operativo o ruoli tecnici di cantiere, preferiamo leggerlo comunque.
                  La candidatura spontanea ci permette di valutare inserimenti futuri senza aspettare la pubblicazione di una posizione dedicata.
                </p>
              </div>

              <div className="border border-white/10 bg-white/5 backdrop-blur-sm p-6 md:p-7">
                <p className="text-[10px] font-black uppercase tracking-[0.35em] text-white/60 mb-4">
                  Cosa includere
                </p>
                <div className="space-y-3">
                  {[
                    'Esperienza tecnica o operativa rilevante',
                    'Disponibilità territoriale e recapiti aggiornati',
                    'CV completo in PDF, DOC o DOCX',
                  ].map((item) => (
                    <div key={item} className="flex items-start gap-3">
                      <ClipboardDocumentCheckIcon className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                      <p className="text-sm text-white/75 leading-relaxed">{item}</p>
                    </div>
                  ))}
                </div>
                <button
                  type="button"
                  onClick={() => openApplication(null)}
                  className="inline-flex items-center justify-between gap-4 w-full mt-8 border border-white/20 px-5 py-4 text-[11px] font-black uppercase tracking-[0.32em] hover:border-primary hover:text-primary transition-colors"
                >
                  Invia il tuo profilo
                  <ArrowRightIcon className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </section>

        <FullscreenFiltersModal
          ariaLabel="Filtri posizioni aperte"
          isOpen={showMobileFilters}
          onClose={() => setShowMobileFilters(false)}
          onSelect={handleMobileFilterSelect}
          sections={mobileFilterSections}
          title="Filtri"
        />
        <CareersApplicationModal
          isOpen={isModalOpen}
          job={selectedJob}
          onClose={() => setIsModalOpen(false)}
          onSubmitApplication={submitApplication}
        />
      </div>
    </Layout>
  );
}

export default CareersPage;
