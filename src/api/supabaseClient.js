import { createClient } from '@supabase/supabase-js';

const supabaseUrl = (import.meta.env.VITE_SUPABASE_URL || '').trim();
const supabaseAnonKey = (
  import.meta.env.VITE_SUPABASE_ANON_KEY ||
  import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY ||
  ''
).trim();

if (!supabaseUrl || !supabaseAnonKey) {
  console.error(
    "ERRORE: Variabili d'ambiente Supabase non trovate! " +
    "Assicurati di avere VITE_SUPABASE_URL e VITE_SUPABASE_ANON_KEY (o VITE_SUPABASE_PUBLISHABLE_KEY)."
  );
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
  },
});

const PROFILI_TABLE = 'utenti';

// Mappa le colonne reali del DB ai nomi usati nell'app
// DB reale:  id_user | nome | cognome | telefono | isdisable | ispregnant | ruolo | data_creazione
// App usa:   id      | full_name (nome+cognome) | email (da auth) | is_disable | is_pregnant | role

/**
 * Converte una riga del DB nel formato usato dall'app,
 * arricchendola con l'email proveniente da Supabase Auth.
 */
function dbToApp(row, authEmail = '') {
  if (!row) return null;
  return {
    id:          row.id_user,
    full_name:   [row.nome, row.cognome].filter(Boolean).join(' '),
    nome:        row.nome,
    cognome:     row.cognome,
    email:       authEmail || '',
    telefono:    row.telefono || '',
    is_disable:  row.isdisable ?? false,
    is_pregnant: row.ispregnant ?? false,
    is_active:   row.isActive ?? row.is_active ?? false,
    role:        row.ruolo || 'user',
    created_at:  row.data_creazione,
  };
}

/**
 * Converte gli aggiornamenti dal formato app al formato DB.
 */
function appToDB(updates) {
  const mapped = {};
  if ('nome' in updates)        mapped.nome = updates.nome;
  if ('cognome' in updates)     mapped.cognome = updates.cognome;
  if ('telefono' in updates)    mapped.telefono = updates.telefono;
  if ('is_disable' in updates)  mapped.isdisable = updates.is_disable;
  if ('is_pregnant' in updates) mapped.ispregnant = updates.is_pregnant;
  if ('is_active' in updates)   mapped.isActive = updates.is_active;
  if ('role' in updates)        mapped.ruolo = updates.role;
  // full_name → nome + cognome (se passato come unico campo)
  if ('full_name' in updates && !('nome' in updates)) {
    const parts = (updates.full_name || '').split(' ');
    mapped.nome    = parts[0] || '';
    mapped.cognome = parts.slice(1).join(' ') || '';
  }
  return mapped;
}

// ============================================================
// AUTENTICAZIONE
// ============================================================

export const auth = {
  register: async (email, password, full_name) => {
    try {
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
        options: { data: { full_name } },
      });

      if (authError) throw authError;
      if (!authData.user) throw new Error('Registrazione completata ma utente non disponibile');

      // Suddivide full_name in nome + cognome
      const parts = (full_name || '').split(' ');
      const nome    = parts[0] || '';
      const cognome = parts.slice(1).join(' ') || '';

      const { error: profileError } = await supabase
        .from(PROFILI_TABLE)
        .upsert([{
          id_user:    authData.user.id,
          nome,
          cognome,
          telefono:   '',
          isdisable:  false,
          ispregnant: false,
          isActive:   false,
          ruolo:      'user',
        }], { onConflict: 'id_user' });

      if (profileError) throw profileError;

      return authData.user;
    } catch (error) {
      throw new Error(`Errore registrazione: ${error.message}`);
    }
  },

  login: async (email, password) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw error;

      if (data.user) {
        // Aggiorna isActive a TRUE al login
        await supabase
          .from(PROFILI_TABLE)
          .update({ isActive: true })
          .eq('id_user', data.user.id);
      }

      return data.user;
    } catch (error) {
      throw new Error(`Errore login: ${error.message}`);
    }
  },

  me: async () => {
    try {
      const { data: { user }, error } = await supabase.auth.getUser();
      if (error) throw error;
      if (!user) throw new Error('Utente non autenticato');

      const { data: profile, error: profileError } = await supabase
        .from(PROFILI_TABLE)
        .select('*')
        .eq('id_user', user.id)
        .single();

      if (profileError && profileError.code !== 'PGRST116') throw profileError;

      // Restituisce il profilo mappato con l'email da auth
      return dbToApp(profile, user.email) || { id: user.id, email: user.email, role: 'user' };
    } catch (error) {
      throw new Error(`Errore recupero utente: ${error.message}`);
    }
  },

  logout: async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        // Aggiorna isActive a FALSE al logout
        await supabase
          .from(PROFILI_TABLE)
          .update({ isActive: false })
          .eq('id_user', user.id);
      }

      const { error } = await supabase.auth.signOut();
      if (error) throw error;
    } catch (error) {
      throw new Error(`Errore logout: ${error.message}`);
    }
  },

  onAuthStateChanged: (callback) => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      callback(!!session);
    });
    return () => subscription.unsubscribe();
  },

  updateMe: async (updates) => {
    try {
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError) throw userError;
      if (!user) throw new Error('Utente non autenticato');

      const dbUpdates = appToDB(updates);

      const { data, error } = await supabase
        .from(PROFILI_TABLE)
        .update(dbUpdates)
        .eq('id_user', user.id)
        .select()
        .single();

      if (error) throw error;
      return dbToApp(data, user.email);
    } catch (error) {
      throw new Error(`Errore aggiornamento profilo: ${error.message}`);
    }
  },
};

