# EasyStop – Brescia Green Parking

Applicazione web per la gestione e prenotazione di parcheggi a Brescia, con focus sulla sostenibilità ambientale.

## Stack Tecnico

- **Frontend**: React 18 + Vite + Tailwind CSS v3 + shadcn/ui
- **Mappa**: React-Leaflet (OpenStreetMap)
- **Backend & DB**: Supabase (Auth + PostgreSQL)
- **State**: TanStack Query (server state) + React Context (auth)

## Setup

1. Clona il repository
2. Installa le dipendenze:
   ```bash
   npm install
   ```
3. Copia il file di ambiente e configura le credenziali Supabase:
   ```bash
   cp .env.example .env.local
   ```
   Inserisci `VITE_SUPABASE_URL` e `VITE_SUPABASE_ANON_KEY` dal tuo progetto Supabase.

4. Avvia il server di sviluppo:
   ```bash
   npm run dev
   ```

## Struttura del Progetto

```
src/
├── api/
│   └── supabaseClient.js   # Client Supabase + helpers auth/entities/booking
├── components/
│   ├── admin/              # Componenti pannello admin
│   ├── booking/            # Form prenotazione, QR code, card
│   ├── layout/             # AppLayout con sidebar navigazione
│   ├── map/                # Marker, popup, filtri mappa
│   ├── ui/                 # Componenti shadcn/ui
│   └── vehicle/            # Gestione veicoli utente
├── hooks/
│   ├── useParking.js       # Hook per fetch parcheggi da Supabase
│   └── use-mobile.jsx      # Hook responsive
├── lib/
│   ├── AuthContext.jsx     # Context autenticazione globale
│   ├── bresciaCoords.js    # Coordinate centro mappa
│   ├── greenUtils.js       # Calcoli CO₂, prezzi, QR code
│   └── utils.js            # Utility generiche
└── pages/
    ├── LoginPage.jsx
    ├── RegisterPage.jsx
    ├── MapPage.jsx          # Mappa principale con filtri e prenotazione
    ├── UserDashboard.jsx
    ├── BookingsPage.jsx
    ├── ProfilePage.jsx
    └── admin/              # Dashboard, parcheggi, utenti admin
```

## Entità Database

Le definizioni SQL si trovano in `entities/`:
- `Utente.sql`
- `Parcheggio.sql`
- `Prenotazione.sql`
- `Veicolo.sql`
