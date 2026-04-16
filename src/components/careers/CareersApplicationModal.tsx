import { Dialog, DialogPanel } from '@headlessui/react';
import {
  ArrowUpTrayIcon,
  BriefcaseIcon,
  CheckCircleIcon,
  ClipboardDocumentCheckIcon,
  MapPinIcon,
  ShieldCheckIcon,
  SparklesIcon,
  UserGroupIcon,
  XMarkIcon,
} from '@heroicons/react/24/outline';
import { zodResolver } from '@hookform/resolvers/zod';
import { AnimatePresence, motion, useReducedMotion } from 'motion/react';
import { useEffect, useId, useMemo, useRef, useState } from 'react';
import { useForm, type UseFormRegisterReturn } from 'react-hook-form';
import * as z from 'zod';
import {
  metaTextClasses,
  primaryTextClasses,
  secondaryTextClasses,
} from '../utils/ColorStyles';

const MAX_FILE_SIZE = 5 * 1024 * 1024;
const ACCEPTED_FILE_TYPES = [
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
] as const;

const UPLOAD_ACCEPT_ATTRIBUTE = '.pdf,.doc,.docx';
const MOTION_EASE: [number, number, number, number] = [0.22, 1, 0.36, 1];
const PROCESS_ITEMS = [
  'Recapiti aggiornati',
  'CV leggibile e coerente',
  'Esperienza e disponibilità indicate con chiarezza',
] as const;

const applicationSchema = z.object({
  name: z.string().min(2, 'Il nome deve contenere almeno 2 caratteri'),
  email: z.string().email('Inserisci un indirizzo email valido'),
  phone: z.string().min(6, 'Inserisci un numero di telefono valido'),
  cv: z.custom<FileList | null | undefined>()
    .refine((files) => files?.length === 1, 'Il CV è obbligatorio')
    .refine((files) => {
      const file = files?.item(0);
      return !!file && file.size <= MAX_FILE_SIZE;
    }, 'La dimensione massima è 5MB')
    .refine((files) => {
      const fileType = files?.item(0)?.type;
      return !!fileType && ACCEPTED_FILE_TYPES.includes(fileType as (typeof ACCEPTED_FILE_TYPES)[number]);
    }, 'Formati supportati: PDF, DOC, DOCX. Le foto non sono ammesse.'),
});

type SubmissionStatus = 'idle' | 'submitting' | 'success' | 'error';

export type CareersApplicationModalJob = {
  descrizione: string;
  dipartimento: string;
  requisiti: string[];
  responsabilita: string[];
  sede: string;
  tipo: string;
  titolo: string;
};

export type ApplicationFormData = z.infer<typeof applicationSchema>;

type CareersApplicationModalProps = {
  isOpen: boolean;
  job: CareersApplicationModalJob | null;
  onClose: () => void;
  onSubmitApplication: (data: ApplicationFormData, job: CareersApplicationModalJob | null) => Promise<void>;
};

type InputFieldProps = {
  autoComplete: string;
  error?: string;
  id: string;
  label: string;
  placeholder: string;
  registerProps: UseFormRegisterReturn;
  type: 'email' | 'tel' | 'text';
};

type StatusViewProps = {
  isError?: boolean;
  onAction: () => void;
  title: string;
};

function InputField({
  autoComplete,
  error,
  id,
  label,
  placeholder,
  registerProps,
  type,
}: InputFieldProps) {
  return (
    <label htmlFor={id} className="block">
      <span className={`mb-3 block text-[10px] font-black uppercase tracking-[0.32em] ${error ? 'text-red-500' : metaTextClasses}`}>
        {label}
      </span>
      <div className={`border px-5 py-4 transition-colors duration-200 ${error ? 'border-red-500/70 bg-red-50/70 dark:bg-red-950/10' : 'border-black/10 bg-white dark:border-white/10 dark:bg-black/30 focus-within:border-primary hover:border-black/20 dark:hover:border-white/20'}`}>
        <input
          id={id}
          autoComplete={autoComplete}
          type={type}
          {...registerProps}
          className={`w-full bg-transparent text-base font-bold outline-none placeholder:font-medium placeholder:text-black/35 dark:placeholder:text-white/25 ${primaryTextClasses}`}
          placeholder={placeholder}
        />
      </div>
      {error ? (
        <p className="mt-2 text-[10px] font-black uppercase tracking-[0.16em] text-red-500">
          {error}
        </p>
      ) : null}
    </label>
  );
}

