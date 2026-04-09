import { useEffect, useMemo, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import Layout from '../components/layout/Layout';
import { logger } from '../utils/logger';
import { progettiService, categorieService } from '../supabase/services';
import { ProgettoData } from '../types/supabaseTypes';
import Map, { Marker, Popup, NavigationControl, Source, Layer } from 'react-map-gl/maplibre';
import maplibreCss from 'maplibre-gl/dist/maplibre-gl.css?inline';
import { useTheme } from '../context/ThemeContext';
import gsap from 'gsap';
import {
    ArrowRightIcon,
    ListBulletIcon,
    MapIcon,
    FunnelIcon,
    XMarkIcon,
    MagnifyingGlassIcon,
} from '@heroicons/react/24/outline';
import AnimatedCounter from '../components/utils/AnimatedCounter';
import SEO from '../components/utils/SEO';
import LoadingState from '../components/utils/LoadingState';
import ProjectImagePlaceholder, { getPrimaryProjectImage } from '../components/utils/ProjectImagePlaceholder';
import { useInjectedHeadStyle } from '../hooks/useInjectedHeadStyle';
import {
    metaTextClasses,
    primaryTextClasses,
    secondaryTextClasses,
} from '../components/utils/ColorStyles';

type Coordinate = { lat: number; lng: number };
type ProjectCoordinates = { points: Coordinate[]; route?: Coordinate[] };
type GeocodingPhase = { current: number; total: number };
type SelectedGroup = { projects: ProgettoData[]; coord: Coordinate };
type MarkerGroup = { lat: number; lng: number; projects: ProgettoData[] };
type LineFeature = {
    type: 'Feature';
    geometry: { type: 'LineString'; coordinates: Array<[number, number]> };
    properties: { id?: string };
};
type LineFeatureCollection = { type: 'FeatureCollection'; features: LineFeature[] };
type NominatimResponse = Array<{ lat: string; lon: string }>;
type OsrmResponse = {
    routes?: Array<{ geometry: { coordinates: Array<[number, number]> } }>;
};

const geoCache: Record<string, Coordinate> = {};
const CONCURRENCY = 3;

async function geocodePart(part: string): Promise<Coordinate | null> {
    if (geoCache[part]) return geoCache[part];
    try {
        const res = await fetch(
            `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(part + ', Italia')}&limit=1`
        );
        if (res.status === 429) {
            await new Promise(r => setTimeout(r, 1200));
            const retry = await fetch(
                `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(part + ', Italia')}&limit=1`
            );
            const data: NominatimResponse = await retry.json();
            if (data?.length > 0) {
                const coord = { lat: parseFloat(data[0].lat), lng: parseFloat(data[0].lon) };
                geoCache[part] = coord;
                return coord;
            }
            return null;
        }
        const data: NominatimResponse = await res.json();
        if (data?.length > 0) {
            const coord = { lat: parseFloat(data[0].lat), lng: parseFloat(data[0].lon) };
            geoCache[part] = coord;
            return coord;
        }
    } catch (e) {
        logger.error(`Failed to geocode: ${part}`, e);
    }
    return null;
}

async function fetchRoute(coords: Coordinate[]): Promise<Coordinate[]> {
    try {
        const osrmPath = coords.map(c => `${c.lng},${c.lat}`).join(';');
        const res = await fetch(
            `https://router.project-osrm.org/route/v1/driving/${osrmPath}?overview=full&geometries=geojson`
        );
        const data: OsrmResponse = await res.json();
        if (data.routes?.[0]) {
            return data.routes[0].geometry.coordinates.map(([lng, lat]) => ({ lng, lat }));
        }
    } catch (e) {
        logger.warn('OSRM error', e);
    }
    return coords;
}

async function geocodeProject(p: ProgettoData): Promise<{ id: string; result: ProjectCoordinates }> {
    const projectId = p.id || '';
    const parts = p.localita.split(/[-/]/).map(item => item.trim());
    const coordResults = await Promise.allSettled(parts.map(part => geocodePart(part)));
    const resolvedCoords = coordResults
        .filter((r): r is PromiseFulfilledResult<Coordinate> => r.status === 'fulfilled' && r.value !== null)
        .map(r => r.value);

    let finalRoute: Coordinate[] = resolvedCoords;
    if (resolvedCoords.length >= 2) {
        finalRoute = await fetchRoute(resolvedCoords);
    }

    return { id: projectId, result: { points: resolvedCoords, route: finalRoute } };
}

function chunkArray<T>(arr: T[], size: number): T[][] {
    const chunks: T[][] = [];
    for (let i = 0; i < arr.length; i += size) chunks.push(arr.slice(i, i + size));
    return chunks;
}

// ─── Project Item Card con Magnetic Effect ─────────────────────────────────
type ProjectItemCardProps = {
    project: ProgettoData;
    index: number;
};

function ProjectItemCard({ project, index }: ProjectItemCardProps) {
    const cardRef = useRef<HTMLDivElement>(null);
    const imageRef = useRef<HTMLDivElement>(null);
    const primaryImage = getPrimaryProjectImage(project);

    useEffect(() => {
        const card = cardRef.current;
        const image = imageRef.current;
        if (!card || !image) return;
        const visual = image.querySelector<HTMLElement>('[data-project-visual], img');
        if (!visual) return;

        const handleMouseMove = (e: MouseEvent) => {
            const rect = card.getBoundingClientRect();
            const x = (e.clientX - rect.left) / rect.width - 0.5;
            const y = (e.clientY - rect.top) / rect.height - 0.5;

            gsap.to(card, { y: y * -15, duration: 0.3, ease: 'power2.out' });
            gsap.to(visual, { x: x * 20, y: y * 20, duration: 0.4, ease: 'power2.out' });
        };

        const handleMouseLeave = () => {
            gsap.to(card, { y: 0, duration: 0.5, ease: 'elastic.out(1, 0.5)' });
            gsap.to(visual, { x: 0, y: 0, duration: 0.5, ease: 'elastic.out(1, 0.5)' });
        };

        card.addEventListener('mousemove', handleMouseMove);
        card.addEventListener('mouseleave', handleMouseLeave);
        return () => {
            card.removeEventListener('mousemove', handleMouseMove);
            card.removeEventListener('mouseleave', handleMouseLeave);
        };
    }, []);

    return (
        <div
            ref={cardRef}
            className="group bg-white dark:bg-dark-surface border border-black/8 dark:border-white/5 hover:border-primary/30 transition-all duration-500 overflow-hidden relative"
            data-animate="fade-up"
            data-animate-delay={(index * 0.04).toFixed(2)}
        >
            <span className="absolute top-4 right-6 text-7xl font-black text-black/[0.04] dark:text-white/[0.04] leading-none select-none pointer-events-none font-heading tabular-nums z-0">
                {String(index + 1).padStart(2, '0')}
            </span>
            <Link to={`/progetti/${project.id}`} className="flex flex-col md:flex-row relative z-10">
                <div ref={imageRef} className="md:w-2/5 aspect-[4/3] md:aspect-auto bg-black/5 dark:bg-dark-elevated relative overflow-hidden">
                    {primaryImage?.url ? (
                        <>
                            <img
                                src={primaryImage.url}
                                alt={project.titolo || ''}
                                data-project-visual
                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                            />
                            <div className="absolute inset-0 bg-gradient-to-br from-black/10 via-transparent to-primary/5 group-hover:opacity-0 transition-opacity duration-500" />
                        </>
                    ) : (
                        <ProjectImagePlaceholder project={project} />
                    )}
                </div>
                <div className="md:w-3/5 p-8 md:p-12 flex flex-col justify-between">
                    <div className="space-y-5">
                        <div className="flex items-center gap-3 flex-wrap">
                            {project.categoria && (
                                <span className="text-[9px] font-black uppercase tracking-[0.35em] text-primary">
                                    {project.categoria}
                                </span>
                            )}
                            {project.categoria && project.anno && (
                                <span className="text-black/30 dark:text-white/15 text-[9px]">·</span>
                            )}
                            {project.anno && (
                                <span className={`text-[9px] font-black uppercase tracking-[0.3em] ${metaTextClasses}`}>
                                    {project.anno}
                                </span>
                            )}
                            <span className="text-black/30 dark:text-white/15 text-[9px]">·</span>
                            <span className={`text-[9px] font-black uppercase tracking-[0.3em] ${metaTextClasses}`}>
                                {project.localita}
                            </span>
                        </div>
                        <h3 className={`text-3xl lg:text-4xl font-black tracking-tighter leading-none font-heading group-hover:text-primary transition-colors duration-300 ${primaryTextClasses}`}>
                            {project.titolo}
                        </h3>
                        <p className={`text-sm font-medium leading-relaxed line-clamp-2 ${secondaryTextClasses}`}>
                            {project.descrizione}
                        </p>
                        {project.tecnologie && project.tecnologie.length > 0 && (
                            <div className="flex flex-wrap gap-2">
                                {project.tecnologie.slice(0, 3).map((tec, i) => (
                                    <span
                                        key={i}
                                        className={`text-[9px] font-black uppercase tracking-widest px-3 py-1.5 border border-black/20 dark:border-white/10 group-hover:border-primary/20 group-hover:text-primary/60 transition-all ${metaTextClasses}`}
                                    >
                                        {tec}
                                    </span>
                                ))}
                            </div>
                        )}
                    </div>
                    <div className="flex items-center gap-3 mt-8 pt-6 border-t border-black/10 dark:border-white/5">
                        <span className={`text-xs font-black uppercase tracking-[0.3em] group-hover:text-primary transition-colors ${metaTextClasses}`}>
                            Scopri il progetto
                        </span>
                        <ArrowRightIcon className={`w-4 h-4 group-hover:text-primary group-hover:translate-x-2 transition-all ${metaTextClasses}`} />
                    </div>
                </div>
            </Link>
        </div>
    );
}

function ProjectsPage() {
    const { theme } = useTheme();
    useInjectedHeadStyle(maplibreCss);

    const [progetti, setProgetti] = useState<ProgettoData[]>([]);
    const [categorie, setCategorie] = useState<string[]>(['tutti']);
    const [loading, setLoading] = useState(true);
    const [categoriaAttiva, setCategoriaAttiva] = useState('tutti');
    const [visualizzazione, setVisualizzazione] = useState<'lista' | 'mappa'>('lista');
    const [showMobileFilters, setShowMobileFilters] = useState(false);
    const [projectCoordinates, setProjectCoordinates] = useState<Record<string, ProjectCoordinates>>({});
    const [geocodingPhase, setGeocodingPhase] = useState<GeocodingPhase>({ current: 0, total: 0 });
    const [selectedGroup, setSelectedGroup] = useState<SelectedGroup | null>(null);
    const [activeProjectIndex, setActiveProjectIndex] = useState(0);
    const mapContainerRef = useRef<HTMLDivElement>(null);
    const geocodedProjectIdsRef = useRef<Set<string>>(new Set());

    const [viewState, setViewState] = useState({
        longitude: 12.5,
        latitude: 42.5,
        zoom: 5
    });

    // Scroll lock sulla mappa
    useEffect(() => {
        const el = mapContainerRef.current;
        if (!el) return;
        const handler = (e: WheelEvent) => {
            e.preventDefault();
            e.stopPropagation();
        };
        el.addEventListener('wheel', handler, { passive: false });
        return () => el.removeEventListener('wheel', handler);
    }, [visualizzazione]);

    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                const [projData, catData] = await Promise.all([
                    progettiService.getAllProjects(),
                    categorieService.getAllCategorie()
                ]);
                const categoryNames = catData.flatMap(({ nome }) => (
                    nome ? [nome.toLowerCase()] : []
                ));
                setProgetti(projData);
                setCategorie(['tutti', ...new Set(categoryNames)]);
                geocodedProjectIdsRef.current.clear();
            } catch (err) {
                logger.error('Impossibile caricare i progetti.');
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    const progettiFiltrati = useMemo(() =>
        categoriaAttiva === 'tutti' ? progetti : progetti.filter(p => p.categoria?.toLowerCase() === categoriaAttiva.toLowerCase())
        , [progetti, categoriaAttiva]);

    const contatoriCategoria = useMemo(() => {
        const counts: Record<string, number> = { tutti: progetti.length };
        progetti.forEach(p => {
            const cat = p.categoria?.toLowerCase();
            if (cat) counts[cat] = (counts[cat] || 0) + 1;
        });
        return counts;
    }, [progetti]);

    // Geocoding parallelo con concurrency = 3
    useEffect(() => {
        let isMounted = true;

        if (visualizzazione === 'mappa' && progettiFiltrati.length > 0) {
            const projectsToProcess = progettiFiltrati.filter((project) => {
                const projectId = project.id ?? '';
                return Boolean(project.localita) && !geocodedProjectIdsRef.current.has(projectId);
            });
            if (projectsToProcess.length === 0) return;

            setGeocodingPhase({ current: 0, total: projectsToProcess.length });

            const processGeocoding = async () => {
                let processedCount = 0;
                const chunks = chunkArray(projectsToProcess, CONCURRENCY);

                for (const chunk of chunks) {
                    if (!isMounted) break;
                    const results = await Promise.allSettled(chunk.map(p => geocodeProject(p)));
                    const coordinatesBatch: Record<string, ProjectCoordinates> = {};

                    results.forEach((result) => {
                        if (!isMounted || result.status !== 'fulfilled') {
                            processedCount++;
                            return;
                        }

                        const { id, result: coords } = result.value;
                        coordinatesBatch[id] = coords;
                        geocodedProjectIdsRef.current.add(id);
                        processedCount++;
                    });

                    if (Object.keys(coordinatesBatch).length > 0) {
                        setProjectCoordinates((prev) => ({ ...prev, ...coordinatesBatch }));
                    }

                    setGeocodingPhase((prev) => ({ ...prev, current: processedCount }));

                    // Piccolo delay tra i batch per rispettare rate limit Nominatim
                    if (isMounted) await new Promise(r => setTimeout(r, 300));
                }
            };

            processGeocoding();
        }

        return () => { isMounted = false; };
    }, [visualizzazione, progettiFiltrati]);

    useEffect(() => {
        const firstWithCoords = progettiFiltrati.find((progetto) =>
            (projectCoordinates[progetto.id ?? '']?.points.length ?? 0) > 0
        );
        if (firstWithCoords && visualizzazione === 'mappa' && viewState.zoom === 5) {
            const coords = projectCoordinates[firstWithCoords.id ?? '']?.points[0];
            if (coords) {
                setViewState(prev => ({ ...prev, longitude: coords.lng, latitude: coords.lat, zoom: 6 }));
            }
        }
    }, [projectCoordinates, progettiFiltrati, viewState.zoom, visualizzazione]);

    const groupedMarkers = useMemo(() => {
        const coordsMap = new globalThis.Map<string, MarkerGroup & { projectIds: Set<string> }>();

        progettiFiltrati.forEach((progetto) => {
            const coords = projectCoordinates[progetto.id ?? ''];
            if (coords?.points) {
                coords.points.forEach((pt) => {
                    const key = `${pt.lat.toFixed(5)},${pt.lng.toFixed(5)}`;
                    const group = coordsMap.get(key) ?? { lat: pt.lat, lng: pt.lng, projects: [], projectIds: new Set<string>() };
                    if (!group.projectIds.has(progetto.id ?? '')) {
                        group.projects.push(progetto);
                        group.projectIds.add(progetto.id ?? '');
                    }
                    coordsMap.set(key, group);
                });
            }
        });
        return [...coordsMap.values()].map(({ projectIds, ...group }) => group);
    }, [progettiFiltrati, projectCoordinates]);

    const lineGeoJSON = useMemo<LineFeatureCollection>(() => {
        const features = progettiFiltrati.flatMap((progetto) => {
            const coords = projectCoordinates[progetto.id ?? ''];
            if (!coords?.route || coords.route.length < 2) return [];

            return [{
                type: 'Feature' as const,
                geometry: {
                    type: 'LineString' as const,
                    coordinates: coords.route.map((pt) => [pt.lng, pt.lat] as [number, number])
                },
                properties: { id: progetto.id }
            }];
        });

        return { type: 'FeatureCollection', features };
    }, [progettiFiltrati, projectCoordinates]);

    const isGeocodingDone = geocodingPhase.current === geocodingPhase.total && geocodingPhase.total > 0;
    // Mostra mappa appena almeno un marker è disponibile, anche se il geocoding non è finito
    const hasAnyCoords = groupedMarkers.length > 0;

    if (loading) {
        return (
            <Layout>
                <LoadingState
                    label="Progetti"
                    description="Stiamo caricando portfolio, filtri e mappa dei cantieri."
                />
            </Layout>
        );
    }

    return (
        <Layout>
            <SEO
                title="Progetti Realizzati | Scandellari"
                description="Portfolio dei progetti ferroviari realizzati da Scandellari Giacinto s.n.c. Installazioni di segnalamento, alta velocità e infrastrutture ferroviarie in tutta Italia."
                keywords="progetti ferroviari, cantieri ferroviari, alta velocità, RFI, installazioni segnalamento, portfolio"
                url="/progetti"
            />
            <div className="bg-stone-50 dark:bg-black min-h-screen pt-32 pb-20 font-sans">

                {/* Hero Section */}
                <section className="container mx-auto max-w-7xl px-6 mb-20">
                    <div
                        className="border-b border-black/10 dark:border-white/5 pb-20"
                        data-animate="fade-up"
                        data-animate-distance="20"
                    >
                        <div className="flex items-center gap-4 mb-12">
                            <div className="w-12 h-[1px] bg-primary shadow-[0_0_8px_rgba(37,99,235,0.5)]" />
                            <span className={`text-[10px] font-black uppercase tracking-[0.4em] ${metaTextClasses}`}>
                                Portfolio Infrastrutturale
                            </span>
                        </div>
                        <div className="flex flex-col md:flex-row md:items-end justify-between gap-12">
                            <div>
                                <h1 className="text-6xl md:text-8xl lg:text-9xl font-black text-black dark:text-white tracking-tighter leading-[0.8] font-heading mb-12">
                                    Grandi<br />Progetti
                                </h1>
                                <p className={`text-base md:text-xl max-w-2xl font-medium leading-relaxed ${secondaryTextClasses}`}>
                                    Un'eredità di eccellenza ingegneristica dal 1945. Esplora le opere che hanno definito l'infrastruttura ferroviaria italiana.
                                </p>
                            </div>
                            <div className="shrink-0 text-right">
                                <div className="text-7xl md:text-8xl font-black text-black/5 dark:text-white/5 leading-none font-heading tabular-nums select-none">
                                    <AnimatedCounter to={progetti.length} duration={1200} />
                                </div>
                                <div className={`text-[10px] font-black uppercase tracking-[0.4em] mt-1 ${metaTextClasses}`}>
                                    Opere totali
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                <main className="container mx-auto max-w-7xl px-6">

                    {/* Filtri orizzontali + switcher */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 mb-16">

                        {/* Filtri categoria — desktop */}
                        <div className="hidden sm:flex bg-black/5 dark:bg-white/5 p-1 overflow-x-auto no-scrollbar">
                            {categorie.map((cat) => (
                                <button
                                    key={cat}
                                    onClick={() => setCategoriaAttiva(cat)}
                                    className={`px-5 py-3 text-xs font-black uppercase tracking-widest whitespace-nowrap transition-all flex items-center gap-2 ${categoriaAttiva === cat
                                        ? 'bg-black dark:bg-white text-white dark:text-black'
                                        : `${metaTextClasses} hover:text-black dark:hover:text-white`
                                        }`}
                                >
                                    {cat === 'tutti' ? 'Tutti' : cat}
                                    <span className={`text-[9px] tabular-nums transition-all ${categoriaAttiva === cat ? 'opacity-60' : 'opacity-40'}`}>
                                        {contatoriCategoria[cat] ?? 0}
                                    </span>
                                </button>
                            ))}
                        </div>

                        {/* Filtri mobile */}
                        <button
                            onClick={() => setShowMobileFilters(true)}
                            className="sm:hidden flex items-center justify-center gap-2 px-6 py-3 border border-black/20 dark:border-white/20 text-[10px] font-black uppercase tracking-widest hover:bg-black dark:hover:bg-white hover:text-white dark:hover:text-black transition-all"
                        >
                            <FunnelIcon className="w-4 h-4" />
                            {categoriaAttiva === 'tutti' ? 'Filtri' : categoriaAttiva}
                        </button>

                        {/* Switcher lista / mappa */}
                        <div className="flex items-center gap-3 shrink-0">
                            <div className="flex bg-black/5 dark:bg-white/5 p-1">
                                <button
                                    onClick={() => setVisualizzazione('lista')}
                                    className={`flex items-center gap-2 px-5 py-3 text-[10px] font-black uppercase tracking-widest transition-all ${visualizzazione === 'lista'
                                        ? 'bg-black dark:bg-white text-white dark:text-black shadow-lg'
                                        : `${metaTextClasses} hover:text-black dark:hover:text-white`
                                        }`}
                                >
                                    <ListBulletIcon className="w-4 h-4" />
                                    <span className="hidden md:inline">Lista</span>
                                </button>
                                <button
                                    onClick={() => setVisualizzazione('mappa')}
                                    className={`flex items-center gap-2 px-5 py-3 text-[10px] font-black uppercase tracking-widest transition-all ${visualizzazione === 'mappa'
                                        ? 'bg-black dark:bg-white text-white dark:text-black shadow-lg'
                                        : `${metaTextClasses} hover:text-black dark:hover:text-white`
                                        }`}
                                >
                                    <MapIcon className="w-4 h-4" />
                                    <span className="hidden md:inline">Mappa</span>
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Contenuto lista / mappa */}
                    {visualizzazione === 'lista' ? (
                        <div key="lista" className="space-y-6">
                            {progettiFiltrati.length === 0 ? (
                                <div className="flex flex-col items-center justify-center py-32 gap-6 text-center">
                                    <MagnifyingGlassIcon className="w-10 h-10 text-black/40 dark:text-white/15" />
                                    <div>
                                        <p className={`text-sm font-black uppercase tracking-widest mb-2 ${metaTextClasses}`}>
                                            Nessun progetto trovato
                                        </p>
                                        <p className={`text-xs font-medium ${metaTextClasses}`}>
                                            Nessuna opera in questa categoria.
                                        </p>
                                    </div>
                                    <button
                                        onClick={() => setCategoriaAttiva('tutti')}
                                        className="text-[10px] font-black uppercase tracking-widest text-primary border border-primary/30 px-6 py-3 hover:bg-primary hover:text-white transition-all"
                                    >
                                        Vedi tutti i progetti
                                    </button>
                                </div>
                            ) : (
                                progettiFiltrati.map((project, index) => (
                                    <ProjectItemCard key={project.id} project={project} index={index} />
                                ))
                            )}
                        </div>
                    ) : (
                        <div
                            key="mappa"
                            ref={mapContainerRef}
                            className="h-[70vh] bg-black/5 dark:bg-dark-surface overflow-hidden border border-black/5 dark:border-white/5 rounded-sm relative"
                            data-animate="fade"
                        >
                            {hasAnyCoords ? (
                                <>
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

                                        {lineGeoJSON.features.length > 0 && (
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

                                        {groupedMarkers.map((group, idx) => (
                                            <Marker
                                                key={`group-${idx}`}
                                                longitude={group.lng}
                                                latitude={group.lat}
                                                anchor="center"
                                                onClick={(e) => {
                                                    e.originalEvent.stopPropagation();
                                                    setSelectedGroup({ projects: group.projects, coord: { lat: group.lat, lng: group.lng } });
                                                    setActiveProjectIndex(0);
                                                }}
                                            >
                                                <div className="relative group cursor-pointer flex items-center justify-center">
                                                    {group.projects.length > 1 && (
                                                        <div className="absolute -top-3 -right-3 min-w-4 h-4 px-1 rounded-full bg-primary text-white text-[8px] font-black flex items-center justify-center z-20 shadow-glow">
                                                            {group.projects.length}
                                                        </div>
                                                    )}
                                                    <div className="absolute w-8 h-8 border border-primary/30 scale-0 group-hover:scale-110 transition-transform duration-500" />
                                                    <div className="w-3.5 h-3.5 bg-white dark:bg-black border-[1.5px] border-primary z-10 transition-all duration-300 group-hover:bg-primary group-hover:border-white group-hover:rotate-45" />
                                                </div>
                                            </Marker>
                                        ))}

                                        {selectedGroup && (
                                            <Popup
                                                longitude={selectedGroup.coord.lng}
                                                latitude={selectedGroup.coord.lat}
                                                anchor="top"
                                                offset={15}
                                                onClose={() => setSelectedGroup(null)}
                                                className="maplibre-popup-custom"
                                                closeButton={false}
                                            >
                                                <div className="p-6 min-w-[260px] max-w-[300px] bg-white dark:bg-dark-surface border border-black/10 dark:border-white/10 shadow-2xl">
                                                    {selectedGroup.projects.length > 1 && (
                                                        <div className="flex items-center justify-between mb-4 pb-4 border-b border-black/10 dark:border-white/10">
                                                            <span className="text-[10px] font-black uppercase tracking-widest text-primary">
                                                                {activeProjectIndex + 1} / {selectedGroup.projects.length} Opere
                                                            </span>
                                                            <div className="flex gap-1">
                                                                <button
                                                                    onClick={(e) => {
                                                                        e.stopPropagation();
                                                                        setActiveProjectIndex(prev => (prev > 0 ? prev - 1 : selectedGroup.projects.length - 1));
                                                                    }}
                                                                    className="w-6 h-6 flex items-center justify-center hover:bg-black/5 dark:hover:bg-white/5 rounded-sm transition-colors"
                                                                >
                                                                    <ListBulletIcon className={`w-3 h-3 rotate-180 hover:text-black dark:hover:text-white ${metaTextClasses}`} />
                                                                </button>
                                                                <button
                                                                    onClick={(e) => {
                                                                        e.stopPropagation();
                                                                        setActiveProjectIndex(prev => (prev < selectedGroup.projects.length - 1 ? prev + 1 : 0));
                                                                    }}
                                                                    className="w-6 h-6 flex items-center justify-center hover:bg-black/5 dark:hover:bg-white/5 rounded-sm transition-colors"
                                                                >
                                                                    <ArrowRightIcon className={`w-3 h-3 hover:text-black dark:hover:text-white ${metaTextClasses}`} />
                                                                </button>
                                                            </div>
                                                        </div>
                                                    )}
                                                    {(() => {
                                                        const p = selectedGroup.projects[activeProjectIndex];
                                                        return (
                                                            <div className="group/pop animate-in fade-in slide-in-from-right-2 duration-300">
                                                                <span className="text-[9px] font-black uppercase tracking-widest text-primary mb-1 block">
                                                                    {p.categoria}
                                                                </span>
                                                                <h4 className="font-black uppercase text-base tracking-tighter leading-tight text-black dark:text-white mb-2">
                                                                    {p.titolo}
                                                                </h4>
                                                                <p className={`text-[10px] font-bold uppercase tracking-widest mb-4 ${metaTextClasses}`}>
                                                                    {p.localita} • {p.anno}
                                                                </p>
                                                                <Link
                                                                    to={`/progetti/${p.id}`}
                                                                    className="flex items-center justify-between group/link pt-4 border-t border-black/10 dark:border-white/10"
                                                                >
                                                                    <span className="text-[10px] font-black uppercase tracking-widest text-black dark:text-white group-hover/link:text-primary transition-colors">Vedi Dettagli</span>
                                                                    <ArrowRightIcon className={`w-4 h-4 group-hover/link:text-primary group-hover/link:translate-x-1 transition-all ${metaTextClasses}`} />
                                                                </Link>
                                                            </div>
                                                        );
                                                    })()}
                                                </div>
                                            </Popup>
                                        )}
                                    </Map>

                                    {/* Progress overlay mentre finisce il geocoding */}
                                    {!isGeocodingDone && (
                                        <div className="absolute bottom-4 left-4 bg-white/90 dark:bg-black/90 backdrop-blur-sm px-4 py-2 flex items-center gap-3 border border-black/10 dark:border-white/10">
                                            <div className="w-2 h-2 bg-primary rounded-full animate-pulse" />
                                            <span className={`text-[9px] font-black uppercase tracking-widest ${metaTextClasses}`}>
                                                Mappatura in corso
                                            </span>
                                            <span className="text-[9px] font-black text-primary tabular-nums">
                                                {geocodingPhase.current}/{geocodingPhase.total}
                                            </span>
                                        </div>
                                    )}
                                </>
                            ) : (
                                <div className="w-full h-full flex flex-col items-center justify-center space-y-6">
                                    <div className="relative w-16 h-16">
                                        <div className="absolute inset-0 border border-black/20 dark:border-white/5 animate-ping" />
                                        <div className="absolute inset-0 border border-primary/20 animate-pulse delay-75" />
                                        <div className="absolute inset-4 border-2 border-primary/40 rotate-45" />
                                    </div>
                                    <div className="text-center space-y-2">
                                        <span className={`block text-[11px] font-black uppercase tracking-[0.4em] animate-pulse ${metaTextClasses}`}>
                                            Mappatura Infrastrutture
                                        </span>
                                        <div className="flex items-center justify-center gap-4">
                                            <div className="h-[2px] w-20 bg-black/15 dark:bg-white/5 overflow-hidden">
                                                <div
                                                    className="h-full bg-primary transition-all duration-500"
                                                    style={{ width: `${geocodingPhase.total > 0 ? (geocodingPhase.current / geocodingPhase.total) * 100 : 0}%` }}
                                                />
                                            </div>
                                            <span className="text-[10px] font-black text-primary tabular-nums">
                                                {geocodingPhase.current} / {geocodingPhase.total}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                </main>

                {/* Mobile Filter Modal */}
                <div
                    className={`fixed inset-0 z-[100] bg-white dark:bg-black p-6 flex flex-col transition-opacity duration-300 ${showMobileFilters ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
                    aria-hidden={!showMobileFilters}
                >
                    <div className="flex justify-between items-center mb-12">
                        <span className="text-xs font-black uppercase tracking-[0.4em]">Filtri</span>
                        <button onClick={() => setShowMobileFilters(false)}>
                            <XMarkIcon className="w-8 h-8" />
                        </button>
                    </div>
                    <div className="flex-grow flex flex-col gap-8">
                        {categorie.map((cat) => (
                            <button
                                key={cat}
                                onClick={() => { setCategoriaAttiva(cat); setShowMobileFilters(false); }}
                                className={`text-3xl font-black tracking-tighter text-left flex items-center gap-4 ${categoriaAttiva === cat ? 'text-primary' : metaTextClasses}`}
                            >
                                {cat === 'tutti' ? 'Tutti i Progetti' : cat}
                                <span className="text-base font-black opacity-50 tabular-nums">
                                    {contatoriCategoria[cat] ?? 0}
                                </span>
                            </button>
                        ))}
                    </div>
                </div>
            </div>
        </Layout>
    );
}

export default ProjectsPage;
