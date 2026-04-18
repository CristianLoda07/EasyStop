import { createClient } from '@supabase/supabase-js';

// Recuperiamo le chiavi dalle variabili d'ambiente (file .env.local)
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Controllo di sicurezza: se le chiavi mancano, avvisiamo lo sviluppatore
if (!supabaseUrl || !supabaseAnonKey) {
  console.error(
    "ERRORE: Variabili d'ambiente Supabase non trovate! " +
    "Assicurati di avere un file .env.local nella root del progetto con " +
    "VITE_SUPABASE_URL e VITE_SUPABASE_ANON_KEY."
  );
}

// Inizializzazione e esportazione del client Supabase
export const supabase = createClient(supabaseUrl, supabaseAnonKey);