function StatusView({ isError = false, onAction, title }: StatusViewProps) {
  return (
    <div className="flex min-h-[420px] flex-col items-center justify-center px-6 py-12 text-center">
      <div className={`mb-8 flex h-20 w-20 items-center justify-center rounded-full border ${isError ? 'border-red-500/20 bg-red-500/10 text-red-500' : 'border-emerald-500/20 bg-emerald-500/10 text-emerald-500'}`}>
        {isError ? <XMarkIcon className="h-10 w-10" /> : <CheckCircleIcon className="h-10 w-10" />}
      </div>
      <p className={`mb-3 text-[10px] font-black uppercase tracking-[0.36em] ${metaTextClasses}`}>
        {isError ? 'Invio non completato' : 'Invio completato'}
      </p>
      <h3 className={`max-w-lg text-3xl font-black tracking-tight md:text-4xl ${primaryTextClasses}`}>
        {title}
      </h3>
      <p className={`mt-4 max-w-md text-sm font-medium leading-relaxed md:text-base ${secondaryTextClasses}`}>
        {isError
          ? 'L’invio non è andato a buon fine. Riprova subito oppure contattaci via email con il CV in allegato.'
          : 'Il profilo è stato ricevuto. Se il ruolo è coerente con esperienza e disponibilità, il team ti ricontatterà.'}
      </p>
      <button
        type="button"
        onClick={onAction}
        className={`mt-10 inline-flex items-center justify-center border px-7 py-4 text-[11px] font-black uppercase tracking-[0.3em] transition-colors ${isError ? 'border-black/10 hover:border-primary hover:text-primary dark:border-white/10' : 'bg-black text-white hover:bg-primary dark:bg-white dark:text-black'}`}
      >
        {isError ? 'Riprova ora' : 'Chiudi candidatura'}
      </button>
    </div>
  );
}

