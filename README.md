<div align="center">

# 🅿️ EasyStop

### *Smart Parking. Cleaner City.*

**EasyStop** è un'applicazione web per la gestione intelligente dei parcheggi di Brescia, progettata per ridurre l'inquinamento urbano, diminuire le emissioni di CO₂ e semplificare la vita degli automobilisti.

[![React](https://img.shields.io/badge/React-18.2-61DAFB?logo=react&logoColor=white)](https://react.dev/)
[![Vite](https://img.shields.io/badge/Vite-6.1-646CFF?logo=vite&logoColor=white)](https://vitejs.dev/)
[![Supabase](https://img.shields.io/badge/Supabase-BaaS-3ECF8E?logo=supabase&logoColor=white)](https://supabase.com/)
[![TailwindCSS](https://img.shields.io/badge/TailwindCSS-3.4-06B6D4?logo=tailwindcss&logoColor=white)](https://tailwindcss.com/)
[![License](https://img.shields.io/badge/License-Private-red)](./LICENSE)

</div>

---

## 📖 Indice

- [Il Problema](#-il-problema)
- [La Soluzione](#-la-soluzione)
- [Funzionalità](#-funzionalità)
- [Tech Stack](#-tech-stack)
- [Architettura del Progetto](#-architettura-del-progetto)
- [Database — Entità](#-database--entità)
- [Installazione e Avvio](#-installazione-e-avvio)
- [Configurazione Supabase](#-configurazione-supabase)
- [Variabili d'Ambiente](#-variabili-dambiente)
- [Script Disponibili](#-script-disponibili)
- [Struttura delle Route](#-struttura-delle-route)
- [Modulo Green — Calcolo CO₂](#-modulo-green--calcolo-co)
- [Ruoli e Permessi](#-ruoli-e-permessi)
- [Contribuire](#-contribuire)

---

## 🌍 Il Problema

Nelle città italiane, una quota significativa del traffico urbano è generata da automobilisti che girano alla ricerca di un parcheggio libero. Questo fenomeno — noto come *cruising* — produce emissioni inutili di CO₂, congestione stradale e frustrazione per i guidatori. A Brescia, con i suoi oltre 26 parcheggi pubblici e un alto flusso di pendolari, il problema è particolarmente sentito.

---

## 💡 La Soluzione

**EasyStop** risolve il problema alla radice: prima ancora di mettersi in auto, l'utente sa esattamente **dove** c'è un posto libero, **quanto costa** e quanto CO₂ risparmierà rispetto a un veicolo a benzina.

L'applicazione integra:

- una **mappa interattiva in tempo reale** dei parcheggi bresciani
- un sistema di **prenotazione con QR code**
- un **calcolatore di risparmio CO₂** basato sul tipo di alimentazione del veicolo
- un pannello **amministrativo completo** per la gestione operativa

---

## ✨ Funzionalità

### Per gli Utenti

| Funzionalità | Descrizione |
|---|---|
| 🗺️ **Mappa Interattiva** | Visualizza tutti i parcheggi di Brescia su mappa Leaflet con marker colorati in base all'occupazione |
| 🔍 **Filtri Avanzati** | Filtra per disponibilità, posti disabili, posti rosa e tariffa massima oraria |
| 📍 **Geolocalizzazione** | Centra la mappa sulla posizione dell'utente con un click |
| 📅 **Prenotazione** | Prenota un posto scegliendo data/ora di inizio e fine sosta, tipo posto (standard/disabili/rosa) |
| 🔖 **QR Code** | Ogni prenotazione genera un codice QR univoco (`ES-xxxxxxxx-xxxxxxxx`) per l'accesso al parcheggio |
| 🚗 **Gestione Veicoli** | Registra più veicoli (auto, moto, van, SUV) con tipo di alimentazione e scegli il veicolo di default |
| 🌿 **Impronta CO₂** | A ogni prenotazione viene calcolato e salvato il risparmio di emissioni CO₂ rispetto a un veicolo a benzina |
| 📊 **Dashboard Personale** | Riepilogo prenotazioni attive, completate, veicoli registrati e CO₂ risparmiata totale |
| 👤 **Profilo Utente** | Gestione dati personali, telefono, flag disabilità e gravidanza (abilitano automaticamente posti speciali) |
| 📋 **Storico Prenotazioni** | Lista completa delle prenotazioni con stato (confermata / in corso / completata / cancellata) |

### Per gli Amministratori

| Funzionalità | Descrizione |
|---|---|
| 📈 **Dashboard Admin** | KPI in tempo reale: prenotazioni totali/oggi, utenti attivi, parcheggi attivi, CO₂ risparmiata |
| 🥧 **Grafici Statistici** | Pie chart per stato prenotazioni, bar chart per top parcheggi più utilizzati |
| 🅿️ **Gestione Parcheggi** | CRUD completo: aggiungi, modifica o disattiva parcheggi con nome, indirizzo, coordinate, capienza, tariffa |
| 👥 **Gestione Utenti** | Visualizza tutti gli utenti registrati, ruoli e stato |
| 📋 **Gestione Prenotazioni** | Tabella completa di tutte le prenotazioni con filtri e dettagli |

---

## 🛠️ Tech Stack

### Frontend

| Tecnologia | Versione | Utilizzo |
|---|---|---|
| [React](https://react.dev/) | 18.2 | UI library |
| [Vite](https://vitejs.dev/) | 6.1 | Build tool & dev server |
| [React Router DOM](https://reactrouter.com/) | 6.26 | Client-side routing |
| [TanStack Query](https://tanstack.com/query) | 5 | Server state management & caching |
| [React Leaflet](https://react-leaflet.js.org/) + [Leaflet](https://leafletjs.com/) | 4.2 / 1.9 | Mappa interattiva |
| [Recharts](https://recharts.org/) | 2.15 | Grafici statistici (bar, pie) |
| [React Hook Form](https://react-hook-form.com/) + [Zod](https://zod.dev/) | 7.54 / 3.24 | Form e validazione schema |
| [Framer Motion](https://www.framer.com/motion/) | 11 | Animazioni UI |
| [shadcn/ui](https://ui.shadcn.com/) + [Radix UI](https://www.radix-ui.com/) | — | Componenti UI accessibili |
| [TailwindCSS](https://tailwindcss.com/) | 3.4 | Utility-first styling |
| [Lucide React](https://lucide.dev/) | 0.475 | Icone |
| [Sonner](https://sonner.emilkowal.ski/) | 2 | Toast notifications |
| [date-fns](https://date-fns.org/) | 3 | Manipolazione date |

### Backend & Infrastruttura

| Tecnologia | Utilizzo |
|---|---|
| [Supabase](https://supabase.com/) | Database PostgreSQL, autenticazione, Row Level Security |
| Supabase Auth | Login/registrazione, sessioni JWT, gestione ruoli |
| Supabase RLS | Politiche di sicurezza per-riga per proteggere i dati degli utenti |

### Tooling

| Strumento | Utilizzo |
|---|---|
| ESLint 9 | Linting del codice (con plugin react, react-hooks, unused-imports) |
| TypeScript (`jsconfig.json`) | Type checking opzionale |
| PostCSS + Autoprefixer | Processing CSS |

---

## 🏗️ Architettura del Progetto

```
EasyStop/
├── src/
│   ├── api/
│   │   └── supabaseClient.js       # Client Supabase + helper entità (base44)
│   ├── components/
│   │   ├── admin/
│   │   │   └── ParkingFormDialog.jsx    # Form modale aggiunta/modifica parcheggio
│   │   ├── booking/
│   │   │   ├── BookingCard.jsx          # Card prenotazione con stato e QR
│   │   │   ├── BookingForm.jsx          # Form prenotazione completo
│   │   │   ├── EmptyVehicleState.jsx    # Stato vuoto senza veicoli registrati
│   │   │   └── QRCodeDisplay.jsx        # Visualizzazione QR code
│   │   ├── layout/
│   │   │   └── AppLayout.jsx            # Layout principale con sidebar
│   │   ├── map/
│   │   │   ├── ParkingFilters.jsx       # Pannello filtri parcheggio
│   │   │   ├── ParkingMarker.jsx        # Marker Leaflet personalizzato
│   │   │   ├── ParkingPopup.jsx         # Popup info parcheggio su mappa
│   │   │   ├── ParkingStatusBar.jsx     # Barra stato occupazione
│   │   │   └── UserLocationMarker.jsx   # Marker posizione utente
│   │   ├── ui/                          # Componenti shadcn/ui (accordion, dialog, ...)
│   │   ├── vehicle/
│   │   │   ├── VehicleCard.jsx          # Card veicolo con azioni
│   │   │   └── VehicleForm.jsx          # Form aggiunta/modifica veicolo
│   │   ├── AdminProtectedRoute.jsx      # Guard route solo admin
│   │   ├── ProtectedRoute.jsx           # Guard route autenticati
│   │   └── UserNotRegisteredError.jsx   # Errore utente non registrato nel DB
│   ├── hooks/
│   │   ├── use-mobile.jsx               # Hook rilevamento viewport mobile
│   │   └── useParking.js                # Hook utility parcheggi
│   ├── lib/
│   │   ├── AuthContext.jsx              # Context autenticazione globale
│   │   ├── PageNotFound.jsx             # Pagina 404
│   │   ├── app-params.js                # Parametri applicazione
│   │   ├── bresciaCoords.js             # Coordinate 26 parcheggi bresciani
│   │   ├── greenUtils.js                # Calcolo CO₂, distanza Haversine, prezzi
│   │   ├── query-client.js              # Istanza TanStack Query
│   │   └── utils.js                     # Utilities (cn, clsx)
│   ├── pages/
│   │   ├── admin/
│   │   │   ├── AdminBookings.jsx        # Gestione prenotazioni (admin)
│   │   │   ├── AdminDashboard.jsx       # Dashboard con KPI e grafici
│   │   │   ├── AdminParkings.jsx        # Gestione parcheggi (admin)
│   │   │   └── AdminUsers.jsx           # Gestione utenti (admin)
│   │   ├── BookingsPage.jsx             # Storico prenotazioni utente
│   │   ├── LoginPage.jsx                # Pagina login
│   │   ├── MapPage.jsx                  # Pagina principale — mappa Leaflet
│   │   ├── ProfilePage.jsx              # Profilo e impostazioni utente
│   │   ├── RegisterPage.jsx             # Registrazione nuovo utente
│   │   └── UserDashboard.jsx            # Dashboard personale utente
│   ├── App.jsx                          # Root component + router
│   ├── main.jsx                         # Entry point React
│   └── index.css                        # CSS globale + variabili tema
├── entities/
│   ├── Parcheggio.sql                   # Schema entità Parcheggio
│   ├── Prenotazione.sql                 # Schema entità Prenotazione
│   ├── Utente.sql                       # Script SQL tabella utenti + RLS
│   └── Veicolo.sql                      # Schema entità Veicolo
├── dist/                                # Build di produzione (generato da Vite)
├── .env                                 # Variabili d'ambiente (NON committare)
├── vite.config.js
├── tailwind.config.js
├── postcss.config.js
├── jsconfig.json
└── package.json
```

---

## 🗄️ Database — Entità

EasyStop usa **Supabase (PostgreSQL)** come backend. Il database è organizzato in quattro entità principali.

### `utenti`

Estende `auth.users` di Supabase con dati di profilo aggiuntivi.

| Campo | Tipo | Descrizione |
|---|---|---|
| `id` | `uuid` (PK) | Collegato a `auth.users.id` |
| `email` | `text` | Email dell'utente |
| `full_name` | `text` | Nome completo |
| `telefono` | `text` | Numero di telefono |
| `is_disable` | `boolean` | Flag portatore di disabilità |
| `is_pregnant` | `boolean` | Flag gravidanza (accesso posti rosa) |
| `role` | `text` | Ruolo: `user` \| `admin` |
| `created_at` | `timestamptz` | Data creazione |

> **Row Level Security**: ogni utente può leggere e modificare solo il proprio profilo. Gli admin possono leggere tutti i profili.

---

### `veicoli`

| Campo | Tipo | Descrizione |
|---|---|---|
| `targa` | `string` (required) | Targa del veicolo |
| `marca` | `string` | Marca del veicolo |
| `type_vcl` | `enum` | `auto` \| `moto` \| `van` \| `suv` |
| `alimentazione` | `enum` | `benzina` \| `diesel` \| `elettrica` \| `ibrida` \| `gpl` \| `metano` |
| `is_default` | `boolean` | Veicolo predefinito per le prenotazioni |

---

### `parcheggi`

| Campo | Tipo | Descrizione |
|---|---|---|
| `park_name` | `string` (required) | Nome del parcheggio |
| `address` | `string` | Indirizzo |
| `lat` / `lng` | `number` | Coordinate geografiche |
| `capacita` | `number` (required) | Numero totale di posti |
| `posti_liberi` | `number` | Posti attualmente liberi (calcolato live) |
| `posti_dis` | `boolean` | Presenza posti disabili |
| `posti_rosa` | `boolean` | Presenza posti rosa |
| `tariffa_oraria` | `number` | Tariffa oraria in euro |
| `is_active` | `boolean` | Parcheggio attivo nel sistema |

---

### `prenotazioni`

| Campo | Tipo | Descrizione |
|---|---|---|
| `veicolo_id` | `string` (required) | ID del veicolo prenotante |
| `parcheggio_id` | `string` (required) | ID del parcheggio |
| `parcheggio_nome` | `string` | Nome parcheggio (denormalizzato) |
| `veicolo_targa` | `string` | Targa veicolo (denormalizzato) |
| `inizio_sosta` | `datetime` (required) | Data/ora inizio sosta |
| `fine_sosta` | `datetime` (required) | Data/ora fine sosta |
| `tipo_posto` | `enum` | `standard` \| `disabili` \| `rosa` |
| `prezzo_tot` | `number` | Prezzo totale calcolato |
| `stato` | `enum` | `confermata` \| `in_corso` \| `completata` \| `cancellata` |
| `codice_qr` | `string` | Codice QR univoco (`ES-XXXXX-XXXXX`) |
| `alimentazione_veicolo` | `string` | Alimentazione del veicolo (per calcolo CO₂) |
| `risparmio_co2` | `number` | Risparmio CO₂ in grammi rispetto a benzina |

---

## 🚀 Installazione e Avvio

### Prerequisiti

- **Node.js** ≥ 18
- **npm** ≥ 9
- Un account **Supabase** gratuito

### 1. Clona il repository

```bash
git clone https://github.com/<org>/EasyStop.git
cd EasyStop
```

### 2. Installa le dipendenze

```bash
npm install
```

### 3. Configura le variabili d'ambiente

Copia il file di esempio e inserisci le tue credenziali Supabase (vedi sezione [Variabili d'Ambiente](#-variabili-dambiente)):

```bash
cp .env.example .env
```

### 4. Configura il database Supabase

Esegui lo script SQL per creare la tabella `utenti` con le policy RLS:

```bash
# Dall'SQL Editor della tua dashboard Supabase, esegui:
entities/Utente.sql
```

Per le altre tabelle (`parcheggi`, `prenotazioni`, `veicoli`), utilizza gli schemi JSON presenti in `entities/` per creare le tabelle tramite l'interfaccia Supabase o via API.

### 5. Avvia il server di sviluppo

```bash
npm run dev
```

L'applicazione sarà disponibile su [http://localhost:5173](http://localhost:5173).

---

## ⚙️ Configurazione Supabase

1. Crea un nuovo progetto su [supabase.com](https://supabase.com)
2. Vai su **Project Settings → API** e copia:
   - **Project URL** → `VITE_SUPABASE_URL`
   - **anon public key** → `VITE_SUPABASE_ANON_KEY`
3. Esegui lo script `entities/Utente.sql` dall'**SQL Editor** della dashboard
4. Crea le tabelle `parcheggi`, `prenotazioni` e `veicoli` seguendo gli schemi in `entities/`
5. Abilita il provider di autenticazione desiderato (Email/Password è quello predefinito)

> ⚠️ **Primo utente admin**: dopo la registrazione, aggiorna manualmente il campo `role` a `'admin'` direttamente su Supabase per il primo amministratore del sistema.

---

## 🔑 Variabili d'Ambiente

Crea un file `.env` nella root del progetto con le seguenti variabili:

```env
# URL del progetto Supabase
VITE_SUPABASE_URL=https://<tuo-progetto>.supabase.co

# Chiave pubblica anonima Supabase
VITE_SUPABASE_ANON_KEY=<tua-anon-key>
```

> ⚠️ Non committare mai il file `.env` con credenziali reali. È già incluso nel `.gitignore`.

---

## 📦 Script Disponibili

```bash
# Avvia il server di sviluppo con hot reload su localhost:5173
npm run dev

# Compila l'applicazione per la produzione in /dist
npm run build

# Anteprima del build di produzione
npm run preview

# Esegue il linter ESLint (solo errori, no warning)
npm run lint

# Corregge automaticamente i problemi di linting
npm run lint:fix

# Type checking TypeScript via jsconfig.json
npm run typecheck
```

---

## 🗺️ Struttura delle Route

| Path | Accesso | Descrizione |
|---|---|---|
| `/login` | Pubblico | Pagina di accesso |
| `/register` | Pubblico | Registrazione nuovo utente |
| `/` | Utente autenticato | Mappa interattiva (pagina principale) |
| `/dashboard` | Utente autenticato | Dashboard personale con statistiche |
| `/profile` | Utente autenticato | Profilo e impostazioni utente |
| `/bookings` | Utente autenticato | Storico e gestione prenotazioni |
| `/admin` | Solo Admin | Dashboard amministrativa con KPI e grafici |
| `/admin/parkings` | Solo Admin | Gestione parcheggi (CRUD) |
| `/admin/users` | Solo Admin | Gestione utenti registrati |
| `/admin/bookings` | Solo Admin | Gestione completa prenotazioni |
| `*` | — | Pagina 404 personalizzata |

Le route protette sono gestite dai componenti `ProtectedRoute` e `AdminProtectedRoute` che verificano rispettivamente l'autenticazione e il ruolo `admin`.

---

## 🌿 Modulo Green — Calcolo CO₂

Il file `src/lib/greenUtils.js` contiene la logica ambientale centrale dell'applicazione.

### Tabella emissioni per tipo di alimentazione

| Alimentazione | Emissioni (g CO₂/km) | vs Benzina |
|---|---|---|
| Benzina | 120 | baseline |
| Diesel | 110 | −8% |
| GPL | 95 | −21% |
| Metano | 80 | −33% |
| Ibrida | 60 | −50% |
| Elettrica | 0 | −100% ♻️ |

### Funzioni principali

```js
// Calcola risparmio CO₂ rispetto a benzina, in grammi, e equivalente in alberi
calcolaRisparmioEmissioni(alimentazione, kmStimati)

// Calcola il prezzo totale della sosta in base alla durata
calcolaPrezzo(inizio, fine, tariffaOraria)

// Genera un codice QR univoco per la prenotazione
generaCodiceQR()  // → "ES-LXYZ123-AB9DEF01"

// Distanza in km tra due coordinate (formula di Haversine)
calcolaDistanza(lat1, lon1, lat2, lon2)

// Restituisce il colore del marker in base all'occupazione del parcheggio
getColorByOccupancy(postiLiberi, capacita)  // → 'green' | 'gold' | 'orange' | 'red'
```

> 1 albero equivalente ≈ 60g di CO₂ assorbita al giorno. Il risparmio accumulato è visibile sia nella dashboard utente che in quella amministrativa.

---

## 🔐 Ruoli e Permessi

EasyStop implementa due livelli di accesso:

| Ruolo | Accesso |
|---|---|
| `user` | Mappa, prenotazioni proprie, veicoli propri, dashboard personale, profilo |
| `admin` | Tutto il sopra + dashboard admin, CRUD parcheggi, gestione utenti, tutte le prenotazioni |

La separazione è garantita a tre livelli:
1. **Frontend** — `ProtectedRoute` e `AdminProtectedRoute` bloccano l'accesso alle route
2. **Context** — `AuthContext` espone `user.role` a tutta l'applicazione
3. **Database** — Le **Row Level Security policies** di Supabase garantiscono che ogni query restituisca solo i dati autorizzati, indipendentemente dal client

---

## 🤝 Contribuire

1. Forka il repository
2. Crea un branch per la tua feature: `git checkout -b feature/nome-feature`
3. Fai commit delle modifiche: `git commit -m 'feat: descrizione feature'`
4. Pusha il branch: `git push origin feature/nome-feature`
5. Apri una **Pull Request** verso `main`

Prima di aprire una PR, assicurati che il linter non riporti errori:

```bash
npm run lint
```

---

<div align="center">

**EasyStop** — Meno tempo a cercare parcheggio. Meno CO₂ in città. 🌱

*Progetto sviluppato per Brescia con ❤️*

</div>
