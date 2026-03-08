import React, { useEffect, useRef, useState } from 'react';
import Layout from '../components/layout/Layout';
import SEO from '../components/utils/SEO';
import gsap from 'gsap';
import {
    BuildingOffice2Icon,
    UserGroupIcon,
    ClockIcon,
    ShieldCheckIcon,
    CheckCircleIcon,
    MapPinIcon,
    WrenchScrewdriverIcon,
    BoltIcon,
} from '@heroicons/react/24/outline';

// ─── Animated Counter Hook ───────────────────────────────────────────────────
function useCountUp(target: number, duration: number = 1800, start: boolean = false) {
    const [count, setCount] = useState(0);
    useEffect(() => {
        if (!start) return;
        let startTime: number | null = null;
        const step = (timestamp: number) => {
            if (!startTime) startTime = timestamp;
            const progress = Math.min((timestamp - startTime) / duration, 1);
            const eased = 1 - Math.pow(1 - progress, 3);
            setCount(Math.floor(eased * target));
            if (progress < 1) requestAnimationFrame(step);
            else setCount(target);
        };
        requestAnimationFrame(step);
    }, [start, target, duration]);
    return count;
}

// ─── Intersection Observer Hook ──────────────────────────────────────────────
function useInView(threshold = 0.2): [React.MutableRefObject<HTMLDivElement | null>, boolean] {
    const ref = useRef<HTMLDivElement | null>(null);
    const [inView, setInView] = useState(false);
    useEffect(() => {
        const obs = new IntersectionObserver(
            ([entry]) => { if (entry.isIntersecting) { setInView(true); obs.disconnect(); } },
            { threshold }
        );
        if (ref.current) obs.observe(ref.current);
        return () => obs.disconnect();
    }, [threshold]);
    return [ref, inView];
}

// ─── Fade-in wrapper ──────────────────────────────────────────────────────────
const FadeIn: React.FC<{ children: React.ReactNode; delay?: number; className?: string }> = ({
    children, delay = 0, className = ''
}) => {
    const ref = useRef<HTMLDivElement>(null);
    useEffect(() => {
        const el = ref.current;
        if (!el) return;
        el.style.opacity = '0';
        el.style.transform = 'translateY(28px)';
        el.style.transition = `opacity 0.65s ease ${delay}s, transform 0.65s ease ${delay}s`;
        const obs = new IntersectionObserver(([entry]) => {
            if (entry.isIntersecting) {
                el.style.opacity = '1';
                el.style.transform = 'translateY(0)';
                obs.disconnect();
            }
        }, { threshold: 0.1, rootMargin: '0px 0px -30px 0px' });
        obs.observe(el);
        return () => obs.disconnect();
    }, [delay]);
    return <div ref={ref} className={className}>{children}</div>;
};

// ─── Magnetic Card with Hover ───────────────────────────────────────────────
const MagneticCard: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className = '' }) => {
    const cardRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const card = cardRef.current;
        if (!card) return;

        const handleMouseMove = (e: MouseEvent) => {
            const rect = card.getBoundingClientRect();
            const x = (e.clientX - rect.left) / rect.width - 0.5;
            const y = (e.clientY - rect.top) / rect.height - 0.5;
            gsap.to(card, { y: y * -12, duration: 0.3, ease: 'power2.out' });
        };

        const handleMouseLeave = () => {
            gsap.to(card, { y: 0, duration: 0.5, ease: 'elastic.out(1, 0.5)' });
        };

        card.addEventListener('mousemove', handleMouseMove);
        card.addEventListener('mouseleave', handleMouseLeave);
        return () => {
            card.removeEventListener('mousemove', handleMouseMove);
            card.removeEventListener('mouseleave', handleMouseLeave);
        };
    }, []);

    return <div ref={cardRef} className={className}>{children}</div>;
};

