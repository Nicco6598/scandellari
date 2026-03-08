import React, { useState, useEffect, useMemo, useRef } from 'react';
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

interface Coordinate { lat: number; lng: number; }
type ProjectCoordinates = { points: Coordinate[]; route?: Coordinate[]; error?: string; };

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
            const data = await retry.json();
            if (data?.length > 0) {
                const coord = { lat: parseFloat(data[0].lat), lng: parseFloat(data[0].lon) };
                geoCache[part] = coord;
                return coord;
            }
            return null;
        }
        const data = await res.json();
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
        const data = await res.json();
        if (data.routes?.[0]) {
            return data.routes[0].geometry.coordinates.map((c: any) => ({ lng: c[0], lat: c[1] }));
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
const ProjectItemCard: React.FC<{ project: ProgettoData; index: number }> = ({ project, index }) => {
    const cardRef = useRef<HTMLDivElement>(null);
    const imageRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const card = cardRef.current;
        const image = imageRef.current;
        if (!card || !image) return;

        const handleMouseMove = (e: MouseEvent) => {
            const rect = card.getBoundingClientRect();
            const x = (e.clientX - rect.left) / rect.width - 0.5;
            const y = (e.clientY - rect.top) / rect.height - 0.5;

            gsap.to(card, { y: y * -15, duration: 0.3, ease: 'power2.out' });
            gsap.to(image.querySelector('img'), { x: x * 20, y: y * 20, duration: 0.4, ease: 'power2.out' });
        };

        const handleMouseLeave = () => {
            gsap.to(card, { y: 0, duration: 0.5, ease: 'elastic.out(1, 0.5)' });
            gsap.to(image.querySelector('img'), { x: 0, y: 0, duration: 0.5, ease: 'elastic.out(1, 0.5)' });
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
                    {project.immagini?.[0]?.url ? (
                        <>
                            <img
                                src={project.immagini[0].url}
                                alt={project.titolo || ''}
                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                            />
                            <div className="absolute inset-0 bg-gradient-to-br from-black/10 via-transparent to-primary/5 group-hover:opacity-0 transition-opacity duration-500" />
                        </>
                    ) : (
                        <div className="w-full h-full flex items-center justify-center">
                            <div className="w-16 h-16 border border-black/20 dark:border-white/10" />
                        </div>
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
                                <span className="text-[9px] font-black uppercase tracking-[0.3em] text-black/60 dark:text-white/30">
                                    {project.anno}
                                </span>
                            )}
                            <span className="text-black/30 dark:text-white/15 text-[9px]">·</span>
                            <span className="text-[9px] font-black text-black/60 dark:text-white/30 uppercase tracking-[0.3em]">
                                {project.localita}
                            </span>
                        </div>
                        <h3 className="text-3xl lg:text-4xl font-black text-black dark:text-white tracking-tighter leading-none font-heading group-hover:text-primary transition-colors duration-300">
                            {project.titolo}
                        </h3>
                        <p className="text-sm text-black/65 dark:text-white/50 font-medium leading-relaxed line-clamp-2">
                            {project.descrizione}
                        </p>
                        {project.tecnologie && project.tecnologie.length > 0 && (
                            <div className="flex flex-wrap gap-2">
                                {project.tecnologie.slice(0, 3).map((tec, i) => (
                                    <span
                                        key={i}
                                        className="text-[9px] font-black uppercase tracking-widest px-3 py-1.5 border border-black/20 dark:border-white/10 text-black/60 dark:text-white/30 group-hover:border-primary/20 group-hover:text-primary/60 transition-all"
                                    >
                                        {tec}
                                    </span>
                                ))}
                            </div>
                        )}
                    </div>
                    <div className="flex items-center gap-3 mt-8 pt-6 border-t border-black/10 dark:border-white/5">
                        <span className="text-xs font-black uppercase tracking-[0.3em] text-black/60 dark:text-white/30 group-hover:text-primary transition-colors">
                            Scopri il progetto
                        </span>
                        <ArrowRightIcon className="w-4 h-4 text-black/60 dark:text-white/30 group-hover:text-primary group-hover:translate-x-2 transition-all" />
                    </div>
                </div>
            </Link>
        </div>
    );
};

const ProjectsPage: React.FC = () => {
    const { theme } = useTheme();

    useEffect(() => {
        const style = document.createElement('style');
        style.textContent = maplibreCss;
        document.head.appendChild(style);
        return () => { document.head.removeChild(style); };
    }, []);

    const [progetti, setProgetti] = useState<ProgettoData[]>([]);
    const [categorie, setCategorie] = useState<string[]>(['tutti']);
    const [loading, setLoading] = useState<boolean>(true);
    const [categoriaAttiva, setCategoriaAttiva] = useState<string>('tutti');
    const [visualizzazione, setVisualizzazione] = useState<'lista' | 'mappa'>('lista');
    const [showMobileFilters, setShowMobileFilters] = useState(false);
    const [projectCoordinates, setProjectCoordinates] = useState<Record<string | number, ProjectCoordinates>>({});
    const [geocodingPhase, setGeocodingPhase] = useState<{ current: number, total: number }>({ current: 0, total: 0 });
    const [selectedGroup, setSelectedGroup] = useState<{ projects: ProgettoData[], coord: Coordinate } | null>(null);
    const [activeProjectIndex, setActiveProjectIndex] = useState(0);
    const mapContainerRef = useRef<HTMLDivElement>(null);

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
                setProgetti(projData);
                setCategorie(['tutti', ...new Set(catData.map(c => c.nome?.toLowerCase()).filter(Boolean) as string[])]);
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
            const projectsToProcess = progettiFiltrati.filter(p => !projectCoordinates[p.id || ''] && p.localita);
            if (projectsToProcess.length === 0) return;

            setGeocodingPhase({ current: 0, total: projectsToProcess.length });

            const processGeocoding = async () => {
                let processedCount = 0;
                const chunks = chunkArray(projectsToProcess, CONCURRENCY);

                for (const chunk of chunks) {
                    if (!isMounted) break;
                    const results = await Promise.allSettled(chunk.map(p => geocodeProject(p)));

                    results.forEach((result) => {
                        if (!isMounted) return;
                        if (result.status === 'fulfilled') {
                            const { id, result: coords } = result.value;
                            setProjectCoordinates(prev => ({ ...prev, [id]: coords }));
                        }
                        processedCount++;
                        setGeocodingPhase(prev => ({ ...prev, current: processedCount }));
                    });

                    // Piccolo delay tra i batch per rispettare rate limit Nominatim
                    if (isMounted) await new Promise(r => setTimeout(r, 300));
                }
            };

            processGeocoding();
        }

        return () => { isMounted = false; };
    }, [visualizzazione, progettiFiltrati]);

    useEffect(() => {
        const firstWithCoords = progettiFiltrati.find(p => {
            const coords = projectCoordinates[p.id || ''];
            return coords && coords.points && coords.points.length > 0;
        });
        if (firstWithCoords && visualizzazione === 'mappa' && viewState.zoom === 5) {
            const coords = projectCoordinates[firstWithCoords.id || ''].points[0];
            if (coords) {
                setViewState(prev => ({ ...prev, longitude: coords.lng, latitude: coords.lat, zoom: 6 }));
            }
        }
    }, [projectCoordinates, visualizzazione, progettiFiltrati]);

    const groupedMarkers = useMemo(() => {
        const coordsMap: Record<string, { lat: number, lng: number, projects: ProgettoData[] }> = {};
        progettiFiltrati.forEach(p => {
            const coords = projectCoordinates[p.id || ''];
            if (coords?.points) {
                coords.points.forEach(pt => {
                    const key = `${pt.lat.toFixed(5)},${pt.lng.toFixed(5)}`;
                    if (!coordsMap[key]) coordsMap[key] = { lat: pt.lat, lng: pt.lng, projects: [] };
                    const group = coordsMap[key];
                    if (!group.projects.find((proj: ProgettoData) => proj.id === p.id)) group.projects.push(p);
                });
            }
        });
        return Object.values(coordsMap);
    }, [progettiFiltrati, projectCoordinates]);

    const lineGeoJSON = useMemo(() => {
        const features = progettiFiltrati.map(p => {
            const coords = projectCoordinates[p.id || ''];
            if (!coords?.route || coords.route.length < 2) return null;
            return {
                type: 'Feature' as const,
                geometry: { type: 'LineString' as const, coordinates: coords.route.map(pt => [pt.lng, pt.lat]) },
                properties: { id: p.id }
            };
        }).filter(Boolean);
        return { type: 'FeatureCollection' as const, features: features as any[] };
    }, [progettiFiltrati, projectCoordinates]);

    const isGeocodingDone = geocodingPhase.current === geocodingPhase.total && geocodingPhase.total > 0;
    // Mostra mappa appena almeno un marker è disponibile, anche se il geocoding non è finito
    const hasAnyCoords = groupedMarkers.length > 0;

    if (loading) return null;

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
                            <span className="text-[10px] font-black uppercase tracking-[0.4em] text-black/70 dark:text-white/60">
                                Portfolio Infrastrutturale
                            </span>
                        </div>
                        <div className="flex flex-col md:flex-row md:items-end justify-between gap-12">
                            <div>
                                <h1 className="text-6xl md:text-8xl lg:text-9xl font-black text-black dark:text-white tracking-tighter leading-[0.8] font-heading mb-12">
                                    Grandi<br />Progetti
                                </h1>
                                <p className="text-base md:text-xl text-black/70 dark:text-white/60 max-w-2xl font-medium leading-relaxed">
                                    Un'eredità di eccellenza ingegneristica dal 1945. Esplora le opere che hanno definito l'infrastruttura ferroviaria italiana.
                                </p>
                            </div>
                            <div className="shrink-0 text-right">
                                <div className="text-7xl md:text-8xl font-black text-black/5 dark:text-white/5 leading-none font-heading tabular-nums select-none">
                                    <AnimatedCounter to={progetti.length} duration={1200} />
                                </div>
                                <div className="text-[10px] font-black uppercase tracking-[0.4em] text-black/30 dark:text-white/30 mt-1">
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
                                        : 'text-black/60 dark:text-white/40 hover:text-black dark:hover:text-white'
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
                                        : 'text-black/60 dark:text-white/40 hover:text-black dark:hover:text-white'
                                        }`}
                                >
                                    <ListBulletIcon className="w-4 h-4" />
                                    <span className="hidden md:inline">Lista</span>
                                </button>
                                <button
                                    onClick={() => setVisualizzazione('mappa')}
                                    className={`flex items-center gap-2 px-5 py-3 text-[10px] font-black uppercase tracking-widest transition-all ${visualizzazione === 'mappa'
                                        ? 'bg-black dark:bg-white text-white dark:text-black shadow-lg'
                                        : 'text-black/60 dark:text-white/40 hover:text-black dark:hover:text-white'
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
                                        <p className="text-sm font-black uppercase tracking-widest text-black/50 dark:text-white/30 mb-2">
                                            Nessun progetto trovato
                                        </p>
                                        <p className="text-xs text-black/40 dark:text-white/20 font-medium">
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
                                                                    <ListBulletIcon className="w-3 h-3 rotate-180 text-black/60 dark:text-white/40 hover:text-black dark:hover:text-white" />
                                                                </button>
                                                                <button
                                                                    onClick={(e) => {
                                                                        e.stopPropagation();
                                                                        setActiveProjectIndex(prev => (prev < selectedGroup.projects.length - 1 ? prev + 1 : 0));
                                                                    }}
                                                                    className="w-6 h-6 flex items-center justify-center hover:bg-black/5 dark:hover:bg-white/5 rounded-sm transition-colors"
                                                                >
                                                                    <ArrowRightIcon className="w-3 h-3 text-black/60 dark:text-white/40 hover:text-black dark:hover:text-white" />
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
                                                                <p className="text-[10px] font-bold text-black/60 dark:text-white/30 uppercase tracking-widest mb-4">
                                                                    {p.localita} • {p.anno}
                                                                </p>
                                                                <Link
                                                                    to={`/progetti/${p.id}`}
                                                                    className="flex items-center justify-between group/link pt-4 border-t border-black/10 dark:border-white/10"
                                                                >
                                                                    <span className="text-[10px] font-black uppercase tracking-widest text-black dark:text-white group-hover/link:text-primary transition-colors">Vedi Dettagli</span>
                                                                    <ArrowRightIcon className="w-4 h-4 text-black/60 dark:text-white/40 group-hover/link:text-primary group-hover/link:translate-x-1 transition-all" />
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
                                            <span className="text-[9px] font-black uppercase tracking-widest text-black/60 dark:text-white/40">
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
                                        <span className="block text-[11px] font-black uppercase tracking-[0.4em] text-black/60 dark:text-white/40 animate-pulse">
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
                                className={`text-3xl font-black tracking-tighter text-left flex items-center gap-4 ${categoriaAttiva === cat ? 'text-primary' : 'text-black/50 dark:text-white/10'}`}
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
};

export default ProjectsPage;
