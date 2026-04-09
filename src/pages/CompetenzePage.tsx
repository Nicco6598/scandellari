import React, { useState, useEffect, useMemo } from 'react';
import DOMPurify from 'dompurify';
import Layout from '../components/layout/Layout';
import { useNavigate, useParams, useLocation, Link } from 'react-router-dom';
import { competenzeService, progettiService } from '../supabase/services';
import { CompetenzaData, ProgettoData } from '../types/supabaseTypes';
import SEO from '../components/utils/SEO';
import LoadingState from '../components/utils/LoadingState';
import DeferredLightbox from '../components/utils/DeferredLightbox';
import {
    WrenchScrewdriverIcon,
    FunnelIcon,
    XMarkIcon,
    ArrowTopRightOnSquareIcon
} from '@heroicons/react/24/outline';
import {
    metaTextClasses,
    primaryTextClasses,
    secondaryTextClasses,
} from '../components/utils/ColorStyles';

const categoryLabels = {
    segnalamento: 'Segnalamento',
    realizzazione: 'Realizzazioni',
    oleodinamica: 'Sistemi Oleodinamici',
    manutenzione: 'Manutenzione'
} as const;

const CompetenzePage: React.FC = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { categoria: categoriaParam } = useParams<{ categoria?: string }>();
    const [competenze, setCompetenze] = useState<CompetenzaData[]>([]);
    const [progetti, setProgetti] = useState<ProgettoData[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [showMobileFilters, setShowMobileFilters] = useState(false);
    const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);
    const activeCategory = categoriaParam || 'oleodinamica';

    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                const compRes = await competenzeService.getAllCompetenze();
                setCompetenze(compRes);
            } catch (_err) {
                // silently fail
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    useEffect(() => {
        let isMounted = true;

        const fetchRelatedProjects = async () => {
            try {
                const related = await progettiService.getProjectsByCategory(activeCategory, 2);
                if (isMounted) {
                    setProgetti(related);
                }
            } catch (_err) {
                if (isMounted) {
                    setProgetti([]);
                }
            }
        };

        fetchRelatedProjects();

        return () => {
            isMounted = false;
        };
    }, [activeCategory]);

    const competenzeByCategory = useMemo(() => {
        const groups = new Map<string, CompetenzaData[]>();
        for (const competenza of competenze) {
            const categoryKey = competenza.categoria?.toLowerCase();
            if (!categoryKey) continue;
            const current = groups.get(categoryKey) ?? [];
            current.push(competenza);
            groups.set(categoryKey, current);
        }
        return groups;
    }, [competenze]);
    const competenzaById = useMemo(() => {
        const map = new Map<string, CompetenzaData>();
        for (const competenza of competenze) {
            if (competenza.id) {
                map.set(competenza.id, competenza);
            }
        }
        return map;
    }, [competenze]);
    const relatedProjects = useMemo(() => {
        return progetti
            .filter((project) => project.categoria?.toLowerCase() === activeCategory)
            .slice(0, 2);
    }, [activeCategory, progetti]);
    const categoryCompetences = competenzeByCategory.get(activeCategory) ?? [];
    const fallbackCompetenza = categoryCompetences[0] ?? null;
    const activeCompetenzaId = location.hash.substring(1) || fallbackCompetenza?.id || null;
    const activeCompetenza = (activeCompetenzaId ? competenzaById.get(activeCompetenzaId) : null) ?? fallbackCompetenza;

    const handleSelect = (cat: string, id?: string) => {
        navigate(`/competenze/${cat}${id ? `#${id}` : ''}`);
        setShowMobileFilters(false);
    };

    if (loading) {
        return (
            <Layout>
                <LoadingState
                    label="Competenze"
                    description="Stiamo caricando competenze tecniche e progetti correlati."
                />
            </Layout>
        );
    }

    return (
        <Layout>
            <SEO
                title="Soluzioni e Competenze Tecniche | Scandellari"
                description="Segnalamento ferroviario, sistemi oleodinamici, realizzazioni e manutenzione. Scopri le competenze tecniche di Scandellari Giacinto s.n.c. al servizio dell'infrastruttura ferroviaria italiana."
                keywords="segnalamento ferroviario, sistemi oleodinamici, manutenzione ferroviaria, competenze tecniche, impianti ferroviari, RFI"
                url="/competenze"
            />
            <div className="bg-stone-50 dark:bg-black min-h-screen pt-32 pb-20 font-sans">
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
                                    <span className={`text-[10px] font-black uppercase tracking-[0.4em] ${metaTextClasses}`}>
                                        Know-how Tecnico
                                    </span>
                                </div>
                                <h1 className="text-6xl md:text-8xl lg:text-9xl font-black text-black dark:text-white tracking-tighter leading-[0.8] font-heading mb-12">
                                    Sapere<br />Tecnico
                                </h1>
                                <p className={`text-base md:text-xl max-w-2xl font-medium leading-relaxed ${secondaryTextClasses}`}>
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
                                {Object.entries(categoryLabels).map(([key, label]) => (
                                    <div key={key} className="space-y-4">
                                        <button
                                            onClick={() => handleSelect(key)}
                                            className={`text-base font-black uppercase tracking-[0.2em] transition-colors ${activeCategory === key ? 'text-primary' : `${metaTextClasses} hover:text-primary dark:hover:text-white`
                                                }`}
                                        >
                                            {label}
                                        </button>

                                        {activeCategory === key && (
                                            <div className="flex flex-col gap-3 pl-4 border-l border-black/5 dark:border-white/5">
                                                {(competenzeByCategory.get(key) ?? [])
                                                    .map(c => (
                                                        <button
                                                            key={c.id}
                                                            onClick={() => handleSelect(key, c.id)}
                                                            className={`text-left text-sm font-bold py-1 transition-all ${activeCompetenzaId === c.id
                                                                ? 'text-primary dark:text-white translate-x-2'
                                                                : `${metaTextClasses} hover:text-primary dark:hover:text-white`
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
                                                <h2 className={`text-3xl md:text-5xl font-black tracking-tight mb-8 font-heading ${primaryTextClasses}`}>
                                                    {activeCompetenza.titolo}
                                                </h2>
                                                <div
                                                    className={`text-sm md:text-lg leading-relaxed font-medium prose dark:prose-invert max-w-none ${secondaryTextClasses}`}
                                                    dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(activeCompetenza.descrizioneLunga || activeCompetenza.descrizioneBreve || '') }}
                                                />
                                            </div>
                                        </div>

                                        {/* Technical Specs Grid */}
                                        <div className="grid md:grid-cols-2 gap-12 border-t border-black/5 dark:border-white/5 pt-16">
                                            {activeCompetenza.caratteristiche?.length ? (
                                                <div className="space-y-8">
                                                    <h3 className={`text-xs font-black uppercase tracking-[0.4em] ${metaTextClasses}`}>Specifiche Tecniche</h3>
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
                                                    <h3 className={`text-xs font-black uppercase tracking-[0.4em] ${metaTextClasses}`}>Ambiti di Utilizzo</h3>

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
                                        {relatedProjects.length > 0 && (
                                            <div className="space-y-12 border-t border-black/5 dark:border-white/5 pt-16">
                                                <h3 className={`text-xs font-black uppercase tracking-[0.4em] text-center ${metaTextClasses}`}>Progetti Correlati</h3>
                                                <div className="grid md:grid-cols-2 gap-px bg-gradient-to-br from-black/5 via-black/5 to-primary/5 dark:from-white/5 dark:via-white/5 dark:to-primary/10 border border-black/10 dark:border-white/5">
                                                    {relatedProjects.map(p => (
                                                            <Link
                                                                key={p.id}
                                                                to={`/progetti/${p.id}`}
                                                                className="bg-white dark:bg-black p-8 group transition-all duration-300 hover:bg-primary/5 dark:hover:bg-dark-surface border border-transparent hover:border-primary/20 dark:hover:border-white/5"
                                                            >
                                                                <span className={`text-xs font-black uppercase tracking-[0.4em] mb-4 block ${metaTextClasses}`}>{p.anno}</span>
                                                                <h4 className={`text-xl font-bold mb-4 flex items-center gap-2 group-hover:text-primary transition-colors ${primaryTextClasses}`}>
                                                                    {p.titolo}
                                                                    <ArrowTopRightOnSquareIcon className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" />
                                                                </h4>
                                                                <p className={`text-xs font-medium ${secondaryTextClasses}`}>{p.descrizione?.substring(0, 80)}...</p>
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
                    className={`fixed inset-0 z-[100] bg-stone-50 dark:bg-black p-6 flex flex-col transition-opacity duration-300 ${showMobileFilters ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
                    aria-hidden={!showMobileFilters}
                >
                    <div className="flex justify-between items-center mb-12">
                        <span className="text-xs font-black uppercase tracking-[0.4em]">Filtri</span>
                        <button onClick={() => setShowMobileFilters(false)}>
                            <XMarkIcon className="w-8 h-8" />
                        </button>
                    </div>
                    <div className="flex-grow overflow-y-auto space-y-12">
                        {Object.entries(categoryLabels).map(([key, label]) => (
                            <div key={key} className="space-y-6">
                                <button
                                    onClick={() => handleSelect(key)}
                                    className={`text-2xl font-black tracking-tighter text-left w-full transition-colors ${activeCategory === key ? 'text-primary' : `${metaTextClasses} hover:text-primary dark:hover:text-white`
                                        }`}
                                >
                                    {label}
                                </button>
                                {activeCategory === key && (
                                    <div className="flex flex-col gap-4 pl-4 border-l-2 border-primary/30">
                                        {(competenzeByCategory.get(key) ?? [])
                                            .map(c => (
                                                <button
                                                    key={c.id}
                                                    onClick={() => handleSelect(key, c.id)}
                                                    className={`text-left text-sm font-bold transition-colors ${activeCompetenzaId === c.id ? 'text-primary dark:text-white' : `${metaTextClasses} hover:text-primary dark:hover:text-white`
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
                <DeferredLightbox
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
