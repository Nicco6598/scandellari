// src/pages/admin/DashboardPage.tsx
import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { logger } from '../../utils/logger';
import AdminLayout from './AdminLayout';
import { progettiService, competenzeService, offerteService } from '../../supabase/services';
import { activityService } from '../../supabase/activityService';
import { CompetenzaData, OffertaLavoroData, ProgettoData, RecentActivity } from '../../types/supabaseTypes';
import { formatDistance } from 'date-fns';
import { it } from 'date-fns/locale';
import { useAuth } from '../../context/AuthContext';

const getTimestampValue = (value?: string | Date) => {
  if (!value) return Number.NEGATIVE_INFINITY;
  const date = typeof value === 'string' ? new Date(value) : value;
  return Number.isNaN(date.getTime()) ? Number.NEGATIVE_INFINITY : date.getTime();
};

const getMostRecentItem = <T extends { created_at?: string | Date; updated_at?: string | Date }>(items: T[]) => {
  return items.reduce<T | undefined>((latest, current) => {
    if (!latest) return current;
    const latestValue = getTimestampValue(latest.updated_at || latest.created_at);
    const currentValue = getTimestampValue(current.updated_at || current.created_at);
    return currentValue > latestValue ? current : latest;
  }, undefined);
};

const countBy = <T,>(items: T[], getKey: (item: T) => string) => {
  const counts = new Map<string, number>();
  for (const item of items) {
    const key = getKey(item);
    counts.set(key, (counts.get(key) ?? 0) + 1);
  }
  return counts;
};

// --- Icon Components ---
const ProjectIcon = () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" /></svg>;
const SkillIcon = () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" /></svg>;
const OfferIcon = () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>;
const AddIcon = () => <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" /></svg>;
const ArrowRightIcon = () => <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" /></svg>;
const TimeIcon = () => <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>;
const UserIcon = () => <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>;
const RefreshIcon = () => <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>;

