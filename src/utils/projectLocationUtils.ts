import { logger } from './logger';
import { ProgettoData } from '../types/supabaseTypes';

export type Coordinate = { lat: number; lng: number };
export type ProjectCoordinates = { points: Coordinate[]; route?: Coordinate[] };
export type GeocodingPhase = { current: number; total: number };
export type SelectedGroup = { projects: ProgettoData[]; coord: Coordinate };
export type MarkerGroup = { lat: number; lng: number; projects: ProgettoData[] };
export type LineFeature = {
  type: 'Feature';
  geometry: { type: 'LineString'; coordinates: Array<[number, number]> };
  properties: { id?: string };
};
export type LineFeatureCollection = { type: 'FeatureCollection'; features: LineFeature[] };

type NominatimResponse = Array<{ lat: string; lon: string }>;
type OsrmResponse = {
  routes?: Array<{ geometry: { coordinates: Array<[number, number]> } }>;
};

const geoCache: Record<string, Coordinate> = {};
const PROJECT_LOCATION_CACHE_KEY = 'scandellari.project-location-cache.v1';

type ProjectWithLocationCache = Pick<ProgettoData, 'id' | 'localita' | 'updated_at'> & {
  coordinatePunti?: Coordinate[];
  coordinatePercorso?: Coordinate[];
  coordinate_punti?: Coordinate[];
  coordinate_percorso?: Coordinate[];
};

type StoredProjectLocationEntry = {
  key: string;
  localita: string;
  points: Coordinate[];
  route: Coordinate[];
  storedAt: string;
  updatedAt: string | null;
};

let projectLocationStore: Record<string, StoredProjectLocationEntry> | null = null;

function canUseStorage(): boolean {
  return typeof window !== 'undefined' && typeof window.localStorage !== 'undefined';
}

function isCoordinate(value: unknown): value is Coordinate {
  return (
    typeof value === 'object' &&
    value !== null &&
    typeof (value as Coordinate).lat === 'number' &&
    typeof (value as Coordinate).lng === 'number'
  );
}

function sanitizeCoordinates(value: unknown): Coordinate[] {
  if (!Array.isArray(value)) return [];
  return value.filter(isCoordinate);
}

function normalizeUpdatedAt(value?: string | Date): string | null {
  if (!value) return null;
  try {
    return typeof value === 'string' ? new Date(value).toISOString() : value.toISOString();
  } catch {
    return null;
  }
}

function loadProjectLocationStore(): Record<string, StoredProjectLocationEntry> {
  if (projectLocationStore) return projectLocationStore;
  if (!canUseStorage()) {
    projectLocationStore = {};
    return projectLocationStore;
  }

  try {
    const raw = window.localStorage.getItem(PROJECT_LOCATION_CACHE_KEY);
    projectLocationStore = raw ? JSON.parse(raw) as Record<string, StoredProjectLocationEntry> : {};
  } catch (error) {
    logger.warn('Impossibile leggere la cache coordinate progetti.', error);
    projectLocationStore = {};
  }

  return projectLocationStore;
}

function persistProjectLocationStore(store: Record<string, StoredProjectLocationEntry>) {
  if (!canUseStorage()) return;

  try {
    window.localStorage.setItem(PROJECT_LOCATION_CACHE_KEY, JSON.stringify(store));
  } catch (error) {
    logger.warn('Impossibile salvare la cache coordinate progetti.', error);
  }
}

function getEmbeddedProjectCoordinates(project: ProjectWithLocationCache): ProjectCoordinates | null {
  const points = sanitizeCoordinates(project.coordinatePunti ?? project.coordinate_punti);
  const route = sanitizeCoordinates(project.coordinatePercorso ?? project.coordinate_percorso);

  if (points.length === 0 && route.length === 0) return null;

  return {
    points,
    route: route.length > 0 ? route : points,
  };
}

export function getProjectLocationCacheKey(project: Pick<ProgettoData, 'id' | 'localita' | 'updated_at'>): string {
  return [
    project.id ?? 'anonymous-project',
    project.localita.trim().toLowerCase(),
    normalizeUpdatedAt(project.updated_at) ?? 'no-updated-at',
  ].join('::');
}

export function getCachedProjectLocation(project: ProjectWithLocationCache): ProjectCoordinates | null {
  const embeddedCoordinates = getEmbeddedProjectCoordinates(project);
  if (embeddedCoordinates) {
    return embeddedCoordinates;
  }

  const store = loadProjectLocationStore();
  const entry = store[getProjectLocationCacheKey(project)];

  if (!entry) return null;

  return {
    points: sanitizeCoordinates(entry.points),
    route: sanitizeCoordinates(entry.route),
  };
}

