// src/supabase/services.ts
import { supabase } from './config';
import { v4 as uuidv4 } from 'uuid';
import { ProgettoData, CompetenzaData, OffertaLavoroData, ImmagineInfo } from '../types/supabaseTypes';
import { activityService } from './activityService';
import { logger } from '../utils/logger';
import { optimizeImageUpload } from '../utils/optimizeImageUpload';

type TimestampFields = {
  created_at?: string | Date;
  updated_at?: string | Date;
};

type FrontendTimestampFields = {
  createdAt?: Date;
  updatedAt?: Date;
};

type ProjectLocationFields = {
  coordinatePunti?: unknown;
  coordinatePercorso?: unknown;
  coordinate_punti?: unknown;
  coordinate_percorso?: unknown;
};

const convertTimestampToDate = <T extends Record<string, unknown>>(item: T): T & FrontendTimestampFields => {
  const newItem = { ...item } as T & FrontendTimestampFields & TimestampFields;

  if (newItem.created_at) {
    newItem.createdAt = typeof newItem.created_at === 'string' ? new Date(newItem.created_at) : newItem.created_at;
  }

  if (newItem.updated_at) {
    newItem.updatedAt = typeof newItem.updated_at === 'string' ? new Date(newItem.updated_at) : newItem.updated_at;
  }

  return newItem;
};

const stripFrontendTimestampFields = <T extends Record<string, unknown>>(payload: T) => {
  const { createdAt: _createdAt, updatedAt: _updatedAt, ...rest } = payload as T & FrontendTimestampFields;
  return rest as Omit<T, keyof FrontendTimestampFields>;
};

const normalizeProjectLocationFields = <T extends Record<string, unknown>>(payload: T) => {
  const {
    coordinatePunti,
    coordinatePercorso,
    coordinate_punti,
    coordinate_percorso,
    ...rest
  } = payload as T & ProjectLocationFields;

  const normalizedPoints = coordinate_punti ?? coordinatePunti;
  const normalizedRoute = coordinate_percorso ?? coordinatePercorso;

  return {
    ...rest,
    ...(normalizedPoints !== undefined ? { coordinate_punti: normalizedPoints } : {}),
    ...(normalizedRoute !== undefined ? { coordinate_percorso: normalizedRoute } : {}),
  };
};

const stripProjectLocationFields = <T extends Record<string, unknown>>(payload: T) => {
  const {
    coordinatePunti: _coordinatePunti,
    coordinatePercorso: _coordinatePercorso,
    coordinate_punti: _coordinatePuntiSnake,
    coordinate_percorso: _coordinatePercorsoSnake,
    ...rest
  } = payload as T & ProjectLocationFields;

  return rest;
};

const isProjectLocationSchemaError = (error: unknown): boolean => {
  if (!error || typeof error !== 'object') return false;

  const details = [
    (error as { code?: string }).code,
    (error as { message?: string }).message,
    (error as { details?: string }).details,
    (error as { hint?: string }).hint,
  ]
    .filter(Boolean)
    .join(' ')
    .toLowerCase();

  const mentionsProjectCoordinates = (
    details.includes('coordinate_punti') ||
    details.includes('coordinate_percorso') ||
    details.includes('coordinatepunti') ||
    details.includes('coordinatepercorso')
  );

  return mentionsProjectCoordinates || details.includes('pgrst204') || details.includes('42703');
};

const getCurrentUser = async () => {
  const { data, error } = await supabase.auth.getUser();
  if (error) {
    logger.error('Errore ottenimento utente:', error);
    throw error;
  }

  return data?.user;
};

const logActivitySafely = async (activity: Parameters<typeof activityService.logActivity>[0], context: string) => {
  try {
    await activityService.logActivity(activity);
  } catch (logError) {
    logger.error(`Errore durante il logging (${context}):`, logError);
  }
};

