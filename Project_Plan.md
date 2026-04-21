PIANO DI PROGETTO
- Back-End in Python
  - DB: Supabase
    - TABELLE:
      - Utenti (
        id_User uuid REFERENCES auth.users ON DELETE CASCADE NOT NULL PRIMARY KEY,
        nome TEXT,
        cognome TEXT,
        telefono TEXT,
        isDisable BOOLEAN DEFAULT FALSE,
        isPregnant BOOLEAN DEFAULT FALSE,
        data_creazione TIMESTAMPZ DEFAULT NOW()
        )
      - Veicoli (
        id_Vcl uuid DEFAULT gen_random_uuid() PRIMARY KEY,
        targa TEXT UNIQUE NOT NULL,
        marca TEXT,
        type_Vcl TEXT CHECK (type_Vcl IN ('auto', 'moto', 'van', 'suv')),
        alimentazione TEXT CHECK (alimentazione IN ('benzina','diesel','elettrica','ibrida','gpl','metano')),
        isDefault BOOLEAN DEFAULT FALSE,
        dataInserimento TIMESTAMPZ DEFAULT NOW
        FOREIGN KEY id_User REFERENCES Utenti(id_User)
      )
      - Parcheggi (
        id_Park uuid DEFAULT gen_random_uuid() PRIMARY KEY,
        park_Name TEXT NOT NULL,
        address TEXT NOT NULL,
        lat DECIMAL(9,6),
        long DECIMAL(9,6),
        posti_tot INTEGER NOT NULL,
        posti_dis INTEGER DEFAULT 0,
        posti_rosa INTEGER DEFAULT 0,
        tariffa_oraria DECIMAL(10, 2) NOT NULL,
        altezza_max_metri DECIMAL(3, 2),
        servizi JSONB DEFAULT '{}'::jsonb -- Esempio: {"ev_charge": true, "coperto": false}
      )
      - Prenotazioni (
        id_Prenotazione uuid DEFAULT gen_random_uuid() PRIMARY KEY,
        id_User uuid REFERENCES Utenti(id_User) ON DELETE CASCADE NOT NULL,
        id_Vcl uuid REFERENCES Veicoli(id_Vcl) NOT NULL,
        id_Park uuid REFERENCES Parcheggi(id_Park) ON DELETE CASCADE NOT NULL,
        inizio_sosta TIMESTAMPTZ NOT NULL,
        fine_sosta TIMESTAMPTZ NOT NULL,
        tipo_posto_prenotato TEXT DEFAULT 'standard' CHECK (tipo_posto_prenotato IN ('standard', 'disabili', 'rosa')),
        prezzo_tot DECIMAL(10, 2),
        stato TEXT DEFAULT 'confermata' CHECK (stato IN ('confermata', 'in_corso', 'completata', 'cancellata')),
        codice_qr TEXT UNIQUE,
        created_at TIMESTAMPTZ DEFAULT NOW()
      )
  - Verifica Email tramite Supabase
  - Autorizzazione in base ai ruoli: User (tutti gli user normali), Admin (accesso completo, solo gli sviluppatori)
- Front-End in React
1. Mappa Parcheggi: Leaflet, pop up per ogni parcheggio con un menù a tendina, contenente il luogo, la via, la distanza dalla propria posizione (se attivata), stato (disponibile, prenotato, occupato), orari ed eventuali tariffe
2. Filtro parcheggi
3. Lista parcheggi
4. Gestione interazione parcheggi (prenotazione, annullamento)
5. Navigazione al parcheggio più vicino
6. Inserimento specifiche veicolo
7. Gestione Utenti (Autenticazione, MFA e Autorizzazione)
8. Grafica che gasa
