import { lazy, Suspense, useEffect, useRef, useState } from 'react';
import DOMPurify from 'dompurify';
import { useParams, Link } from 'react-router-dom';
import Layout from '../components/layout/Layout';
import { logger } from '../utils/logger';
import { progettiService } from '../supabase/services';
import { ProgettoData } from '../types/supabaseTypes';
import { useTheme } from '../context/ThemeContext';
import {
    ArrowLeftIcon,
    ArrowRightIcon,
} from '@heroicons/react/24/outline';
import LoadingState from '../components/utils/LoadingState';
import DeferredLightbox from '../components/utils/DeferredLightbox';
import ProjectImagePlaceholder, { getPrimaryProjectImage } from '../components/utils/ProjectImagePlaceholder';
import {
    metaTextClasses,
    primaryTextClasses,
    secondaryTextClasses,
} from '../components/utils/ColorStyles';
import { Coordinate, resolveProjectLocation } from '../utils/projectLocationUtils';

const ProjectDetailMap = lazy(() => import('../components/maps/ProjectDetailMap'));

function ProjectDetailPage() {
    const { theme } = useTheme();
    const { id } = useParams<{ id: string }>();

    const [progetto, setProgetto] = useState<ProgettoData | null>(null);
    const [progettiCorrelati, setProgettiCorrelati] = useState<ProgettoData[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [isLightboxOpen, setIsLightboxOpen] = useState(false);
    const [lightboxIndex, setLightboxIndex] = useState(0);
    const [mapPoints, setMapPoints] = useState<Coordinate[]>([]);
    const [routePoints, setRoutePoints] = useState<Coordinate[]>([]);

    const [viewState, setViewState] = useState({
        longitude: 12.5,
        latitude: 42.5,
        zoom: 10
    });

    useEffect(() => {
        const fetchProject = async () => {
            if (!id) return;
            try {
                setLoading(true);
                const data = await progettiService.getProjectById(id);
                setProgetto(data);
                setLoading(false);

                if (data?.categoria) {
                    progettiService
                        .getProjectsByCategory(data.categoria, 3, data.id)
                        .then(setProgettiCorrelati)
                        .catch((relatedError) => {
                            logger.error('Errore caricamento progetti correlati', relatedError);
                        });
                }

                if (data?.localita) {
                    const locationData = await resolveProjectLocation(data);
                    const coords = locationData.points;

                    if (coords.length > 0) {
                        setMapPoints(coords);
                        setViewState(prev => ({
                            ...prev,
                            longitude: coords[0].lng,
                            latitude: coords[0].lat,
                            zoom: coords.length > 1 ? 7 : 10
                        }));

                        setRoutePoints(locationData.route ?? coords);
                    }
                }
            } catch (err) {
                setError('Impossibile caricare il progetto.');
                setLoading(false);
            }
        };
        fetchProject();
    }, [id]);

    const primaryImage = getPrimaryProjectImage(progetto ?? {});

    const openLightbox = (index: number) => {
        setLightboxIndex(index);
        setIsLightboxOpen(true);
    };

    if (loading) {
        return (
            <Layout>
                <LoadingState
                    label="Dettaglio progetto"
                    description="Stiamo caricando contenuti, immagini e localizzazione del progetto."
                />
            </Layout>
        );
    }

    if (!progetto) return (
        <Layout>
            <div className="min-h-screen bg-stone-50 dark:bg-black pt-40 container mx-auto max-w-7xl px-6 text-center">
                <h1 className="text-2xl font-black uppercase">{error || 'Progetto non trovato'}</h1>
                <Link to="/progetti" className="text-primary mt-8 inline-block font-bold">Torna alla lista</Link>
            </div>
        </Layout>
    );

    return (
        <Layout>
            <div className="bg-stone-50 dark:bg-black min-h-screen pt-32 pb-20 font-sans">
                <section className="container mx-auto max-w-7xl px-6 mb-20">
                    <Link
                        to="/progetti"
                        className={`inline-flex items-center gap-3 text-xs font-black uppercase tracking-[0.3em] hover:text-black dark:hover:text-white transition-colors mb-12 ${metaTextClasses}`}
                    >
                        <ArrowLeftIcon className="w-4 h-4" />
                        Tutti i Progetti
                    </Link>

                    <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-12 border-b border-black/10 dark:border-white/5 pb-12">
                        <div className="max-w-4xl">
                            <div className="flex items-center gap-4 mb-8">
                                <span className="text-[10px] font-black bg-black dark:bg-white text-white dark:text-black px-2 py-1 uppercase tracking-tighter">
                                    {progetto.categoria}
                                </span>
                                <div className="w-12 h-[1px] bg-primary" />
                                <span className={`text-[10px] font-black uppercase tracking-[0.4em] ${metaTextClasses}`}>
                                    {progetto.anno} • {progetto.localita}
                                </span>
                            </div>
                                <h1 className={`text-5xl md:text-7xl lg:text-8xl font-black tracking-tighter leading-[0.85] font-heading ${primaryTextClasses}`}>
                                    {progetto.titolo}
                                </h1>
                        </div>
                    </div>

                    {/* Map Integration */}
                    <Suspense
                        fallback={(
                            <div className="mt-12 w-full h-80 bg-black/8 dark:bg-dark-surface border border-black/10 dark:border-white/5 overflow-hidden relative animate-pulse" />
                        )}
                    >
                        <ProjectDetailMap
                            localita={progetto.localita}
                            mapPoints={mapPoints}
                            routePoints={routePoints}
                            theme={theme}
                            viewState={viewState}
                            onViewStateChange={setViewState}
                        />
                    </Suspense>
                </section>

                <main className="container mx-auto max-w-7xl px-6">
                    <div className="grid lg:grid-cols-12 gap-16">
                        <div className="lg:col-span-8 space-y-20">
                            <div className="aspect-[21/9] bg-gray-100 dark:bg-dark-elevated overflow-hidden">
                                {primaryImage?.url ? (
                                    <img
                                        src={primaryImage.url}
                                        alt={progetto.titolo}
                                        className="w-full h-full object-cover grayscale hover:grayscale-0 transition-all duration-1000"
                                    />
                                ) : (
                                    <ProjectImagePlaceholder project={progetto} variant="feature" />
                                )}
                            </div>

                            <div className="max-w-3xl">
                                <h2 className={`text-xs font-black uppercase tracking-[0.4em] mb-8 font-heading ${metaTextClasses}`}>Panoramica</h2>
                                <div
                                    className={`text-lg leading-relaxed font-medium prose dark:prose-invert max-w-none prose-p:mb-6 ${secondaryTextClasses}`}
                                    dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(progetto.descrizioneLunga || progetto.descrizione || '') }}
                                />
                            </div>

                            {progetto.immagini && progetto.immagini.length > 1 && (
                                <div className="space-y-8">
                                    <h2 className={`text-xs font-black uppercase tracking-[0.4em] font-heading ${metaTextClasses}`}>Documentazione Fotografica</h2>
                                    <div className="grid grid-cols-2 md:grid-cols-3 gap-1">
                                        {progetto.immagini.map((img, i) => (
                                            <div
                                                key={i}
                                                onClick={() => openLightbox(i)}
                                                className="aspect-[4/3] bg-gray-100 dark:bg-dark-elevated cursor-crosshair overflow-hidden group"
                                            >
                                                <img
                                                    src={img.url}
                                                    className="w-full h-full object-cover grayscale brightness-75 group-hover:grayscale-0 group-hover:brightness-100 transition-all duration-700"
                                                    alt="Project detail"
                                                />
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            <div className="grid md:grid-cols-2 gap-12 border-t border-black/10 dark:border-white/5 pt-16">
                                {progetto.sfide?.length ? (
                                    <div className="space-y-8">
                                        <h3 className={`text-xs font-black uppercase tracking-[0.4em] ${metaTextClasses}`}>Sfide e Soluzioni</h3>
                                        <ul className="space-y-4">
                                            {progetto.sfide.map((item, i) => (
                                                <li key={i} className="flex gap-4 text-sm font-bold text-black dark:text-white">
                                                    <span className="text-primary">—</span>
                                                    {item}
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                ) : null}

                                {progetto.risultati?.length ? (
                                    <div className="space-y-8">
                                        <h3 className={`text-xs font-black uppercase tracking-[0.4em] ${metaTextClasses}`}>Risultati</h3>
                                        <ul className="space-y-4">
                                            {progetto.risultati.map((item, i) => (
                                                <li key={i} className="flex gap-4 text-sm font-bold text-black dark:text-white">
                                                    <span className="text-primary">—</span>
                                                    {item}
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                ) : null}
                            </div>
                        </div>

                        <aside className="lg:col-span-4 gap-12 flex flex-col">
                            <div className="sticky top-32 space-y-16">
                                <div className="p-10 bg-black/8 dark:bg-white/5 space-y-10 rounded-sm">
                                    <div>
                                        <h4 className={`text-xs font-black uppercase tracking-[0.4em] mb-6 ${metaTextClasses}`}>Dettagli Appalto</h4>
                                        <dl className="space-y-6">
                                            <div className="flex flex-col gap-1">
                                                <dt className={`text-[9px] font-black uppercase tracking-widest ${metaTextClasses}`}>Committente / Località</dt>
                                                <dd className="text-sm font-black text-black dark:text-white">{progetto.localita}</dd>
                                            </div>
                                            <div className="flex flex-col gap-1">
                                                <dt className={`text-[9px] font-black uppercase tracking-widest ${metaTextClasses}`}>Anno di Esecuzione</dt>
                                                <dd className="text-sm font-black text-black dark:text-white">{progetto.anno}</dd>
                                            </div>
                                            {progetto.tecnologie?.length ? (
                                                <div className="flex flex-col gap-1">
                                                    <dt className={`text-[9px] font-black uppercase tracking-widest ${metaTextClasses}`}>Sistemi Impiegati</dt>
                                                    <dd className="flex flex-wrap gap-2 mt-2">
                                                        {progetto.tecnologie.map((tech, i) => (
                                                            <span key={i} className="px-2 py-1 bg-black/10 dark:bg-white/10 text-[9px] font-black uppercase">{tech}</span>
                                                        ))}
                                                    </dd>
                                                </div>
                                            ) : null}
                                        </dl>
                                    </div>

                                    <div className="pt-10 border-t border-black/10 dark:border-white/5">
                                        <Link
                                            to="/contatti"
                                            className="group flex items-center justify-between w-full text-left"
                                        >
                                            <div>
                                                <span className="text-[9px] font-black uppercase tracking-widest text-primary block mb-1">Richiedi Informazioni</span>
                                                <span className="text-sm font-black text-black dark:text-white">Parla con un esperto</span>
                                            </div>
                                            <ArrowRightIcon className="w-5 h-5 transition-transform group-hover:translate-x-2" />
                                        </Link>
                                    </div>
                                </div>
                            </div>
                        </aside>
                    </div>

                    {progettiCorrelati.length > 0 && (
                        <section className="mt-40 pt-20 border-t border-black/10 dark:border-white/5">
                            <div className="flex items-end justify-between mb-16">
                                <h2 className={`text-4xl md:text-5xl font-black tracking-tighter font-heading ${primaryTextClasses}`}>Opere Correlate</h2>
                            </div>
                            <div className="grid md:grid-cols-3 gap-px bg-black/8 dark:bg-white/5 border border-black/10 dark:border-white/5">
                                {progettiCorrelati.map((p) => (
                                    <Link
                                        key={p.id}
                                        to={`/progetti/${p.id}`}
                                        className="bg-white dark:bg-black p-8 group transition-colors hover:bg-stone-50 dark:hover:bg-dark-surface"
                                    >
                                        <span className={`text-[9px] font-black uppercase tracking-[0.4em] mb-4 block ${metaTextClasses}`}>{p.anno}</span>
                                        <h4 className="text-lg font-black mb-4 flex items-center gap-2 group-hover:text-primary transition-colors">
                                            {p.titolo}
                                        </h4>
                                        <p className={`text-[11px] font-bold uppercase tracking-widest ${metaTextClasses}`}>{p.localita}</p>
                                    </Link>
                                ))}
                            </div>
                        </section>
                    )}
                </main>

                <DeferredLightbox
                    open={isLightboxOpen}
                    close={() => setIsLightboxOpen(false)}
                    index={lightboxIndex}
                    slides={progetto.immagini?.map(img => ({ src: img.url })) || []}
                />
            </div>
        </Layout>
    );
}

export default ProjectDetailPage;