const removeImagesSafely = async (paths: string[]) => {
  const validPaths = paths.filter((path) => path && typeof path === 'string' && path.trim() !== '');
  if (validPaths.length === 0) {
    logger.log('Nessun path valido fornito per la cancellazione immagini.');
    return;
  }

  const { data, error } = await supabase.storage.from('images').remove(validPaths);
  if (error) {
    logger.error('Errore cancellazione immagini:', error);
    throw new Error(`Errore durante la cancellazione di una o più immagini: ${error.message}`);
  }

  logger.log('Immagini cancellate con successo:', data);
};


// ==========================
// Offerte Service (Job Offers)
// ==========================
export const offerteService = {
  // Get all offers
  getAllOfferte: async (): Promise<OffertaLavoroData[]> => {
    const { data, error } = await supabase
      .from('offerte_lavoro')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
       logger.error("Errore getAllOfferte:", error);
       throw error;
    }
    // Applica conversione se i tipi usano createdAt/updatedAt
    return (data ?? []).map((item) => convertTimestampToDate(item)) as OffertaLavoroData[];
  },

  // Get offer by ID
  getOffertaById: async (id: string): Promise<OffertaLavoroData | null> => {
    const { data, error } = await supabase
      .from('offerte_lavoro')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') return null; // Not found
      logger.error("Errore getOffertaById:", error);
      throw error;
    }
    return data ? convertTimestampToDate(data) as OffertaLavoroData : null;
  },

  // Create a new offer
  createOfferta: async (offertaData: Omit<OffertaLavoroData, 'id' | 'created_at' | 'updated_at' | 'createdAt' | 'updatedAt'>): Promise<OffertaLavoroData> => {
    const currentUser = await getCurrentUser();
    const newId = uuidv4();

    const insertPayload = {
        ...offertaData,
        id: newId,
        created_at: new Date().toISOString()
    };

    const { data, error } = await supabase
      .from('offerte_lavoro')
      .insert([insertPayload])
      .select()
      .single();

    if (error) {
        logger.error("Errore createOfferta:", error);
        throw error;
    }

    // Log
    await logActivitySafely({
      type: 'create',
      description: `Offerta "${offertaData.titolo}" creata`,
      user: currentUser?.email || 'utente_sconosciuto',
      entityType: 'offerta',
      entityId: newId
    }, 'createOfferta');

    return convertTimestampToDate(data) as OffertaLavoroData;
  },

  // Update an existing offer
  updateOfferta: async (id: string, offertaData: Partial<Omit<OffertaLavoroData, 'id' | 'created_at' | 'createdAt'>>): Promise<OffertaLavoroData> => {
    const currentUser = await getCurrentUser();
    const existingOfferta = await offerteService.getOffertaById(id);
     if (!existingOfferta) {
       throw new Error(`Offerta con ID ${id} non trovata per l'aggiornamento.`);
     }

    const updatePayload = {
       ...stripFrontendTimestampFields(offertaData),
       updated_at: new Date().toISOString()
    };


    const { data, error } = await supabase
      .from('offerte_lavoro')
      .update(updatePayload)
      .eq('id', id)
      .select()
      .single();

    if (error) {
        logger.error("Errore updateOfferta:", error);
        throw error;
    }

    // Log
    const titoloLog = offertaData.titolo || existingOfferta.titolo;
    await logActivitySafely({
      type: 'update',
      description: `Offerta "${titoloLog}" aggiornata`,
      user: currentUser?.email || 'utente_sconosciuto',
      entityType: 'offerta',
      entityId: id
    }, 'updateOfferta');

    return convertTimestampToDate(data) as OffertaLavoroData;
  },

  // Delete an offer
  deleteOfferta: async (id: string): Promise<string> => {
    const currentUser = await getCurrentUser();
    const existingOfferta = await offerteService.getOffertaById(id);
     if (!existingOfferta) {
        throw new Error(`Offerta con ID ${id} non trovata per la cancellazione.`);
     }

    const { error } = await supabase.from('offerte_lavoro').delete().eq('id', id);

    if (error) {
        logger.error("Errore deleteOfferta:", error);
        throw error;
    }

    // Log
    await logActivitySafely({
      type: 'delete',
      description: `Offerta "${existingOfferta.titolo}" eliminata`,
      user: currentUser?.email || 'utente_sconosciuto',
      entityType: 'offerta',
      entityId: id
    }, 'deleteOfferta');

    return id;
  }
};


