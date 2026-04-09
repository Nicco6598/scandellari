import { Fragment, useEffect, useMemo, useRef, useState } from 'react';
import DOMPurify from 'dompurify';
import { useParams, Link } from 'react-router-dom';
import Layout from '../components/layout/Layout';
import { logger } from '../utils/logger';
import { progettiService } from '../supabase/services';
import { ProgettoData } from '../types/supabaseTypes';
import Map, { Marker, Popup, NavigationControl, Source, Layer } from 'react-map-gl/maplibre';
import maplibreCss from 'maplibre-gl/dist/maplibre-gl.css?inline';
import { useTheme } from '../context/ThemeContext';
import Lightbox from "yet-another-react-lightbox";
import lightboxCss from "yet-another-react-lightbox/styles.css?inline";
import {
    ArrowLeftIcon,
    ArrowRightIcon,
} from '@heroicons/react/24/outline';
import LoadingState from '../components/utils/LoadingState';
import ProjectImagePlaceholder, { getPrimaryProjectImage } from '../components/utils/ProjectImagePlaceholder';
import { useInjectedHeadStyle } from '../hooks/useInjectedHeadStyle';

type Coordinate = { lat: number; lng: number };
type RouteFeatureCollection = {
    type: 'FeatureCollection';
    features: Array<{
        type: 'Feature';
        geometry: { type: 'LineString'; coordinates: Array<[number, number]> };
        properties: Record<string, never>;
    }>;
};
type NominatimResponse = Array<{ lat: string; lon: string }>;
type OsrmResponse = {
    routes?: Array<{ geometry: { coordinates: Array<[number, number]> } }>;
};

const detailGeoCache: Record<string, Coordinate> = {};

async function geocodePartDetail(part: string): Promise<Coordinate | null> {
    if (detailGeoCache[part]) return detailGeoCache[part];
    try {
        const res = await fetch(
            `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(part + ', Italia')}&limit=1`
        );
        const data: NominatimResponse = await res.json();
        if (data?.length > 0) {
            const coord = { lat: parseFloat(data[0].lat), lng: parseFloat(data[0].lon) };
            detailGeoCache[part] = coord;
            return coord;
        }
    } catch (e) {
        logger.error('Geocoding error', e);
    }
    return null;
}

