import React, { useMemo, useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { logger } from '../../utils/logger';
import AdminLayout from './AdminLayout';
import { progettiService } from '../../supabase/services';
import ConfirmDialog from '../../components/admin/ConfirmDialog';
import { CoordinateInfo, ProgettoData } from '../../types/supabaseTypes';
import { geocodeLocalita } from '../../utils/projectLocationUtils';

type BackfillProgress = {
  current: number;
  total: number;
  title: string;
};

const sanitizeCoordinates = (value?: CoordinateInfo[] | null): CoordinateInfo[] => {
  if (!Array.isArray(value)) return [];

  return value.filter((item): item is CoordinateInfo => (
    typeof item?.lat === 'number' && typeof item?.lng === 'number'
  ));
};

const getPersistedProjectLocation = (project: ProgettoData) => {
  const points = sanitizeCoordinates(project.coordinate_punti ?? project.coordinatePunti);
  const route = sanitizeCoordinates(project.coordinate_percorso ?? project.coordinatePercorso);

  return {
    points,
    route,
  };
};

const needsCoordinateBackfill = (project: ProgettoData) => {
  if (!project.id || !project.localita?.trim()) return false;

  const { points, route } = getPersistedProjectLocation(project);
  return points.length === 0 || route.length === 0;
};

const ProgettiPage: React.FC = () => {
  const [progetti, setProgetti] = useState<ProgettoData[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [isBackfillingCoordinates, setIsBackfillingCoordinates] = useState(false);
  const [backfillProgress, setBackfillProgress] = useState<BackfillProgress | null>(null);
  const [backfillSummary, setBackfillSummary] = useState<string | null>(null);
  const [backfillError, setBackfillError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProgetti = async () => {
      try {
        const data = await progettiService.getAllProjects();
        setProgetti(data);
      } catch (error) {
        logger.error('Error fetching projects', error);
      } finally {
        setLoading(false);
      }
    };

    fetchProgetti();
  }, []);

  const categories = useMemo(() => Array.from(new Set(progetti.map((project) => project.categoria))), [progetti]);
  const normalizedSearchTerm = searchTerm.trim().toLowerCase();
  const filteredProjects = useMemo(() => {
    return progetti.filter((project) => {
      const matchesSearch =
        normalizedSearchTerm === '' ||
        project.titolo.toLowerCase().includes(normalizedSearchTerm) ||
        project.localita?.toLowerCase().includes(normalizedSearchTerm) ||
        project.categoria.toLowerCase().includes(normalizedSearchTerm);

      const matchesCategory = activeCategory === null || project.categoria === activeCategory;
      return matchesSearch && matchesCategory;
    });
  }, [activeCategory, normalizedSearchTerm, progetti]);

  const missingProjectImagesCount = useMemo(() => {
    return progetti.filter((p) => !p.immagini || p.immagini.length === 0).length;
  }, [progetti]);

  const projectsNeedingCoordinateBackfill = useMemo(() => {
    return progetti.filter(needsCoordinateBackfill);
  }, [progetti]);

  const missingProjectCoordinatesCount = projectsNeedingCoordinateBackfill.length;

  const handleDeleteProgetto = async (id: string) => {
    if (!id) return;

    try {
      await progettiService.deleteProject(id);
      setProgetti((currentProjects) => currentProjects.filter((project) => project.id !== id));
      setConfirmDelete(null);
    } catch (error) {
      logger.error("Error deleting project", error);
    }
  };

  const handleCoordinateBackfill = async () => {
    if (projectsNeedingCoordinateBackfill.length === 0) {
      setBackfillSummary('Tutti i progetti con località hanno già coordinate e percorso persistiti.');
      setBackfillError(null);
      return;
    }

    setIsBackfillingCoordinates(true);
    setBackfillError(null);
    setBackfillSummary(null);

    let updatedProjects = 0;
    const failures: string[] = [];

    try {
      for (let index = 0; index < projectsNeedingCoordinateBackfill.length; index += 1) {
        const project = projectsNeedingCoordinateBackfill[index];
        setBackfillProgress({
          current: index + 1,
          total: projectsNeedingCoordinateBackfill.length,
          title: project.titolo,
        });

        try {
          const coordinates = await geocodeLocalita(project.localita);
          if (coordinates.points.length === 0) {
            failures.push(`${project.titolo}: nessuna coordinata trovata`);
            continue;
          }

          const route = coordinates.route?.length ? coordinates.route : coordinates.points;
          const updatedProject = await progettiService.updateProjectLocationData(project.id!, {
            coordinate_punti: coordinates.points,
            coordinate_percorso: route,
          });

          updatedProjects += 1;

          setProgetti((currentProjects) => currentProjects.map((currentProject) => (
            currentProject.id === updatedProject.id
              ? {
                  ...currentProject,
                  coordinate_punti: updatedProject.coordinate_punti ?? coordinates.points,
                  coordinate_percorso: updatedProject.coordinate_percorso ?? route,
                  updated_at: updatedProject.updated_at,
                }
              : currentProject
          )));

          await new Promise((resolve) => setTimeout(resolve, 350));
        } catch (error) {
          logger.error(`Errore backfill coordinate per progetto ${project.titolo}`, error);
          failures.push(`${project.titolo}: errore aggiornamento`);
        }
      }

      const failedCount = failures.length;
      const summaryParts = [`Aggiornati ${updatedProjects} progetti`];
      if (failedCount > 0) {
        summaryParts.push(`${failedCount} non completati`);
      }

      setBackfillSummary(summaryParts.join(' - '));
      setBackfillError(
        failedCount > 0
          ? `Backfill parziale. Verifica: ${failures.slice(0, 3).join(' | ')}${failedCount > 3 ? ' | ...' : ''}`
          : null
      );
    } finally {
      setIsBackfillingCoordinates(false);
      setBackfillProgress(null);
    }
  };

  return (
    <AdminLayout title="Gestione Progetti">
      <div className="px-4 sm:px-6 lg:px-8 py-8 bg-stone-50 dark:bg-black min-h-screen">
        {/* Header */}
        <div className="flex items-center justify-between mb-8 pb-6 border-b border-black/5 dark:border-white/5">
          <h1 className="text-2xl font-black uppercase tracking-tight text-black dark:text-white">Gestione Progetti</h1>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={handleCoordinateBackfill}
              disabled={isBackfillingCoordinates || missingProjectCoordinatesCount === 0}
              className="px-4 py-3 border border-black/10 dark:border-white/10 text-xs font-black uppercase tracking-widest text-black dark:text-white hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black transition-all disabled:opacity-40"
            >
              {isBackfillingCoordinates ? 'Backfill coordinate...' : 'Backfill coordinate'}
            </button>
            <Link
              to="/admin/progetti/nuovo"
              className="px-6 py-3 bg-primary text-white hover:bg-white hover:text-primary dark:bg-primary-700 dark:text-black dark:hover:bg-black/80 dark:hover:text-primary text-xs font-black uppercase tracking-widest transition-all border border-primary dark:border-primary-700"
            >
              + Nuovo
            </Link>
          </div>
        </div>

        {/* Filters */}
        <div className="border border-black/5 dark:border-white/5 p-4 mb-6">
          <div className="flex flex-wrap items-center gap-3 mb-4">
            <div className="inline-flex items-center px-3 py-2 border border-black/10 dark:border-white/10 bg-white dark:bg-black text-[10px] font-black uppercase tracking-widest text-black/70 dark:text-white/70">
              Totali: {progetti.length}
            </div>
            <div className="inline-flex items-center px-3 py-2 border border-black/10 dark:border-white/10 bg-white dark:bg-black text-[10px] font-black uppercase tracking-widest text-black/70 dark:text-white/70">
              Mostrati: {filteredProjects.length}
            </div>
            <div className="inline-flex items-center px-3 py-2 border border-sky-600/25 bg-sky-500/10 text-sky-900 dark:text-sky-200 text-[10px] font-black uppercase tracking-widest">
              {missingProjectCoordinatesCount} da geocodare
            </div>
            {missingProjectImagesCount > 0 && (
              <div className="inline-flex items-center px-3 py-2 border border-amber-600/25 bg-amber-500/10 text-amber-900 dark:text-amber-200 text-[10px] font-black uppercase tracking-widest">
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v4m0 4h.01M10.29 3.86l-8.02 14A1.5 1.5 0 003.57 20h16.86a1.5 1.5 0 001.3-2.14l-8.02-14a1.5 1.5 0 00-2.6 0z" />
                </svg>
                {missingProjectImagesCount} senza immagini
              </div>
            )}
          </div>
          {(backfillProgress || backfillSummary || backfillError) && (
            <div className="mb-4 space-y-3">
              {backfillProgress && (
                <div className="border border-sky-600/20 bg-sky-500/10 p-4">
                  <div className="flex items-center justify-between gap-4 text-[10px] font-black uppercase tracking-widest text-sky-900 dark:text-sky-200">
                    <span>Backfill in corso</span>
                    <span>{backfillProgress.current} / {backfillProgress.total}</span>
                  </div>
                  <div className="mt-3 h-2 bg-sky-900/10 dark:bg-sky-100/10 overflow-hidden">
                    <div
                      className="h-full bg-sky-600 transition-all"
                      style={{ width: `${(backfillProgress.current / backfillProgress.total) * 100}%` }}
                    />
                  </div>
                  <div className="mt-3 text-xs text-sky-900 dark:text-sky-100">
                    {backfillProgress.title}
                  </div>
                </div>
              )}
              {backfillSummary && (
                <div className="border border-emerald-600/20 bg-emerald-500/10 p-4 text-[11px] font-bold tracking-wide text-emerald-900 dark:text-emerald-200">
                  {backfillSummary}
                </div>
              )}
              {backfillError && (
                <div className="border border-orange-600/20 bg-orange-500/10 p-4 text-[11px] font-bold tracking-wide text-orange-900 dark:text-orange-200">
                  {backfillError}
                </div>
              )}
            </div>
          )}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="md:col-span-2">
              <input
                type="text"
                placeholder="Cerca progetti..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-4 py-3 bg-transparent border border-black/10 dark:border-white/10 focus:border-primary transition-all focus:outline-none text-black dark:text-white placeholder-black/30 dark:placeholder-white/30 text-sm"
              />
            </div>
            {categories.length > 0 && (
              <select
                value={activeCategory || ''}
                onChange={(e) => setActiveCategory(e.target.value || null)}
                className="w-full px-4 py-3 bg-white dark:bg-black border border-black/10 dark:border-white/10 focus:border-primary transition-all focus:outline-none text-black dark:text-white text-sm"
              >
                <option value="" className="bg-white text-black dark:bg-black dark:text-white">Tutte le categorie</option>
                {categories.map(category => (
                  <option key={category} value={category} className="bg-white text-black dark:bg-black dark:text-white">{category}</option>
                ))}
              </select>
            )}
          </div>
        </div>

        {/* Table */}
        {loading ? (
          <div className="border border-black/5 dark:border-white/5 p-12 text-center">
            <div className="text-sm font-medium text-black/60 dark:text-white/60">Caricamento...</div>
          </div>
        ) : filteredProjects.length === 0 ? (
          <div className="border border-black/5 dark:border-white/5 p-12 text-center">
            <div className="text-sm font-medium text-black/60 dark:text-white/60">Nessun progetto trovato</div>
          </div>
        ) : (
          <div className="border border-black/5 dark:border-white/5">
            {/* Desktop Table */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full">
                <thead className="border-b border-black/5 dark:border-white/5">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-black uppercase tracking-widest text-black dark:text-white">Titolo</th>
                    <th className="px-6 py-4 text-left text-xs font-black uppercase tracking-widest text-black dark:text-white">Categoria</th>
                    <th className="px-6 py-4 text-left text-xs font-black uppercase tracking-widest text-black dark:text-white">Località</th>
                    <th className="px-6 py-4 text-center text-xs font-black uppercase tracking-widest text-black dark:text-white">Anno</th>
                    <th className="px-6 py-4 text-right text-xs font-black uppercase tracking-widest text-black dark:text-white">Azioni</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredProjects.map((project) => (
                    (() => {
                      const hasImages = !!project.immagini && project.immagini.length > 0;
                      const { points, route } = getPersistedProjectLocation(project);
                      const hasPersistedLocation = points.length > 0 && route.length > 0;
                      return (
                    <tr key={project.id} className="border-b border-black/5 dark:border-white/5 hover:bg-black/5 dark:hover:bg-white/5 transition-colors group">
                      <td className="px-6 py-4 text-sm font-medium text-black dark:text-white">
                        <div className="flex items-center gap-2">
                          <span className="truncate">{project.titolo}</span>
                          {!hasImages && (
                            <span className="inline-flex items-center px-2 py-0.5 border border-amber-600/25 bg-amber-500/10 text-amber-900 dark:text-amber-200 text-[10px] font-black uppercase tracking-widest">
                              <svg className="w-3.5 h-3.5 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v4m0 4h.01M10.29 3.86l-8.02 14A1.5 1.5 0 003.57 20h16.86a1.5 1.5 0 001.3-2.14l-8.02-14a1.5 1.5 0 00-2.6 0z" />
                              </svg>
                              Senza immagini
                            </span>
                          )}
                          {!hasPersistedLocation && project.localita?.trim() && (
                            <span className="inline-flex items-center px-2 py-0.5 border border-sky-600/25 bg-sky-500/10 text-sky-900 dark:text-sky-200 text-[10px] font-black uppercase tracking-widest">
                              Coordinate mancanti
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="px-3 py-1 text-xs font-black uppercase tracking-wider bg-primary/10 text-primary border border-primary/20">
                          {project.categoria}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-black/70 dark:text-white/70">{project.localita}</td>
                      <td className="px-6 py-4 text-sm text-black/70 dark:text-white/70 text-center">{project.anno}</td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Link
                            to={`/admin/progetti/modifica/${project.id}`}
                            className="p-2 text-primary hover:bg-primary hover:text-white transition-all border border-primary"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                            </svg>
                          </Link>
                          <button
                            onClick={() => project.id && setConfirmDelete(project.id)}
                            className="p-2 text-red-600 hover:bg-red-600 hover:text-white transition-all border border-red-600"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </button>
                        </div>
                      </td>
                    </tr>
                      );
                    })()
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile Cards */}
            <div className="md:hidden divide-y divide-black/5 dark:divide-white/5">
              {filteredProjects.map((project) => (
                (() => {
                  const hasImages = !!project.immagini && project.immagini.length > 0;
                  const { points, route } = getPersistedProjectLocation(project);
                  const hasPersistedLocation = points.length > 0 && route.length > 0;
                  return (
                <div key={project.id} className="p-4">
                  <div className="flex justify-between items-start mb-3">
                    <div className="min-w-0">
                      <h3 className="text-sm font-black uppercase text-black dark:text-white truncate">{project.titolo}</h3>
                      {!hasImages && (
                        <div className="mt-2 inline-flex items-center px-2 py-1 border border-amber-600/25 bg-amber-500/10 text-amber-900 dark:text-amber-200 text-[10px] font-black uppercase tracking-widest">
                          <svg className="w-3.5 h-3.5 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v4m0 4h.01M10.29 3.86l-8.02 14A1.5 1.5 0 003.57 20h16.86a1.5 1.5 0 001.3-2.14l-8.02-14a1.5 1.5 0 00-2.6 0z" />
                          </svg>
                          Senza immagini
                        </div>
                      )}
                      {!hasPersistedLocation && project.localita?.trim() && (
                        <div className="mt-2 inline-flex items-center px-2 py-1 border border-sky-600/25 bg-sky-500/10 text-sky-900 dark:text-sky-200 text-[10px] font-black uppercase tracking-widest">
                          Coordinate mancanti
                        </div>
                      )}
                    </div>
                    <div className="flex gap-2">
                      <Link
                        to={`/admin/progetti/modifica/${project.id}`}
                        className="p-2 text-primary hover:bg-primary hover:text-white transition-all border border-primary"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                      </Link>
                      <button
                        onClick={() => project.id && setConfirmDelete(project.id)}
                        className="p-2 text-red-600 hover:bg-red-600 hover:text-white transition-all border border-red-600"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                  </div>
                  <div className="space-y-2 text-xs">
                    <div className="flex items-center gap-2">
                      <span className="font-black uppercase tracking-wider text-black/60 dark:text-white/60">Categoria:</span>
                      <span className="px-2 py-1 text-xs font-black uppercase bg-primary/10 text-primary border border-primary/20">{project.categoria}</span>
                    </div>
                    {project.localita && (
                      <div className="flex items-center gap-2">
                        <span className="font-black uppercase tracking-wider text-black/60 dark:text-white/60">Località:</span>
                        <span className="text-black/70 dark:text-white/70">{project.localita}</span>
                      </div>
                    )}
                    {project.anno && (
                      <div className="flex items-center gap-2">
                        <span className="font-black uppercase tracking-wider text-black/60 dark:text-white/60">Anno:</span>
                        <span className="text-black/70 dark:text-white/70">{project.anno}</span>
                      </div>
                    )}
                  </div>
                </div>
                  );
                })()
              ))}
            </div>
          </div>
        )}

        {/* Delete Confirmation */}
        <ConfirmDialog
          isOpen={confirmDelete !== null}
          title="Conferma eliminazione"
          message="Sei sicuro di voler eliminare questo progetto? Questa azione non può essere annullata."
          confirmLabel="Elimina"
          cancelLabel="Annulla"
          confirmColor="red"
          icon="delete"
          onConfirm={() => confirmDelete && handleDeleteProgetto(confirmDelete)}
          onCancel={() => setConfirmDelete(null)}
        />
      </div>
    </AdminLayout>
  );
};

export default ProgettiPage;