// ==========================
// Progetti Service (Projects)
// ==========================
export const progettiService = {
  getProjectsCount: async (): Promise<number> => {
    const { count, error } = await supabase
      .from('progetti')
      .select('id', { count: 'exact', head: true });

    if (error) {
      logger.error('Errore getProjectsCount:', error);
      throw error;
    }

    return count ?? 0;
  },

  getFeaturedProjects: async (limit: number = 4): Promise<ProgettoData[]> => {
    const { data, error } = await supabase
      .from('progetti')
      .select('id,id_numerico,titolo,descrizione,categoria,localita,anno,tecnologie,immagini,created_at,updated_at')
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) {
      logger.error('Errore getFeaturedProjects:', error);
      throw error;
    }

    return (data ?? []).map((item) => convertTimestampToDate(item)) as ProgettoData[];
  },

  getProjectsByCategory: async (category: string, limit?: number, excludeId?: string): Promise<ProgettoData[]> => {
    let query = supabase
      .from('progetti')
      .select('id,id_numerico,titolo,descrizione,categoria,localita,anno,tecnologie,immagini,created_at,updated_at')
      .ilike('categoria', category)
      .order('created_at', { ascending: false });

    if (excludeId) {
      query = query.neq('id', excludeId);
    }

    if (typeof limit === 'number') {
      query = query.limit(limit);
    }

    const { data, error } = await query;

    if (error) {
      logger.error('Errore getProjectsByCategory:', error);
      throw error;
    }

    return (data ?? []).map((item) => convertTimestampToDate(item)) as ProgettoData[];
  },

  // Get all projects
  getAllProjects: async (): Promise<ProgettoData[]> => {
    const { data, error } = await supabase
      .from('progetti')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
        logger.error("Errore getAllProjects:", error);
        throw error;
    }
    return (data ?? []).map((item) => convertTimestampToDate(item)) as ProgettoData[];
  },

  // Get project by ID (UUID or numeric)
  getProjectById: async (id: string): Promise<ProgettoData | null> => {
    const idNumerico = !isNaN(Number(id)) ? Number(id) : null;
    let query = supabase.from('progetti').select('*');

    if (idNumerico !== null) {
       query = query.eq('id_numerico', idNumerico);
    } else {
       query = query.eq('id', id);
    }

    const { data, error } = await query.single();

    if (error) {
      if (error.code === 'PGRST116') return null; // Not found
      logger.error(`Errore getProjectById (ID: ${id}, Numerico: ${idNumerico}):`, error);
      throw error;
    }
    return data ? convertTimestampToDate(data) as ProgettoData : null;
  },

  // Create a new project
  createProject: async (projectData: Omit<ProgettoData, 'id' | 'created_at' | 'updated_at' | 'id_numerico' | 'createdAt' | 'updatedAt'>): Promise<ProgettoData> => {
    const currentUser = await getCurrentUser();
    const newId = uuidv4();

    const insertPayload = normalizeProjectLocationFields({
      ...projectData,
      id: newId,
      created_at: new Date().toISOString(),
    });

    let { data, error } = await supabase.from('progetti').insert([insertPayload]).select().single();

    if (error && isProjectLocationSchemaError(error)) {
      logger.warn('Colonne coordinate progetto non ancora disponibili. Riprovo senza campi geografici.', error);
      ({ data, error } = await supabase
        .from('progetti')
        .insert([stripProjectLocationFields(insertPayload)])
        .select()
        .single());
    }

    if (error) {
      logger.error("Errore createProject:", error);
      throw error;
    }

    // Log
    await logActivitySafely({
      type: 'create',
      description: `Progetto "${projectData.titolo}" creato`,
      user: currentUser?.email || 'utente_sconosciuto',
      entityType: 'progetto',
      entityId: newId
    }, 'createProject');
    return convertTimestampToDate(data) as ProgettoData;
  },

  // Update an existing project by ID (UUID or numeric)
  updateProject: async (id: string, projectData: Partial<Omit<ProgettoData, 'id' | 'created_at' | 'id_numerico' | 'createdAt'>>): Promise<ProgettoData> => {
    const currentUser = await getCurrentUser();

    const existingProject = await progettiService.getProjectById(id);
    if (!existingProject || !existingProject.id) {
        throw new Error(`Progetto con ID/ID_Numerico ${id} non trovato o ID mancante per l'aggiornamento.`);
    }
    const projectId = existingProject.id;

    const updatePayload = normalizeProjectLocationFields({
      ...stripFrontendTimestampFields(projectData),
      updated_at: new Date().toISOString()
    });

    let { data, error } = await supabase.from('progetti').update(updatePayload).eq('id', projectId).select().single();

    if (error && isProjectLocationSchemaError(error)) {
      logger.warn('Colonne coordinate progetto non ancora disponibili. Riprovo aggiornamento senza campi geografici.', error);
      ({ data, error } = await supabase
        .from('progetti')
        .update(stripProjectLocationFields(updatePayload))
        .eq('id', projectId)
        .select()
        .single());
    }

    if (error) {
        logger.error("Errore updateProject (database):", error);
        throw error;
    }

    // Gestione Cancellazione Vecchie Immagini
    if (projectData.hasOwnProperty('immagini') && existingProject.immagini) {
        const oldPaths = existingProject.immagini.map(img => img.path).filter(p => p);
        const newPaths = (projectData.immagini || []).map(img => img.path).filter(p => p);
        const nextPaths = new Set(newPaths);
        const pathsToDelete = oldPaths.filter((oldPath) => !nextPaths.has(oldPath));

        if (pathsToDelete.length > 0) {
            logger.log("Cancellazione immagini vecchie:", pathsToDelete);
            try { await progettiService.deleteMultipleImages(pathsToDelete); }
            catch (deleteError) { logger.error("Errore non bloccante cancellazione vecchie immagini:", deleteError); }
        }
    }

    // Log
    const titoloLog = projectData.titolo || existingProject.titolo;
    await logActivitySafely({
      type: 'update',
      description: `Progetto "${titoloLog}" aggiornato`,
      user: currentUser?.email || 'utente_sconosciuto',
      entityType: 'progetto',
      entityId: projectId
    }, 'updateProject');
    return convertTimestampToDate(data) as ProgettoData;
  },

  updateProjectLocationData: async (
    id: string,
    locationData: Pick<ProgettoData, 'coordinatePunti' | 'coordinatePercorso' | 'coordinate_punti' | 'coordinate_percorso'>
  ): Promise<ProgettoData> => {
    const existingProject = await progettiService.getProjectById(id);
    if (!existingProject || !existingProject.id) {
      throw new Error(`Progetto con ID/ID_Numerico ${id} non trovato o ID mancante per l'aggiornamento coordinate.`);
    }

    const updatePayload = normalizeProjectLocationFields({
      ...locationData,
      updated_at: new Date().toISOString(),
    });

    let { data, error } = await supabase
      .from('progetti')
      .update(updatePayload)
      .eq('id', existingProject.id)
      .select()
      .single();

    if (error && isProjectLocationSchemaError(error)) {
      logger.warn('Colonne coordinate progetto non ancora disponibili. Aggiornamento geografico ignorato.', error);
      throw error;
    }

    if (error) {
      logger.error('Errore updateProjectLocationData (database):', error);
      throw error;
    }

    return convertTimestampToDate(data) as ProgettoData;
  },

  // Delete a project by ID (UUID or numeric)
  deleteProject: async (id: string): Promise<string> => {
    const currentUser = await getCurrentUser();

    const existingProject = await progettiService.getProjectById(id);
    if (!existingProject || !existingProject.id) {
      throw new Error(`Progetto con ID/ID_Numerico ${id} non trovato o ID mancante per la cancellazione.`);
    }
    const projectId = existingProject.id;

    // Cancella Immagini Associate
    if (existingProject.immagini && existingProject.immagini.length > 0) {
      const pathsToDelete = existingProject.immagini.map(img => img.path).filter(p => p);
      if (pathsToDelete.length > 0) {
          logger.log("Cancellazione immagini del progetto:", pathsToDelete);
          try { await progettiService.deleteMultipleImages(pathsToDelete); }
          catch (deleteError) { logger.error("Errore non bloccante cancellazione immagini associate:", deleteError); }
      }
    }

    // Cancella Record dal Database
    const { error } = await supabase.from('progetti').delete().eq('id', projectId);

    if (error) {
      logger.error("Errore deleteProject (database):", error);
      throw error;
    }

    // Log
    await logActivitySafely({
      type: 'delete',
      description: `Progetto "${existingProject.titolo}" eliminato`,
      user: currentUser?.email || 'utente_sconosciuto',
      entityType: 'progetto',
      entityId: projectId
    }, 'deleteProject');
    return projectId;
  },

  // Upload a *single* image and return its public URL and path
  uploadImage: async (file: File, folder: string = 'progetti'): Promise<ImmagineInfo> => {
    const optimizedFile = await optimizeImageUpload(file);
    const cleanFileName = optimizedFile.name.replace(/[^a-zA-Z0-9.\-_]/g, '_');
    const filename = `${folder}/${uuidv4()}-${cleanFileName}`;

    logger.log(`Tentativo upload: ${filename}`);
    const { data: uploadData, error: uploadError } = await supabase
      .storage
      .from('images')
      .upload(filename, optimizedFile, {
        cacheControl: '31536000',
        contentType: optimizedFile.type || file.type,
        upsert: false,
      });

    if (uploadError) {
        logger.error(`Errore uploadImage (Upload - ${filename}):`, uploadError);
        throw new Error(`Errore durante il caricamento del file: ${uploadError.message}`);
    }
     if (!uploadData?.path) {
         logger.error(`Errore uploadImage (Path mancante dopo upload - ${filename})`);
         throw new Error('Caricamento completato ma path non restituito da Supabase.');
     }
     const imagePath = uploadData.path;

     logger.log(`Upload completato, path: ${imagePath}. Ottenimento URL pubblico...`);

    const publicUrlResult = await supabase
      .storage
      .from('images')
      .getPublicUrl(imagePath);
    const urlData = publicUrlResult.data;

    if (!urlData?.publicUrl) {
      logger.error(`Errore uploadImage (URL pubblico mancante o data assente - ${imagePath})`);
      try { await supabase.storage.from('images').remove([imagePath]); } catch (e) {}
      throw new Error('URL pubblico non restituito o dati mancanti da Supabase dopo il caricamento.');
    }

    const imageUrl = urlData.publicUrl;
    logger.log(`URL Pubblico ottenuto: ${imageUrl}`);
    return { url: imageUrl, path: imagePath };
  },

  // Delete a *single* image by path
  deleteImage: async (path: string): Promise<void> => {
    if (!path || typeof path !== 'string' || path.trim() === '') {
        logger.warn("Tentativo di cancellare un path non valido:", path); return; }
    logger.log("Tentativo cancellazione immagine singola:", path);
    const { data, error } = await supabase.storage.from('images').remove([path]);
    if (error) { logger.error(`Errore deleteImage (path: ${path}):`, error); throw new Error(`Errore cancellazione immagine ${path}: ${error.message}`); }
     logger.log(`Immagine singola cancellata con successo: ${path}`, data);
  },

   // Helper function to delete multiple images by their paths
   deleteMultipleImages: async (paths: string[]): Promise<void> => {
    await removeImagesSafely(paths);
   }
};


