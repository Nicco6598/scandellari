import { logger } from '../utils/logger';
import { CompetenzaData, OffertaLavoroData, ProgettoData } from '../types/supabaseTypes';

type TimestampFields = {
  created_at?: string | Date;
  updated_at?: string | Date;
};

type FrontendTimestampFields = {
  createdAt?: Date;
  updatedAt?: Date;
};

type QueryValue = string | number | boolean | undefined | null;

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Variabili d’ambiente Supabase mancanti. Impossibile inizializzare il client pubblico.');
}

const restBaseUrl = `${supabaseUrl.replace(/\/+$/, '')}/rest/v1`;

function convertTimestampToDate<T extends object>(item: T): T & FrontendTimestampFields {
  const nextItem = { ...item } as T & FrontendTimestampFields & TimestampFields;

  if (nextItem.created_at) {
    nextItem.createdAt = typeof nextItem.created_at === 'string'
      ? new Date(nextItem.created_at)
      : nextItem.created_at;
  }

  if (nextItem.updated_at) {
    nextItem.updatedAt = typeof nextItem.updated_at === 'string'
      ? new Date(nextItem.updated_at)
      : nextItem.updated_at;
  }

  return nextItem;
}

function encodeInList(values: readonly string[]) {
  return values
    .map((value) => `"${value.replace(/"/g, '\\"')}"`)
    .join(',');
}

function buildQueryString(params: Record<string, QueryValue>) {
  const searchParams = new URLSearchParams();

  Object.entries(params).forEach(([key, value]) => {
    if (value === undefined || value === null || value === '') return;
    searchParams.set(key, String(value));
  });

  return searchParams.toString();
}

async function requestJson<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`${restBaseUrl}${path}`, {
    ...init,
    headers: {
      apikey: supabaseAnonKey,
      Authorization: `Bearer ${supabaseAnonKey}`,
      Accept: 'application/json',
      ...(init?.headers ?? {}),
    },
  });

  if (!response.ok) {
    const errorText = await response.text().catch(() => '');
    throw new Error(errorText || `Richiesta Supabase fallita con status ${response.status}.`);
  }

  return response.json() as Promise<T>;
}

async function requestOptionalJson<T>(path: string, init?: RequestInit): Promise<T | null> {
  const response = await fetch(`${restBaseUrl}${path}`, {
    ...init,
    headers: {
      apikey: supabaseAnonKey,
      Authorization: `Bearer ${supabaseAnonKey}`,
      Accept: 'application/json',
      ...(init?.headers ?? {}),
    },
  });

  if (response.status === 404 || response.status === 406) {
    return null;
  }

  if (!response.ok) {
    const errorText = await response.text().catch(() => '');
    throw new Error(errorText || `Richiesta Supabase fallita con status ${response.status}.`);
  }

  return response.json() as Promise<T>;
}

async function requestCount(path: string): Promise<number> {
  const response = await fetch(`${restBaseUrl}${path}`, {
    method: 'HEAD',
    headers: {
      apikey: supabaseAnonKey,
      Authorization: `Bearer ${supabaseAnonKey}`,
      Prefer: 'count=exact',
    },
  });

  if (!response.ok) {
    const errorText = await response.text().catch(() => '');
    throw new Error(errorText || `Richiesta count fallita con status ${response.status}.`);
  }

  const contentRange = response.headers.get('content-range');
  const total = contentRange?.split('/')[1];
  return total ? Number(total) || 0 : 0;
}

const PUBLIC_PROJECT_LIST_SELECT = 'id,id_numerico,titolo,descrizione,categoria,localita,anno,tecnologie,immagini,created_at,updated_at';
const PUBLIC_PROJECT_DETAIL_SELECT = '*';
const PUBLIC_COMPETENZE_SELECT = '*';
const PUBLIC_OFFER_SELECT = '*';

export const publicOfferteService = {
  async getAllOfferte(): Promise<OffertaLavoroData[]> {
    try {
      const query = buildQueryString({
        select: PUBLIC_OFFER_SELECT,
        order: 'created_at.desc',
      });
      const data = await requestJson<OffertaLavoroData[]>(`/offerte_lavoro?${query}`);
      return (data ?? []).map((item) => convertTimestampToDate(item)) as OffertaLavoroData[];
    } catch (error) {
      logger.error('Errore public getAllOfferte:', error);
      throw error;
    }
  },
};

