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

# EasyStop

