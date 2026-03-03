// src/supabase/services.ts
import { supabase } from './config';
import { v4 as uuidv4 } from 'uuid';
// Assicurati che questi tipi siano definiti correttamente, specialmente ProgettoData con 'immagini'
import { ProgettoData, CompetenzaData, OffertaLavoroData, ImmagineInfo } from '../types/supabaseTypes';
import { activityService } from './activityService'; // Assicurati che questo servizio sia definito e importato correttamente
import { logger } from '../utils/logger';


// Convertitore Timestamp (opzionale, dipende da come gestisci le date)
// Converte le colonne _at (stringa ISO da Supabase) in proprietà At (oggetti Date)
const convertTimestampToDate = (item: any) => {
  if (item && typeof item === 'object') {
    const newItem = { ...item };
    if (newItem.created_at) {
       newItem.createdAt = typeof newItem.created_at === 'string' ? new Date(newItem.created_at) : newItem.created_at;
       // delete newItem.created_at; // Opzionale: rimuovi originale
    }
    if (newItem.updated_at) {
       newItem.updatedAt = typeof newItem.updated_at === 'string' ? new Date(newItem.updated_at) : newItem.updated_at;
       // delete newItem.updated_at; // Opzionale: rimuovi originale
    }
    return newItem;
  }
  return item;
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
    return data.map(item => convertTimestampToDate(item)) as OffertaLavoroData[];
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
    const { data: currentUserData, error: userError } = await supabase.auth.getUser();
     if (userError) {
       logger.error("Errore ottenimento utente in createOfferta:", userError);
       throw userError;
     }
    const currentUser = currentUserData?.user;
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
    try {
        await activityService.logActivity({
          type: 'create',
          description: `Offerta "${offertaData.titolo}" creata`,
          user: currentUser?.email || 'utente_sconosciuto',
          entityType: 'offerta',
          entityId: newId
        });
    } catch (logError) {
        logger.error("Errore durante il logging (createOfferta):", logError);
    }

    return convertTimestampToDate(data) as OffertaLavoroData;
  },

  // Update an existing offer
  updateOfferta: async (id: string, offertaData: Partial<Omit<OffertaLavoroData, 'id' | 'created_at' | 'createdAt'>>): Promise<OffertaLavoroData> => {
    const { data: currentUserData, error: userError } = await supabase.auth.getUser();
     if (userError) {
       logger.error("Errore ottenimento utente in updateOfferta:", userError);
       throw userError;
     }
     const currentUser = currentUserData?.user;
    const existingOfferta = await offerteService.getOffertaById(id);
     if (!existingOfferta) {
       throw new Error(`Offerta con ID ${id} non trovata per l'aggiornamento.`);
     }

    const updatePayload = {
       ...offertaData,
       updated_at: new Date().toISOString()
    };
    // Rimuovi campi timestamp frontend se presenti
    delete (updatePayload as any).updatedAt;
    delete (updatePayload as any).createdAt;


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
    try {
        const titoloLog = offertaData.titolo || existingOfferta.titolo;
        await activityService.logActivity({
          type: 'update',
          description: `Offerta "${titoloLog}" aggiornata`,
          user: currentUser?.email || 'utente_sconosciuto',
          entityType: 'offerta',
          entityId: id
        });
    } catch (logError) {
        logger.error("Errore durante il logging (updateOfferta):", logError);
    }

    return convertTimestampToDate(data) as OffertaLavoroData;
  },

  // Delete an offer
  deleteOfferta: async (id: string): Promise<string> => {
     const { data: currentUserData, error: userError } = await supabase.auth.getUser();
      if (userError) {
        logger.error("Errore ottenimento utente in deleteOfferta:", userError);
        throw userError;
      }
      const currentUser = currentUserData?.user;
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
    try {
        await activityService.logActivity({
          type: 'delete',
          description: `Offerta "${existingOfferta.titolo}" eliminata`,
          user: currentUser?.email || 'utente_sconosciuto',
          entityType: 'offerta',
          entityId: id
        });
    } catch (logError) {
         logger.error("Errore durante il logging (deleteOfferta):", logError);
    }

    return id;
  }
};


