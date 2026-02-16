import React, { useState, useEffect, useMemo, useRef } from 'react';
import Layout from '../components/layout/Layout';
import { useNavigate, useParams, useLocation, Link } from 'react-router-dom';
import { competenzeService, progettiService } from '../supabase/services';
import { CompetenzaData, ProgettoData } from '../types/supabaseTypes';
import Lightbox from 'yet-another-react-lightbox';
import 'yet-another-react-lightbox/styles.css';
import {
    WrenchScrewdriverIcon,
    ChevronRightIcon,
    FunnelIcon,
    XMarkIcon,
    ArrowTopRightOnSquareIcon
} from '@heroicons/react/24/outline';

const CompetenzePage: React.FC = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { categoria: categoriaParam } = useParams<{ categoria?: string }>();
    const detalleRef = useRef<HTMLDivElement>(null);

    const [competenze, setCompetenze] = useState<CompetenzaData[]>([]);
    const [progetti, setProgetti] = useState<ProgettoData[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const [showMobileFilters, setShowMobileFilters] = useState(false);
    const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

    const categories = useMemo(() => ({
        segnalamento: "Segnalamento",
        realizzazione: "Realizzazioni",
        oleodinamica: "Sistemi Oleodinamici",
        manutenzione: "Manutenzione"
    }), []);

    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                const [compRes, projRes] = await Promise.all([
                    competenzeService.getAllCompetenze(),
                    progettiService.getAllProjects()
                ]);
                setCompetenze(compRes);
                setProgetti(projRes);
            } catch (err) {
                setError("Errore nel caricamento dei dati.");
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    const activeCategory = categoriaParam || 'oleodinamica';
    const activeCompetenzaId = location.hash.substring(1) || (competenze.find(c => c.categoria?.toLowerCase() === activeCategory)?.id || null);
    const activeCompetenza = competenze.find(c => c.id === activeCompetenzaId) || competenze.find(c => c.categoria?.toLowerCase() === activeCategory);

    const handleSelect = (cat: string, id?: string) => {
        navigate(`/competenze/${cat}${id ? `#${id}` : ''}`);
        setShowMobileFilters(false);
    };

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
                {/* Header Section */}
                <section className="container mx-auto max-w-7xl px-6 mb-32">
                    <div
                        className="border-b border-black/5 dark:border-white/5 pb-20"
                        data-animate="fade-up"
                        data-animate-distance="20"
                    >
                        <div className="flex flex-col md:flex-row md:items-end justify-between gap-12">
                            <div className="max-w-3xl">
                                <div className="flex items-center gap-4 mb-12">
                                    <div className="w-12 h-[1px] bg-primary shadow-[0_0_8px_rgba(37,99,235,0.5)]" />
                                    <span className="text-[10px] font-black uppercase tracking-[0.4em] text-black/70 dark:text-white/60">
                                        Know-how Tecnico
                                    </span>
                                </div>
                                <h1 className="text-6xl md:text-8xl lg:text-9xl font-black text-black dark:text-white tracking-tighter leading-[0.8] font-heading mb-12">
                                    Sapere<br />Tecnico
                                </h1>
                                <p className="text-base md:text-xl text-black/70 dark:text-white/60 max-w-2xl font-medium leading-relaxed">
                                    Dal 1945 Scandellari sviluppa tecnologie avanzate per l'infrastruttura ferroviaria, garantendo i massimi standard di sicurezza e innovazione nazionale.
                                </p>
                            </div>

                            <button
                                onClick={() => setShowMobileFilters(true)}
                                className="lg:hidden flex items-center gap-3 px-6 py-4 bg-black dark:bg-white text-white dark:text-black text-[11px] font-black uppercase tracking-widest"
                            >
                                <FunnelIcon className="w-4 h-4" />
                                Categorie
                            </button>
                        </div>
                    </div>
                </section>

                <section className="container mx-auto max-w-7xl px-6">
                    <div className="flex flex-col lg:flex-row gap-16">
                        {/* Sidebar Navigation */}
                        <aside className="hidden lg:block w-72 shrink-0">
                            <div className="sticky top-32 space-y-12">
                                {Object.entries(categories).map(([key, label]) => (
                                    <div key={key} className="space-y-4">
                                        <button
                                            onClick={() => handleSelect(key)}
                                            className={`text-base font-black uppercase tracking-[0.2em] transition-colors ${activeCategory === key ? 'text-primary' : 'text-black/60 dark:text-white/40 hover:text-black dark:hover:text-white'
                                                }`}
                                        >
                                            {label}
                                        </button>

                                        {activeCategory === key && (
                                            <div className="flex flex-col gap-3 pl-4 border-l border-black/5 dark:border-white/5">
                                                {competenze
                                                    .filter(c => c.categoria?.toLowerCase() === key)
                                                    .map(c => (
                                                        <button
                                                            key={c.id}
                                                            onClick={() => handleSelect(key, c.id)}
                                                            className={`text-left text-sm font-bold py-1 transition-all ${activeCompetenzaId === c.id
                                                                ? 'text-black dark:text-white translate-x-2'
                                                                : 'text-black/60 dark:text-white/50 hover:text-black dark:hover:text-white'
                                                                }`}
                                                        >
                                                            {c.titolo}
                                                        </button>
                                                    ))}
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </aside>

                        {/* Main Content Detail */}
                        <main className="flex-grow">
                            {activeCompetenza ? (
                                <div
                                    key={activeCompetenza.id}
                                    className="space-y-16"
                                    data-animate="fade-left"
                                    data-animate-distance="20"
                                >
                                        {/* Visual & Title */}
                                        <div className="space-y-12">
                                            <div className="aspect-[21/9] bg-gray-100 dark:bg-dark-surface overflow-hidden relative border border-black/5 dark:border-white/5 group">
                                                {(activeCompetenza.immagini?.[0]?.url || activeCompetenza.immagine?.url) ? (
                                                    <>
                                                        <img
                                                            src={activeCompetenza.immagini?.[0]?.url || activeCompetenza.immagine?.url}
                                                            alt={activeCompetenza.titolo}
                                                            className="w-full h-full object-cover grayscale hover:grayscale-0 transition-all duration-1000"
                                                        />
                                                        <div className="absolute inset-0 bg-gradient-to-br from-black/10 via-transparent to-primary/5 mix-blend-multiply opacity-40 group-hover:opacity-0 transition-opacity duration-500" />
                                                    </>
                                                ) : (
                                                    <div className="w-full h-full flex items-center justify-center opacity-10">
                                                        <WrenchScrewdriverIcon className="w-32 h-32" />
                                                    </div>
                                                )}
                                            </div>

                                            <div className="max-w-3xl">
                                                <h2 className="text-3xl md:text-5xl font-black text-black dark:text-white tracking-tight mb-8 font-heading">
                                                    {activeCompetenza.titolo}
                                                </h2>
                                                <div
                                                    className="text-sm md:text-lg text-black/80 dark:text-white/70 leading-relaxed font-medium prose dark:prose-invert max-w-none"
                                                    dangerouslySetInnerHTML={{ __html: activeCompetenza.descrizioneLunga || activeCompetenza.descrizioneBreve || '' }}
                                                />
                                            </div>
                                        </div>

                                        {/* Technical Specs Grid */}
                                        <div className="grid md:grid-cols-2 gap-12 border-t border-black/5 dark:border-white/5 pt-16">
                                            {activeCompetenza.caratteristiche?.length ? (
                                                <div className="space-y-8">
                                                    <h3 className="text-xs font-black uppercase tracking-[0.4em] text-black/60 dark:text-white/40">Specifiche Tecniche</h3>
                                                    <ul className="space-y-4">
                                                        {activeCompetenza.caratteristiche.map((item, i) => (
                                                            <li key={i} className="flex gap-4 text-xs md:text-sm font-bold text-black dark:text-white">
                                                                <span className="text-primary">—</span>
                                                                {item}
                                                            </li>
                                                        ))}
                                                    </ul>
                                                </div>
                                            ) : null}

                                            {activeCompetenza.applicazioni?.length ? (
                                                <div className="space-y-8">
                                                    <h3 className="text-xs font-black uppercase tracking-[0.4em] text-black/60 dark:text-white/40">Ambiti di Utilizzo</h3>
                                                    <ul className="space-y-4">
                                                        {activeCompetenza.applicazioni.map((item, i) => (
                                                            <li key={i} className="flex gap-4 text-xs md:text-sm font-bold text-black dark:text-white">
                                                                <span className="text-primary">—</span>
                                                                {item}
                                                            </li>
                                                        ))}
                                                    </ul>
                                                </div>
                                            ) : null}
                                        </div>

                                        {/* Gallery if many images */}
                                        {activeCompetenza.immagini && activeCompetenza.immagini.length > 1 && (
                                            <div className="grid grid-cols-2 md:grid-cols-3 gap-1">
                                                {activeCompetenza.immagini.map((img, i) => (
                                                    <div
                                                        key={i}
                                                        onClick={() => setLightboxIndex(i)}
                                                        className="aspect-square bg-gray-100 dark:bg-dark-surface cursor-crosshair overflow-hidden group relative border border-black/5 dark:border-white/5 hover:border-primary/30 transition-all"
                                                    >
                                                        <img
                                                            src={img.url}
                                                            className="w-full h-full object-cover grayscale brightness-75 group-hover:grayscale-0 group-hover:brightness-100 transition-all duration-700"
                                                            alt="Gallery image"
                                                        />
                                                        <div className="absolute inset-0 bg-gradient-to-br from-black/5 to-primary/5 mix-blend-multiply opacity-30 group-hover:opacity-0 transition-opacity" />
                                                    </div>
                                                ))}
                                            </div>
                                        )}

                                        {/* Related Projects */}
                                        {progetti.filter(p => p.categoria?.toLowerCase() === activeCategory).length > 0 && (
                                            <div className="space-y-12 border-t border-black/5 dark:border-white/5 pt-16">
                                                <h3 className="text-xs font-black uppercase tracking-[0.4em] text-black/60 dark:text-white/40 text-center">Progetti Correlati</h3>
                                                <div className="grid md:grid-cols-2 gap-px bg-gradient-to-br from-black/5 via-black/5 to-primary/5 dark:from-white/5 dark:via-white/5 dark:to-primary/10 border border-black/5 dark:border-white/5">
                                                    {progetti
                                                        .filter(p => p.categoria?.toLowerCase() === activeCategory)
                                                        .slice(0, 2)
                                                        .map(p => (
                                                            <Link
                                                                key={p.id}
                                                                to={`/progetti/${p.id}`}
                                                                className="bg-white dark:bg-black p-8 group transition-all duration-300 hover:bg-gray-50 dark:hover:bg-dark-surface"
                                                            >
                                                                <span className="text-xs font-black text-black/60 dark:text-white/40 uppercase tracking-[0.4em] mb-4 block">{p.anno}</span>
                                                                <h4 className="text-xl font-bold mb-4 flex items-center gap-2 group-hover:text-primary transition-colors">
                                                                    {p.titolo}
                                                                    <ArrowTopRightOnSquareIcon className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" />
                                                                </h4>
                                                                <p className="text-xs text-black/70 dark:text-white/60 font-medium">{p.descrizione?.substring(0, 80)}...</p>
                                                            </Link>
                                                        ))}
                                                </div>
                                            </div>
                                        )}
                                </div>
                            ) : (
                                <div className="h-96 flex items-center justify-center opacity-20">
                                    <p className="text-xs font-black uppercase tracking-widest">Seleziona una competenza</p>
                                </div>
                            )}
                        </main>
                    </div>
                </section>

                <div
                    className={`fixed inset-0 z-[100] bg-gray-50 dark:bg-black p-6 flex flex-col transition-opacity duration-300 ${showMobileFilters ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
                    aria-hidden={!showMobileFilters}
                >
                    <div className="flex justify-between items-center mb-12">
                        <span className="text-xs font-black uppercase tracking-[0.4em]">Filtri</span>
                        <button onClick={() => setShowMobileFilters(false)}>
                            <XMarkIcon className="w-8 h-8" />
                        </button>
                    </div>
                    <div className="flex-grow overflow-y-auto space-y-12">
                        {Object.entries(categories).map(([key, label]) => (
                            <div key={key} className="space-y-6">
                                <button
                                    onClick={() => handleSelect(key)}
                                    className={`text-2xl font-black tracking-tighter text-left w-full ${activeCategory === key ? 'text-primary' : 'text-black/60 dark:text-white/40'
                                        }`}
                                >
                                    {label}
                                </button>
                                {activeCategory === key && (
                                    <div className="flex flex-col gap-4 pl-4">
                                        {competenze
                                            .filter(c => c.categoria?.toLowerCase() === key)
                                            .map(c => (
                                                <button
                                                    key={c.id}
                                                    onClick={() => handleSelect(key, c.id)}
                                                    className={`text-left text-sm font-bold ${activeCompetenzaId === c.id ? 'text-black dark:text-white' : 'text-black/60 dark:text-white/50'
                                                        }`}
                                                >
                                                    {c.titolo}
                                                </button>
                                            ))}
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </div>

                {/* Lightbox */}
                <Lightbox
                    open={lightboxIndex !== null}
                    close={() => setLightboxIndex(null)}
                    index={lightboxIndex || 0}
                    slides={activeCompetenza?.immagini?.map(img => ({ src: img.url })) || []}
                />
            </div>
        </Layout>
    );
};

export default CompetenzePage;