// ==========================
// Competenze Service (Skills)
// ==========================
export const competenzeService = {
  getCompetenzeByTitles: async (titles: readonly string[]): Promise<CompetenzaData[]> => {
    if (titles.length === 0) return [];

    const { data, error } = await supabase
      .from('competenze')
      .select('*')
      .in('titolo', [...titles]);

    if (error) {
      logger.error('Errore getCompetenzeByTitles:', error);
      throw error;
    }

    const titleOrder = new Map(titles.map((title, index) => [title, index]));

    return (data ?? [])
      .map((item) => convertTimestampToDate(item) as CompetenzaData)
      .sort((left, right) => (
        (titleOrder.get(left.titolo) ?? Number.MAX_SAFE_INTEGER) -
        (titleOrder.get(right.titolo) ?? Number.MAX_SAFE_INTEGER)
      ));
  },

  // Get all skills
  getAllCompetenze: async (): Promise<CompetenzaData[]> => {
    const { data, error } = await supabase
      .from('competenze')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
        logger.error("Errore getAllCompetenze:", error);
        throw error;
    }
    return (data ?? []).map((item) => convertTimestampToDate(item)) as CompetenzaData[];
  },

  // Get skill by ID
  getCompetenzaById: async (id: string): Promise<CompetenzaData | null> => {
    const { data, error } = await supabase
      .from('competenze')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') return null; // Not found
      logger.error("Errore getCompetenzaById:", error);
      throw error;
    }
    return data ? convertTimestampToDate(data) as CompetenzaData : null;
  },

  // Create a new skill
  createCompetenza: async (competenzaData: Omit<CompetenzaData, 'id' | 'created_at' | 'updated_at' | 'createdAt' | 'updatedAt'> & { id?: string }): Promise<CompetenzaData> => {
    const currentUser = await getCurrentUser();
    const newId = competenzaData.id || uuidv4();

    const { id: _id, ...restData } = competenzaData;

    const dataToInsert = { ...restData, id: newId, created_at: new Date().toISOString() };

    const { data, error } = await supabase.from('competenze').insert([dataToInsert]).select().single();

    if (error) {
        logger.error("Errore createCompetenza:", error);
        throw error;
    }

    // Log
    await logActivitySafely({
      type: 'create',
      description: `Competenza "${competenzaData.titolo}" creata`,
      user: currentUser?.email || 'utente_sconosciuto',
      entityType: 'competenza',
      entityId: newId
    }, 'createCompetenza');
    return convertTimestampToDate(data) as CompetenzaData;
  },

  // Update an existing skill
  updateCompetenza: async (id: string, competenzaData: Partial<Omit<CompetenzaData, 'id' | 'created_at' | 'createdAt'>>): Promise<CompetenzaData> => {
    const currentUser = await getCurrentUser();
    
    // Prima verifica che la competenza esista
    const { data: existingData, error: existingError } = await supabase
      .from('competenze')
      .select('*')
      .eq('id', id)
      .single();

    if (existingError) {
      logger.error("Errore verifica esistenza competenza:", existingError);
      throw new Error(`Competenza con ID ${id} non trovata per l'aggiornamento.`);
    }

    if (!existingData) {
      throw new Error(`Competenza con ID ${id} non trovata per l'aggiornamento.`);
    }

    const updatePayload = { ...stripFrontendTimestampFields(competenzaData), updated_at: new Date().toISOString() };

    // Esegui l'aggiornamento
    const { data: updatedData, error: updateError } = await supabase
      .from('competenze')
      .update(updatePayload)
      .eq('id', id)
      .select()
      .single();

    if (updateError) {
      logger.error("Errore updateCompetenza:", updateError);
      throw updateError;
    }

    if (!updatedData) {
      throw new Error('Aggiornamento completato ma nessun dato restituito.');
    }

    // Log
    const titoloLog = competenzaData.titolo || existingData.titolo;
    await logActivitySafely({
      type: 'update',
      description: `Competenza "${titoloLog}" aggiornata`,
      user: currentUser?.email || 'utente_sconosciuto',
      entityType: 'competenza',
      entityId: id
    }, 'updateCompetenza');

    return convertTimestampToDate(updatedData) as CompetenzaData;
  },

  // Delete a skill
  deleteCompetenza: async (id: string): Promise<string> => {
    const currentUser = await getCurrentUser();
    const existingCompetenza = await competenzeService.getCompetenzaById(id);
     if (!existingCompetenza) {
         throw new Error(`Competenza con ID ${id} non trovata per la cancellazione.`);
     }

    const { error } = await supabase.from('competenze').delete().eq('id', id);

    if (error) {
        logger.error("Errore deleteCompetenza:", error);
        throw error;
    }

    // Log
    await logActivitySafely({
      type: 'delete',
      description: `Competenza "${existingCompetenza.titolo}" eliminata`,
      user: currentUser?.email || 'utente_sconosciuto',
      entityType: 'competenza',
      entityId: id
    }, 'deleteCompetenza');

    return id;
  },

  // Upload a *single* image and return its public URL and path
  uploadImage: async (file: File, folder: string = 'competenze'): Promise<ImmagineInfo> => {
    const optimizedFile = await optimizeImageUpload(file);
    const cleanFileName = optimizedFile.name.replace(/[^a-zA-Z0-9.\-_]/g, '_');
    const filename = `${folder}/${uuidv4()}-${cleanFileName}`;

    logger.log(`Tentativo upload: ${filename}`);
    const { data: uploadData, error: uploadError } = await supabase
      .storage
      .from('images')
      .upload(filename, optimizedFile, {
        cacheControl: '31536000',
        contentType: optimizedFile.type || file.type,
        upsert: false,
      });

    if (uploadError) {
        logger.error(`Errore uploadImage (Upload - ${filename}):`, uploadError);
        throw new Error(`Errore durante il caricamento del file: ${uploadError.message}`);
    }
     if (!uploadData?.path) {
         logger.error(`Errore uploadImage (Path mancante dopo upload - ${filename})`);
         throw new Error('Caricamento completato ma path non restituito da Supabase.');
     }
     const imagePath = uploadData.path;

     logger.log(`Upload completato, path: ${imagePath}. Ottenimento URL pubblico...`);

    const publicUrlResult = await supabase
      .storage
      .from('images')
      .getPublicUrl(imagePath);
    const urlData = publicUrlResult.data;

    if (!urlData?.publicUrl) {
      logger.error(`Errore uploadImage (URL pubblico mancante o data assente - ${imagePath})`);
      try { await supabase.storage.from('images').remove([imagePath]); } catch (e) {}
      throw new Error('URL pubblico non restituito o dati mancanti da Supabase dopo il caricamento.');
    }

    const imageUrl = urlData.publicUrl;
    logger.log(`URL Pubblico ottenuto: ${imageUrl}`);
    return { url: imageUrl, path: imagePath };
  },

  // Delete a *single* image by path
  deleteImage: async (path: string): Promise<void> => {
    if (!path || typeof path !== 'string' || path.trim() === '') {
        logger.warn("Tentativo di cancellare un path non valido:", path); return; }
    logger.log("Tentativo cancellazione immagine singola:", path);
    const { data, error } = await supabase.storage.from('images').remove([path]);
    if (error) { logger.error(`Errore deleteImage (path: ${path}):`, error); throw new Error(`Errore cancellazione immagine ${path}: ${error.message}`); }
     logger.log(`Immagine singola cancellata con successo: ${path}`, data);
  },

   // Helper function to delete multiple images by their paths
   deleteMultipleImages: async (paths: string[]): Promise<void> => {
    await removeImagesSafely(paths);
   }
};


// ==========================
// Categorie Service (Categories)
// ==========================
export const categorieService = {
  // Get all categories
  getAllCategorie: async (): Promise<Array<{ nome?: string | null }>> => {
    const { data, error } = await supabase.from('categorie').select('*');

    if (error) {
        logger.error("Errore getAllCategorie:", error);
        throw error;
    }
    return (data ?? []).map((item) => convertTimestampToDate(item));
  }
};