// ==========================
// Progetti Service (Projects)
// ==========================
export const progettiService = {
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
    return data.map(item => convertTimestampToDate(item)) as ProgettoData[];
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
    const { data: currentUserData, error: userError } = await supabase.auth.getUser();
     if (userError) {
       logger.error("Errore ottenimento utente in createProject:", userError);
       throw userError;
     }
    const currentUser = currentUserData?.user;
    const newId = uuidv4();

    const insertPayload = {
        ...projectData,
        id: newId,
        created_at: new Date().toISOString(),
    };

    const { data, error } = await supabase.from('progetti').insert([insertPayload]).select().single();

    if (error) {
      logger.error("Errore createProject:", error);
      throw error;
    }

    // Log
    try {
        await activityService.logActivity({
          type: 'create',
          description: `Progetto "${projectData.titolo}" creato`,
          user: currentUser?.email || 'utente_sconosciuto',
          entityType: 'progetto',
          entityId: newId
        });
    } catch (logError) {
         logger.error("Errore durante il logging (createProject):", logError);
    }
    return convertTimestampToDate(data) as ProgettoData;
  },

  // Update an existing project by ID (UUID or numeric)
  updateProject: async (id: string, projectData: Partial<Omit<ProgettoData, 'id' | 'created_at' | 'id_numerico' | 'createdAt'>>): Promise<ProgettoData> => {
     const { data: currentUserData, error: userError } = await supabase.auth.getUser();
      if (userError) {
        logger.error("Errore ottenimento utente in updateProject:", userError);
        throw userError;
      }
     const currentUser = currentUserData?.user;

    const existingProject = await progettiService.getProjectById(id);
    if (!existingProject || !existingProject.id) {
        throw new Error(`Progetto con ID/ID_Numerico ${id} non trovato o ID mancante per l'aggiornamento.`);
    }
    const projectId = existingProject.id;

    const updatePayload = {
      ...projectData,
      updated_at: new Date().toISOString()
    };
    delete (updatePayload as any).updatedAt;
    delete (updatePayload as any).createdAt;

    const { data, error } = await supabase.from('progetti').update(updatePayload).eq('id', projectId).select().single();

    if (error) {
        logger.error("Errore updateProject (database):", error);
        throw error;
    }

    // Gestione Cancellazione Vecchie Immagini
    if (projectData.hasOwnProperty('immagini') && existingProject.immagini) {
        const oldPaths = existingProject.immagini.map(img => img.path).filter(p => p);
        const newPaths = (projectData.immagini || []).map(img => img.path).filter(p => p);
        const pathsToDelete = oldPaths.filter(oldPath => !newPaths.includes(oldPath));

        if (pathsToDelete.length > 0) {
            logger.log("Cancellazione immagini vecchie:", pathsToDelete);
            try { await progettiService.deleteMultipleImages(pathsToDelete); }
            catch (deleteError) { logger.error("Errore non bloccante cancellazione vecchie immagini:", deleteError); }
        }
    }

    // Log
    try {
        const titoloLog = projectData.titolo || existingProject.titolo;
        await activityService.logActivity({
          type: 'update',
          description: `Progetto "${titoloLog}" aggiornato`,
          user: currentUser?.email || 'utente_sconosciuto',
          entityType: 'progetto',
          entityId: projectId
        });
    } catch (logError) {
        logger.error("Errore durante il logging (updateProject):", logError);
    }
    return convertTimestampToDate(data) as ProgettoData;
  },

  // Delete a project by ID (UUID or numeric)
  deleteProject: async (id: string): Promise<string> => {
    const { data: currentUserData, error: userError } = await supabase.auth.getUser();
     if (userError) {
       logger.error("Errore ottenimento utente in deleteProject:", userError);
       throw userError;
     }
     const currentUser = currentUserData?.user;

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
    try {
        await activityService.logActivity({
          type: 'delete',
          description: `Progetto "${existingProject.titolo}" eliminato`,
          user: currentUser?.email || 'utente_sconosciuto',
          entityType: 'progetto',
          entityId: projectId
        });
     } catch (logError) {
          logger.error("Errore durante il logging (deleteProject):", logError);
     }
    return projectId;
  },

  // Upload a *single* image and return its public URL and path
  uploadImage: async (file: File, folder: string = 'progetti'): Promise<ImmagineInfo> => {
    const cleanFileName = file.name.replace(/[^a-zA-Z0-9.\-_]/g, '_');
    const filename = `${folder}/${uuidv4()}-${cleanFileName}`;

    logger.log(`Tentativo upload: ${filename}`);
    const { data: uploadData, error: uploadError } = await supabase
      .storage
      .from('images')
      .upload(filename, file, { cacheControl: '3600', upsert: false });

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

    // ULTIMO TENTATIVO: Cast esplicito a 'any' per bypassare il controllo TS sull'oggetto risultato
    const publicUrlResult: any = await supabase
      .storage
      .from('images')
      .getPublicUrl(imagePath);

     // Ora accediamo alle proprietà come se fosse un oggetto JavaScript normale
     const urlError = publicUrlResult.error;
     const urlData = publicUrlResult.data;

     if (urlError) {
        // L'errore esiste e viene loggato
        logger.error(`Errore uploadImage (GetPublicUrl - ${imagePath}):`, urlError);
        logger.warn(`Tentativo di rimozione del file ${imagePath} a causa di errore URL.`);
        try { await supabase.storage.from('images').remove([imagePath]); }
        catch (removeError) { logger.error(`Errore durante rimozione file ${imagePath}:`, removeError); }
        // Assicurati che urlError abbia una proprietà message o fornisci un fallback
        const errorMessage = (urlError as Error)?.message || 'Errore sconosciuto nell\'ottenere l\'URL pubblico';
        throw new Error(`Errore nell'ottenere l'URL pubblico: ${errorMessage}`);

     } else if (!urlData?.publicUrl) {
         // Non c'è errore, ma mancano i dati o l'URL specifico
         logger.error(`Errore uploadImage (URL pubblico mancante o data assente - ${imagePath})`);
         try { await supabase.storage.from('images').remove([imagePath]); } catch (e) {}
         throw new Error('URL pubblico non restituito o dati mancanti da Supabase dopo il caricamento.');
     } else {
         // Successo: non c'è errore e publicUrl esiste
         const imageUrl = urlData.publicUrl;
         logger.log(`URL Pubblico ottenuto: ${imageUrl}`);
         return { url: imageUrl, path: imagePath };
     }
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
    const validPaths = paths.filter(p => p && typeof p === 'string' && p.trim() !== '');
    if (validPaths.length === 0) { logger.log("Nessun path valido fornito per deleteMultipleImages."); return; }

    logger.log("Tentativo cancellazione multiple immagini:", validPaths);
    const { data, error } = await supabase.storage.from('images').remove(validPaths);

    if (error) {
        logger.error("Errore deleteMultipleImages:", error);
        // Rimosso controllo su 'data' dentro if(error)
        throw new Error(`Errore durante la cancellazione di una o più immagini: ${error.message}`);
    }
     logger.log("Immagini multiple cancellate con successo:", data);
   }
};