function CareersApplicationModal({
  isOpen,
  job,
  onClose,
  onSubmitApplication,
}: CareersApplicationModalProps) {
  const shouldReduceMotion = useReducedMotion();
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const titleId = useId();
  const [status, setStatus] = useState<SubmissionStatus>('idle');

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    trigger,
    watch,
    formState: { errors },
  } = useForm<ApplicationFormData>({
    resolver: zodResolver(applicationSchema),
    mode: 'onBlur',
  });

  const selectedFile = watch('cv');
  const selectedCvFile = selectedFile?.[0];
  const summaryItems = useMemo(
    () => (job
      ? [
          { icon: UserGroupIcon, label: 'Dipartimento', value: job.dipartimento },
          { icon: BriefcaseIcon, label: 'Contratto', value: job.tipo },
          { icon: MapPinIcon, label: 'Sede', value: job.sede },
        ]
      : []),
    [job]
  );

  const { ref: cvFieldRef, ...cvField } = register('cv', {
    onChange: () => {
      void trigger('cv');
    },
  });

  useEffect(() => {
    if (!isOpen) return;

    setStatus('idle');
    reset();

    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  }, [isOpen, reset]);

  const handleClose = () => {
    if (status === 'submitting') return;
    onClose();
  };

  const clearSelectedFile = () => {
    setValue('cv', null, { shouldDirty: true });
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    void trigger('cv');
  };

  const onSubmit = handleSubmit(async (data) => {
    setStatus('submitting');

    try {
      await onSubmitApplication(data, job);
      setStatus('success');
    } catch {
      setStatus('error');
    }
  });

  const overlayTransition = shouldReduceMotion
    ? { duration: 0 }
    : { duration: 0.24, ease: MOTION_EASE };

  const panelTransition = shouldReduceMotion
    ? { duration: 0 }
    : { duration: 0.34, ease: MOTION_EASE };

  return (
    <AnimatePresence>
      {isOpen ? (
        <Dialog static open={isOpen} onClose={handleClose} className="fixed inset-0 z-[110]">
          <motion.div
            key="application-overlay"
            className="absolute inset-0 bg-black/65 backdrop-blur-md"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={overlayTransition}
          />

          <div className="absolute inset-0 md:p-4">
            <div className="flex h-full items-end justify-center md:items-center">
              <motion.div
                key="application-panel"
                initial={shouldReduceMotion ? false : { opacity: 0, y: 28, scale: 0.985 }}
                animate={shouldReduceMotion ? { opacity: 1 } : { opacity: 1, y: 0, scale: 1 }}
                exit={shouldReduceMotion ? { opacity: 0 } : { opacity: 0, y: 20, scale: 0.99 }}
                transition={panelTransition}
                className="w-full max-w-6xl"
              >
                <DialogPanel
                  aria-labelledby={titleId}
                  className="relative grid h-[100svh] w-full grid-rows-[auto_minmax(0,1fr)] overflow-hidden border-black/10 bg-stone-50 shadow-[0_32px_120px_rgba(0,0,0,0.28)] dark:border-white/10 dark:bg-black md:h-[calc(100dvh-2rem)] md:rounded-[28px] md:border"
                >
                  <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-primary/60 to-transparent" />
                  <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(circle_at_top_right,rgba(37,99,235,0.14),transparent_26%),radial-gradient(circle_at_bottom_left,rgba(255,255,255,0.08),transparent_22%)] dark:bg-[radial-gradient(circle_at_top_right,rgba(37,99,235,0.18),transparent_24%),radial-gradient(circle_at_bottom_left,rgba(255,255,255,0.06),transparent_18%)]" />

                  <div className="relative flex items-center justify-between border-b border-black/10 px-5 py-5 dark:border-white/10 md:px-8 md:py-6">
                    <div className="min-w-0">
                      <p className={`mb-2 text-[10px] font-black uppercase tracking-[0.34em] ${metaTextClasses}`}>
                        {job ? 'Invio candidatura' : 'Candidatura spontanea'}
                      </p>
                      <h2 id={titleId} className={`truncate pr-4 text-2xl font-black tracking-tight md:text-3xl ${primaryTextClasses}`}>
                        {job?.titolo ?? 'Nuova risorsa per il team'}
                      </h2>
                    </div>

                    <button
                      type="button"
                      onClick={handleClose}
                      aria-label="Chiudi candidatura"
                      className={`flex h-12 w-12 items-center justify-center rounded-full border border-black/10 bg-white/90 transition-colors hover:border-primary hover:text-primary dark:border-white/10 dark:bg-dark-surface ${primaryTextClasses}`}
                    >
                      <XMarkIcon className="h-6 w-6" />
                    </button>
                  </div>

                  <div
                    className="min-h-0 overflow-y-auto overscroll-contain [touch-action:pan-y] [-webkit-overflow-scrolling:touch]"
                    data-lenis-prevent
                    data-lenis-prevent-touch
                    data-lenis-prevent-wheel
                  >
                    <div className="grid min-h-full lg:grid-cols-[380px_minmax(0,1fr)]">
                      <aside className="border-b border-black/10 bg-white/90 px-5 py-6 backdrop-blur-sm dark:border-white/10 dark:bg-dark-surface md:px-8 lg:border-b-0 lg:border-r">
                        <div className="space-y-8">
                          <div>
                            <p className={`mb-4 text-[10px] font-black uppercase tracking-[0.34em] ${metaTextClasses}`}>
                              Checklist candidatura
                            </p>
                            <div className="space-y-3">
                              {PROCESS_ITEMS.map((item) => (
                                <div key={item} className="flex items-start gap-3">
                                  <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-primary/15 bg-primary/10 text-primary">
                                    <ClipboardDocumentCheckIcon className="h-4 w-4" />
                                  </div>
                                  <p className={`text-sm font-medium leading-relaxed ${secondaryTextClasses}`}>
                                    {item}
                                  </p>
                                </div>
                              ))}
                            </div>
                          </div>

                          {job ? (
                            <div className="overflow-hidden border border-black/10 bg-stone-50 dark:border-white/10 dark:bg-dark-elevated/70">
                              <div className="border-b border-black/10 px-5 py-4 dark:border-white/10">
                                <p className={`text-[10px] font-black uppercase tracking-[0.34em] ${metaTextClasses}`}>
                                  Riepilogo ruolo
                                </p>
                              </div>
                              <div className="space-y-5 p-5">
                                <div className="flex flex-wrap gap-2">
                                  {summaryItems.map((item) => (
                                    <span
                                      key={item.label}
                                      className="inline-flex items-center gap-2 border border-black/10 bg-white px-3 py-2 text-[10px] font-black uppercase tracking-[0.22em] text-primary dark:border-white/10 dark:bg-black/40"
                                    >
                                      <item.icon className="h-4 w-4" />
                                      {item.value}
                                    </span>
                                  ))}
                                </div>

                                <p className={`text-sm font-medium leading-relaxed ${secondaryTextClasses}`}>
                                  {job.descrizione}
                                </p>

                                {job.responsabilita.length > 0 ? (
                                  <div>
                                    <p className={`mb-3 text-[10px] font-black uppercase tracking-[0.34em] ${metaTextClasses}`}>
                                      Attività principali
                                    </p>
                                    <div className="space-y-3">
                                      {job.responsabilita.slice(0, 3).map((item) => (
                                        <div key={item} className="flex items-start gap-3">
                                          <CheckCircleIcon className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
                                          <p className={`text-sm font-medium leading-relaxed ${secondaryTextClasses}`}>
                                            {item}
                                          </p>
                                        </div>
                                      ))}
                                    </div>
                                  </div>
                                ) : null}

                                {job.requisiti.length > 0 ? (
                                  <div>
                                    <p className={`mb-3 text-[10px] font-black uppercase tracking-[0.34em] ${metaTextClasses}`}>
                                      Requisiti essenziali
                                    </p>
                                    <div className="space-y-3">
                                      {job.requisiti.slice(0, 3).map((item) => (
                                        <div key={item} className="flex items-start gap-3">
                                          <ShieldCheckIcon className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
                                          <p className={`text-sm font-medium leading-relaxed ${secondaryTextClasses}`}>
                                            {item}
                                          </p>
                                        </div>
                                      ))}
                                    </div>
                                  </div>
                                ) : null}
                              </div>
                            </div>
                          ) : (
                            <div className="overflow-hidden border border-black/10 bg-stone-50 dark:border-white/10 dark:bg-dark-elevated/70">
                              <div className="border-b border-black/10 px-5 py-4 dark:border-white/10">
                                <p className={`text-[10px] font-black uppercase tracking-[0.34em] ${metaTextClasses}`}>
                                  Candidatura spontanea
                                </p>
                              </div>
                              <div className="space-y-4 p-5">
                                <div className="flex items-start gap-3">
                                  <div className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                                    <SparklesIcon className="h-5 w-5" />
                                  </div>
                                  <p className={`text-sm font-medium leading-relaxed ${secondaryTextClasses}`}>
                                    Il profilo viene tenuto per aperture future coerenti con ruoli tecnici, operativi o di supporto.
                                  </p>
                                </div>
                                <div className="flex items-start gap-3">
                                  <div className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                                    <MapPinIcon className="h-5 w-5" />
                                  </div>
                                  <p className={`text-sm font-medium leading-relaxed ${secondaryTextClasses}`}>
                                    Se hai vincoli o disponibilità territoriali, devono risultare subito leggibili nel CV.
                                  </p>
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                      </aside>

                      <section className="flex flex-col px-5 py-6 md:px-8 md:py-8">
                        {status === 'success' ? (
                          <StatusView
                            title="Candidatura inviata correttamente"
                            onAction={handleClose}
                          />
                        ) : status === 'error' ? (
                          <StatusView
                            isError
                            title="Non siamo riusciti a inviare la candidatura"
                            onAction={() => setStatus('idle')}
                          />
                        ) : (
                          <form onSubmit={onSubmit} className="mx-auto flex h-full w-full max-w-2xl flex-col">
                            <div className="mb-8">
                              <p className={`mb-3 text-[10px] font-black uppercase tracking-[0.34em] ${metaTextClasses}`}>
                                Dati essenziali
                              </p>
                              <h3 className={`text-3xl font-black tracking-tight md:text-4xl ${primaryTextClasses}`}>
                                Invia i dati necessari.
                              </h3>
                              <p className={`mt-3 max-w-xl text-sm font-medium leading-relaxed md:text-base ${secondaryTextClasses}`}>
                                Il form raccoglie solo i dati operativi. Esperienza, disponibilità e dettagli utili devono stare nel CV.
                              </p>
                            </div>

                            <div className="space-y-5">
                              <InputField
                                id="application-name"
                                autoComplete="name"
                                error={errors.name?.message}
                                label="Nome e cognome"
                                placeholder="Mario Rossi"
                                registerProps={register('name')}
                                type="text"
                              />
                              <InputField
                                id="application-email"
                                autoComplete="email"
                                error={errors.email?.message}
                                label="Email"
                                placeholder="nome@azienda.it"
                                registerProps={register('email')}
                                type="email"
                              />
                              <InputField
                                id="application-phone"
                                autoComplete="tel"
                                error={errors.phone?.message}
                                label="Telefono"
                                placeholder="+39 333 1234567"
                                registerProps={register('phone')}
                                type="tel"
                              />

                              <div>
                                <span className={`mb-3 block text-[10px] font-black uppercase tracking-[0.32em] ${errors.cv ? 'text-red-500' : metaTextClasses}`}>
                                  Curriculum vitae
                                </span>

                                <label className={`group relative block cursor-pointer overflow-hidden border border-dashed px-5 py-6 transition-colors ${errors.cv ? 'border-red-500/70 bg-red-50/70 dark:bg-red-950/10' : 'border-black/15 bg-white hover:border-primary dark:border-white/15 dark:bg-dark-elevated/70'}`}>
                                  <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                                    <div className="flex items-start gap-4">
                                      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                                        <ArrowUpTrayIcon className="h-6 w-6" />
                                      </div>
                                      <div>
                                        <p className={`text-base font-black tracking-tight ${primaryTextClasses}`}>
                                          {selectedCvFile ? 'Sostituisci il file selezionato' : 'Carica il tuo CV'}
                                        </p>
                                        <p className={`mt-1 text-sm font-medium leading-relaxed ${secondaryTextClasses}`}>
                                          PDF, DOC o DOCX. Dimensione massima 5MB.
                                        </p>
                                      </div>
                                    </div>
                                    <span className="inline-flex items-center justify-center border border-black/10 px-4 py-3 text-[10px] font-black uppercase tracking-[0.24em] transition-colors group-hover:border-primary group-hover:text-primary dark:border-white/10">
                                      {selectedCvFile ? 'Cambia file' : 'Seleziona'}
                                    </span>
                                  </div>

                                  <input
                                    type="file"
                                    accept={UPLOAD_ACCEPT_ATTRIBUTE}
                                    className="sr-only"
                                    {...cvField}
                                    ref={(element) => {
                                      cvFieldRef(element);
                                      fileInputRef.current = element;
                                    }}
                                  />
                                </label>

                                {selectedCvFile ? (
                                  <div className="mt-4 flex items-center justify-between gap-4 border border-black/10 bg-white px-4 py-4 dark:border-white/10 dark:bg-dark-elevated/70">
                                    <div className="min-w-0">
                                      <p className={`truncate text-sm font-bold ${primaryTextClasses}`}>
                                        {selectedCvFile.name}
                                      </p>
                                      <p className={`mt-1 text-[10px] font-black uppercase tracking-[0.22em] ${metaTextClasses}`}>
                                        {(selectedCvFile.size / 1024 / 1024).toFixed(2)} MB
                                      </p>
                                    </div>
                                    <button
                                      type="button"
                                      onClick={clearSelectedFile}
                                      className={`shrink-0 border border-black/10 px-4 py-3 text-[10px] font-black uppercase tracking-[0.24em] transition-colors hover:border-red-500 hover:text-red-500 dark:border-white/10 ${metaTextClasses}`}
                                    >
                                      Rimuovi
                                    </button>
                                  </div>
                                ) : null}

                                {errors.cv ? (
                                  <p className="mt-2 text-[10px] font-black uppercase tracking-[0.16em] text-red-500">
                                    {errors.cv.message}
                                  </p>
                                ) : null}
                              </div>
                            </div>

                            <div className="mt-8 border border-black/10 bg-white/90 p-5 backdrop-blur-sm dark:border-white/10 dark:bg-dark-elevated/70">
                              <p className={`text-[10px] font-black uppercase tracking-[0.34em] ${metaTextClasses}`}>
                                Uso dei dati
                              </p>
                              <p className={`mt-3 text-sm font-medium leading-relaxed ${secondaryTextClasses}`}>
                                I dati vengono usati solo per valutare la candidatura. Il contatto, se utile, avviene via email o telefono.
                              </p>
                            </div>

                            <div className="mt-auto pt-8">
                              <div className="flex flex-col gap-4 border-t border-black/10 pt-6 dark:border-white/10 sm:flex-row sm:items-center sm:justify-between">
                                <p className={`max-w-sm text-xs font-black uppercase tracking-[0.24em] ${metaTextClasses}`}>
                                  Invio rapido, lettura immediata, nessun campo superfluo
                                </p>
                                <div className="flex flex-col gap-3 sm:flex-row">
                                  <button
                                    type="button"
                                    onClick={handleClose}
                                    className="border border-black/10 px-5 py-4 text-[11px] font-black uppercase tracking-[0.28em] transition-colors hover:border-primary hover:text-primary dark:border-white/10"
                                  >
                                    Annulla
                                  </button>
                                  <button
                                    type="submit"
                                    disabled={status === 'submitting'}
                                    className="inline-flex min-w-[220px] items-center justify-center bg-black px-6 py-4 text-[11px] font-black uppercase tracking-[0.28em] text-white transition-colors hover:bg-primary disabled:cursor-not-allowed disabled:opacity-60 dark:bg-white dark:text-black"
                                  >
                                    {status === 'submitting' ? 'Invio in corso...' : 'Invia candidatura'}
                                  </button>
                                </div>
                              </div>
                            </div>
                          </form>
                        )}
                      </section>
                    </div>
                  </div>
                </DialogPanel>
              </motion.div>
            </div>
          </div>
        </Dialog>
      ) : null}
    </AnimatePresence>
  );
}

export default CareersApplicationModal;
