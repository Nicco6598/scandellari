import { useEffect, useRef, useState } from 'react';
import type { ReactNode } from 'react';
import Layout from '../components/layout/Layout';
import { logger } from '../utils/logger';
import SEO from '../components/utils/SEO';
import { trackFormSubmit } from '../components/utils/Analytics';
import Map, { Marker, Popup, NavigationControl } from 'react-map-gl/maplibre';
import maplibreCss from 'maplibre-gl/dist/maplibre-gl.css?inline';
import { useForm } from 'react-hook-form';
import { useTheme } from '../context/ThemeContext';
import { zodResolver } from '@hookform/resolvers/zod';
import gsap from 'gsap';
import * as z from 'zod';
import { useInjectedHeadStyle } from '../hooks/useInjectedHeadStyle';
import {
    MapPinIcon,
    PhoneIcon,
    EnvelopeIcon,
    ArrowRightIcon,
    XMarkIcon,
    CheckCircleIcon
} from '@heroicons/react/24/outline';

const companyCoords = { longitude: 9.59088, latitude: 45.51263 };

const contactSchema = z.object({
    name: z.string().min(2, 'Il nome deve contenere almeno 2 caratteri'),
    email: z.string().email('Inserisci un indirizzo email valido'),
    phone: z.string()
        .regex(/^[\d\s+\-()]*$/, 'Inserisci un numero di telefono valido')
        .optional()
        .or(z.literal('')),
    subject: z.string().min(3, 'L\'oggetto deve contenere almeno 3 caratteri'),
    message: z.string().min(10, 'Il messaggio deve contenere almeno 10 caratteri'),
});

type ContactFormData = z.infer<typeof contactSchema>;

type SubmissionStatus = 'idle' | 'submitting' | 'success' | 'error';

type MagneticLinkProps = {
    href: string;
    children: ReactNode;
    className?: string;
};

type ContactField = {
    id: keyof ContactFormData;
    label: string;
    type: 'text' | 'email' | 'tel';
};

const contactFields: ContactField[] = [
    { id: 'name', label: 'Nome e Cognome', type: 'text' },
    { id: 'email', label: 'Email Aziendale', type: 'email' },
    { id: 'phone', label: 'Telefono', type: 'tel' },
    { id: 'subject', label: 'Oggetto', type: 'text' }
];

function MagneticLink({ href, children, className = '' }: MagneticLinkProps) {
    const linkRef = useRef<HTMLAnchorElement>(null);

    useEffect(() => {
        const link = linkRef.current;
        if (!link) return;

        const handleMouseMove = (e: MouseEvent) => {
            const rect = link.getBoundingClientRect();
            const x = e.clientX - rect.left - rect.width / 2;
            const y = e.clientY - rect.top - rect.height / 2;
            gsap.to(link, { x: x * 0.1, y: y * 0.1, duration: 0.2, ease: 'power2.out' });
        };

        const handleMouseLeave = () => {
            gsap.to(link, { x: 0, y: 0, duration: 0.4, ease: 'elastic.out(1, 0.5)' });
        };

        link.addEventListener('mousemove', handleMouseMove);
        link.addEventListener('mouseleave', handleMouseLeave);
        return () => {
            link.removeEventListener('mousemove', handleMouseMove);
            link.removeEventListener('mouseleave', handleMouseLeave);
        };
    }, []);

    return (
        <a ref={linkRef} href={href} className={className}>
            {children}
        </a>
    );
}