const DashboardPage: React.FC = () => {
  const { currentUser } = useAuth();
  const [progetti, setProgetti] = useState<ProgettoData[]>([]);
  const [competenze, setCompetenze] = useState<CompetenzaData[]>([]);
  const [offerte, setOfferte] = useState<OffertaLavoroData[]>([]);
  const [recentActivities, setRecentActivities] = useState<RecentActivity[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [activityFilter, setActivityFilter] = useState<'all' | 'content' | 'access'>('all');

  const loadDashboardData = async (reason: 'initial' | 'refresh') => {
    if (reason === 'initial') setLoading(true);
    if (reason === 'refresh') setRefreshing(true);

    try {
      const [progettiData, competenzeData, offerteData, activities] = await Promise.all([
        progettiService.getAllProjects(),
        competenzeService.getAllCompetenze(),
        offerteService.getAllOfferte(),
        activityService.getRecentActivities(15)
      ]);
      setProgetti(progettiData);
      setCompetenze(competenzeData);
      setOfferte(offerteData);
      setRecentActivities(activities);
    } catch (error) {
      logger.error('Error fetching dashboard data', error);
    } finally {
      if (reason === 'initial') setLoading(false);
      if (reason === 'refresh') setRefreshing(false);
    }
  };

  useEffect(() => {
    void loadDashboardData('initial');
  }, []);

  const formatRelativeTime = (timestamp: string): string => {
    try {
      return formatDistance(new Date(timestamp), new Date(), { addSuffix: true, locale: it });
    } catch (error) { return 'Data sconosciuta'; }
  };

  const formatRelativeDate = (dateValue?: string | Date): string => {
    if (!dateValue) return 'N/D';
    try {
      const date = typeof dateValue === 'string' ? new Date(dateValue) : dateValue;
      if (Number.isNaN(date.getTime())) return 'N/D';
      return formatDistance(date, new Date(), { addSuffix: true, locale: it });
    } catch {
      return 'N/D';
    }
  };

  const latestProgetto = useMemo(() => {
    return getMostRecentItem(progetti);
  }, [progetti]);

  const latestCompetenza = useMemo(() => {
    return getMostRecentItem(competenze);
  }, [competenze]);

  const latestOfferta = useMemo(() => {
    return getMostRecentItem(offerte);
  }, [offerte]);

  const missingProjectImagesCount = useMemo(() => {
    return progetti.filter((p) => !p.immagini || p.immagini.length === 0).length;
  }, [progetti]);

  const missingCompetenzaImagesCount = useMemo(() => {
    return competenze.filter((c) => (!c.immagini || c.immagini.length === 0) && !c.immagine?.url).length;
  }, [competenze]);

  const topProjectCategories = useMemo(() => {
    const counts = countBy(progetti, (project) => project.categoria);
    return [...counts.entries()].sort((a, b) => b[1] - a[1]).slice(0, 3);
  }, [progetti]);

  const topSkillCategories = useMemo(() => {
    const counts = countBy(competenze, (skill) => skill.categoria);
    return [...counts.entries()].sort((a, b) => b[1] - a[1]).slice(0, 3);
  }, [competenze]);

  const offersByType = useMemo(() => {
    const counts = countBy(offerte, (offer) => offer.tipo);
    return [...counts.entries()].sort((a, b) => b[1] - a[1]);
  }, [offerte]);

  const filteredActivities = useMemo(() => {
    if (activityFilter === 'all') return recentActivities;
    if (activityFilter === 'access') return recentActivities.filter((a) => a.type === 'login' || a.type === 'logout');
    return recentActivities.filter((a) => a.type === 'create' || a.type === 'update' || a.type === 'delete');
  }, [activityFilter, recentActivities]);

  const getActivityIcon = (type: RecentActivity['type'] | string) => {
    const baseClasses = `w-10 h-10 flex items-center justify-center mr-3 flex-shrink-0`;
    const iconClasses = "w-5 h-5 text-white";

    switch (type) {
      case 'create':
        return (
          <div className={`${baseClasses} bg-green-600`}>
            <svg className={iconClasses} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
          </div>
        );
      case 'update':
        return (
          <div className={`${baseClasses} bg-blue-600`}>
            <svg className={iconClasses} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
          </div>
        );
      case 'delete':
        return (
          <div className={`${baseClasses} bg-red-600`}>
            <svg className={iconClasses} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </div>
        );
      case 'login':
        return (
          <div className={`${baseClasses} bg-purple-600`}>
            <svg className={iconClasses} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
            </svg>
          </div>
        );
      case 'logout':
        return (
          <div className={`${baseClasses} bg-amber-600`}>
            <svg className={iconClasses} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
          </div>
        );
      default:
        return (
          <div className={`${baseClasses} bg-gray-600`}>
            <svg className={iconClasses} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
        );
    }
  };

  const getEntityLink = (activity: RecentActivity): string => {
    if (!activity.entityType || !activity.entityId || activity.type === 'login' || activity.type === 'logout') return '#';
    switch (activity.entityType) {
      case 'progetto': return `/admin/progetti/modifica/${activity.entityId}`;
      case 'competenza': return `/admin/competenze/modifica/${activity.entityId}`;
      case 'offerta': return `/admin/offerte-lavoro/modifica/${activity.entityId}`;
      default: return '#';
    }
  };

  return (
    <AdminLayout title="Dashboard">
      <div className="px-4 sm:px-6 lg:px-8 py-8 bg-stone-50 dark:bg-black min-h-screen">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-8 pb-6 border-b border-black/5 dark:border-white/5">
          <h1 className="text-2xl font-black uppercase tracking-tight text-black dark:text-white mb-2 sm:mb-0">
            Dashboard
          </h1>
          {currentUser && (
            <div className="text-xs font-black uppercase tracking-widest px-4 py-2 border border-black/5 dark:border-white/5">
              <span className="bg-gradient-to-r from-orange-700 via-amber-600 to-fuchsia-700 dark:from-orange-400 dark:via-amber-300 dark:to-fuchsia-400 text-transparent bg-clip-text animate-hue">
                {currentUser.email?.split('@')[0]}
              </span>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          <div className="xl:col-span-2 space-y-6">
            {loading ? (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="border border-black/5 dark:border-white/5 p-6 animate-pulse h-44"></div>
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="border border-black/5 dark:border-white/5 p-6 transition-colors hover:border-primary/20 dark:hover:border-primary/20 transition-transform hover:-translate-y-0.5">
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center">
                      <div className="w-12 h-12 bg-primary flex items-center justify-center text-white mr-3">
                        <ProjectIcon />
                      </div>
                      <h3 className="text-xs font-black uppercase tracking-widest text-black dark:text-white">Progetti</h3>
                    </div>
                  </div>
                  <p className="text-4xl font-black text-black dark:text-white mb-3">{progetti.length}</p>
                  <div className="space-y-3">
                    {latestProgetto?.id && (
                      <div className="border border-black/5 dark:border-white/5 p-3">
                        <div className="flex items-center justify-between gap-3 mb-2">
                          <span className="text-[10px] font-black uppercase tracking-widest text-black/60 dark:text-white/60">
                            Ultima modifica
                          </span>
                          <span className="text-[10px] font-black uppercase tracking-widest text-black/70 dark:text-white/70 px-2 py-1 border border-black/10 dark:border-white/10 bg-black/5 dark:bg-white/5">
                            {formatRelativeDate(latestProgetto.updated_at || latestProgetto.created_at)}
                          </span>
                        </div>
                        <Link
                          to={`/admin/progetti/modifica/${latestProgetto.id}`}
                          className="block text-sm font-black tracking-tight text-black dark:text-white hover:text-primary dark:hover:text-primary truncate"
                        >
                          {latestProgetto.titolo}
                        </Link>
                      </div>
                    )}

                    {missingProjectImagesCount > 0 && (
                      <div className="inline-flex items-center px-3 py-2 border border-amber-600/25 bg-amber-500/10 text-amber-900 dark:text-amber-200 text-[10px] font-black uppercase tracking-widest">
                        {missingProjectImagesCount} senza immagini
                      </div>
                    )}

                    <div className="grid grid-cols-2 gap-2 pt-4 mt-4 border-t border-black/5 dark:border-white/5">
                      <Link
                        to="/admin/progetti/nuovo"
                        className="flex items-center justify-between px-3 py-2 bg-primary text-white hover:bg-white hover:text-primary dark:bg-primary-700 dark:text-black dark:hover:bg-black/80 dark:hover:text-primary text-[10px] font-black uppercase tracking-widest transition-all border border-primary dark:border-primary-700"
                      >
                        <span>Nuovo</span>
                        <AddIcon />
                      </Link>
                      <Link
                        to="/admin/progetti"
                        className="flex items-center justify-between px-3 py-2 text-[10px] font-black uppercase tracking-widest transition-all border border-primary text-primary hover:bg-primary hover:text-white"
                      >
                        <span>Gestisci</span>
                        <ArrowRightIcon />
                      </Link>
                    </div>
                  </div>
                </div>

                <div className="border border-black/5 dark:border-white/5 p-6 transition-colors hover:border-indigo-600/20 dark:hover:border-indigo-600/20 transition-transform hover:-translate-y-0.5">
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center">
                      <div className="w-12 h-12 bg-indigo-600 flex items-center justify-center text-white mr-3">
                        <SkillIcon />
                      </div>
                      <h3 className="text-xs font-black uppercase tracking-widest text-black dark:text-white">Competenze</h3>
                    </div>
                  </div>
                  <p className="text-4xl font-black text-black dark:text-white mb-3">{competenze.length}</p>
                  <div className="space-y-3">
                    {latestCompetenza?.id && (
                      <div className="border border-black/5 dark:border-white/5 p-3">
                        <div className="flex items-center justify-between gap-3 mb-2">
                          <span className="text-[10px] font-black uppercase tracking-widest text-black/60 dark:text-white/60">
                            Ultima modifica
                          </span>
                          <span className="text-[10px] font-black uppercase tracking-widest text-black/70 dark:text-white/70 px-2 py-1 border border-black/10 dark:border-white/10 bg-black/5 dark:bg-white/5">
                            {formatRelativeDate(latestCompetenza.updated_at || latestCompetenza.created_at)}
                          </span>
                        </div>
                        <Link
                          to={`/admin/competenze/modifica/${latestCompetenza.id}`}
                          className="block text-sm font-black tracking-tight text-black dark:text-white hover:text-indigo-600 dark:hover:text-indigo-600 truncate"
                        >
                          {latestCompetenza.titolo}
                        </Link>
                      </div>
                    )}

                    {missingCompetenzaImagesCount > 0 && (
                      <div className="inline-flex items-center px-3 py-2 border border-amber-600/25 bg-amber-500/10 text-amber-900 dark:text-amber-200 text-[10px] font-black uppercase tracking-widest">
                        {missingCompetenzaImagesCount} senza immagini
                      </div>
                    )}

                    <div className="grid grid-cols-2 gap-2 pt-4 mt-4 border-t border-black/5 dark:border-white/5">
                      <Link
                        to="/admin/competenze/nuova"
                        className="flex items-center justify-between px-3 py-2 bg-indigo-600 text-white hover:bg-white hover:text-indigo-600 dark:bg-indigo-600 dark:text-black dark:hover:bg-black/80 dark:hover:text-indigo-600 text-[10px] font-black uppercase tracking-widest transition-all border border-indigo-600 dark:border-indigo-600/80"
                      >
                        <span>Nuova</span>
                        <AddIcon />
                      </Link>
                      <Link
                        to="/admin/competenze"
                        className="flex items-center justify-between px-3 py-2 text-[10px] font-black uppercase tracking-widest transition-all border border-indigo-600 text-indigo-600 hover:bg-indigo-600 hover:text-white"
                      >
                        <span>Gestisci</span>
                        <ArrowRightIcon />
                      </Link>
                    </div>
                  </div>
                </div>

                <div className="border border-black/5 dark:border-white/5 p-6 transition-colors hover:border-teal-600/20 dark:hover:border-teal-600/20 transition-transform hover:-translate-y-0.5">
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center">
                      <div className="w-12 h-12 bg-teal-600 flex items-center justify-center text-white mr-3">
                        <OfferIcon />
                      </div>
                      <h3 className="text-xs font-black uppercase tracking-widest text-black dark:text-white">Offerte</h3>
                    </div>
                  </div>
                  <p className="text-4xl font-black text-black dark:text-white mb-3">{offerte.length}</p>
                  <div className="space-y-3">
                    {latestOfferta?.id ? (
                      <div className="border border-black/5 dark:border-white/5 p-3">
                        <div className="flex items-center justify-between gap-3 mb-2">
                          <span className="text-[10px] font-black uppercase tracking-widest text-black/60 dark:text-white/60">
                            Ultima modifica
                          </span>
                          <span className="text-[10px] font-black uppercase tracking-widest text-black/70 dark:text-white/70 px-2 py-1 border border-black/10 dark:border-white/10 bg-black/5 dark:bg-white/5">
                            {formatRelativeDate(latestOfferta.updated_at || latestOfferta.created_at)}
                          </span>
                        </div>
                        <Link
                          to={`/admin/offerte-lavoro/modifica/${latestOfferta.id}`}
                          className="block text-sm font-black tracking-tight text-black dark:text-white hover:text-teal-600 dark:hover:text-teal-600 truncate"
                        >
                          {latestOfferta.titolo}
                        </Link>
                      </div>
                    ) : (
                      <div className="inline-flex items-center px-3 py-2 border border-rose-600/25 bg-rose-500/10 text-rose-900 dark:text-rose-200 text-[10px] font-black uppercase tracking-widest">
                        Nessuna offerta pubblicata
                      </div>
                    )}

                    <div className="grid grid-cols-2 gap-2 pt-4 mt-4 border-t border-black/5 dark:border-white/5">
                      <Link
                        to="/admin/offerte-lavoro/nuova"
                        className="flex items-center justify-between px-3 py-2 bg-teal-600 text-white hover:bg-white hover:text-teal-600 dark:bg-teal-600 dark:text-black dark:hover:bg-black/80 dark:hover:text-teal-600 text-[10px] font-black uppercase tracking-widest transition-all border border-teal-600 dark:border-teal-600/80"
                      >
                        <span>Nuova</span>
                        <AddIcon />
                      </Link>
                      <Link
                        to="/admin/offerte-lavoro"
                        className="flex items-center justify-between px-3 py-2 text-[10px] font-black uppercase tracking-widest transition-all border border-teal-600 text-teal-600 hover:bg-teal-600 hover:text-white"
                      >
                        <span>Gestisci</span>
                        <ArrowRightIcon />
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            )}

            <div className="border border-black/5 dark:border-white/5 p-6">
              <h3 className="text-sm font-black uppercase tracking-widest text-black dark:text-white mb-5">Panoramica</h3>
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="border border-black/5 dark:border-white/5 p-4">
                  <div className="text-xs font-black uppercase tracking-widest text-black dark:text-white mb-3">Categorie progetti</div>
                  {loading ? (
                    <div className="space-y-2">
                      {[...Array(3)].map((_, i) => (
                        <div key={i} className="h-3 bg-black/5 dark:bg-white/5 w-3/4 animate-pulse"></div>
                      ))}
                    </div>
                  ) : topProjectCategories.length === 0 ? (
                    <div className="text-[10px] font-black uppercase tracking-widest text-black/60 dark:text-white/60">N/D</div>
                  ) : (
                    <div className="space-y-2">
                      {topProjectCategories.map(([category, count]) => (
                        <div key={category} className="flex items-center justify-between text-[10px] font-black uppercase tracking-widest text-black/70 dark:text-white/70">
                          <span className="truncate pr-3">{category}</span>
                          <span className="text-black/60 dark:text-white/60">{count}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="border border-black/5 dark:border-white/5 p-4">
                  <div className="text-xs font-black uppercase tracking-widest text-black dark:text-white mb-3">Categorie competenze</div>
                  {loading ? (
                    <div className="space-y-2">
                      {[...Array(3)].map((_, i) => (
                        <div key={i} className="h-3 bg-black/5 dark:bg-white/5 w-3/4 animate-pulse"></div>
                      ))}
                    </div>
                  ) : topSkillCategories.length === 0 ? (
                    <div className="text-[10px] font-black uppercase tracking-widest text-black/60 dark:text-white/60">N/D</div>
                  ) : (
                    <div className="space-y-2">
                      {topSkillCategories.map(([category, count]) => (
                        <div key={category} className="flex items-center justify-between text-[10px] font-black uppercase tracking-widest text-black/70 dark:text-white/70">
                          <span className="truncate pr-3">{category}</span>
                          <span className="text-black/60 dark:text-white/60">{count}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="border border-black/5 dark:border-white/5 p-4">
                  <div className="text-xs font-black uppercase tracking-widest text-black dark:text-white mb-3">Offerte per tipo</div>
                  {loading ? (
                    <div className="space-y-2">
                      {[...Array(4)].map((_, i) => (
                        <div key={i} className="h-3 bg-black/5 dark:bg-white/5 w-4/5 animate-pulse"></div>
                      ))}
                    </div>
                  ) : offersByType.length === 0 ? (
                    <div className="text-[10px] font-black uppercase tracking-widest text-black/60 dark:text-white/60">N/D</div>
                  ) : (
                    <div className="space-y-2">
                      {offersByType.map(([tipo, count]) => (
                        <div key={tipo} className="flex items-center justify-between text-[10px] font-black uppercase tracking-widest text-black/70 dark:text-white/70">
                          <span className="truncate pr-3">{tipo}</span>
                          <span className="text-black/60 dark:text-white/60">{count}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          <div className="xl:col-span-1">
            <div className="border border-black/5 dark:border-white/5">
              <div className="p-6 border-b border-black/5 dark:border-white/5">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-black uppercase tracking-widest text-black dark:text-white">Attività</h3>
                <button
                  onClick={() => { void loadDashboardData('refresh'); }}
                  disabled={refreshing}
                  className="text-[10px] font-black uppercase tracking-widest text-primary hover:bg-primary hover:text-white px-3 py-2 transition-all border border-primary flex items-center disabled:opacity-50"
                >
                    <RefreshIcon /> Aggiorna
                  </button>
                </div>
                <div className="grid grid-cols-3 gap-2 mt-4">
                  <button
                    onClick={() => setActivityFilter('all')}
                    className={`px-2 py-2 text-[10px] font-black uppercase tracking-widest transition-all border ${activityFilter === 'all'
                      ? 'bg-black text-white dark:bg-white dark:text-black border-black dark:border-white'
                      : 'text-black/70 dark:text-white/70 hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black border-black/5 dark:border-white/5'
                      }`}
                  >
                    Tutto
                  </button>
                  <button
                    onClick={() => setActivityFilter('content')}
                    className={`px-2 py-2 text-[10px] font-black uppercase tracking-widest transition-all border ${activityFilter === 'content'
                      ? 'bg-black text-white dark:bg-white dark:text-black border-black dark:border-white'
                      : 'text-black/70 dark:text-white/70 hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black border-black/5 dark:border-white/5'
                      }`}
                  >
                    Contenuti
                  </button>
                  <button
                    onClick={() => setActivityFilter('access')}
                    className={`px-2 py-2 text-[10px] font-black uppercase tracking-widest transition-all border ${activityFilter === 'access'
                      ? 'bg-black text-white dark:bg-white dark:text-black border-black dark:border-white'
                      : 'text-black/70 dark:text-white/70 hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black border-black/5 dark:border-white/5'
                      }`}
                  >
                    Accessi
                  </button>
                </div>
              </div>

              <div className="p-5">
                {loading ? (
                  <div className="space-y-4">
                    {[...Array(6)].map((_, i) => (
                      <div key={i} className="flex items-start gap-3 p-3">
                        <div className="w-10 h-10 bg-black/5 dark:bg-white/5 animate-pulse flex-shrink-0"></div>
                        <div className="flex-1 space-y-3">
                          <div className="h-4 bg-black/5 dark:bg-white/5 w-3/4 animate-pulse"></div>
                          <div className="h-3 bg-black/5 dark:bg-white/5 w-1/2 animate-pulse"></div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : filteredActivities.length === 0 ? (
                  <div className="text-center py-10">
                    <svg className="w-16 h-16 mx-auto text-black/50 dark:text-white/40 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <p className="text-sm font-medium text-black/70 dark:text-white/70">Nessuna attività</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {filteredActivities.map((activity) => {
                      const link = getEntityLink(activity);
                      const canLink = link !== '#';
                      const Tag = canLink ? Link : 'div';

                      return (
                        <div
                          key={activity.id}
                          className="border border-black/5 dark:border-white/5 p-4 hover:border-primary transition-all"
                        >
                          <Tag
                            to={link}
                            className={`flex items-start ${canLink ? 'cursor-pointer' : 'cursor-default'}`}
                          >
                            {getActivityIcon(activity.type)}
                            <div className="flex-1">
                              <p className="text-sm font-medium text-black dark:text-white mb-1">
                                {activity.description}
                              </p>
                              <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-[10px] font-black uppercase tracking-widest text-black/70 dark:text-white/70">
                                <span className="inline-flex items-center">
                                  <TimeIcon />{formatRelativeTime(activity.timestamp)}
                                </span>
                                {activity.user && (
                                  <span className="inline-flex items-center">
                                    <UserIcon />
                                    {activity.user.split('@')[0]}
                                  </span>
                                )}
                              </div>
                            </div>
                          </Tag>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};

export default DashboardPage;
