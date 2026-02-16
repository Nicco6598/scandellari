import React from 'react';
import Layout from '../components/layout/Layout';
import SEO from '../components/utils/SEO';
import { Link } from 'react-router-dom';
import {
    ArrowRightIcon,
    BuildingOffice2Icon,
    UserGroupIcon,
    ClockIcon,
    ShieldCheckIcon,
    CheckCircleIcon
} from '@heroicons/react/24/outline';

const AboutPage: React.FC = () => {
    const collaborazioni = [
        'R.F.I.', 'TRENITALIA', 'ITALFERR', 'SERFER-MERCITALIA S.& T.',
        'TRENORD', 'ALSTOM FERROVIARIA', 'ANSALDO FERROVIARIA', 'SIEMENS',
        'BONCIANI', 'A.C.M.A.R.', 'COSTRUZIONE LINEE FERROVIARIE',
        'VALSECCHI ARMAMENTO', 'G.C.F. GENERALE COSTRUZIONI FERROVIARIE'
    ];

    const competenze = [
        'Installazione impianti di segnalamento e sicurezza per linee "lente" e ad "alta velocità"',
        'Installazione impianti S.C.M.T., A.C.E.I., A.C.S., A.C.C., B.C.A.',
        'Allestimento tecnologico e funzionale DIGICODE alta velocità',
        'Installazione sistemi oleodinamici (TG 0,040 - 0,074 - 0,022 C.P.F./C.P.M. e MOT)',
        'Installazione sistemi elettromeccanici (P.80, L.90, P.64, L.63, L.88, P.75, FS.55)',
        'Installazione impianti R.E.D., Diffusione Sonora, L.F.M., T.L.C.',
        'Posa cavi in fibra ottica e realizzazione giunzioni ottiche',
        'Allestimento locali tecnologici',
        'Manutenzione ordinaria e straordinaria impianti segnalamento',
        'Perizie di commessa'
    ];

    return (
        <Layout>
            <SEO
                title="Chi Siamo - Storia e Valori | Scandellari"
                description="79 anni di esperienza nel settore ferroviario. Scopri la storia di Scandellari Giacinto s.n.c., leader nell'installazione di sistemi di segnalamento dal 1945."
                keywords="storia scandellari, azienda ferroviaria, esperienza ferroviaria, Treviglio, segnalamento ferroviario"
                url="/chi-siamo"
            />
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
                                Storia & Visione
                            </span>
                        </div>
                        <h1 className="text-6xl md:text-8xl lg:text-9xl font-black text-black dark:text-white tracking-tighter leading-[0.8] font-heading mb-12">
                            Ingegneria<br />dal 1945
                        </h1>
                        <p className="text-base md:text-xl text-black/80 dark:text-white/70 max-w-3xl font-medium leading-relaxed">
                            Da oltre settant'anni, Scandellari Giacinto s.n.c. rappresenta un punto di riferimento nell'installazione di sistemi di segnalamento e sicurezza ferroviaria in Italia.
                        </p>
                    </div>
                </section>

                {/* Chi Siamo */}
                <section className="container mx-auto max-w-7xl px-6 mb-40">
                    <div className="grid lg:grid-cols-2 gap-24 items-start">
                        <div className="space-y-12">
                            <h2 className="text-3xl font-black text-black dark:text-white tracking-tight uppercase font-heading">Chi Siamo</h2>
                            <div className="space-y-6 text-sm md:text-base text-black/90 dark:text-white/80 font-medium leading-relaxed">
                                <p>
                                    La Scandellari Giacinto s.n.c. opera nel settore ferroviario sin dal 1945, realizzando e installando impianti di segnalamento e sicurezza per la circolazione ferroviaria.
                                </p>
                                <p>
                                    Collaborando con le primarie multinazionali del settore e direttamente con R.F.I., TRENITALIA e ITALFERR, l'azienda ha registrato nel corso degli anni una costante crescita, migliorando l'organizzazione e la qualità delle risorse.
                                </p>
                                <p>
                                    Il nostro obiettivo è soddisfare al meglio le esigenze del cliente, garantendo la qualità del prodotto e operando in un sistema di salute e sicurezza sul lavoro per la salvaguardia degli operatori, attuando un sistema di gestione ambientale sempre più attento e rispettoso dell'ambiente che ci circonda.
                                </p>
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-px bg-gradient-to-br from-black/5 via-black/5 to-primary/5 dark:from-white/5 dark:via-white/5 dark:to-primary/10 border border-black/5 dark:border-white/5">
                            {[
                                { icon: ClockIcon, label: "Esperienza", value: "79 Anni" },
                                { icon: UserGroupIcon, label: "Team", value: "Esperti Tech" },
                                { icon: ShieldCheckIcon, label: "Focus", value: "Sicurezza" },
                                { icon: BuildingOffice2Icon, label: "Status", value: "Leader" }
                            ].map((item, i) => (
                                <div key={i} className="bg-white dark:bg-black p-8 group hover:bg-gray-50 dark:hover:bg-dark-surface transition-all duration-300">
                                    <item.icon className="w-6 h-6 mb-4 text-primary group-hover:scale-110 transition-transform" />
                                    <div className="text-xs font-black uppercase tracking-widest text-black/60 dark:text-white/40 mb-1">{item.label}</div>
                                    <div className="text-xl font-black text-black dark:text-white">{item.value}</div>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* Timeline */}
                <section className="bg-black/5 dark:bg-dark-surface py-32 mb-40">
                    <div className="container mx-auto max-w-7xl px-6">
                        <h2 className="text-xs font-black uppercase tracking-[0.4em] text-black/60 dark:text-white/40 mb-20 text-center">La Nostra Storia</h2>
                        <div className="space-y-12">
                            {[
                                { year: "1945", title: "Fondazione", desc: "Giacinto Scandellari apre i battenti lavorando esclusivamente per le Ferrovie, specializzandosi come ditta operante nella manutenzione ferroviaria." },
                                { year: "1961", title: "Seconda Generazione", desc: "Leonida Scandellari, figlio del fondatore, assume la conduzione dell'azienda. Per un trentennio guida con sapiente maestria l'attività, portando l'azienda ad operare oltre i confini delle attività manutentive." },
                                { year: "Anni '70", title: "Espansione", desc: "L'azienda diventa ditta di subappalto di multinazionali italiane, ampliando significativamente il proprio raggio d'azione nel settore ferroviario." },
                                { year: "Primi '90", title: "Nuova Leadership", desc: "Luigi Guglielmetti, tecnico di esperienza nel settore specifico, e Carlo Manara, ex dipendente delle Ferrovie dello Stato con esperienza nella gestione cantieri, assumono la guida dell'azienda mantenendo il nomoriginario per rispetto verso i predecessori." },
                                { year: "Ultimi 15 Anni", title: "Crescita Esponenziale", desc: "La Scandellari registra una notevole crescita, operando in regime di subappalto per le più grandi imprese del settore ferroviario, distinguendosi per professionalità e competenza tecnica." }
                            ].map((step, i) => (
                                <div
                                    key={i}
                                    className="bg-white dark:bg-black border border-black/5 dark:border-white/5 hover:border-primary/30 p-8 md:p-12 flex flex-col md:flex-row gap-8 items-start transition-all duration-500 group"
                                    data-animate="fade-up"
                                    data-animate-delay={(i * 0.05).toFixed(2)}
                                >
                                    <div className="text-4xl md:text-5xl font-black text-primary font-heading w-32 shrink-0">{step.year}</div>
                                    <div className="flex-grow">
                                        <h3 className="text-xl md:text-2xl font-black mb-4 uppercase tracking-tight group-hover:text-primary transition-colors">{step.title}</h3>
                                        <p className="text-black/70 dark:text-white/60 text-sm md:text-base font-medium max-w-2xl leading-relaxed">{step.desc}</p>
                                    </div>
                                    <ArrowRightIcon className="w-6 h-6 text-black/10 dark:text-white/10 group-hover:text-primary group-hover:translate-x-2 transition-all hidden md:block" />
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* Competenze */}
                <section className="container mx-auto max-w-7xl px-6 mb-40">
                    <div className="mb-20">
                        <h2 className="text-3xl md:text-4xl font-black text-black dark:text-white tracking-tighter font-heading mb-6">Le Nostre Competenze</h2>
                        <p className="text-sm md:text-base text-black/80 dark:text-white/70 max-w-2xl font-medium leading-relaxed">
                            Offriamo un'ampia gamma di servizi specializzati per l'infrastruttura ferroviaria nazionale.
                        </p>
                    </div>
                    <div className="grid md:grid-cols-2 gap-6">
                        {competenze.map((comp, i) => (
                            <div
                                key={i}
                                className="bg-white dark:bg-dark-surface border border-black/5 dark:border-white/5 hover:border-primary/30 p-6 md:p-8 flex gap-4 items-start group transition-all duration-300"
                                data-animate="fade-up"
                                data-animate-delay={(i * 0.03).toFixed(2)}
                            >
                                <CheckCircleIcon className="w-5 h-5 text-primary shrink-0 mt-1 group-hover:scale-110 transition-transform" />
                                <p className="text-sm md:text-base text-black/90 dark:text-white/80 font-medium leading-relaxed">{comp}</p>
                            </div>
                        ))}
                    </div>
                </section>

                {/* Partnerships */}
                <section className="container mx-auto max-w-7xl px-6 mb-40">
                    <div className="mb-20">
                        <h2 className="text-3xl md:text-4xl font-black text-black dark:text-white tracking-tighter font-heading mb-6">Collaborazioni Strategiche</h2>
                        <p className="text-sm md:text-base text-black/80 dark:text-white/70 max-w-2xl font-medium leading-relaxed">
                            Lavoriamo a stretto contatto con i maggiori player del settore ferroviario per garantire i più alti standard di qualità.
                        </p>
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                        {collaborazioni.map((p, i) => (
                            <div
                                key={i}
                                className="aspect-video bg-white dark:bg-dark-surface border border-black/5 dark:border-white/5 hover:border-primary/30 flex items-center justify-center p-4 group transition-all duration-300"
                                data-animate="scale"
                                data-animate-delay={(i * 0.01).toFixed(2)}
                            >
                                <span className="text-[10px] md:text-xs font-black uppercase tracking-wider text-center text-black/70 dark:text-white/50 group-hover:text-primary transition-colors">{p}</span>
                            </div>
                        ))}
                    </div>
                </section>

                {/* CTA */}
                <section className="container mx-auto max-w-7xl px-6">
                    <Link
                        to="/contatti"
                        className="block bg-black dark:bg-dark-surface text-white dark:text-white p-12 md:p-20 group relative overflow-hidden border border-black/5 dark:border-white/5"
                    >
                        <div className="absolute inset-0 bg-gradient-to-br from-transparent via-transparent to-primary/10 dark:to-accent/10 pointer-events-none" />
                        <div className="relative z-10 text-center space-y-8">
                            <div>
                                <h2 className="text-4xl md:text-6xl font-black tracking-tighter mb-4 font-heading">Contattaci</h2>
                                <p className="text-sm md:text-lg opacity-80 font-medium uppercase tracking-widest">Per una consulenza tecnica specializzata</p>
                            </div>
                            <div className="flex justify-center">
                                <ArrowRightIcon className="w-12 h-12 transition-all group-hover:translate-x-4 group-hover:text-primary" />
                            </div>
                        </div>
                    </Link>
                </section>
            </div>
        </Layout>
    );
};

export default AboutPage;
