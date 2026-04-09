import { lazy, Suspense, useState } from 'react';
import Layout from '../components/layout/Layout';
import { useTheme } from '../context/ThemeContext';
import AnimatedCounter from '../components/utils/AnimatedCounter';
import SEO from '../components/utils/SEO';
import LoadingState from '../components/utils/LoadingState';
import {
  metaTextClasses,
  secondaryTextClasses,
} from '../components/utils/ColorStyles';
import ProjectsFiltersModal from '../components/projects/ProjectsFiltersModal';
import ProjectsList from '../components/projects/ProjectsList';
import ProjectsToolbar from '../components/projects/ProjectsToolbar';
import { useProjectsCatalog } from '../hooks/useProjectsCatalog';
import { useProjectsMapData } from '../hooks/useProjectsMapData';

const ProjectsMapPanel = lazy(() => import('../components/maps/ProjectsMapPanel'));

function ProjectsPage() {
  const { theme } = useTheme();
  const {
    activeCategory,
    categories,
    categoryCounts,
    filteredProjects,
    loading,
    projects,
    setActiveCategory,
  } = useProjectsCatalog();
  const [view, setView] = useState<'lista' | 'mappa'>('lista');
  const [showMobileFilters, setShowMobileFilters] = useState(false);
  const {
    activeProjectIndex,
    geocodingPhase,
    groupedMarkers,
    hasAnyCoords,
    isGeocodingDone,
    lineGeoJSON,
    selectedGroup,
    setActiveProjectIndex,
    setSelectedGroup,
    setViewState,
    viewState,
  } = useProjectsMapData({
    enabled: view === 'mappa',
    projects: filteredProjects,
  });

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
                  Grandi
                  <br />
                  Progetti
                </h1>
                <p className={`text-base md:text-xl max-w-2xl font-medium leading-relaxed ${secondaryTextClasses}`}>
                  Un'eredità di eccellenza ingegneristica dal 1945. Esplora le opere che hanno definito l'infrastruttura ferroviaria italiana.
                </p>
              </div>
              <div className="shrink-0 text-right">
                <div className="text-7xl md:text-8xl font-black text-black/5 dark:text-white/5 leading-none font-heading tabular-nums select-none">
                  <AnimatedCounter to={projects.length} duration={1200} />
                </div>
                <div className={`text-[10px] font-black uppercase tracking-[0.4em] mt-1 ${metaTextClasses}`}>
                  Opere totali
                </div>
              </div>
            </div>
          </div>
        </section>

        <main className="container mx-auto max-w-7xl px-6">
          <ProjectsToolbar
            activeCategory={activeCategory}
            categories={categories}
            categoryCounts={categoryCounts}
            onOpenMobileFilters={() => setShowMobileFilters(true)}
            onSelectCategory={setActiveCategory}
            onSelectView={setView}
            view={view}
          />

          {view === 'lista' ? (
            <ProjectsList
              activeCategory={activeCategory}
              onResetFilters={() => setActiveCategory('tutti')}
              projects={filteredProjects}
            />
          ) : (
            <Suspense
              fallback={(
                <div className="h-[70vh] bg-black/5 dark:bg-dark-surface overflow-hidden border border-black/5 dark:border-white/5 rounded-sm relative animate-pulse" />
              )}
            >
              <ProjectsMapPanel
                activeProjectIndex={activeProjectIndex}
                geocodingPhase={geocodingPhase}
                groupedMarkers={groupedMarkers}
                hasAnyCoords={hasAnyCoords}
                isGeocodingDone={isGeocodingDone}
                lineGeoJSON={lineGeoJSON}
                onViewStateChange={setViewState}
                selectedGroup={selectedGroup}
                setActiveProjectIndex={setActiveProjectIndex}
                setSelectedGroup={setSelectedGroup}
                theme={theme}
                viewState={viewState}
              />
            </Suspense>
          )}
        </main>

        <ProjectsFiltersModal
          activeCategory={activeCategory}
          categories={categories}
          categoryCounts={categoryCounts}
          isOpen={showMobileFilters}
          onClose={() => setShowMobileFilters(false)}
          onSelectCategory={setActiveCategory}
        />
      </div>
    </Layout>
  );
}

export default ProjectsPage;
