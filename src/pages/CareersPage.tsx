import { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import Layout from '../components/layout/Layout';
import { logger } from '../utils/logger';
import { offerteService } from '../supabase/services';
import { OffertaLavoroData } from '../types/supabaseTypes';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import {
  MapPinIcon,
  UserGroupIcon,
  SparklesIcon,
  ShieldCheckIcon,
  ArrowRightIcon,
  XMarkIcon,
  CheckCircleIcon,
  BriefcaseIcon
} from '@heroicons/react/24/outline';
import AnimatedCounter from '../components/utils/AnimatedCounter';
import LoadingState from '../components/utils/LoadingState';
import { trackEvent } from '../components/utils/Analytics';
import { useBodyScrollLock } from '../hooks/useBodyScrollLock';
import {
  metaTextClasses,
  primaryTextClasses,
  secondaryTextClasses,
} from '../components/utils/ColorStyles';

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ACCEPTED_FILE_TYPES = [
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
] as const;

type SubmissionStatus = 'idle' | 'submitting' | 'success' | 'error';
type UploadedCv = FileList | null | undefined;

const applicationSchema = z.object({
  name: z.string().min(2, 'Il nome deve contenere almeno 2 caratteri'),
  email: z.string().email('Inserisci un indirizzo email valido'),
  phone: z.string().min(6, 'Inserisci un numero di telefono valido'),
  cv: z.custom<UploadedCv>()
    .refine((files) => files?.length === 1, 'Il CV è obbligatorio')
    .refine((files) => {
      const file = files?.item(0);
      return !!file && file.size <= MAX_FILE_SIZE;
    }, 'La dimensione massima è 5MB')
    .refine(
      (files) => {
        const fileType = files?.item(0)?.type;
        return !!fileType && ACCEPTED_FILE_TYPES.some((acceptedType) => acceptedType === fileType);
      },
      'Formati supportati: PDF, DOC, DOCX. Le foto non sono ammesse.'
    ),
});

type ApplicationFormData = z.infer<typeof applicationSchema>;

const getUniqueSortedValues = (items: Array<string | undefined>) =>
  Array.from(new Set(items.filter((value): value is string => Boolean(value)))).sort();

function CareersPage() {
  const [offerte, setOfferte] = useState<OffertaLavoroData[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedJob, setSelectedJob] = useState<OffertaLavoroData | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [status, setStatus] = useState<SubmissionStatus>('idle');
  const [expandedJobId, setExpandedJobId] = useState<string | null>(null);
  const [isJobDescriptionTruncated, setIsJobDescriptionTruncated] = useState<Record<string, boolean>>({});
  const jobDescriptionRefs = useRef<Record<string, HTMLParagraphElement | null>>({});

  const {
    register,
    handleSubmit,
    reset,
    watch,
    trigger,
    setValue,
    formState: { errors }
  } = useForm<ApplicationFormData>({
    resolver: zodResolver(applicationSchema),
    mode: 'onBlur'
  });

  const selectedFile = watch('cv');
  const selectedCvFile = selectedFile?.[0];

  // Filter States
  const [filterDipartimento, setFilterDipartimento] = useState('');
  const [filterTipo, setFilterTipo] = useState('');
  const [filterSede, setFilterSede] = useState('');
  useBodyScrollLock(isModalOpen);

  const filteredOfferte = useMemo(() => {
    return offerte.filter((job) => {
      const matchDip = !filterDipartimento || job.dipartimento === filterDipartimento;
      const matchTipo = !filterTipo || job.tipo === filterTipo;
      const matchSede = !filterSede || job.sede === filterSede;
      return matchDip && matchTipo && matchSede;
    });
  }, [offerte, filterDipartimento, filterTipo, filterSede]);

  const filteredJobKeys = useMemo(
    () => filteredOfferte.map((job, index) => job.id ?? `job-${index}`),
    [filteredOfferte]
  );
  const filteredJobKeysSet = useMemo(() => new Set(filteredJobKeys), [filteredJobKeys]);
  const syncTruncatedDescriptions = () => {
    setIsJobDescriptionTruncated((prev) => {
      const next = { ...prev };
      let changed = false;

      for (const key of filteredJobKeys) {
        if (expandedJobId === key) continue;
        const el = jobDescriptionRefs.current[key];
        if (!el) continue;
        const truncated = el.scrollHeight - el.clientHeight > 1;
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
      const el = jobDescriptionRefs.current[key];
      if (el) observer.observe(el);
    }

    return () => {
      if (rafId != null) window.cancelAnimationFrame(rafId);
      observer.disconnect();
    };
  }, [expandedJobId, filteredJobKeys]);

  useEffect(() => {
    const fetchOfferte = async () => {
      try {
        const data = await offerteService.getAllOfferte();
        setOfferte(data);
      } catch (err) {
        logger.error('Fetch error', err);
      } finally {
        setLoading(false);
      }
    };
    fetchOfferte();
  }, []);

  const openApplication = (job: OffertaLavoroData | null) => {
    setSelectedJob(job);
    setIsModalOpen(true);
    setStatus('idle');
    reset();
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

  const onSubmit = async (data: ApplicationFormData) => {
    setStatus('submitting');

    try {
      const backendUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3001';

      const formData = new FormData();
      formData.append('name', data.name);
      formData.append('email', data.email);
      formData.append('phone', data.phone);
      formData.append('subject', selectedJob?.titolo || 'Candidatura Spontanea');
      formData.append('message', selectedJob
        ? `Candidatura per la posizione: ${selectedJob.titolo}\n\nDipartimento: ${selectedJob.dipartimento}\nTipo contratto: ${selectedJob.tipo}\nSede: ${selectedJob.sede}`
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

      setStatus('success');
      trackApplicationSubmit(true);
    } catch (error) {
      logger.error('Error sending application:', error);
      setStatus('error');
      trackApplicationSubmit(false);
    }
  };

  useEffect(() => {
    setExpandedJobId(null);
  }, [filterDipartimento, filterTipo, filterSede]);

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
      <div className="bg-stone-50 dark:bg-black min-h-screen pt-32 pb-20 font-sans">

        {/* Hero Section */}
        <section className="container mx-auto max-w-7xl px-6 mb-32">
          <div
            className="border-b border-black/10 dark:border-white/5 pb-20"
            data-animate="fade-up"
            data-animate-distance="20"
          >
            <div className="flex items-center gap-4 mb-12">
              <div className="w-12 h-[1px] bg-primary shadow-[0_0_8px_rgba(37,99,235,0.5)]" />
              <span className={`text-[10px] font-black uppercase tracking-[0.4em] ${metaTextClasses}`}>
                Careers & Growth
              </span>
            </div>
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-12">
              <div>
                <h1 className="text-6xl md:text-8xl lg:text-9xl font-black text-black dark:text-white tracking-tighter leading-[0.8] font-heading mb-12">
                  Unisciti al<br />Team
                </h1>
                <p className={`text-base md:text-xl max-w-2xl font-medium leading-relaxed ${secondaryTextClasses}`}>
                  Cerchiamo professionisti pronti a costruire l'infrastruttura ferroviaria del domani. Innovazione, sicurezza e competenza tecnica sono i nostri pilastri.
                </p>
              </div>
              {offerte.length > 0 && (
                <div className="shrink-0 text-right">
                  <div className="text-7xl md:text-8xl font-black text-black/5 dark:text-white/5 leading-none font-heading tabular-nums select-none">
                    <AnimatedCounter to={offerte.length} duration={1200} />
                  </div>
                  <div className={`text-[10px] font-black uppercase tracking-[0.4em] mt-1 ${metaTextClasses}`}>
                    Posizioni aperte
                  </div>
                </div>
              )}
            </div>
          </div>
        </section>

        {/* Culture & Benefits */}
        <section className="container mx-auto max-w-7xl px-6 mb-40">
          <div className="grid md:grid-cols-3 gap-px bg-gradient-to-br from-black/8 via-black/8 to-primary/5 dark:from-white/5 dark:via-white/5 dark:to-primary/10 border border-black/10 dark:border-white/5">
            {[
              { icon: SparklesIcon, num: '01', title: 'Innovazione', desc: "Accesso a tecnologie all'avanguardia nel settore segnalamento." },
              { icon: UserGroupIcon, num: '02', title: 'Formazione', desc: 'Percorsi di crescita continua e tutoraggio specialistico.' },
              { icon: ShieldCheckIcon, num: '03', title: 'Sicurezza', desc: 'Ambiente di lavoro protetto con standard oltre la norma.' }
            ].map((item) => (
              <div key={item.num} className="bg-white dark:bg-black p-8 space-y-6 group hover:bg-stone-50 dark:hover:bg-dark-surface transition-all duration-300 relative overflow-hidden">
                <span className="absolute top-4 right-6 text-6xl font-black text-black/[0.04] dark:text-white/[0.04] leading-none select-none pointer-events-none font-heading">
                  {item.num}
                </span>
                <item.icon className="w-6 h-6 text-primary group-hover:scale-110 transition-transform" />
                <div>
                  <h3 className="text-lg font-black uppercase tracking-widest font-heading mb-2">{item.title}</h3>
                  <p className={`text-xs font-medium leading-relaxed ${secondaryTextClasses}`}>{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Job Openings */}
        <section className="container mx-auto max-w-7xl px-6 mb-40">
          <div className="flex flex-col gap-10 mb-16">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
              <div>
                <h2 className="text-4xl font-black text-black dark:text-white tracking-tighter font-heading mb-4">Posizioni Aperte</h2>
                <div className="w-20 h-[1px] bg-black/15 dark:bg-white/10" />
              </div>
              {(filterDipartimento || filterTipo || filterSede) && (
                <button
                  onClick={() => { setFilterDipartimento(''); setFilterTipo(''); setFilterSede(''); }}
                  className={`text-[10px] font-black uppercase tracking-widest hover:text-primary transition-colors self-start md:self-auto ${metaTextClasses}`}
                >
                  Rimuovi filtri ×
                </button>
              )}
            </div>

            {/* Filtri pill */}
            <div className="flex flex-col gap-4">
              {[ 
                { label: 'Dipartimento', value: filterDipartimento, setter: setFilterDipartimento, options: getUniqueSortedValues(offerte.map(o => o.dipartimento)) },
                { label: 'Contratto', value: filterTipo, setter: setFilterTipo, options: getUniqueSortedValues(offerte.map(o => o.tipo)) },
                { label: 'Sede', value: filterSede, setter: setFilterSede, options: getUniqueSortedValues(offerte.map(o => o.sede)) }
              ].filter(f => f.options.length > 0).map((filter, i) => (
                <div key={i} className="flex items-center gap-3 flex-wrap">
                  <span className={`text-[9px] font-black uppercase tracking-[0.35em] w-24 shrink-0 ${metaTextClasses}`}>{filter.label}</span>
                  <div className="flex bg-black/8 dark:bg-white/5 p-1 flex-wrap gap-1">
                    <button
                      onClick={() => filter.setter('')}
                        className={`px-4 py-2 text-[10px] font-black uppercase tracking-widest transition-all ${!filter.value ? 'bg-black dark:bg-white text-white dark:text-black' : `${metaTextClasses} hover:text-black dark:hover:text-white`}`}
                    >
                      Tutti
                    </button>
                    {filter.options.map(opt => (
                      <button
                        key={opt}
                        onClick={() => filter.setter(opt === filter.value ? '' : opt)}
                        className={`px-4 py-2 text-[10px] font-black uppercase tracking-widest transition-all ${filter.value === opt ? 'bg-black dark:bg-white text-white dark:text-black' : `${metaTextClasses} hover:text-black dark:hover:text-white`}`}
                      >
                        {opt}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {filteredOfferte.length > 0 ? (
            <div className="space-y-6">
              {filteredOfferte.map((job, index) => {
                const jobKey = job.id ?? `job-${index}`;
                return (
                  <div
                    key={jobKey}
                    className="group bg-white dark:bg-dark-surface border border-black/10 dark:border-white/5 hover:border-primary/30 transition-all duration-500 overflow-hidden relative"
                    data-animate="fade-up"
                    data-animate-delay={(index * 0.04).toFixed(2)}
                  >
                    {/* Numero progressivo decorativo */}
                    <span className="absolute top-4 right-6 text-7xl font-black text-black/[0.04] dark:text-white/[0.04] leading-none select-none pointer-events-none font-heading tabular-nums z-0">
                      {String(index + 1).padStart(2, '0')}
                    </span>

                    <div className="p-8 md:p-12 flex flex-col md:grid md:grid-cols-12 gap-8 md:items-center relative z-10">
                      <div className="md:col-span-8 flex flex-col md:flex-row gap-6 md:gap-8 items-start">
                        <div className="w-12 h-12 bg-black/8 dark:bg-dark-elevated border border-black/10 dark:border-white/5 flex items-center justify-center shrink-0 group-hover:border-primary group-hover:bg-primary/10 transition-all">
                          <BriefcaseIcon className="w-6 h-6 opacity-30 group-hover:opacity-100 group-hover:text-primary transition-all" />
                        </div>
                        <div className="flex-1">
                          <div className="flex flex-wrap items-center gap-3 mb-3">
                            {job.dipartimento && (
                              <span className="text-[9px] font-black uppercase tracking-[0.35em] text-primary">
                                {job.dipartimento}
                              </span>
                            )}
                            {job.dipartimento && <span className="text-black/30 dark:text-white/15 text-[9px]">·</span>}
                            <span className={`text-[9px] font-black uppercase tracking-[0.3em] ${metaTextClasses}`}>{job.tipo}</span>
                            <span className="text-black/30 dark:text-white/15 text-[9px]">·</span>
                            <span className={`text-[9px] font-black uppercase tracking-[0.3em] flex items-center gap-1 ${metaTextClasses}`}>
                              <MapPinIcon className="w-3 h-3" />
                              {job.sede}
                            </span>
                          </div>
                          <h3 className={`text-2xl md:text-3xl font-black mb-4 tracking-tight font-heading group-hover:text-primary transition-colors ${primaryTextClasses}`}>{job.titolo}</h3>
                          <p
                            ref={(el) => {
                              jobDescriptionRefs.current[jobKey] = el;
                            }}
                            className={`text-sm font-medium max-w-2xl leading-relaxed ${secondaryTextClasses} ${expandedJobId === jobKey ? '' : 'line-clamp-2'}`}
                          >
                            {job.descrizione}
                          </p>
                          {isJobDescriptionTruncated[jobKey] && (
                            <button
                              type="button"
                              onClick={() => setExpandedJobId((prev) => (prev === jobKey ? null : jobKey))}
                              className="mt-3 inline-flex text-primary text-[10px] font-black uppercase tracking-widest hover:underline"
                              aria-expanded={expandedJobId === jobKey}
                            >
                              {expandedJobId === jobKey ? 'Mostra meno' : 'Leggi tutto'}
                            </button>
                          )}
                        </div>
                      </div>
                      <div className="md:col-span-4 flex justify-start md:justify-end mt-4 md:mt-0">
                        <button
                          onClick={() => openApplication(job)}
                          className="inline-flex items-center gap-4 text-[10px] font-black uppercase tracking-[0.3em] group/btn border-b-2 border-black dark:border-white hover:border-primary hover:text-primary pb-2 transition-all"
                        >
                          Candidati Ora
                          <ArrowRightIcon className="w-4 h-4 transition-transform group-hover/btn:translate-x-2" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-32 gap-6 text-center">
              <BriefcaseIcon className="w-10 h-10 text-black/40 dark:text-white/15" />
              <div>
                <p className={`text-sm font-black uppercase tracking-widest mb-2 ${metaTextClasses}`}>
                  Nessuna posizione trovata
                </p>
                <p className={`text-xs font-medium ${metaTextClasses}`}>
                  Nessuna offerta corrisponde ai filtri selezionati.
                </p>
              </div>
              <button
                onClick={() => { setFilterDipartimento(''); setFilterTipo(''); setFilterSede(''); }}
                className="text-[10px] font-black uppercase tracking-widest text-primary border border-primary/30 px-6 py-3 hover:bg-primary hover:text-white transition-all"
              >
                Vedi tutte le posizioni
              </button>
            </div>
          )}
        </section>

        {/* Spontaneous Application */}
        <section className="container mx-auto max-w-7xl px-6">
          <div
            className="bg-black dark:bg-dark-surface text-white dark:text-white p-12 md:p-24 text-center space-y-10 border border-black/10 dark:border-white/5 relative overflow-hidden group cursor-pointer"
            onClick={() => openApplication(null)}
          >
            <div className="absolute inset-0 bg-gradient-to-br from-transparent via-transparent to-primary/10 dark:to-accent/10 pointer-events-none" />
            <div className="relative z-10 space-y-8">
              <div className="space-y-4">
                <h2 className="text-4xl md:text-6xl font-black font-heading leading-tight tracking-tighter uppercase">Candidatura Spontanea</h2>
                <p className="text-base md:text-xl opacity-80 font-medium max-w-2xl mx-auto leading-relaxed">
                  Non trovi la posizione giusta? Inviaci comunque il tuo profilo. Cerchiamo sempre talenti motivati per far crescere il nostro dipartimento tecnico.
                </p>
              </div>
              <div className="flex justify-center">
                <span className="inline-flex items-center gap-6 text-xs font-black uppercase tracking-[0.4em] border-b-2 border-primary pb-2 group-hover:text-primary transition-all">
                  Invia Profilo
                  <ArrowRightIcon className="w-6 h-6 transition-transform group-hover:translate-x-2" />
                </span>
              </div>
            </div>
          </div>
        </section>

        {/* Application Modal (Full Screen) */}
        <div
          className={`fixed inset-0 z-[100] bg-white dark:bg-black overflow-hidden transform transition-all duration-500 ease-out ${isModalOpen ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-full pointer-events-none'}`}
          aria-hidden={!isModalOpen}
        >
          <div className="container mx-auto max-w-5xl h-full flex flex-col relative">
            <div className="flex justify-between items-center p-6 md:p-12 border-b border-black/10 dark:border-white/5">
              <div>
                <h3 className="text-xs font-black uppercase tracking-widest text-primary mb-2">
                  {selectedJob ? 'Candidatura per' : 'Candidatura spontanea'}
                </h3>
                <h2 className="text-2xl md:text-4xl font-black font-heading tracking-tight">{selectedJob?.titolo || 'Nuova Risorsa'}</h2>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-4 hover:bg-black/10 dark:hover:bg-white/5 transition-colors group rounded-full"
              >
                <XMarkIcon className="w-8 h-8 md:w-10 md:h-10 transition-transform group-hover:rotate-90" />
              </button>
            </div>

            <div className="flex-grow overflow-y-auto overflow-x-hidden p-6 md:p-12">
              <div className="max-w-2xl mx-auto pb-20">
                {selectedJob && (
                  <div className="mb-12 p-8 bg-stone-50 dark:bg-white/5 border border-black/10 dark:border-white/5 space-y-4">
                    <div className="flex flex-wrap gap-4 text-[10px] font-black uppercase tracking-widest text-primary">
                      <span className="flex items-center gap-2"><MapPinIcon className="w-3 h-3" /> {selectedJob.sede}</span>
                      <span className="flex items-center gap-2"><BriefcaseIcon className="w-3 h-3" /> {selectedJob.tipo}</span>
                    </div>
                    <p className={`text-sm font-medium leading-relaxed ${secondaryTextClasses}`}>
                      {selectedJob.descrizione}
                    </p>
                  </div>
                )}

                {status === 'success' ? (
                  <div className="flex flex-col items-center justify-center py-20 text-center animate-fade-in">
                    <div className="w-24 h-24 bg-green-500/10 rounded-full flex items-center justify-center mb-8">
                      <CheckCircleIcon className="w-12 h-12 text-green-500" />
                    </div>
                    <h3 className="text-3xl md:text-4xl font-black font-heading mb-4">Candidatura Inviata</h3>
                    <p className={`font-medium max-w-md mx-auto leading-relaxed ${secondaryTextClasses}`}>
                      Grazie per il tuo interesse. Il nostro team HR valuterà il tuo profilo e ti contatterà presto.
                    </p>
                    <button
                      onClick={() => setIsModalOpen(false)}
                      className="mt-12 px-8 py-4 bg-black dark:bg-white text-white dark:text-black text-xs font-black uppercase tracking-[0.2em] hover:opacity-80 transition-opacity"
                    >
                      Torna alla Pagina
                    </button>
                  </div>
                ) : status === 'error' ? (
                  <div className="flex flex-col items-center justify-center py-20 text-center animate-fade-in">
                    <div className="w-24 h-24 bg-red-500/10 rounded-full flex items-center justify-center mb-8">
                      <XMarkIcon className="w-12 h-12 text-red-500" />
                    </div>
                    <h3 className="text-3xl md:text-4xl font-black font-heading mb-4">Errore Invio</h3>
                    <p className={`font-medium max-w-md mx-auto leading-relaxed mb-8 ${secondaryTextClasses}`}>
                      Si è verificato un errore durante l'invio della candidatura. Riprova o contattaci direttamente.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4">
                      <button
                        onClick={() => setStatus('idle')}
                        className="px-8 py-4 border-2 border-black dark:border-white text-black dark:text-white text-xs font-black uppercase tracking-[0.2em] hover:bg-black dark:hover:bg-white hover:text-white dark:hover:text-black transition-all"
                      >
                        Riprova
                      </button>
                      <a
                        href="mailto:info@scandellarigiacintosnc.it"
                        className="px-8 py-4 bg-black dark:bg-white text-white dark:text-black text-xs font-black uppercase tracking-[0.2em] hover:opacity-80 transition-opacity"
                      >
                        Invia Email Diretta
                      </a>
                    </div>
                  </div>
                ) : (
                  <form id="application-form" onSubmit={handleSubmit(onSubmit)} className="space-y-px bg-black/8 dark:bg-white/5 border border-black/10 dark:border-white/5 animate-fade-in">
                    {[
                      { id: 'name', label: 'Nome e Cognome', type: 'text' },
                      { id: 'email', label: 'Email', type: 'email' },
                      { id: 'phone', label: 'Telefono', type: 'tel' }
                    ].map((f) => (
                      <div key={f.id} className="bg-white dark:bg-black p-6 md:p-8 group focus-within:bg-stone-50 dark:focus-within:bg-white/5 transition-colors border-b border-black/10 dark:border-white/10">
                        <label
                          htmlFor={f.id}
                            className={`block text-xs font-black uppercase mb-3 group-focus-within:text-primary transition-colors ${errors[f.id as keyof ApplicationFormData] ? 'text-red-500' : metaTextClasses}`}
                        >
                          {f.label}
                        </label>
                        <input
                          id={f.id}
                          type={f.type}
                          {...register(f.id as keyof ApplicationFormData)}
                          className={`w-full bg-transparent border-b pb-2 text-lg md:text-xl focus:ring-0 font-bold text-black dark:text-white transition-colors placeholder:text-black/40 placeholder:font-medium dark:placeholder:text-white/30 ${errors[f.id as keyof ApplicationFormData] ? 'border-red-500 focus:border-red-500' : 'border-black/10 dark:border-white/20 focus:border-primary'}`}
                          placeholder={`Inserisci ${f.label.toLowerCase()}...`}
                        />
                        {errors[f.id as keyof ApplicationFormData] && (
                          <p className="text-red-500 text-[10px] font-black uppercase mt-2">{errors[f.id as keyof ApplicationFormData]?.message as string}</p>
                        )}
                      </div>
                    ))}
                    <div className="bg-white dark:bg-black p-6 md:p-8 group focus-within:bg-stone-50 dark:focus-within:bg-white/5 transition-colors">
                      <label className={`block text-xs font-black uppercase mb-4 group-focus-within:text-primary transition-colors ${errors.cv ? 'text-red-500' : metaTextClasses}`}>
                        Curriculum Vitae
                      </label>

                      <label className={`block border-2 border-dashed p-12 text-center group hover:border-primary transition-colors cursor-pointer ${errors.cv ? 'border-red-500' : 'border-black/10 dark:border-white/10'}`}>
                        <span className={`text-sm font-black uppercase tracking-widest transition-opacity block mb-2 opacity-80 group-hover:opacity-100 ${secondaryTextClasses}`}>
                          {selectedCvFile ? 'Cambia File' : 'Seleziona File'}
                        </span>
                        <span className={`text-xs font-bold block ${metaTextClasses}`}>Max 5MB · PDF, DOCX</span>
                        <input
                          type="file"
                          accept=".pdf,.doc,.docx"
                          className="hidden"
                          {...register('cv', {
                            onChange: () => {
                              trigger('cv');
                            }
                          })}
                        />
                      </label>

                      {selectedCvFile && (
                        <div className="mt-4 p-4 bg-stone-50 dark:bg-white/5 border border-black/10 dark:border-white/5 flex items-center justify-between animate-fade-in">
                          <div className="flex items-center gap-4 overflow-hidden">
                            <div className="w-10 h-10 bg-primary/10 flex items-center justify-center shrink-0 rounded-sm">
                              <BriefcaseIcon className="w-5 h-5 text-primary" />
                            </div>
                            <div className="min-w-0">
                              <p className="text-sm font-bold truncate text-black dark:text-white">{selectedCvFile.name}</p>
                              <p className={`text-[10px] font-medium ${metaTextClasses}`}>
                                {(selectedCvFile.size / 1024 / 1024).toFixed(2)} MB
                              </p>
                            </div>
                          </div>
                          <button
                            type="button"
                            onClick={() => {
                              setValue('cv', null);
                              trigger('cv');
                            }}
                            className={`p-3 hover:bg-red-50 dark:hover:bg-red-900/10 transition-colors hover:text-red-500 rounded-sm ${metaTextClasses}`}
                          >
                            <XMarkIcon className="w-5 h-5" />
                          </button>
                        </div>
                      )}
                      {errors.cv && (
                        <p className="text-red-500 text-[10px] font-black uppercase mt-4 text-center">{errors.cv.message as string}</p>
                      )}
                    </div>
                  </form>
                )}
              </div>
            </div>

            {(status === 'idle' || status === 'submitting') && (
              <div className="p-6 md:p-8 bg-white dark:bg-black border-t border-black/10 dark:border-white/5 flex flex-col md:flex-row gap-6 md:items-center justify-between shrink-0 mb-safe">
                <p className={`hidden md:block text-xs font-black uppercase tracking-widest ${metaTextClasses}`}>Invio candidatura conforme alla privacy</p>
                <button
                  type="submit"
                  form="application-form"
                  disabled={status === 'submitting'}
                  className="w-full md:w-auto bg-black dark:bg-white text-white dark:text-black px-12 py-5 text-xs font-black uppercase tracking-[0.4em] hover:bg-primary transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {status === 'submitting' ? 'Invio in corso...' : 'Invia Candidatura'}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
}

export default CareersPage;