// ============================================================
// HELPER GENERICI PER ENTITÀ
// ============================================================

function makeEntity(tableName) {
  // Mappa la chiave primaria per ogni tabella
  const PK_MAP = {
    utenti:       'id_user',
    veicoli:      'id_vcl',
    parcheggi:    'id_park',
    prenotazioni: 'id_prenotazione',
  };
  const pkField = PK_MAP[tableName] || 'id';

  return {
    list: async () => {
      try {
        const { data, error } = await supabase.from(tableName).select('*');
        if (error) throw error;
        if (tableName === PROFILI_TABLE) {
          // Recupera le email da auth solo per admin (best-effort)
          return (data || []).map(r => dbToApp(r));
        }
        return data || [];
      } catch (error) {
        throw new Error(`Errore lettura ${tableName}: ${error.message}`);
      }
    },

    filter: async (filters = {}, sort = null, limit = null) => {
      try {
        let query = supabase.from(tableName).select('*');
        Object.entries(filters).forEach(([key, value]) => {
          query = query.eq(key, value);
        });
        if (sort) {
          const desc = sort.startsWith('-');
          const key = desc ? sort.slice(1) : sort;
          query = query.order(key, { ascending: !desc });
        }
        if (limit) query = query.limit(limit);
        const { data, error } = await query;
        if (error) throw error;
        const rows = data || [];
        return tableName === PROFILI_TABLE ? rows.map(r => dbToApp(r)) : rows;
      } catch (error) {
        throw new Error(`Errore filtro ${tableName}: ${error.message}`);
      }
    },

    get: async (id) => {
      try {
        const { data, error } = await supabase
          .from(tableName).select('*').eq(pkField, id).single();
        if (error && error.code !== 'PGRST116') throw error;
        return tableName === PROFILI_TABLE ? dbToApp(data) : (data || null);
      } catch (error) {
        throw new Error(`Errore lettura ${tableName}(${id}): ${error.message}`);
      }
    },

    create: async (data) => {
      try {
        const { data: newRecord, error } = await supabase
          .from(tableName).insert([data]).select().single();
        if (error) throw error;
        return tableName === PROFILI_TABLE ? dbToApp(newRecord) : newRecord;
      } catch (error) {
        throw new Error(`Errore creazione ${tableName}: ${error.message}`);
      }
    },

    update: async (id, data) => {
      try {
        const { data: updated, error } = await supabase
          .from(tableName).update(data).eq(pkField, id).select().single();
        if (error) throw error;
        return tableName === PROFILI_TABLE ? dbToApp(updated) : updated;
      } catch (error) {
        throw new Error(`Errore aggiornamento ${tableName}(${id}): ${error.message}`);
      }
    },

    delete: async (id) => {
      try {
        const { error } = await supabase.from(tableName).delete().eq(pkField, id);
        if (error) throw error;
      } catch (error) {
        throw new Error(`Errore eliminazione ${tableName}(${id}): ${error.message}`);
      }
    },
  };
}

// ============================================================
// OPERAZIONI ATOMICHE CON RPC
// ============================================================

export const booking = {
  createAtomic: async (prenotazioneData) => {
    try {
      const { data, error } = await supabase.rpc('create_prenotazione_atomica', {
        p_veicolo_id:            prenotazioneData.veicolo_id,
        p_parcheggio_id:         prenotazioneData.parcheggio_id,
        p_parcheggio_nome:       prenotazioneData.parcheggio_nome,
        p_veicolo_targa:         prenotazioneData.veicolo_targa,
        p_inizio_sosta:          prenotazioneData.inizio_sosta,
        p_fine_sosta:            prenotazioneData.fine_sosta,
        p_tipo_posto:            prenotazioneData.tipo_posto,
        p_prezzo_tot:            prenotazioneData.prezzo_tot,
        p_codice_qr:             prenotazioneData.codice_qr,
        p_alimentazione_veicolo: prenotazioneData.alimentazione_veicolo,
        p_risparmio_co2:         prenotazioneData.risparmio_co2,
      });
      if (error) throw error;
      if (data && !data.success) throw new Error(data.error || 'Errore creazione prenotazione');
      return data;
    } catch (error) {
      throw new Error(`Errore creazione prenotazione atomica: ${error.message}`);
    }
  },

  cancelAtomic: async (prenotazioneId) => {
    try {
      const { data, error } = await supabase.rpc('cancel_prenotazione_atomica', {
        p_prenotazione_id: prenotazioneId,
      });
      if (error) throw error;
      if (data && !data.success) throw new Error(data.error || 'Errore cancellazione prenotazione');
      return data;
    } catch (error) {
      throw new Error(`Errore cancellazione prenotazione atomica: ${error.message}`);
    }
  },
};

// ============================================================
// ESPORTA LE ENTITÀ
// ============================================================

export const entities = {
  Parcheggio:   makeEntity('parcheggi'),
  Prenotazione: makeEntity('prenotazioni'),
  Veicolo:      makeEntity('veicoli'),
  User:         makeEntity(PROFILI_TABLE),
};

export const base44 = { auth, entities, booking };
export default supabase;