function storeProjectLocation(project: ProjectWithLocationCache, coordinates: ProjectCoordinates) {
  if (!project.localita) return;

  const store = loadProjectLocationStore();
  const key = getProjectLocationCacheKey(project);

  store[key] = {
    key,
    localita: project.localita,
    points: coordinates.points,
    route: coordinates.route ?? coordinates.points,
    storedAt: new Date().toISOString(),
    updatedAt: normalizeUpdatedAt(project.updated_at),
  };

  persistProjectLocationStore(store);
}

export async function geocodePart(part: string, retryOnRateLimit: boolean = true): Promise<Coordinate | null> {
  if (!part) return null;
  if (geoCache[part]) return geoCache[part];

  try {
    const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(`${part}, Italia`)}&limit=1`;
    const response = await fetch(url);

    if (response.status === 429 && retryOnRateLimit) {
      await new Promise((resolve) => setTimeout(resolve, 1200));
      return geocodePart(part, false);
    }

    const data: NominatimResponse = await response.json();
    if (!data?.length) return null;

    const coord = {
      lat: parseFloat(data[0].lat),
      lng: parseFloat(data[0].lon),
    };

    geoCache[part] = coord;
    return coord;
  } catch (error) {
    logger.error(`Failed to geocode: ${part}`, error);
    return null;
  }
}

export async function fetchRoute(coords: Coordinate[]): Promise<Coordinate[]> {
  if (coords.length < 2) return coords;

  try {
    const osrmPath = coords.map((coord) => `${coord.lng},${coord.lat}`).join(';');
    const response = await fetch(
      `https://router.project-osrm.org/route/v1/driving/${osrmPath}?overview=full&geometries=geojson`
    );
    const data: OsrmResponse = await response.json();

    if (data.routes?.[0]) {
      return data.routes[0].geometry.coordinates.map(([lng, lat]) => ({ lng, lat }));
    }
  } catch (error) {
    logger.warn('OSRM error', error);
  }

  return coords;
}

export async function geocodeLocalita(localita: string): Promise<ProjectCoordinates> {
  const parts = localita
    .split(/[-/]/)
    .map((item) => item.trim())
    .filter(Boolean);

  const coordResults = await Promise.allSettled(parts.map((part) => geocodePart(part)));
  const points = coordResults
    .filter((result): result is PromiseFulfilledResult<Coordinate> => (
      result.status === 'fulfilled' && result.value !== null
    ))
    .map((result) => result.value);

  const route = await fetchRoute(points);

  return {
    points,
    route,
  };
}

export async function resolveProjectLocation(project: ProjectWithLocationCache): Promise<ProjectCoordinates> {
  const cachedCoordinates = getCachedProjectLocation(project);
  if (cachedCoordinates) {
    return cachedCoordinates;
  }

  const coordinates = await geocodeLocalita(project.localita);
  storeProjectLocation(project, coordinates);
  return coordinates;
}

export async function geocodeProject(project: ProgettoData): Promise<{ id: string; result: ProjectCoordinates }> {
  return {
    id: project.id ?? '',
    result: await resolveProjectLocation(project),
  };
}

export function chunkArray<T>(items: T[], size: number): T[][] {
  const chunks: T[][] = [];

  for (let index = 0; index < items.length; index += size) {
    chunks.push(items.slice(index, index + size));
  }

  return chunks;
}

export function groupProjectMarkers(
  projects: ProgettoData[],
  projectCoordinates: Record<string, ProjectCoordinates>
): MarkerGroup[] {
  const coordsMap = new globalThis.Map<string, MarkerGroup & { projectIds: Set<string> }>();

  projects.forEach((project) => {
    const coords = projectCoordinates[project.id ?? ''];
    if (!coords?.points?.length) return;

    coords.points.forEach((point) => {
      const key = `${point.lat.toFixed(5)},${point.lng.toFixed(5)}`;
      const group = coordsMap.get(key) ?? {
        lat: point.lat,
        lng: point.lng,
        projects: [],
        projectIds: new Set<string>(),
      };

      const projectId = project.id ?? '';
      if (!group.projectIds.has(projectId)) {
        group.projects.push(project);
        group.projectIds.add(projectId);
      }

      coordsMap.set(key, group);
    });
  });

  return [...coordsMap.values()].map(({ projectIds, ...group }) => group);
}

export function buildProjectRoutesGeoJSON(
  projects: ProgettoData[],
  projectCoordinates: Record<string, ProjectCoordinates>
): LineFeatureCollection {
  const features = projects.flatMap((project) => {
    const coords = projectCoordinates[project.id ?? ''];
    if (!coords?.route || coords.route.length < 2) return [];

    return [{
      type: 'Feature' as const,
      geometry: {
        type: 'LineString' as const,
        coordinates: coords.route.map((point) => [point.lng, point.lat] as [number, number]),
      },
      properties: { id: project.id },
    }];
  });

  return {
    type: 'FeatureCollection',
    features,
  };
}
