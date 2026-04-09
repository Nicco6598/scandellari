import { lazy, Suspense, useCallback, useEffect, useMemo, useState } from 'react';
import Layout from '../components/layout/Layout';
import { logger } from '../utils/logger';
import SEO from '../components/utils/SEO';
import { certifications, Certification } from '../data/certificationsData';
import {
    ArrowTopRightOnSquareIcon,
    MagnifyingGlassMinusIcon,
    MagnifyingGlassPlusIcon,
    ChevronLeftIcon,
    ChevronRightIcon,
    XMarkIcon,
    FunnelIcon,
    CheckBadgeIcon,
    ShieldCheckIcon,
    SparklesIcon,
    ArrowRightIcon,
    ArrowLeftIcon,
} from '@heroicons/react/24/outline';
import PDFThumbnail from '../components/utils/PDFThumbnail';
import AnimatedCounter from '../components/utils/AnimatedCounter';
import LoadingState from '../components/utils/LoadingState';
import { useBodyScrollLock } from '../hooks/useBodyScrollLock';

const LazyPDFViewer = lazy(() => import('./LazyPDFViewer'));

const POLITICA_ID = 'politica-aziendale';
const POLITICA_CERT: Certification = {
    id: POLITICA_ID,
    title: 'Politica Sistema Integrato',
    category: 'Qualità & Sicurezza',
    description: 'Politica del Sistema Integrato Qualità, Ambiente e Sicurezza.',
    pdfUrl: '/certificazioni/Politica_Sistema_Integrato_Qualita_Ambiente_Sicurezza.pdf',
    issuer: 'Scandellari Giacinto s.n.c.',
    expiryDate: '—',
    year: '',
    thumbnailUrl: '',
};