// ==========================
// Competenze Service (Skills)
// ==========================
export const competenzeService = {
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
    return data.map(item => convertTimestampToDate(item)) as CompetenzaData[];
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
    const { data: currentUserData, error: userError } = await supabase.auth.getUser();
     if (userError) {
       logger.error("Errore ottenimento utente in createCompetenza:", userError);
       throw userError;
     }
     const currentUser = currentUserData?.user;
    const newId = competenzaData.id || uuidv4();

    const { id: _id, ...restData } = competenzaData;

    const dataToInsert = { ...restData, id: newId, created_at: new Date().toISOString() };

    const { data, error } = await supabase.from('competenze').insert([dataToInsert]).select().single();

    if (error) {
        logger.error("Errore createCompetenza:", error);
        throw error;
    }

    // Log
     try {
        await activityService.logActivity({
          type: 'create',
          description: `Competenza "${competenzaData.titolo}" creata`,
          user: currentUser?.email || 'utente_sconosciuto',
          entityType: 'competenza',
          entityId: newId
        });
    } catch (logError) {
        logger.error("Errore durante il logging (createCompetenza):", logError);
    }
    return convertTimestampToDate(data) as CompetenzaData;
  },

  // Update an existing skill
  updateCompetenza: async (id: string, competenzaData: Partial<Omit<CompetenzaData, 'id' | 'created_at' | 'createdAt'>>): Promise<CompetenzaData> => {
    const { data: currentUserData, error: userError } = await supabase.auth.getUser();
     if (userError) {
       logger.error("Errore ottenimento utente in updateCompetenza:", userError);
       throw userError;
     }
     const currentUser = currentUserData?.user;
    
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

    const updatePayload = { ...competenzaData, updated_at: new Date().toISOString() };
    delete (updatePayload as any).updatedAt;
    delete (updatePayload as any).createdAt;

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
    try {
      const titoloLog = competenzaData.titolo || existingData.titolo;
      await activityService.logActivity({
        type: 'update',
        description: `Competenza "${titoloLog}" aggiornata`,
        user: currentUser?.email || 'utente_sconosciuto',
        entityType: 'competenza',
        entityId: id
      });
    } catch (logError) {
      logger.error("Errore durante il logging (updateCompetenza):", logError);
    }

    return convertTimestampToDate(updatedData) as CompetenzaData;
  },

  // Delete a skill
  deleteCompetenza: async (id: string): Promise<string> => {
     const { data: currentUserData, error: userError } = await supabase.auth.getUser();
      if (userError) {
        logger.error("Errore ottenimento utente in deleteCompetenza:", userError);
        throw userError;
      }
      const currentUser = currentUserData?.user;
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
     try {
        await activityService.logActivity({
          type: 'delete',
          description: `Competenza "${existingCompetenza.titolo}" eliminata`,
          user: currentUser?.email || 'utente_sconosciuto',
          entityType: 'competenza',
          entityId: id
        });
     } catch (logError) {
         logger.error("Errore durante il logging (deleteCompetenza):", logError);
     }

    return id;
  },

  // Upload a *single* image and return its public URL and path
  uploadImage: async (file: File, folder: string = 'competenze'): Promise<ImmagineInfo> => {
    const cleanFileName = file.name.replace(/[^a-zA-Z0-9.\-_]/g, '_');
    const filename = `${folder}/${uuidv4()}-${cleanFileName}`;

    logger.log(`Tentativo upload: ${filename}`);
    const { data: uploadData, error: uploadError } = await supabase
      .storage
      .from('images')
      .upload(filename, file, { cacheControl: '3600', upsert: false });

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

    // ULTIMO TENTATIVO: Cast esplicito a 'any' per bypassare il controllo TS sull'oggetto risultato
    const publicUrlResult: any = await supabase
      .storage
      .from('images')
      .getPublicUrl(imagePath);

     // Ora accediamo alle proprietà come se fosse un oggetto JavaScript normale
     const urlError = publicUrlResult.error;
     const urlData = publicUrlResult.data;

     if (urlError) {
        // L'errore esiste e viene loggato
        logger.error(`Errore uploadImage (GetPublicUrl - ${imagePath}):`, urlError);
        logger.warn(`Tentativo di rimozione del file ${imagePath} a causa di errore URL.`);
        try { await supabase.storage.from('images').remove([imagePath]); }
        catch (removeError) { logger.error(`Errore durante rimozione file ${imagePath}:`, removeError); }
        // Assicurati che urlError abbia una proprietà message o fornisci un fallback
        const errorMessage = (urlError as Error)?.message || 'Errore sconosciuto nell\'ottenere l\'URL pubblico';
        throw new Error(`Errore nell'ottenere l'URL pubblico: ${errorMessage}`);

     } else if (!urlData?.publicUrl) {
         // Non c'è errore, ma mancano i dati o l'URL specifico
         logger.error(`Errore uploadImage (URL pubblico mancante o data assente - ${imagePath})`);
         try { await supabase.storage.from('images').remove([imagePath]); } catch (e) {}
         throw new Error('URL pubblico non restituito o dati mancanti da Supabase dopo il caricamento.');
     } else {
         // Successo: non c'è errore e publicUrl esiste
         const imageUrl = urlData.publicUrl;
         logger.log(`URL Pubblico ottenuto: ${imageUrl}`);
         return { url: imageUrl, path: imagePath };
     }
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
    const validPaths = paths.filter(p => p && typeof p === 'string' && p.trim() !== '');
    if (validPaths.length === 0) { logger.log("Nessun path valido fornito per deleteMultipleImages."); return; }

    logger.log("Tentativo cancellazione multiple immagini:", validPaths);
    const { data, error } = await supabase.storage.from('images').remove(validPaths);

    if (error) {
        logger.error("Errore deleteMultipleImages:", error);
        // Rimosso controllo su 'data' dentro if(error)
        throw new Error(`Errore durante la cancellazione di una o più immagini: ${error.message}`);
    }
     logger.log("Immagini multiple cancellate con successo:", data);
   }
};


// ==========================
// Categorie Service (Categories)
// ==========================
export const categorieService = {
  // Get all categories
  getAllCategorie: async (): Promise<any[]> => { // Usa un tipo specifico se disponibile
    const { data, error } = await supabase.from('categorie').select('*');

    if (error) {
        logger.error("Errore getAllCategorie:", error);
        throw error;
    }
    return data.map(item => convertTimestampToDate(item));
  }
};