function ContactPage() {
    const { theme } = useTheme();
    const [status, setStatus] = useState<SubmissionStatus>('idle');
    useInjectedHeadStyle(maplibreCss);
    const [viewState, setViewState] = useState({
        ...companyCoords,
        zoom: 13
    });

    const {
        register,
        handleSubmit,
        reset,
        formState: { errors }
    } = useForm<ContactFormData>({
        resolver: zodResolver(contactSchema)
    });

    const onSubmit = async (data: ContactFormData) => {
        setStatus('submitting');

        try {
            const backendUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3001';
            const response = await fetch(`${backendUrl}/api/contacts`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    name: data.name,
                    email: data.email,
                    phone: data.phone || '',
                    subject: data.subject,
                    message: data.message,
                }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Errore durante l\'invio del messaggio');
            }

            setStatus('success');
            reset();
            trackFormSubmit('contact_form', true);
        } catch (error) {
            logger.error('Error sending contact form:', error);
            setStatus('error');
            trackFormSubmit('contact_form', false);
        }
    };

    return (
        <Layout>
            <SEO
                title="Contatti - Richiedi Informazioni | Scandellari"
                description="Contattaci per consulenze tecniche, preventivi o informazioni sui nostri sistemi di segnalamento ferroviario. Sede a Treviglio (BG)."
                keywords="contatti scandellari, preventivo segnalamento, consulenza ferroviaria, Treviglio, Via Roggia Vignola"
                url="/contatti"
            />
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
                            <span className="text-[10px] font-black uppercase tracking-[0.4em] text-black/70 dark:text-white/60">
                                Canali Diretti
                            </span>
                        </div>
                        <h1 className="text-6xl md:text-8xl lg:text-9xl font-black text-black dark:text-white tracking-tighter leading-[0.8] font-heading mb-12">
                            Parliamo
                        </h1>
                        <p className="text-base md:text-xl text-black/70 dark:text-white/60 max-w-2xl font-medium leading-relaxed">
                            Contattaci per consulenze tecniche, preventivi o informazioni sui nostri sistemi di segnalamento ferroviario.
                        </p>
                    </div>
                </section>

                <main className="container mx-auto max-w-7xl px-6">
                    <div className="grid lg:grid-cols-12 gap-24">
                        {/* Contact Info */}
                        <div className="lg:col-span-5 space-y-20">
                            <div className="space-y-12">
                                <div className="group">
                                    <div className="text-xs font-black uppercase tracking-widest text-primary mb-4">Sede Operativa</div>
                                    <h3 className="text-2xl font-black text-black dark:text-white mb-2 font-heading">Treviglio, BG</h3>
                                    <p className="text-black/70 dark:text-white/60 font-medium">Via Roggia Vignola, 9<br />24047 Treviglio (BG)</p>
                                </div>

                                <div className="group">
                                    <div className="text-xs font-black uppercase tracking-widest text-primary mb-4">Recapiti</div>
                                    <div className="space-y-4">
                                        <MagneticLink href="tel:+390363303506" className="flex items-center gap-4 text-xl font-black hover:text-primary transition-colors">
                                            <PhoneIcon className="w-5 h-5" />
                                            +39 0363 303 506
                                        </MagneticLink>
                                        <MagneticLink href="mailto:info@scandellarigiacintosnc.it" className="flex items-center gap-4 text-xl font-black hover:text-primary transition-colors">
                                            <EnvelopeIcon className="w-5 h-5" />
                                            info@scandellarigiacintosnc.it
                                        </MagneticLink>
                                    </div>
                                </div>
                            </div>

                            {/* Map */}
                            <div className="aspect-square bg-black/8 dark:bg-dark-surface border border-black/10 dark:border-white/5 overflow-hidden group hover:border-primary/30 transition-all relative">
                                <Map
                                    {...viewState}
                                    onMove={evt => setViewState(evt.viewState)}
                                    style={{ width: '100%', height: '100%' }}
                                    mapStyle={theme === 'dark' 
                                        ? "https://basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json"
                                        : "https://basemaps.cartocdn.com/gl/positron-gl-style/style.json"
                                    }
                                    attributionControl={false}
                                >
                                    <NavigationControl position="top-right" />
                                    <Marker
                                        longitude={companyCoords.longitude}
                                        latitude={companyCoords.latitude}
                                        anchor="center"
                                    >
                                        <div className="relative group cursor-pointer flex items-center justify-center">
                                            {/* Hover square ripple */}
                                            <div className="absolute w-10 h-10 border border-primary/30 scale-0 group-hover:scale-110 transition-transform duration-500" />
                                            {/* Technical Square Marker (larger for headquarters) */}
                                            <div className="w-5 h-5 bg-white dark:bg-black border-2 border-primary z-10 transition-all duration-300 group-hover:bg-primary group-hover:border-white group-hover:rotate-45 shadow-[0_0_15px_rgba(37,99,235,0.3)]" />
                                        </div>
                                    </Marker>
                                    <Popup
                                        longitude={companyCoords.longitude}
                                        latitude={companyCoords.latitude}
                                        anchor="top"
                                        offset={15}
                                        closeButton={false}
                                        className="maplibre-popup-custom"
                                    >
                                        <div className="p-4 min-w-[180px] bg-white dark:bg-dark-surface border border-black/10 dark:border-white/10 shadow-xl">
                                            <span className="text-[9px] font-black uppercase tracking-widest text-primary mb-1 block">Sede Operativa</span>
                                            <h4 className="font-black uppercase text-xs tracking-tight text-black dark:text-white">Scandellari Giacinto s.n.c.</h4>
                                        </div>
                                    </Popup>
                                </Map>
                            </div>
                        </div>

                        {/* Contact Form */}
                        <div className="lg:col-span-7">
                            {status === 'success' ? (
                                <div className="bg-primary text-white p-12 md:p-20 text-center animate-fade-in">
                                        <CheckCircleIcon className="w-20 h-20 mx-auto mb-8" />
                                        <h2 className="text-4xl font-black mb-4 font-heading">Inviato</h2>
                                        <p className="opacity-80 font-medium">Grazie per averci contattato. Ti risponderemo entro 24 ore lavorative.</p>
                                        <button
                                            onClick={() => setStatus('idle')}
                                            className="mt-12 text-xs font-black uppercase tracking-[0.4em] border-b border-white pb-2"
                                        >
                                            Invia un altro messaggio
                                        </button>
                                </div>
                            ) : status === 'error' ? (
                                <div className="bg-red-500 text-white p-12 md:p-20 text-center animate-fade-in">
                                        <XMarkIcon className="w-20 h-20 mx-auto mb-8" />
                                        <h2 className="text-4xl font-black mb-4 font-heading">Errore</h2>
                                        <p className="opacity-80 font-medium mb-8">Si è verificato un errore durante l'invio del messaggio. Riprova o contattaci direttamente via email.</p>
                                        <div className="flex flex-col sm:flex-row gap-4 justify-center">
                                            <button
                                                onClick={() => setStatus('idle')}
                                                className="text-xs font-black uppercase tracking-[0.4em] border-2 border-white px-8 py-4 hover:bg-white hover:text-red-500 transition-all"
                                            >
                                                Riprova
                                            </button>
                                            <a
                                                href="mailto:info@scandellarigiacintosnc.it"
                                                className="text-xs font-black uppercase tracking-[0.4em] border-2 border-white px-8 py-4 hover:bg-white hover:text-red-500 transition-all"
                                            >
                                                Invia Email Diretta
                                            </a>
                                        </div>
                                </div>
                            ) : (
                                <form
                                    onSubmit={handleSubmit(onSubmit)}
                                    className="space-y-px bg-gradient-to-br from-black/8 via-black/8 to-primary/5 dark:from-white/5 dark:via-white/5 dark:to-primary/10 border border-black/10 dark:border-white/5 animate-fade-in"
                                >
                                        {contactFields.map((field) => (
                                            <div key={field.id} className="bg-white dark:bg-black p-8 group border-b border-black/10 dark:border-white/10 hover:bg-stone-50/50 dark:hover:bg-dark-surface focus-within:bg-stone-50 dark:focus-within:bg-dark-surface transition-all duration-300">
                                                <label
                                                    htmlFor={field.id}
                                                    className={`block text-xs font-black uppercase tracking-widest mb-4 group-focus-within:text-primary transition-colors ${errors[field.id] ? 'text-red-500' : 'text-black/70 dark:text-white/60'}`}
                                                >
                                                    {field.label}
                                                </label>
                                                <input
                                                    id={field.id}
                                                    type={field.type}
                                                    {...register(field.id)}
                                                    className={`w-full bg-transparent border-b pb-2 text-black dark:text-white font-black text-lg focus:ring-0 placeholder-black/40 dark:placeholder-white/30 transition-colors ${errors[field.id] ? 'border-red-500 focus:border-red-500' : 'border-black/10 dark:border-white/20 focus:border-primary'}`}
                                                />
                                                {errors[field.id] && (
                                                    <p className="text-red-500 text-[10px] font-black uppercase tracking-widest mt-2">
                                                        {errors[field.id]?.message}
                                                    </p>
                                                )}
                                            </div>
                                        ))}
                                        <div className="bg-white dark:bg-black p-8 group hover:bg-stone-50/50 dark:hover:bg-dark-surface focus-within:bg-stone-50 dark:focus-within:bg-dark-surface transition-all duration-300">
                                            <label
                                                htmlFor="message"
                                                className={`block text-xs font-black uppercase tracking-widest mb-4 group-focus-within:text-primary transition-colors ${errors.message ? 'text-red-500' : 'text-black/70 dark:text-white/60'}`}
                                            >
                                                Messaggio
                                            </label>
                                            <textarea
                                                id="message"
                                                rows={5}
                                                {...register('message')}
                                                className={`w-full bg-transparent border-b pb-2 text-black dark:text-white font-black text-lg focus:ring-0 resize-none placeholder-black/40 dark:placeholder-white/30 transition-colors ${errors.message ? 'border-red-500 focus:border-red-500' : 'border-black/10 dark:border-white/20 focus:border-primary'}`}
                                            />
                                            {errors.message && (
                                                <p className="text-red-500 text-[10px] font-black uppercase tracking-widest mt-2">
                                                    {errors.message.message}
                                                </p>
                                            )}
                                        </div>
                                        <button
                                            type="submit"
                                            disabled={status === 'submitting'}
                                            className="w-full bg-black dark:bg-white text-white dark:text-black p-10 text-[11px] font-black uppercase tracking-[0.4em] flex items-center justify-between group hover:bg-primary transition-colors disabled:opacity-50"
                                        >
                                            {status === 'submitting' ? 'Invio in corso...' : 'Invia Messaggio'}
                                            <ArrowRightIcon className="w-6 h-6 group-hover:translate-x-2 transition-transform" />
                                        </button>
                                </form>
                            )}
                        </div>
                    </div>
                </main>
            </div>
        </Layout>
    );
}

export default ContactPage;