function ProjectDetailPage() {
    const { theme } = useTheme();
    const { id } = useParams<{ id: string }>();
    useInjectedHeadStyle(maplibreCss + lightboxCss);

    const [progetto, setProgetto] = useState<ProgettoData | null>(null);
    const [progettiCorrelati, setProgettiCorrelati] = useState<ProgettoData[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [isLightboxOpen, setIsLightboxOpen] = useState(false);
    const [lightboxIndex, setLightboxIndex] = useState(0);
    const [mapPoints, setMapPoints] = useState<Coordinate[]>([]);
    const [routePoints, setRoutePoints] = useState<Coordinate[]>([]);
    const mapContainerRef = useRef<HTMLDivElement>(null);

    const [viewState, setViewState] = useState({
        longitude: 12.5,
        latitude: 42.5,
        zoom: 10
    });

    // Scroll lock sulla mappa
    useEffect(() => {
        const el = mapContainerRef.current;
        if (!el || mapPoints.length === 0) return;
        const handler = (e: WheelEvent) => {
            e.preventDefault();
            e.stopPropagation();
        };
        el.addEventListener('wheel', handler, { passive: false });
        return () => el.removeEventListener('wheel', handler);
    }, [mapPoints]);

    useEffect(() => {
        const fetchProject = async () => {
            if (!id) return;
            try {
                setLoading(true);
                const data = await progettiService.getProjectById(id);
                setProgetto(data);
                setLoading(false);

                if (data?.categoria) {
                    progettiService.getAllProjects().then(allProjects => {
                        const related = allProjects
                            .filter(p => p.categoria?.toLowerCase() === data.categoria?.toLowerCase() && p.id !== data.id)
                            .slice(0, 3);
                        setProgettiCorrelati(related);
                    });
                }

                if (data?.localita) {
                    const parts = data.localita.split(/[-/]/).map(item => item.trim());

                    // Tutte le parti in parallelo — nessun delay artificiale
                    const results = await Promise.allSettled(parts.map(part => geocodePartDetail(part)));
                    const coords = results
                        .filter((r): r is PromiseFulfilledResult<Coordinate> => r.status === 'fulfilled' && r.value !== null)
                        .map(r => r.value);

                    if (coords.length > 0) {
                        setMapPoints(coords);
                        setViewState(prev => ({
                            ...prev,
                            longitude: coords[0].lng,
                            latitude: coords[0].lat,
                            zoom: coords.length > 1 ? 7 : 10
                        }));

                        if (coords.length >= 2) {
                            try {
                                const osrmPath = coords.map(c => `${c.lng},${c.lat}`).join(';');
                                const routeRes = await fetch(
                                    `https://router.project-osrm.org/route/v1/driving/${osrmPath}?overview=full&geometries=geojson`
                                );
                                const routeData: OsrmResponse = await routeRes.json();
                                if (routeData.routes?.[0]) {
                                    setRoutePoints(
                                        routeData.routes[0].geometry.coordinates.map(([lng, lat]) => ({
                                            lng,
                                            lat
                                        }))
                                    );
                                } else {
                                    setRoutePoints(coords);
                                }
                            } catch (e) {
                                setRoutePoints(coords);
                            }
                        } else {
                            setRoutePoints(coords);
                        }
                    }
                }
            } catch (err) {
                setError('Impossibile caricare il progetto.');
                setLoading(false);
            }
        };
        fetchProject();
    }, [id]);

    const lineGeoJSON = useMemo<RouteFeatureCollection | null>(() => {
        if (routePoints.length < 2) return null;
        return {
            type: 'FeatureCollection',
            features: [{
                type: 'Feature',
                geometry: {
                    type: 'LineString',
                    coordinates: routePoints.map((pt) => [pt.lng, pt.lat] as [number, number])
                },
                properties: {}
            }]
        };
    }, [routePoints]);
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
                        className="inline-flex items-center gap-3 text-xs font-black uppercase tracking-[0.3em] text-black/70 dark:text-white/60 hover:text-black dark:hover:text-white transition-colors mb-12"
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
                                <span className="text-[10px] font-black uppercase tracking-[0.4em] text-black/70 dark:text-white/60">
                                    {progetto.anno} • {progetto.localita}
                                </span>
                            </div>
                            <h1 className="text-5xl md:text-7xl lg:text-8xl font-black text-black dark:text-white tracking-tighter leading-[0.85] font-heading">
                                {progetto.titolo}
                            </h1>
                        </div>
                    </div>

                    {/* Map Integration */}
                    <div
                        ref={mapContainerRef}
                        className="mt-12 w-full h-80 bg-black/8 dark:bg-dark-surface border border-black/10 dark:border-white/5 overflow-hidden relative"
                    >
                        {mapPoints.length > 0 ? (
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
                                {lineGeoJSON && (
                                    <Source id="routes" type="geojson" data={lineGeoJSON}>
                                        <Layer
                                            id="routes-layer"
                                            type="line"
                                            paint={{
                                                'line-color': theme === 'dark' ? '#3b82f6' : '#2563eb',
                                                'line-width': 4,
                                                'line-opacity': 0.8
                                            }}
                                        />
                                    </Source>
                                )}
                                {mapPoints.map((pt, i) => (
                                    <Fragment key={`${pt.lat}-${pt.lng}`}>
                                        <Marker
                                            longitude={pt.lng}
                                            latitude={pt.lat}
                                            anchor="center"
                                        >
                                            <div className="relative group cursor-pointer flex items-center justify-center">
                                                <div className="absolute w-8 h-8 border border-primary/30 scale-0 group-hover:scale-110 transition-transform duration-500" />
                                                <div className="w-3 h-3 bg-white dark:bg-black border-[1.5px] border-primary z-10 transition-all duration-300 group-hover:bg-primary group-hover:border-white group-hover:rotate-45" />
                                            </div>
                                        </Marker>
                                        <Popup
                                            longitude={pt.lng}
                                            latitude={pt.lat}
                                            anchor="top"
                                            offset={15}
                                            closeButton={false}
                                            className="maplibre-popup-custom"
                                            >
                                                <div className="p-3 min-w-[120px] bg-white dark:bg-dark-surface border border-black/10 dark:border-white/10 shadow-xl">
                                                    <span className="text-[9px] font-black uppercase tracking-widest text-primary mb-1 block">
                                                    Località {i + 1}
                                                </span>
                                                <h4 className="font-black uppercase text-[10px] tracking-tight text-black dark:text-white leading-tight">
                                                    {progetto.localita.split(/[-/]/)[i]?.trim() || progetto.localita}
                                                </h4>
                                                </div>
                                            </Popup>
                                    </Fragment>
                                ))}
                            </Map>
                        ) : (
                            <div className="w-full h-full flex flex-col items-center justify-center space-y-4 animate-pulse">
                                <div className="w-8 h-8 border border-black/10 dark:border-white/10 rotate-45 flex items-center justify-center">
                                    <div className="w-2 h-2 bg-primary/20" />
                                </div>
                                <span className="text-[10px] font-black uppercase tracking-[0.3em] text-black/40 dark:text-white/20">
                                    Acquisizione coordinate...
                                </span>
                            </div>
                        )}
                    </div>
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
                                <h2 className="text-xs font-black uppercase tracking-[0.4em] text-black/60 dark:text-white/40 mb-8 font-heading">Panoramica</h2>
                                <div
                                    className="text-lg text-black/80 dark:text-white/70 leading-relaxed font-medium prose dark:prose-invert max-w-none prose-p:mb-6"
                                    dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(progetto.descrizioneLunga || progetto.descrizione || '') }}
                                />
                            </div>

                            {progetto.immagini && progetto.immagini.length > 1 && (
                                <div className="space-y-8">
                                    <h2 className="text-xs font-black uppercase tracking-[0.4em] text-black/60 dark:text-white/40 font-heading">Documentazione Fotografica</h2>
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
                                        <h3 className="text-xs font-black uppercase tracking-[0.4em] text-black/60 dark:text-white/40">Sfide e Soluzioni</h3>
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
                                        <h3 className="text-xs font-black uppercase tracking-[0.4em] text-black/60 dark:text-white/40">Risultati</h3>
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
                                        <h4 className="text-xs font-black uppercase tracking-[0.4em] text-black/60 dark:text-white/40 mb-6">Dettagli Appalto</h4>
                                        <dl className="space-y-6">
                                            <div className="flex flex-col gap-1">
                                                <dt className="text-[9px] font-black uppercase tracking-widest text-black/60 dark:text-white/40">Committente / Località</dt>
                                                <dd className="text-sm font-black text-black dark:text-white">{progetto.localita}</dd>
                                            </div>
                                            <div className="flex flex-col gap-1">
                                                <dt className="text-[9px] font-black uppercase tracking-widest text-black/60 dark:text-white/40">Anno di Esecuzione</dt>
                                                <dd className="text-sm font-black text-black dark:text-white">{progetto.anno}</dd>
                                            </div>
                                            {progetto.tecnologie?.length ? (
                                                <div className="flex flex-col gap-1">
                                                    <dt className="text-[9px] font-black uppercase tracking-widest text-black/60 dark:text-white/40">Sistemi Impiegati</dt>
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
                                <h2 className="text-4xl md:text-5xl font-black text-black dark:text-white tracking-tighter font-heading">Opere Correlate</h2>
                            </div>
                            <div className="grid md:grid-cols-3 gap-px bg-black/8 dark:bg-white/5 border border-black/10 dark:border-white/5">
                                {progettiCorrelati.map((p) => (
                                    <Link
                                        key={p.id}
                                        to={`/progetti/${p.id}`}
                                        className="bg-white dark:bg-black p-8 group transition-colors hover:bg-stone-50 dark:hover:bg-dark-surface"
                                    >
                                        <span className="text-[9px] font-black text-black/60 dark:text-white/40 uppercase tracking-[0.4em] mb-4 block">{p.anno}</span>
                                        <h4 className="text-lg font-black mb-4 flex items-center gap-2 group-hover:text-primary transition-colors">
                                            {p.titolo}
                                        </h4>
                                        <p className="text-[11px] text-black/70 dark:text-white/60 font-bold uppercase tracking-widest">{p.localita}</p>
                                    </Link>
                                ))}
                            </div>
                        </section>
                    )}
                </main>

                <Lightbox
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