function CertificationsPage() {
    const [selectedCertification, setSelectedCertification] = useState<Certification | null>(null);
    const [numPages, setNumPages] = useState<number | null>(null);
    const [pageNumber, setPageNumber] = useState<number>(1);
    const [pdfScale, setPdfScale] = useState<number>(1.0);
    const [activeCategory, setActiveCategory] = useState<string>('all');
    const [loading, setLoading] = useState<boolean>(true);
    const [showMobileFilters, setShowMobileFilters] = useState(false);
    useBodyScrollLock(Boolean(selectedCertification));

    useEffect(() => {
        const timer = setTimeout(() => setLoading(false), 500);
        return () => clearTimeout(timer);
    }, []);

    // Scala 1.2 su desktop, 1.0 su mobile
    useEffect(() => {
        if (selectedCertification) {
            setPdfScale(window.innerWidth >= 768 ? 1.2 : 1.0);
        }
    }, [selectedCertification]);

    const categories = useMemo(() => ['all', ...Array.from(new Set(certifications.map(c => c.category)))], []);
    const filteredCertifications = useMemo(() =>
        activeCategory === 'all' ? certifications : certifications.filter(c => c.category === activeCategory)
        , [activeCategory]);

    const openCertification = (cert: Certification) => {
        setSelectedCertification(cert);
        setPageNumber(1);
        setNumPages(null);
    };

    const closeCertification = () => {
        setSelectedCertification(null);
        setNumPages(null);
        setPageNumber(1);
        setPdfScale(1.0);
    };

    const handlePageChange = useCallback((page: number) => {
        if (!numPages) return;
        if (page < 1 || page > numPages) return;
        setPageNumber(page);
    }, [numPages]);

    const isPolitica = selectedCertification?.id === POLITICA_ID;
    const isMultiPage = numPages !== null && numPages > 1;

    if (loading) {
        return (
            <Layout>
                <LoadingState
                    label="Certificazioni"
                    description="Stiamo preparando la documentazione certificata."
                />
            </Layout>
        );
    }

    return (
        <Layout>
            <SEO
                title="Certificazioni Qualità e Sicurezza | Scandellari"
                description="Certificazioni ISO 9001, ISO 14001 e ISO 45001. Sistema integrato di gestione qualità, ambiente e sicurezza per l'eccellenza operativa."
                keywords="certificazioni ISO, ISO 9001, ISO 14001, ISO 45001, qualità, sicurezza, ambiente, sistema integrato"
                url="/certificazioni"
            />
            <div className="bg-stone-50 dark:bg-black min-h-screen pt-32 pb-20 font-sans">

                {/* Hero */}
                <section className="container mx-auto max-w-7xl px-6 mb-32">
                    <div className="border-b border-black/10 dark:border-white/5 pb-20" data-animate="fade-up" data-animate-distance="20">
                        <div className="flex items-center gap-4 mb-12">
                            <div className="w-12 h-[1px] bg-primary shadow-[0_0_8px_rgba(37,99,235,0.5)]" />
                            <span className="text-[10px] font-black uppercase tracking-[0.4em] text-black/70 dark:text-white/60">
                                Standard & Conformità
                            </span>
                        </div>
                        <div className="flex flex-col md:flex-row md:items-end justify-between gap-12">
                            <div>
                                <h1 className="text-6xl md:text-8xl lg:text-9xl font-black text-black dark:text-white tracking-tighter leading-[0.8] font-heading mb-12">
                                    Qualità<br />Certificata
                                </h1>
                                <p className="text-base md:text-xl text-black/70 dark:text-white/60 max-w-2xl font-medium leading-relaxed">
                                    Operiamo secondo i più alti parametri di sicurezza e sostenibilità, garantiti da processi certificati e monitorati costantemente.
                                </p>
                            </div>
                            <div className="shrink-0 text-right">
                                <div className="text-7xl md:text-8xl font-black text-black/5 dark:text-white/5 leading-none font-heading tabular-nums select-none">
                                    <AnimatedCounter to={certifications.length} duration={1200} />
                                </div>
                                <div className="text-[10px] font-black uppercase tracking-[0.4em] text-black/50 dark:text-white/30 mt-1">
                                    Certificazioni
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Management System */}
                <section className="container mx-auto max-w-7xl px-6 mb-40">
                    <div className="grid lg:grid-cols-2 gap-24 items-center">
                        <div className="space-y-12">
                            <h2 className="text-3xl font-black text-black dark:text-white tracking-tight uppercase font-heading">Sistema Integrato</h2>
                            <div className="grid gap-8">
                                {[
                                    { icon: CheckBadgeIcon, title: "Gestione Qualità", desc: "Ottimizzazione dei processi per l'eccellenza operativa." },
                                    { icon: ShieldCheckIcon, title: "Sicurezza sul Lavoro", desc: "Priorità assoluta alla tutela del nostro capitale umano." },
                                    { icon: SparklesIcon, title: "Assetto Ambientale", desc: "Riduzione dell'impatto ambientale in ogni fase di cantiere." }
                                ].map((item, i) => (
                                    <div key={i} className="flex gap-6 items-start group" data-animate="fade-up" data-animate-delay={(i * 0.04).toFixed(2)}>
                                        <div className="w-12 h-12 bg-black/8 dark:bg-dark-surface border border-black/10 dark:border-white/5 flex items-center justify-center shrink-0 group-hover:bg-primary group-hover:border-primary transition-all">
                                            <item.icon className="w-6 h-6 group-hover:text-white transition-colors" />
                                        </div>
                                        <div>
                                            <h3 className="font-black text-black dark:text-white uppercase text-xs tracking-widest mb-1">{item.title}</h3>
                                            <p className="text-sm text-black/70 dark:text-white/60 font-medium">{item.desc}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Politica — non scaricabile */}
                        <div className="bg-black dark:bg-dark-surface text-white p-12 md:p-16 border border-black/10 dark:border-white/5 relative overflow-hidden">
                            <div className="absolute inset-0 bg-gradient-to-br from-transparent via-transparent to-primary/10 pointer-events-none" />
                            <div className="relative z-10">
                                <h3 className="text-2xl font-black mb-6 font-heading">Politica Aziendale</h3>
                                <p className="text-sm opacity-80 mb-10 leading-relaxed font-medium">
                                    Il nostro documento programmatico che definisce la visione strategica su qualità, ambiente e sicurezza.
                                </p>
                                <button
                                    onClick={() => openCertification(POLITICA_CERT)}
                                    className="inline-flex items-center gap-4 text-xs font-black uppercase tracking-[0.3em] group hover:text-primary transition-colors"
                                >
                                    Visualizza Politica
                                    <ArrowRightIcon className="w-4 h-4 transition-transform group-hover:translate-x-2" />
                                </button>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Grid certificazioni */}
                <section className="container mx-auto max-w-7xl px-6">
                    <div className="flex flex-col md:flex-row md:items-end justify-between gap-12 mb-20">
                        <h2 className="text-4xl font-black text-black dark:text-white tracking-tighter font-heading">Documentazione</h2>
                        <div className="flex flex-col sm:flex-row gap-4">
                            <div className="hidden sm:flex bg-black/5 dark:bg-white/5 p-1 overflow-x-auto no-scrollbar">
                                {categories.map((cat) => (
                                    <button
                                        key={cat}
                                        onClick={() => setActiveCategory(cat)}
                                        className={`px-6 py-3 text-xs font-black uppercase tracking-widest whitespace-nowrap transition-all ${activeCategory === cat ? 'bg-black dark:bg-white text-white dark:text-black' : 'text-black/70 dark:text-white/40'}` }
                                    >
                                        {cat === 'all' ? 'Tutte' : cat}
                                    </button>
                                ))}
                            </div>
                            <button
                                onClick={() => setShowMobileFilters(true)}
                                className="sm:hidden flex items-center justify-center gap-3 px-8 py-4 bg-black dark:bg-white text-white dark:text-black text-[10px] font-black uppercase tracking-widest"
                            >
                                <FunnelIcon className="w-4 h-4" />
                                Filtri
                            </button>
                        </div>
                    </div>

                    <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
                        {filteredCertifications.map((cert, index) => (
                            <div
                                key={cert.id}
                                className="bg-white dark:bg-dark-surface border border-black/10 dark:border-white/5 flex flex-col h-full hover:border-primary/30 transition-all duration-500 group overflow-hidden relative"
                                data-animate="fade-up"
                                data-animate-delay={(index * 0.03).toFixed(2)}
                            >
                                <div
                                    className="relative overflow-hidden cursor-pointer aspect-[3/2] bg-black/8 dark:bg-black/40 border-b border-black/10 dark:border-white/5"
                                    onClick={() => openCertification(cert)}
                                >
                                    <div className="absolute inset-0 transition-transform duration-700 group-hover:scale-105 origin-top">
                                        <PDFThumbnail pdfUrl={cert.pdfUrl} />
                                    </div>
                                    <div className="absolute inset-0 bg-primary/0 group-hover:bg-primary/10 transition-all duration-500 flex items-center justify-center z-10">
                                        <div className="opacity-0 group-hover:opacity-100 transition-all duration-300 translate-y-2 group-hover:translate-y-0 bg-black/80 dark:bg-white/90 text-white dark:text-black px-5 py-3 text-[10px] font-black uppercase tracking-[0.3em] flex items-center gap-2">
                                            <ArrowTopRightOnSquareIcon className="w-3.5 h-3.5" />
                                            Apri PDF
                                        </div>
                                    </div>
                                </div>

                                <div className="p-8 flex flex-col flex-grow relative">
                                    <span className="absolute top-4 right-6 text-6xl font-black text-black/[0.04] dark:text-white/[0.04] leading-none select-none pointer-events-none font-heading tabular-nums">
                                        {String(index + 1).padStart(2, '0')}
                                    </span>
                                    <div className="text-[9px] font-black uppercase tracking-[0.35em] text-primary mb-3">{cert.category}</div>
                                    <h3 className="text-xl font-black text-black dark:text-white mb-3 tracking-tighter leading-tight group-hover:text-primary transition-colors duration-300">{cert.title}</h3>
                                    <p className="text-xs text-black/60 dark:text-white/40 font-medium mb-5 leading-relaxed line-clamp-2">{cert.description}</p>
                                    <div className="mt-auto pt-6 border-t border-black/10 dark:border-white/5 space-y-4">
                                        <div className="flex items-start justify-between gap-3">
                                            <div>
                                                <div className="text-[9px] font-black uppercase tracking-[0.3em] text-black/50 dark:text-white/30 mb-0.5">Ente</div>
                                                <div className="text-xs font-bold text-black/70 dark:text-white/60 leading-tight">{cert.issuer}</div>
                                            </div>
                                            <div className="text-right shrink-0">
                                                <div className="text-[9px] font-black uppercase tracking-[0.3em] text-black/30 dark:text-white/30 mb-0.5">Scadenza</div>
                                                <div className="text-xs font-black text-black dark:text-white">{cert.expiryDate}</div>
                                            </div>
                                        </div>
                                        <button
                                            onClick={() => openCertification(cert)}
                                            className="inline-flex items-center gap-4 text-[10px] font-black uppercase tracking-[0.3em] group/btn border-b-2 border-black dark:border-white hover:border-primary hover:text-primary pb-2 transition-all"
                                        >
                                            Vedi Certificato
                                            <ArrowTopRightOnSquareIcon className="w-3.5 h-3.5 transition-transform group-hover/btn:translate-x-0.5 group-hover/btn:-translate-y-0.5" />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </section>

                {/* PDF Modal */}
                {selectedCertification && (
                    <div className="fixed inset-0 z-[100] bg-white dark:bg-black flex flex-col">
                        {/* Header */}
                        <div className="flex justify-between items-center p-6 md:p-8 border-b border-black/10 dark:border-white/5 shrink-0">
                            <div className="flex-1 min-w-0 mr-4">
                                <div className="text-[10px] font-black uppercase tracking-[0.4em] text-black/60 dark:text-white/40 mb-2">
                                    {selectedCertification.category}
                                </div>
                                <h3 className="text-lg md:text-xl font-black uppercase tracking-tight text-black dark:text-white truncate">
                                    {selectedCertification.title}
                                </h3>
                            </div>
                            <div className="flex items-center gap-3">
                                {isPolitica && (
                                    <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 border border-black/10 dark:border-white/10">
                                        <ShieldCheckIcon className="w-3.5 h-3.5 text-primary" />
                                        <span className="text-[9px] font-black uppercase tracking-widest text-black/60 dark:text-white/40">
                                            Solo visualizzazione
                                        </span>
                                    </div>
                                )}
                                {/* Hint sfoglia se multi pagina */}
                                {isMultiPage && (
                                    <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 border border-black/10 dark:border-white/10">
                                        <ArrowLeftIcon className="w-3 h-3 text-black/50 dark:text-white/30" />
                                        <span className="text-[9px] font-black uppercase tracking-widest text-black/50 dark:text-white/30">
                                            Scorri o trascina
                                        </span>
                                        <ArrowRightIcon className="w-3 h-3 text-black/50 dark:text-white/30" />
                                    </div>
                                )}
                                <button
                                    onClick={closeCertification}
                                    className="p-2 hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
                                    aria-label="Chiudi"
                                >
                                    <XMarkIcon className="w-8 h-8" />
                                </button>
                            </div>
                        </div>

                        {/* PDF Viewer */}
                        <div className="flex-1 overflow-auto bg-stone-50 dark:bg-zinc-950 flex items-center justify-center p-4 md:p-8 min-h-0">
                            <Suspense fallback={
                                <div className="flex items-center justify-center w-full h-full">
                                    <div className="w-8 h-8 border-2 border-black dark:border-white border-t-transparent animate-spin" />
                                </div>
                            }>
                                <LazyPDFViewer
                                    pdfUrl={selectedCertification.pdfUrl}
                                    pageNumber={pageNumber}
                                    scale={pdfScale}
                                    onLoadSuccess={({ numPages: n }: { numPages: number }) => setNumPages(n)}
                                    onLoadError={(err: unknown) => logger.error("PDF load error", err)}
                                    onPageChange={handlePageChange}
                                    numPages={numPages}
                                />
                            </Suspense>
                        </div>

                        {/* Footer controls */}
                        <div className="p-6 md:p-8 border-t border-black/10 dark:border-white/5 bg-stone-50 dark:bg-black shrink-0">
                            <div className="flex flex-col sm:flex-row justify-between items-center gap-6">
                                {/* Navigazione pagine */}
                                <div className="flex items-center gap-4">
                                    <button
                                        disabled={pageNumber <= 1}
                                        onClick={() => handlePageChange(pageNumber - 1)}
                                        className="p-3 disabled:opacity-20 disabled:cursor-not-allowed hover:bg-black/5 dark:hover:bg-white/5 transition-colors border border-black/10 dark:border-white/10"
                                        aria-label="Pagina precedente"
                                    >
                                        <ChevronLeftIcon className="w-5 h-5" />
                                    </button>
                                    <span className="text-xs font-black uppercase tracking-widest min-w-[100px] text-center tabular-nums">
                                        Pag. {pageNumber} / {numPages || '...'}
                                    </span>
                                    <button
                                        disabled={numPages ? pageNumber >= numPages : true}
                                        onClick={() => handlePageChange(pageNumber + 1)}
                                        className="p-3 disabled:opacity-20 disabled:cursor-not-allowed hover:bg-black/5 dark:hover:bg-white/5 transition-colors border border-black/10 dark:border-white/10"
                                        aria-label="Pagina successiva"
                                    >
                                        <ChevronRightIcon className="w-5 h-5" />
                                    </button>
                                </div>

                                {/* Zoom + download condizionale */}
                                <div className="flex items-center gap-4">
                                    <button
                                        onClick={() => setPdfScale(s => Math.max(0.5, parseFloat((s - 0.2).toFixed(1))))}
                                        className="p-3 hover:bg-black/5 dark:hover:bg-white/5 transition-colors border border-black/10 dark:border-white/10"
                                        aria-label="Riduci zoom"
                                    >
                                        <MagnifyingGlassMinusIcon className="w-5 h-5" />
                                    </button>
                                    <span className="text-xs font-black uppercase tracking-widest min-w-[60px] text-center tabular-nums">
                                        {Math.round(pdfScale * 100)}%
                                    </span>
                                    <button
                                        onClick={() => setPdfScale(s => Math.min(3, parseFloat((s + 0.2).toFixed(1))))}
                                        className="p-3 hover:bg-black/5 dark:hover:bg-white/5 transition-colors border border-black/10 dark:border-white/10"
                                        aria-label="Aumenta zoom"
                                    >
                                        <MagnifyingGlassPlusIcon className="w-5 h-5" />
                                    </button>

                                    {!isPolitica && (
                                        <>
                                            <div className="w-px h-8 bg-black/20 dark:bg-white/10 mx-2" />
                                            <a
                                                href={selectedCertification.pdfUrl}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="p-3 bg-black dark:bg-white text-white dark:text-black hover:bg-primary dark:hover:bg-primary transition-colors border border-black dark:border-white"
                                                aria-label="Apri in una nuova scheda"
                                            >
                                                <ArrowTopRightOnSquareIcon className="w-5 h-5" />
                                            </a>
                                        </>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Mobile Filter Modal */}
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
                    <div className="flex-grow flex flex-col gap-8">
                        <button
                            onClick={() => { setActiveCategory('all'); setShowMobileFilters(false); }}
                            className={`text-xl font-black uppercase tracking-wider text-left pb-6 border-b border-black/10 dark:border-white/10 ${activeCategory === 'all' ? 'text-accent' : 'text-black/50 dark:text-white/20'}`}
                        >
                            Tutte le Certificazioni
                        </button>
                        {categories.filter(cat => cat !== 'all').map((cat) => (
                            <button
                                key={cat}
                                onClick={() => { setActiveCategory(cat); setShowMobileFilters(false); }}
                                className={`text-3xl font-black tracking-tighter text-left ${activeCategory === cat ? 'text-primary' : 'text-black/50 dark:text-white/10'}`}
                            >
                                {cat.charAt(0).toUpperCase() + cat.slice(1)}
                            </button>
                        ))}
                    </div>
                </div>
            </div>
        </Layout>
    );
}

export default CertificationsPage;
