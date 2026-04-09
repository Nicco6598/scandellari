// src/types/supabaseTypes.ts

// Interfaccia per la struttura di ogni immagine memorizzata (URL pubblico e path per la cancellazione)
export interface ImmagineInfo {
  url: string; // URL pubblico per visualizzare l'immagine
  path: string; // Path nel bucket Supabase Storage, necessario per la cancellazione
}

export interface CoordinateInfo {
  lat: number;
  lng: number;
}

export interface ProgettoData {
  id?: string; // UUID gestito da Supabase/servizio
  id_numerico?: number; // ID numerico sequenziale opzionale
  titolo: string;
  descrizione: string; // Descrizione breve/intro
  descrizioneLunga?: string; // Descrizione dettagliata
  categoria: string; // Riferimento a una categoria (es. 'Web Development', 'UI/UX Design')
  localita: string; // Luogo di realizzazione/cliente
  anno: string; // Anno di completamento/inizio
  cliente?: string; // Nome del cliente
  durata?: string; // Durata del progetto (es. '3 mesi', 'Continuativo')
  tecnologie?: string[]; // Array di tecnologie utilizzate (es. ['React', 'Node.js', 'PostgreSQL'])
  caratteristiche?: string[]; // Array di caratteristiche chiave del progetto
  risultati?: string[]; // Array di risultati ottenuti
  sfide?: string[]; // Array di sfide affrontate
  coordinatePunti?: CoordinateInfo[]; // Coordinate persistite opzionali per i punti del progetto
  coordinatePercorso?: CoordinateInfo[]; // Percorso persistito opzionale per la mappa
  coordinate_punti?: CoordinateInfo[]; // Compatibilità con possibili colonne snake_case
  coordinate_percorso?: CoordinateInfo[]; // Compatibilità con possibili colonne snake_case
  // Sostituito 'immaginiGalleria' con 'immagini' che contiene oggetti ImmagineInfo
  immagini?: ImmagineInfo[]; // Array di oggetti contenenti URL e path delle immagini
  created_at?: string | Date; // Timestamp di creazione (Supabase usa stringa ISO)
  updated_at?: string | Date; // Timestamp di ultima modifica (Supabase usa stringa ISO)

  // NOTA: Ho usato created_at/updated_at per coerenza con i nomi delle colonne Supabase,
  // ma puoi mantenere createdAt/updatedAt se preferisci e gestire la mappatura.
}

export interface CompetenzaData {
  id?: string;
  titolo: string;
  categoria: string;
  descrizioneBreve: string;
  descrizioneLunga: string;
  icona: string; // Nome/path dell'icona rappresentativa
  caratteristiche?: string[];
  lineeUtilizzo?: string[];
  applicazioni?: string[];
  immagine?: ImmagineInfo; // Mantenuto per retrocompatibilità
  immagini?: ImmagineInfo[]; // Array di immagini per la galleria
  created_at?: string | Date;
  updated_at?: string | Date;
}

export interface OffertaLavoroData {
  id?: string;
  titolo: string;
  dipartimento: string;
  sede: string;
  tipo: 'Full-time' | 'Part-time' | 'Contratto' | 'Stage' | 'Collaborazione'; // Aggiunto Stage/Collaborazione?
  descrizione: string;
  requisiti: string[];
  responsabilita: string[];
  created_at?: string | Date;
  updated_at?: string | Date;
}

// Alias per ProgettoData (opzionale, ma può essere utile)
export type ProjectType = ProgettoData;

// Tipo per le attività recenti (per il log)
export interface RecentActivity {
  id: string; // UUID del log
  // Assicurati che questa sia l'unica definizione del campo 'type'
  type: 'create' | 'update' | 'delete' | 'login' | 'logout' | 'error' | 'info'; // Tipi di log possibili
  description: string; // Descrizione dell'attività
  timestamp: string; // Timestamp ISO dell'evento
  user?: string; // Email o ID dell'utente che ha eseguito l'azione
  entityType?: 'progetto' | 'offerta' | 'competenza' | 'user' | 'system'; // Tipo di entità coinvolta
  entityId?: string; // ID dell'entità coinvolta
  details?: Record<string, any>; // Dettagli aggiuntivi in formato JSON (opzionale)
}
