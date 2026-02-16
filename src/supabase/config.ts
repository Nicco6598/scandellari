// src/supabase/config.ts
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  // Logga l'errore sulla console per debugging
  console.error('ERRORE CRITICO: Variabili d\'ambiente Supabase mancanti! Controlla il file .env.local o le variabili d\'ambiente del server.');
  // Lancia un errore per bloccare l'inizializzazione dell'app con configurazione invalida
  throw new Error('Variabili d\'ambiente Supabase mancanti. Impossibile inizializzare Supabase.');
}

// A questo punto, siamo sicuri che le variabili non siano undefined
export const supabase = createClient(supabaseUrl, supabaseAnonKey);