export const publicProgettiService = {
  async getProjectsCount(): Promise<number> {
    try {
      return await requestCount('/progetti?select=id');
    } catch (error) {
      logger.error('Errore public getProjectsCount:', error);
      throw error;
    }
  },

  async getFeaturedProjects(limit = 4): Promise<ProgettoData[]> {
    try {
      const query = buildQueryString({
        select: PUBLIC_PROJECT_LIST_SELECT,
        order: 'created_at.desc',
        limit,
      });
      const data = await requestJson<ProgettoData[]>(`/progetti?${query}`);
      return (data ?? []).map((item) => convertTimestampToDate(item)) as ProgettoData[];
    } catch (error) {
      logger.error('Errore public getFeaturedProjects:', error);
      throw error;
    }
  },

  async getProjectsByCategory(category: string, limit?: number, excludeId?: string): Promise<ProgettoData[]> {
    try {
      const query = buildQueryString({
        select: PUBLIC_PROJECT_LIST_SELECT,
        categoria: `ilike.${category}`,
        ...(excludeId ? { id: `neq.${excludeId}` } : {}),
        order: 'created_at.desc',
        ...(typeof limit === 'number' ? { limit } : {}),
      });
      const data = await requestJson<ProgettoData[]>(`/progetti?${query}`);
      return (data ?? []).map((item) => convertTimestampToDate(item)) as ProgettoData[];
    } catch (error) {
      logger.error('Errore public getProjectsByCategory:', error);
      throw error;
    }
  },

  async getAllProjects(): Promise<ProgettoData[]> {
    try {
      const query = buildQueryString({
        select: PUBLIC_PROJECT_DETAIL_SELECT,
        order: 'created_at.desc',
      });
      const data = await requestJson<ProgettoData[]>(`/progetti?${query}`);
      return (data ?? []).map((item) => convertTimestampToDate(item)) as ProgettoData[];
    } catch (error) {
      logger.error('Errore public getAllProjects:', error);
      throw error;
    }
  },

  async getProjectById(id: string): Promise<ProgettoData | null> {
    const idNumerico = Number(id);
    const isNumericId = Number.isFinite(idNumerico) && String(idNumerico) === id.trim();
    const filterKey = isNumericId ? 'id_numerico' : 'id';
    const filterValue = isNumericId ? `eq.${idNumerico}` : `eq.${id}`;

    try {
      const query = buildQueryString({
        select: PUBLIC_PROJECT_DETAIL_SELECT,
        [filterKey]: filterValue,
      });
      const data = await requestOptionalJson<ProgettoData[]>(`/progetti?${query}`);
      const project = data?.[0];
      return project ? convertTimestampToDate(project) as ProgettoData : null;
    } catch (error) {
      logger.error(`Errore public getProjectById (ID: ${id}):`, error);
      throw error;
    }
  },
};

export const publicCompetenzeService = {
  async getCompetenzeByTitles(titles: readonly string[]): Promise<CompetenzaData[]> {
    if (titles.length === 0) return [];

    try {
      const query = buildQueryString({
        select: PUBLIC_COMPETENZE_SELECT,
        titolo: `in.(${encodeInList(titles)})`,
      });
      const data = await requestJson<CompetenzaData[]>(`/competenze?${query}`);
      const titleOrder = new Map(titles.map((title, index) => [title, index]));

      return (data ?? [])
        .map((item) => convertTimestampToDate(item) as CompetenzaData)
        .sort((left, right) => (
          (titleOrder.get(left.titolo) ?? Number.MAX_SAFE_INTEGER) -
          (titleOrder.get(right.titolo) ?? Number.MAX_SAFE_INTEGER)
        ));
    } catch (error) {
      logger.error('Errore public getCompetenzeByTitles:', error);
      throw error;
    }
  },

  async getAllCompetenze(): Promise<CompetenzaData[]> {
    try {
      const query = buildQueryString({
        select: PUBLIC_COMPETENZE_SELECT,
        order: 'created_at.desc',
      });
      const data = await requestJson<CompetenzaData[]>(`/competenze?${query}`);
      return (data ?? []).map((item) => convertTimestampToDate(item)) as CompetenzaData[];
    } catch (error) {
      logger.error('Errore public getAllCompetenze:', error);
      throw error;
    }
  },
};

export const publicCategorieService = {
  async getAllCategorie(): Promise<Array<{ nome?: string | null }>> {
    try {
      const query = buildQueryString({
        select: 'nome',
      });
      return await requestJson<Array<{ nome?: string | null }>>(`/categorie?${query}`);
    } catch (error) {
      logger.error('Errore public getAllCategorie:', error);
      throw error;
    }
  },
};
