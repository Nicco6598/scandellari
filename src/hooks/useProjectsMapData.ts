import { useEffect, useMemo, useRef, useState } from 'react';
import { ProgettoData } from '../types/supabaseTypes';
import {
  GeocodingPhase,
  LineFeatureCollection,
  MarkerGroup,
  ProjectCoordinates,
  SelectedGroup,
  buildProjectRoutesGeoJSON,
  chunkArray,
  getCachedProjectLocation,
  getProjectLocationCacheKey,
  geocodeProject,
  groupProjectMarkers,
} from '../utils/projectLocationUtils';

const CONCURRENCY = 3;
const DEFAULT_VIEW_STATE = {
  longitude: 12.5,
  latitude: 42.5,
  zoom: 5,
};

type ViewState = typeof DEFAULT_VIEW_STATE;

type UseProjectsMapDataOptions = {
  enabled: boolean;
  projects: ProgettoData[];
};

type UseProjectsMapDataResult = {
  activeProjectIndex: number;
  geocodingPhase: GeocodingPhase;
  groupedMarkers: MarkerGroup[];
  hasAnyCoords: boolean;
  isGeocodingDone: boolean;
  lineGeoJSON: LineFeatureCollection;
  projectCoordinates: Record<string, ProjectCoordinates>;
  selectedGroup: SelectedGroup | null;
  setActiveProjectIndex: React.Dispatch<React.SetStateAction<number>>;
  setSelectedGroup: React.Dispatch<React.SetStateAction<SelectedGroup | null>>;
  setViewState: React.Dispatch<React.SetStateAction<ViewState>>;
  viewState: ViewState;
};

export function useProjectsMapData({
  enabled,
  projects,
}: UseProjectsMapDataOptions): UseProjectsMapDataResult {
  const [projectCoordinates, setProjectCoordinates] = useState<Record<string, ProjectCoordinates>>({});
  const [geocodingPhase, setGeocodingPhase] = useState<GeocodingPhase>({ current: 0, total: 0 });
  const [selectedGroup, setSelectedGroup] = useState<SelectedGroup | null>(null);
  const [activeProjectIndex, setActiveProjectIndex] = useState(0);
  const [viewState, setViewState] = useState(DEFAULT_VIEW_STATE);
  const resolvedProjectKeysRef = useRef<Set<string>>(new Set());

  useEffect(() => {
    setSelectedGroup(null);
    setActiveProjectIndex(0);
  }, [projects]);

  useEffect(() => {
    if (projects.length === 0) return;

    const cachedCoordinates: Record<string, ProjectCoordinates> = {};

    projects.forEach((project) => {
      const projectId = project.id ?? '';
      const cachedLocation = getCachedProjectLocation(project);
      if (!projectId || !cachedLocation) return;

      cachedCoordinates[projectId] = cachedLocation;
      resolvedProjectKeysRef.current.add(getProjectLocationCacheKey(project));
    });

    if (Object.keys(cachedCoordinates).length > 0) {
      setProjectCoordinates((previous) => ({ ...previous, ...cachedCoordinates }));
    }
  }, [projects]);

  useEffect(() => {
    let isMounted = true;

    if (!enabled || projects.length === 0) {
      setGeocodingPhase({ current: 0, total: 0 });
      return () => {
        isMounted = false;
      };
    }

    const projectsToProcess = projects.filter((project) => {
      const cacheKey = getProjectLocationCacheKey(project);
      return Boolean(project.localita) && !resolvedProjectKeysRef.current.has(cacheKey);
    });

    if (projectsToProcess.length === 0) {
      setGeocodingPhase({ current: 0, total: 0 });
      return () => {
        isMounted = false;
      };
    }

    setGeocodingPhase({ current: 0, total: projectsToProcess.length });

    const processGeocoding = async () => {
      let processedCount = 0;
      const chunks = chunkArray(projectsToProcess, CONCURRENCY);

      for (const chunk of chunks) {
        if (!isMounted) break;

        const results = await Promise.allSettled(
          chunk.map(async (project) => ({
            cacheKey: getProjectLocationCacheKey(project),
            geocoded: await geocodeProject(project),
          }))
        );
        const coordinatesBatch: Record<string, ProjectCoordinates> = {};

        results.forEach((result) => {
          processedCount += 1;

          if (result.status !== 'fulfilled' || !isMounted) {
            return;
          }

          const {
            cacheKey,
            geocoded: { id, result: coords },
          } = result.value;
          coordinatesBatch[id] = coords;
          resolvedProjectKeysRef.current.add(cacheKey);
        });

        if (Object.keys(coordinatesBatch).length > 0) {
          setProjectCoordinates((previous) => ({ ...previous, ...coordinatesBatch }));
        }

        setGeocodingPhase((previous) => ({ ...previous, current: processedCount }));

        if (isMounted) {
          await new Promise((resolve) => setTimeout(resolve, 300));
        }
      }
    };

    processGeocoding();

    return () => {
      isMounted = false;
    };
  }, [enabled, projects]);

  useEffect(() => {
    if (!enabled || viewState.zoom !== DEFAULT_VIEW_STATE.zoom) return;

    const firstWithCoords = projects.find((project) => (
      (projectCoordinates[project.id ?? '']?.points.length ?? 0) > 0
    ));

    const coords = firstWithCoords
      ? projectCoordinates[firstWithCoords.id ?? '']?.points[0]
      : null;

    if (coords) {
      setViewState((previous) => ({
        ...previous,
        longitude: coords.lng,
        latitude: coords.lat,
        zoom: 6,
      }));
    }
  }, [enabled, projectCoordinates, projects, viewState.zoom]);

  const groupedMarkers = useMemo(() => (
    groupProjectMarkers(projects, projectCoordinates)
  ), [projectCoordinates, projects]);

  const lineGeoJSON = useMemo(() => (
    buildProjectRoutesGeoJSON(projects, projectCoordinates)
  ), [projectCoordinates, projects]);

  return {
    activeProjectIndex,
    geocodingPhase,
    groupedMarkers,
    hasAnyCoords: groupedMarkers.length > 0,
    isGeocodingDone: geocodingPhase.total === 0 || geocodingPhase.current === geocodingPhase.total,
    lineGeoJSON,
    projectCoordinates,
    selectedGroup,
    setActiveProjectIndex,
    setSelectedGroup,
    setViewState,
    viewState,
  };
}
