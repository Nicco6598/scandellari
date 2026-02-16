import React, { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import Layout from '../components/layout/Layout';
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

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ACCEPTED_FILE_TYPES = [
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
];

const applicationSchema = z.object({
  name: z.string().min(2, 'Il nome deve contenere almeno 2 caratteri'),
  email: z.string().email('Inserisci un indirizzo email valido'),
  phone: z.string().min(6, 'Inserisci un numero di telefono valido'),
  cv: z.any()
    .refine((files) => files?.length === 1, 'Il CV è obbligatorio')
    .refine((files) => files?.[0]?.size <= MAX_FILE_SIZE, 'La dimensione massima è 5MB')
    .refine(
      (files) => ACCEPTED_FILE_TYPES.includes(files?.[0]?.type),
      'Formati supportati: PDF, DOC, DOCX. Le foto non sono ammesse.'
    ),
});

type ApplicationFormData = z.infer<typeof applicationSchema>;

const CareersPage: React.FC = () => {
  const [offerte, setOfferte] = useState<OffertaLavoroData[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [selectedJob, setSelectedJob] = useState<OffertaLavoroData | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [status, setStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle');
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

  // Filter States
  const [filterDipartimento, setFilterDipartimento] = useState('');
  const [filterTipo, setFilterTipo] = useState('');
  const [filterSede, setFilterSede] = useState('');

  const filteredOfferte = offerte.filter(job => {
    const matchDip = !filterDipartimento || job.dipartimento === filterDipartimento;
    const matchTipo = !filterTipo || job.tipo === filterTipo;
    const matchSede = !filterSede || job.sede === filterSede;
    return matchDip && matchTipo && matchSede;
  });

  const filteredJobKeys = useMemo(
    () => filteredOfferte.map((job, index) => job.id ?? `job-${index}`),
    [filteredOfferte]
  );

  useEffect(() => {
    setIsJobDescriptionTruncated((prev) => {
      const next = { ...prev };
      let changed = false;

      for (const key of Object.keys(next)) {
        if (!filteredJobKeys.includes(key)) {
          delete next[key];
          changed = true;
        }
      }

      return changed ? next : prev;
    });

    const refs = jobDescriptionRefs.current;
    for (const key of Object.keys(refs)) {
      if (!filteredJobKeys.includes(key)) delete refs[key];
    }
  }, [filteredJobKeys]);

  useLayoutEffect(() => {
    const rafId = window.requestAnimationFrame(() => {
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
        console.error(err);
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

  const onSubmit = async (data: ApplicationFormData) => {
    setStatus('submitting');

    try {
      const backendUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3001';

      // Create FormData for file upload
      const formData = new FormData();
      formData.append('name', data.name);
      formData.append('email', data.email);
      formData.append('phone', data.phone);
      formData.append('subject', selectedJob?.titolo || 'Candidatura Spontanea');
      formData.append('message', selectedJob
        ? `Candidatura per la posizione: ${selectedJob.titolo}\n\nDipartimento: ${selectedJob.dipartimento}\nTipo contratto: ${selectedJob.tipo}\nSede: ${selectedJob.sede}`
        : 'Candidatura spontanea per posizioni future'
      );

      // Append CV file
      if (data.cv && data.cv[0]) {
        formData.append('cv', data.cv[0]);
      }

      const response = await fetch(`${backendUrl}/api/applications`, {
        method: 'POST',
        body: formData, // Don't set Content-Type header, browser will set it with boundary
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Errore durante l\'invio della candidatura');
      }

      // Success
      setStatus('success');

      // Track successful application submission (if Analytics is configured)
      if (typeof window !== 'undefined' && (window as any).gtag) {
        (window as any).gtag('event', 'form_submit', {
          category: 'engagement',
          label: 'job_application',
          value: 1,
          success: true,
          job_title: selectedJob?.titolo || 'spontaneous'
        });
      }
    } catch (error) {
      console.error('Error sending application:', error);
      setStatus('error');

      // Track failed application submission
      if (typeof window !== 'undefined' && (window as any).gtag) {
        (window as any).gtag('event', 'form_submit', {
          category: 'engagement',
          label: 'job_application',
          value: 0,
          success: false
        });
      }
    }
  };

  // Scroll Lock when modal is open
  useEffect(() => {
    if (isModalOpen) {
      const scrollY = window.scrollY;
      document.body.style.position = 'fixed';
      document.body.style.top = `-${scrollY}px`;
      document.body.style.width = '100%';
      document.body.style.overflow = 'hidden';
    } else {
      const scrollY = document.body.style.top;
      document.body.style.position = '';
      document.body.style.top = '';
      document.body.style.width = '';
      document.body.style.overflow = '';
      if (scrollY) {
        window.scrollTo(0, parseInt(scrollY || '0') * -1);
      }
    }
  }, [isModalOpen]);

  useEffect(() => {
    setExpandedJobId(null);
  }, [filterDipartimento, filterTipo, filterSede]);

  if (loading) return (
    <Layout>
      <div className="min-h-screen bg-gray-50 dark:bg-black pt-40 flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-black dark:border-white border-t-transparent animate-spin" />
      </div>
    </Layout>
  );

  return (
    <Layout>
      <div className="bg-gray-50 dark:bg-black min-h-screen pt-32 pb-20 font-sans">
        {/* Hero Section */}
        <section className="container mx-auto max-w-7xl px-6 mb-32">
          <div
            className="border-b border-black/5 dark:border-white/5 pb-20"
            data-animate="fade-up"
            data-animate-distance="20"
          >
            <div className="flex items-center gap-4 mb-12">
              <div className="w-12 h-[1px] bg-primary shadow-[0_0_8px_rgba(37,99,235,0.5)]" />
              <span className="text-[10px] font-black uppercase tracking-[0.4em] text-black/70 dark:text-white/60">
                Careers & Growth
              </span>
            </div>
            <h1 className="text-6xl md:text-8xl lg:text-9xl font-black text-black dark:text-white tracking-tighter leading-[0.8] font-heading mb-12">
              Unisciti al<br />Team
            </h1>
            <p className="text-base md:text-xl text-black/70 dark:text-white/60 max-w-2xl font-medium leading-relaxed">
              Cerchiamo professionisti pronti a costruire l'infrastruttura ferroviaria del domani. Innovazione, sicurezza e competenza tecnica sono i nostri pilastri.
            </p>
          </div>
        </section>

        {/* Culture & Benefits */}
        <section className="container mx-auto max-w-7xl px-6 mb-24">
          <div className="grid md:grid-cols-3 gap-px bg-gradient-to-br from-black/5 via-black/5 to-primary/5 dark:from-white/5 dark:via-white/5 dark:to-primary/10 border border-black/5 dark:border-white/5">
            {[
              { icon: SparklesIcon, title: "Innovazione", desc: "Accesso a tecnologie all'avanguardia nel settore segnalamento." },
              { icon: UserGroupIcon, title: "Formazione", desc: "Percorsi di crescita continua e tutoraggio specialistico." },
              { icon: ShieldCheckIcon, title: "Sicurezza", desc: "Ambiente di lavoro protetto con standard oltre la norma." }
            ].map((item, i) => (
              <div key={i} className="bg-white dark:bg-black p-8 space-y-4 group hover:bg-gray-50 dark:hover:bg-dark-surface transition-all duration-300">
                <item.icon className="w-6 h-6 text-primary group-hover:scale-110 transition-transform" />
                <h3 className="text-lg font-black uppercase tracking-widest font-heading">{item.title}</h3>
                <p className="text-xs text-black/70 dark:text-white/60 font-medium leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Job Openings */}
        <section className="container mx-auto max-w-7xl px-6 mb-40">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-8">
            <div>
              <h2 className="text-4xl font-black text-black dark:text-white tracking-tighter font-heading mb-4">Posizioni Aperte</h2>
              <div className="w-20 h-[1px] bg-black/10 dark:bg-white/10" />
            </div>

            {/* Filters */}
            <div className="flex flex-wrap gap-4">
              {[
                { label: 'Dipartimento', value: filterDipartimento, setter: setFilterDipartimento, options: Array.from(new Set(offerte.map(o => o.dipartimento))).sort() },
                { label: 'Contratto', value: filterTipo, setter: setFilterTipo, options: Array.from(new Set(offerte.map(o => o.tipo))).sort() },
                { label: 'Sede', value: filterSede, setter: setFilterSede, options: Array.from(new Set(offerte.map(o => o.sede))).sort() }
              ].map((filter, i) => (
                <div key={i} className="relative group">
                  <select
                    value={filter.value}
                    onChange={(e) => filter.setter(e.target.value)}
                    className="appearance-none bg-white dark:bg-dark-surface border border-black/10 dark:border-white/10 px-6 py-3 pr-10 text-xs font-black uppercase tracking-widest text-black/60 dark:text-white/60 focus:border-primary focus:ring-0 cursor-pointer min-w-[160px]"
                  >
                    <option value="">{filter.label}</option>
                    {filter.options.map(opt => (
                      <option key={opt} value={opt}>{opt}</option>
                    ))}
                  </select>
                  <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none">
                    <svg className="w-3 h-3 text-black/40 dark:text-white/40" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                  </div>
                </div>
              ))}

              {(filterDipartimento || filterTipo || filterSede) && (
                <button
                  onClick={() => {
                    setFilterDipartimento('');
                    setFilterTipo('');
                    setFilterSede('');
                  }}
                  className="px-6 py-3 text-xs font-black uppercase tracking-widest text-red-500 hover:bg-red-50 dark:hover:bg-red-900/10 transition-colors border border-transparent hover:border-red-200 dark:hover:border-red-900/30"
                >
                  Reset
                </button>
              )}
            </div>
          </div>

          {filteredOfferte.length > 0 ? (
            <div className="space-y-12">
              {filteredOfferte.map((job, index) => {
                const jobKey = job.id ?? `job-${index}`;
                return (
                <div
                  key={jobKey}
                  className="bg-white dark:bg-dark-surface border border-black/5 dark:border-white/5 hover:border-primary/30 p-8 md:p-12 group transition-all duration-500 flex flex-col md:grid md:grid-cols-12 gap-8 md:items-center"
                  data-animate="fade-up"
                  data-animate-delay={(index * 0.04).toFixed(2)}
                >
                  <div className="md:col-span-8 flex flex-col md:flex-row gap-6 md:gap-8 items-start">
                    <div className="w-12 h-12 bg-black/5 dark:bg-dark-elevated border border-black/5 dark:border-white/5 flex items-center justify-center shrink-0 group-hover:border-primary group-hover:bg-primary/10 transition-all rounded-lg md:rounded-none">
                      <BriefcaseIcon className="w-6 h-6 opacity-30 group-hover:opacity-100 group-hover:text-primary transition-all" />
                    </div>
                    <div className="flex-1">
                      <div className="flex flex-wrap items-center gap-3 mb-3">
                        <span className="text-xs font-black uppercase tracking-widest text-primary bg-primary/5 px-2 py-1 rounded md:bg-transparent md:p-0">{job.tipo}</span>
                        <span className="hidden md:block w-1 h-1 bg-black/10 dark:bg-white/10 rounded-full" />
                        <span className="text-xs font-black uppercase tracking-widest text-black/60 dark:text-white/40 flex items-center gap-2">
                          <MapPinIcon className="w-3 h-3" />
                          {job.sede}
                        </span>
                      </div>
                      <h3 className="text-2xl md:text-3xl font-black text-black dark:text-white mb-4 tracking-tight font-heading group-hover:text-primary transition-colors">{job.titolo}</h3>
                      <p
                        ref={(el) => {
                          jobDescriptionRefs.current[jobKey] = el;
                        }}
                        className={`text-sm text-black/70 dark:text-white/60 font-medium max-w-2xl leading-relaxed ${expandedJobId === jobKey ? '' : 'line-clamp-3 md:line-clamp-2'}`}
                      >
                        {job.descrizione}
                      </p>
                      {isJobDescriptionTruncated[jobKey] && (
                        <button
                          type="button"
                          onClick={() => setExpandedJobId((prev) => (prev === jobKey ? null : jobKey))}
                          className="mt-3 inline-flex text-primary text-xs font-black uppercase tracking-widest hover:underline"
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
                      className="w-full md:w-auto px-8 py-4 border-2 border-black dark:border-white text-[10px] font-black uppercase tracking-[0.3em] hover:bg-black dark:hover:bg-white hover:text-white dark:hover:text-black transition-all text-center"
                    >
                      Candidati Ora
                    </button>
                  </div>
                </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-20 border border-black/5 dark:border-white/5">
              <SparklesIcon className="w-12 h-12 mx-auto text-black/20 dark:text-white/20 mb-6" />
              <p className="text-black/40 dark:text-white/40 font-medium italic mb-6">Nessuna posizione corrisponde ai filtri selezionati.</p>
              <button
                onClick={() => {
                  setFilterDipartimento('');
                  setFilterTipo('');
                  setFilterSede('');
                }}
                className="text-primary text-xs font-black uppercase tracking-widest hover:underline"
              >
                Rimuovi Filtri
              </button>
            </div>
          )}
        </section>

        {/* Spontaneous Application */}
        <section className="container mx-auto max-w-7xl px-6">
          <div className="bg-black dark:bg-dark-surface text-white dark:text-white p-12 md:p-24 text-center space-y-10 border border-black/5 dark:border-white/5 relative overflow-hidden">
            {/* Subtle gradient overlay */}
            <div className="absolute inset-0 bg-gradient-to-br from-transparent via-transparent to-primary/10 dark:to-accent/10 pointer-events-none" />
            <div className="relative z-10">
              <h2 className="text-4xl md:text-6xl font-black font-heading leading-tight tracking-tighter uppercase">Candidatura Spontanea</h2>
              <p className="text-base md:text-xl opacity-80 font-medium max-w-2xl mx-auto leading-relaxed">
                Non trovi la posizione giusta? Inviaci comunque il tuo profilo. Cerchiamo sempre talenti motivati per far crescere il nostro dipartimento tecnico.
              </p>
              <div className="pt-6">
                <button
                  onClick={() => openApplication(null)}
                  className="inline-flex items-center gap-6 text-xs font-black uppercase tracking-[0.4em] group border-b-2 border-primary pb-2 hover:text-primary transition-all"
                >
                  Invia Profilo
                  <ArrowRightIcon className="w-6 h-6 transition-transform group-hover:translate-x-2" />
                </button>
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
            <div className="flex justify-between items-center p-6 md:p-12 border-b border-black/5 dark:border-white/5">
              <div>
                <h3 className="text-xs font-black uppercase tracking-widest text-primary mb-2">
                  {selectedJob ? 'Candidatura per' : 'Candidatura spontanea'}
                </h3>
                <h2 className="text-2xl md:text-4xl font-black font-heading tracking-tight">{selectedJob?.titolo || 'Nuova Risorsa'}</h2>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-4 hover:bg-black/5 dark:hover:bg-white/5 transition-colors group rounded-full"
              >
                <XMarkIcon className="w-8 h-8 md:w-10 md:h-10 transition-transform group-hover:rotate-90" />
              </button>
            </div>

            <div className="flex-grow overflow-y-auto overflow-x-hidden p-6 md:p-12">
              <div className="max-w-2xl mx-auto pb-20">
                {selectedJob && (
                  <div className="mb-12 p-8 bg-gray-50 dark:bg-white/5 border border-black/5 dark:border-white/5 space-y-4">
                    <div className="flex flex-wrap gap-4 text-[10px] font-black uppercase tracking-widest text-primary">
                      <span className="flex items-center gap-2"><MapPinIcon className="w-3 h-3" /> {selectedJob.sede}</span>
                      <span className="flex items-center gap-2"><BriefcaseIcon className="w-3 h-3" /> {selectedJob.tipo}</span>
                    </div>
                    <p className="text-sm text-black/70 dark:text-white/60 font-medium leading-relaxed">
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
                    <p className="text-black/70 dark:text-white/60 font-medium max-w-md mx-auto leading-relaxed">
                      Grazie per il tuo interesse. Il nostro team HR valuterà il tuo profilo e ti contatterà presto.
                    </p>
                    <button
                      onClick={() => setIsModalOpen(false)}
                      className="mt-12 px-8 py-4 bg-black dark:bg-white text-white dark:text-black text-xs font-black uppercase tracking-[0.2em] hover:opacity-80 transition-opacity"
                    >
                      Torna alla Home
                    </button>
                  </div>
                ) : status === 'error' ? (
                  <div className="flex flex-col items-center justify-center py-20 text-center animate-fade-in">
                    <div className="w-24 h-24 bg-red-500/10 rounded-full flex items-center justify-center mb-8">
                      <XMarkIcon className="w-12 h-12 text-red-500" />
                    </div>
                    <h3 className="text-3xl md:text-4xl font-black font-heading mb-4">Errore Invio</h3>
                    <p className="text-black/70 dark:text-white/60 font-medium max-w-md mx-auto leading-relaxed mb-8">
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
                  <form id="application-form" onSubmit={handleSubmit(onSubmit)} className="space-y-px bg-black/5 dark:bg-white/5 border border-black/5 dark:border-white/5 animate-fade-in">
                    {[
                      { id: 'name', label: 'Nome e Cognome', type: 'text' },
                      { id: 'email', label: 'Email', type: 'email' },
                      { id: 'phone', label: 'Telefono', type: 'tel' }
                    ].map((f) => (
                      <div key={f.id} className="bg-white dark:bg-black p-6 md:p-8 group focus-within:bg-gray-50 dark:focus-within:bg-white/5 transition-colors border-b border-black/5 dark:border-white/10">
                        <label
                          htmlFor={f.id}
                          className={`block text-xs font-black uppercase mb-3 group-focus-within:text-primary transition-colors ${errors[f.id as keyof ApplicationFormData] ? 'text-red-500' : 'text-black/70 dark:text-white/60'}`}
                        >
                          {f.label}
                        </label>
                        <input
                          id={f.id}
                          type={f.type}
                          {...register(f.id as keyof ApplicationFormData)}
                          className={`w-full bg-transparent border-b pb-2 text-lg md:text-xl focus:ring-0 font-bold text-black dark:text-white transition-colors placeholder:text-black/60 placeholder:font-medium dark:placeholder:text-white/50 ${errors[f.id as keyof ApplicationFormData] ? 'border-red-500 focus:border-red-500' : 'border-black/10 dark:border-white/20 focus:border-primary'}`}
                          placeholder={`Inserisci ${f.label.toLowerCase()}...`}
                        />
                        {errors[f.id as keyof ApplicationFormData] && (
                          <p className="text-red-500 text-[10px] font-black uppercase mt-2">{errors[f.id as keyof ApplicationFormData]?.message as string}</p>
                        )}
                      </div>
                    ))}
                    <div className="bg-white dark:bg-black p-6 md:p-8 group focus-within:bg-gray-50 dark:focus-within:bg-white/5 transition-colors">
                      <label className={`block text-xs font-black uppercase mb-4 group-focus-within:text-primary transition-colors ${errors.cv ? 'text-red-500' : 'text-black/70 dark:text-white/60'}`}>
                        Curriculum Vitae
                      </label>

                      <label className={`block border-2 border-dashed p-12 text-center group hover:border-primary transition-colors cursor-pointer ${errors.cv ? 'border-red-500' : 'border-black/10 dark:border-white/10'}`}>
                        <span className="text-sm font-black uppercase tracking-widest transition-opacity block mb-2 text-black/80 dark:text-white/70 opacity-80 group-hover:opacity-100">
                          {selectedFile?.length > 0 ? 'Cambia File' : 'Seleziona File'}
                        </span>
                        <span className="text-xs font-bold text-black/70 dark:text-white/40 block">Max 5MB (PDF, DOCX)</span>
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

                      {selectedFile?.length > 0 && (
                        <div className="mt-4 p-4 bg-gray-50 dark:bg-white/5 border border-black/5 dark:border-white/5 flex items-center justify-between animate-fade-in">
                          <div className="flex items-center gap-4 overflow-hidden">
                            <div className="w-10 h-10 bg-primary/10 flex items-center justify-center shrink-0 rounded-sm">
                              <BriefcaseIcon className="w-5 h-5 text-primary" />
                            </div>
                            <div className="min-w-0">
                              <p className="text-sm font-bold truncate text-black dark:text-white">{selectedFile[0].name}</p>
                              <p className="text-[10px] text-black/60 dark:text-white/40 font-medium">
                                {(selectedFile[0].size / 1024 / 1024).toFixed(2)} MB
                              </p>
                            </div>
                          </div>
                          <button
                            type="button"
                            onClick={() => {
                              setValue('cv', null);
                              trigger('cv');
                            }}
                            className="p-3 hover:bg-red-50 dark:hover:bg-red-900/10 transition-colors text-black/60 dark:text-white/40 hover:text-red-500 rounded-sm"
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
              <div className="p-6 md:p-8 bg-white dark:bg-black border-t border-black/5 dark:border-white/5 flex flex-col md:flex-row gap-6 md:items-center justify-between shrink-0 mb-safe">
                <p className="hidden md:block text-xs font-black uppercase tracking-widest text-black/70 dark:text-white/40">Invio candidatura conforme alla privacy</p>
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
      </div >
    </Layout >
  );
};

export default CareersPage;