// ─── Stat Card with Counter ───────────────────────────────────────────────────
const StatCard: React.FC<{
    icon: React.ElementType;
    label: string;
    value: number;
    suffix?: string;
    delay?: number;
}> = ({ icon: Icon, label, value, suffix = '', delay = 0 }) => {
    const [ref, inView] = useInView(0.3);
    const count = useCountUp(value, 1800, inView);
    return (
        <FadeIn delay={delay}>
            <MagneticCard>
                <div ref={ref} className="bg-white dark:bg-black p-8 group hover:bg-stone-50 dark:hover:bg-dark-surface transition-all duration-300 border border-black/10 dark:border-white/5 hover:border-primary/30">
                    <Icon className="w-6 h-6 mb-4 text-primary group-hover:scale-110 transition-transform duration-300" />
                    <div className="text-xs font-black uppercase tracking-widest text-black/60 dark:text-white/40 mb-2">{label}</div>
                    <div className="text-4xl font-black text-black dark:text-white font-heading tabular-nums">
                        {count}{suffix}
                    </div>
                </div>
            </MagneticCard>
        </FadeIn>
    );
};

// ─── Main Component ───────────────────────────────────────────────────────────
const AboutPage: React.FC = () => {
    const [activeTimeline, setActiveTimeline] = useState<number | null>(null);

    const collaborazioni = [
        'R.F.I.', 'TRENITALIA', 'ITALFERR', 'SERFER-MERCITALIA S.& T.',
        'TRENORD', 'ALSTOM FERROVIARIA', 'ANSALDO FERROVIARIA', 'SIEMENS',
        'BONCIANI', 'A.C.M.A.R.', 'COSTRUZIONE LINEE FERROVIARIE',
        'VALSECCHI ARMAMENTO', 'G.C.F. GENERALE COSTRUZIONI FERROVIARIE'
    ];

    const competenze = [
        { text: 'Installazione impianti di segnalamento e sicurezza per linee "lente" e ad "alta velocità"', icon: BoltIcon },
        { text: 'Installazione impianti S.C.M.T., A.C.E.I., A.C.S., A.C.C., B.C.A.', icon: ShieldCheckIcon },
        { text: 'Allestimento tecnologico e funzionale DIGICODE alta velocità', icon: BoltIcon },
        { text: 'Installazione sistemi oleodinamici (TG 0,040 - 0,074 - 0,022 C.P.F./C.P.M. e MOT)', icon: WrenchScrewdriverIcon },
        { text: 'Installazione sistemi elettromeccanici (P.80, L.90, P.64, L.63, L.88, P.75, FS.55)', icon: WrenchScrewdriverIcon },
        { text: 'Installazione impianti R.E.D., Diffusione Sonora, L.F.M., T.L.C.', icon: BoltIcon },
        { text: 'Posa cavi in fibra ottica e realizzazione giunzioni ottiche', icon: CheckCircleIcon },
        { text: 'Allestimento locali tecnologici', icon: BuildingOffice2Icon },
        { text: 'Manutenzione ordinaria e straordinaria impianti segnalamento', icon: WrenchScrewdriverIcon },
        { text: 'Perizie di commessa', icon: CheckCircleIcon },
    ];

    const specializzazioni = [
        {
            area: 'Alta Velocità',
            badge: 'Core Expertise',
            items: ['DIGICODE AV', 'S.C.M.T.', 'A.C.E.I.', 'A.C.C.'],
            highlight: false,
        },
        {
            area: 'Sistemi Oleodinamici Ferroviari',
            badge: 'Eccellenza Tecnica',
            items: ['TG 0,040', 'TG 0,074', 'TG 0,022', 'C.P.F. / C.P.M.', 'MOT'],
            highlight: true,
        },
        {
            area: 'Manovre Oleodinamiche in Traversa',
            badge: 'Eccellenza Tecnica',
            items: ['Deviatoi ad azionamento oleodinamico', 'Traverse in calcestruzzo e legno', 'Impianti di comando centralizzato'],
            highlight: true,
        },
        {
            area: 'Sistemi Elettromeccanici',
            badge: 'Core Expertise',
            items: ['P.80', 'L.90', 'P.64', 'L.63', 'L.88', 'P.75', 'FS.55'],
            highlight: false,
        },
        {
            area: 'Infrastruttura TLC',
            badge: 'Specializzazione',
            items: ['Fibra Ottica', 'Giunzioni Ottiche', 'R.E.D.', 'Diffusione Sonora', 'L.F.M.'],
            highlight: false,
        },
        {
            area: 'Sicurezza & Compliance',
            badge: 'Specializzazione',
            items: ['A.C.S.', 'B.C.A.', 'Manutenzione Ordinaria', 'Manutenzione Straordinaria', 'Perizie di Commessa'],
            highlight: false,
        },
    ];

    const timelineSteps = [
        {
            year: "1945", title: "Fondazione",
            desc: "Giacinto Scandellari apre i battenti lavorando esclusivamente per le Ferrovie, specializzandosi come ditta operante nella manutenzione ferroviaria.",
            detail: "Un singolo uomo, una visione chiara: diventare il riferimento per la manutenzione ferroviaria italiana nel dopoguerra."
        },
        {
            year: "1961", title: "Seconda Generazione",
            desc: "Leonida Scandellari, figlio del fondatore, assume la conduzione dell'azienda. Per un trentennio guida l'attività portandola oltre i confini delle attività manutentive.",
            detail: "Sotto la guida di Leonida, l'azienda triplica il numero di cantieri seguiti e inizia a posizionarsi come partner tecnico, non più solo manutentore."
        },
        {
            year: "Anni '70", title: "Espansione Nazionale",
            desc: "L'azienda diventa ditta di subappalto di multinazionali italiane, ampliando significativamente il proprio raggio d'azione.",
            detail: "Il boom infrastrutturale italiano apre nuovi scenari: Scandellari partecipa ai grandi cantieri di ammodernamento della rete ferroviaria nazionale."
        },
        {
            year: "Primi '90", title: "Nuova Leadership",
            desc: "Luigi Guglielmetti e Carlo Manara assumono la guida dell'azienda, mantenendo il nome originario per rispetto verso i predecessori.",
            detail: "Una transizione pianificata e rispettosa: la nuova direzione porta competenze manageriali moderne senza perdere il DNA tecnico dell'azienda."
        },
        {
            year: "Oggi", title: "Crescita Esponenziale",
            desc: "Scandellari opera per le più grandi imprese del settore ferroviario, distinguendosi per professionalità e competenza tecnica in tutta Italia.",
            detail: "13 partner strategici, decine di grandi opere completate, presenza capillare su tutto il territorio nazionale."
        }
    ];

    return (
        <Layout>
            <SEO
                title="Chi Siamo - Storia e Valori | Scandellari"
                description={`${new Date().getFullYear() - 1945} anni di esperienza nel settore ferroviario. Scopri la storia di Scandellari Giacinto s.n.c., leader nell'installazione di sistemi di segnalamento dal 1945.`}
                keywords="storia scandellari, azienda ferroviaria, esperienza ferroviaria, Treviglio, segnalamento ferroviario"
                url="/chi-siamo"
            />
            <div className="bg-stone-50 dark:bg-black min-h-screen pt-32 pb-20 font-sans">

                {/* ── Hero ─────────────────────────────────────────────────── */}
                <section className="container mx-auto max-w-7xl px-6 mb-32">
                    <div className="border-b border-black/10 dark:border-white/5 pb-20">
                        <div className="flex items-center gap-4 mb-12">
                            <div className="w-12 h-[1px] bg-primary shadow-[0_0_8px_rgba(37,99,235,0.5)]" />
                            <span className="text-[10px] font-black uppercase tracking-[0.4em] text-black/70 dark:text-white/60">
                                Storia & Visione
                            </span>
                        </div>
                        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-16">
                            <div>
                                <h1 className="text-6xl md:text-8xl lg:text-9xl font-black text-black dark:text-white tracking-tighter leading-[0.8] font-heading mb-12">
                                    Ingegneria<br />dal 1945
                                </h1>
                                <p className="text-base md:text-xl text-black/80 dark:text-white/70 max-w-2xl font-medium leading-relaxed">
                                    Da oltre settant'anni, Scandellari Giacinto s.n.c. rappresenta un punto di riferimento nell'installazione di sistemi di segnalamento e sicurezza ferroviaria in Italia.
                                </p>
                            </div>
                            <div className="shrink-0 text-right select-none">
                                <div className="text-[10px] font-black uppercase tracking-[0.4em] text-black/50 dark:text-white/30 mb-2">Fondata nel</div>
                                <div className="text-8xl md:text-9xl font-black text-black/5 dark:text-white/5 leading-none font-heading tabular-nums">
                                    1945
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* ── Stats Row ────────────────────────────────────────────── */}
                <section className="container mx-auto max-w-7xl px-6 mb-40">
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-px bg-black/8 dark:bg-white/5 border border-black/10 dark:border-white/5">
                        <StatCard icon={ClockIcon}          label="Anni di attività"   value={new Date().getFullYear() - 1945}  suffix="+" delay={0}    />
                        <StatCard icon={MapPinIcon}          label="Grandi opere"       value={50}  suffix="+" delay={0.08} />
                        <StatCard icon={UserGroupIcon}       label="Partner strategici" value={13}  suffix=""  delay={0.16} />
                        <StatCard icon={ShieldCheckIcon}     label="Anni di sicurezza"  value={new Date().getFullYear() - 1945}  suffix=""  delay={0.24} />
                    </div>
                </section>

                {/* ── Chi Siamo + Specializzazioni ─────────────────────────── */}
                <section className="container mx-auto max-w-7xl px-6 mb-40">
                    <div className="grid lg:grid-cols-2 gap-24 items-start">
                        <FadeIn delay={0}>
                            <div className="space-y-10">
                                <h2 className="text-3xl font-black text-black dark:text-white tracking-tight uppercase font-heading">Chi Siamo</h2>
                                <div className="space-y-6 text-sm md:text-base text-black/90 dark:text-white/80 font-medium leading-relaxed">
                                    <p>
                                        La Scandellari Giacinto s.n.c. opera nel settore ferroviario sin dal 1945, realizzando e installando impianti di segnalamento e sicurezza per la circolazione ferroviaria.
                                    </p>
                                    <p>
                                        Collaborando con le primarie multinazionali del settore e direttamente con R.F.I., TRENITALIA e ITALFERR, l'azienda ha registrato nel corso degli anni una costante crescita, migliorando l'organizzazione e la qualità delle risorse.
                                    </p>
                                    <p>
                                        Il nostro obiettivo è soddisfare al meglio le esigenze del cliente, garantendo la qualità del prodotto e operando in un sistema di salute e sicurezza sul lavoro per la salvaguardia degli operatori.
                                    </p>
                                </div>
                            </div>
                        </FadeIn>

                        {/* Specializzazioni cards */}
                        <FadeIn delay={0.15}>
                            <div className="space-y-3">
                                <h3 className="text-[10px] font-black uppercase tracking-[0.4em] text-black/60 dark:text-white/40 mb-6">
                                    Aree di Specializzazione
                                </h3>
                                {specializzazioni.map((s, i) => (
                                    <div
                                        key={i}
                                        className={`border p-5 transition-all duration-300 group relative overflow-hidden
                                            ${s.highlight
                                                ? 'border-primary/40 bg-primary/[0.03] dark:bg-primary/[0.06] hover:border-primary/70'
                                                    : 'border-black/10 dark:border-white/5 bg-white dark:bg-dark-surface hover:border-primary/20'
                                            }`}
                                    >
                                        {s.highlight && (
                                            <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full blur-2xl pointer-events-none" />
                                        )}
                                        <div className="flex items-start justify-between gap-4 mb-3 relative z-10">
                                            <span className={`text-sm font-black uppercase tracking-tight ${s.highlight ? 'text-primary' : 'text-black dark:text-white'}`}>
                                                {s.area}
                                            </span>
                                            <span className={`shrink-0 text-[8px] font-black uppercase tracking-widest px-2 py-1 border
                                                ${s.highlight
                                                    ? 'border-primary/40 text-primary bg-primary/5'
                                                    : 'border-black/10 dark:border-white/10 text-black/60 dark:text-white/30'
                                                }`}>
                                                {s.badge}
                                            </span>
                                        </div>
                                        <div className="flex flex-wrap gap-2 relative z-10">
                                            {s.items.map((item, j) => (
                                                <span
                                                    key={j}
                                                    className={`text-[9px] font-black uppercase tracking-wider px-2 py-1
                                                        ${s.highlight
                                                            ? 'bg-primary/10 text-primary/80'
                                                            : 'bg-black/8 dark:bg-white/5 text-black/60 dark:text-white/40'
                                                        }`}
                                                >
                                                    {item}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </FadeIn>
                    </div>
                </section>

                {/* ── Timeline Interattiva ──────────────────────────────────── */}
                <section className="bg-black/[0.03] dark:bg-dark-surface py-32 mb-40">
                    <div className="container mx-auto max-w-7xl px-6">
                        <FadeIn>
                            <div className="flex items-center gap-4 mb-4">
                                <div className="w-8 h-[1px] bg-primary" />
                                <span className="text-[10px] font-black uppercase tracking-[0.4em] text-black/60 dark:text-white/40">
                                    La Nostra Storia
                                </span>
                            </div>
                            <h2 className="text-4xl md:text-5xl font-black text-black dark:text-white tracking-tighter font-heading mb-20">
                                {new Date().getFullYear() - 1945} anni di<br />eccellenza
                            </h2>
                        </FadeIn>

                        <div className="relative">
                            <div className="absolute left-[19px] md:left-[calc(theme(spacing.36)+19px)] top-0 bottom-0 w-[1px] bg-black/10 dark:bg-white/5" />
                            <div className="space-y-4">
                                {timelineSteps.map((step, i) => (
                                    <FadeIn key={i} delay={i * 0.08}>
                                        <div
                                            className="relative flex gap-6 md:gap-0 cursor-pointer group"
                                            onClick={() => setActiveTimeline(activeTimeline === i ? null : i)}
                                        >
                                            {/* Anno sidebar desktop */}
                                            <div className="hidden md:flex w-36 shrink-0 justify-end pr-10 pt-6">
                                                <span className={`text-sm font-black tabular-nums transition-colors duration-300 ${activeTimeline === i ? 'text-primary' : 'text-black/50 dark:text-white/20 group-hover:text-black/70 dark:group-hover:text-white/50'}`}>
                                                    {step.year}
                                                </span>
                                            </div>

                                            {/* Dot */}
                                            <div className="relative flex items-start pt-5 shrink-0 z-10">
                                                <div className={`w-10 h-10 flex items-center justify-center transition-all duration-300 border ${activeTimeline === i
                                                    ? 'bg-primary border-primary'
                                                    : 'bg-white dark:bg-black border-black/10 dark:border-white/10 group-hover:border-primary/50'}`
                                                }>
                                                    <div className={`w-2 h-2 transition-all duration-300 ${activeTimeline === i ? 'bg-white' : 'bg-black/20 dark:bg-white/20'}`} />
                                                </div>
                                            </div>

                                            {/* Card */}
                                            <div className="flex-grow pb-4 pl-6">
                                                <span className={`md:hidden text-[10px] font-black uppercase tracking-widest mb-1 block transition-colors ${activeTimeline === i ? 'text-primary' : 'text-black/60 dark:text-white/30'}`}>
                                                    {step.year}
                                                </span>
                                                <div className={`border transition-all duration-500 ${activeTimeline === i
                                                    ? 'border-primary/30 bg-white dark:bg-black'
                                                    : 'border-black/10 dark:border-white/5 bg-white dark:bg-black group-hover:border-primary/20'}`
                                                }>
                                                    <div className="p-6 md:p-8">
                                                        <div className="flex items-start justify-between gap-4">
                                                            <h3 className={`text-lg md:text-xl font-black uppercase tracking-tight transition-colors duration-300 ${activeTimeline === i ? 'text-primary' : 'text-black dark:text-white'}`}>
                                                                {step.title}
                                                            </h3>
                                                            <div className={`shrink-0 w-5 h-5 mt-1 transition-transform duration-300 ${activeTimeline === i ? 'rotate-180' : 'rotate-0'}`}>
                                                                <svg viewBox="0 0 20 20" fill="none" className="w-full h-full">
                                                                    <path d="M5 7l5 5 5-5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className={activeTimeline === i ? 'text-primary' : 'text-black/30 dark:text-white/30'} />
                                                                </svg>
                                                            </div>
                                                        </div>
                                                        <p className="text-sm text-black/80 dark:text-white/60 font-medium leading-relaxed mt-2">
                                                            {step.desc}
                                                        </p>
                                                        <div className={`overflow-hidden transition-all duration-500 ease-in-out ${activeTimeline === i ? 'max-h-40 opacity-100 mt-4' : 'max-h-0 opacity-0'}`}>
                                                            <div className="pt-4 border-t border-black/10 dark:border-white/5">
                                                                <p className="text-xs text-primary font-bold leading-relaxed">
                                                                    {step.detail}
                                                                </p>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </FadeIn>
                                ))}
                            </div>
                        </div>
                    </div>
                </section>

                {/* ── Competenze ───────────────────────────────────────────── */}
                <section className="container mx-auto max-w-7xl px-6 mb-40">
                    <FadeIn>
                        <div className="mb-20">
                            <h2 className="text-3xl md:text-4xl font-black text-black dark:text-white tracking-tighter font-heading mb-6">
                                Le Nostre Competenze
                            </h2>
                            <p className="text-sm md:text-base text-black/80 dark:text-white/70 max-w-2xl font-medium leading-relaxed">
                                Offriamo un'ampia gamma di servizi specializzati per l'infrastruttura ferroviaria nazionale.
                            </p>
                        </div>
                    </FadeIn>
                    <div className="grid md:grid-cols-2 gap-4">
                        {competenze.map((comp, i) => (
                            <FadeIn key={i} delay={i * 0.04}>
                                <div className="bg-white dark:bg-dark-surface border border-black/10 dark:border-white/5 hover:border-primary/30 p-6 md:p-8 flex gap-4 items-start group transition-all duration-300 h-full">
                                    <comp.icon className="w-5 h-5 text-primary shrink-0 mt-0.5 group-hover:scale-110 transition-transform duration-300" />
                                    <p className="text-sm md:text-base text-black/90 dark:text-white/80 font-medium leading-relaxed">
                                        {comp.text}
                                    </p>
                                </div>
                            </FadeIn>
                        ))}
                    </div>
                </section>

                {/* ── Partnerships ─────────────────────────────────────────── */}
                <section className="container mx-auto max-w-7xl px-6 pb-20">
                    <FadeIn>
                        <div className="mb-20">
                            <h2 className="text-3xl md:text-4xl font-black text-black dark:text-white tracking-tighter font-heading mb-6">
                                Collaborazioni Strategiche
                            </h2>
                            <p className="text-sm md:text-base text-black/80 dark:text-white/70 max-w-2xl font-medium leading-relaxed">
                                Lavoriamo a stretto contatto con i maggiori player del settore ferroviario per garantire i più alti standard di qualità.
                            </p>
                        </div>
                    </FadeIn>
                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-px bg-black/8 dark:bg-white/5 border border-black/10 dark:border-white/5">
                        {collaborazioni.map((p, i) => (
                            <FadeIn key={i} delay={i * 0.03}>
                                <div className="aspect-video bg-white dark:bg-dark-surface flex items-center justify-center p-6 group transition-all duration-300 hover:bg-stone-50 dark:hover:bg-black relative overflow-hidden">
                                    <div className="absolute inset-0 bg-gradient-to-br from-primary/0 to-primary/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                                    <span className="text-[10px] md:text-xs font-black uppercase tracking-wider text-center text-black/70 dark:text-white/40 group-hover:text-primary transition-colors duration-300 relative z-10 leading-relaxed">
                                        {p}
                                    </span>
                                </div>
                            </FadeIn>
                        ))}
                    </div>
                </section>

            </div>
        </Layout>
    );
};

export default AboutPage;
