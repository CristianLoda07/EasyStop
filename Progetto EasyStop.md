# PROMPT — PROGETTO "EASYSTOP"
 
---
 
## 🎯 RUOLO E CONTESTO
 
Sei un senior full-stack developer specializzato in React, JavaScript e Supabase. Il tuo compito è sviluppare l'applicazione web **EasyStop**, una piattaforma per la prenotazione e gestione di parcheggi nella città di Brescia, con un forte orientamento alla sostenibilità ambientale (Green Scenario).
 
L'app deve essere **completamente funzionante**, strutturata con architettura modulare, buone pratiche di sviluppo (clean code, separazione delle responsabilità, componenti riutilizzabili) e una UI moderna, responsive e accessibile.
 
---
 
## 🗂️ STACK TECNOLOGICO
 
| Layer | Tecnologia |
|---|---|
| Frontend Framework | React 18+ con JavaScript |
| State Management | Zustand o Context API |
| UI Component Library | TailwindCSS + DaisyUI |
| Mappa interattiva | Leaflet.js + React-Leaflet |
| Backend / Database | Supabase (Auth + PostgreSQL + RLS) + Python |
| OTP / MFA | Supabase MFA (TOTP) + libreria `otpauth` o `qrcode` |
| Icone | DaisyUI + React |
| Form | React Hook Form + Zod (validazione) |
| QR Code | libreria `qrcode.react` |
| Build Tool | Vite |
 
---
 
## 🏗️ SCHEMA DATABASE (Supabase / PostgreSQL)
 
Implementa esattamente le seguenti tabelle con le rispettive policy RLS:
 
```sql
-- Tabella Utenti
CREATE TABLE Utenti (
  id_User uuid REFERENCES auth.users ON DELETE CASCADE NOT NULL PRIMARY KEY,
  nome TEXT,
  cognome TEXT,
  telefono TEXT,
  isDisable BOOLEAN DEFAULT FALSE,
  isPregnant BOOLEAN DEFAULT FALSE,
  data_creazione TIMESTAMPTZ DEFAULT NOW()
);
 
-- Tabella Veicoli
CREATE TABLE Veicoli (
  id_Vcl uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  id_User uuid REFERENCES Utenti(id_User) ON DELETE CASCADE NOT NULL,
  targa TEXT UNIQUE NOT NULL,
  marca TEXT,
  type_Vcl TEXT CHECK (type_Vcl IN ('auto', 'moto', 'van', 'suv')),
  alimentazione TEXT CHECK (alimentazione IN ('benzina','diesel','elettrica','ibrida','gpl','metano')),
  isDefault BOOLEAN DEFAULT FALSE,
  dataInserimento TIMESTAMPTZ DEFAULT NOW()
);
 
-- Tabella Parcheggi
create table public.parcheggi (
  id_park uuid not null default gen_random_uuid (),
  park_name text not null,
  address text null,
  posti_dis boolean null default false,
  posti_rosa boolean null default false,
  capacita integer null,
  constraint parcheggi_pkey primary key (id_park)
)
 
-- Tabella Prenotazioni
CREATE TABLE Prenotazioni (
  id_Prenotazione uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  id_User uuid REFERENCES Utenti(id_User) ON DELETE CASCADE NOT NULL,
  id_Vcl uuid REFERENCES Veicoli(id_Vcl) NOT NULL,
  id_Park uuid REFERENCES Parcheggi(id_Park) ON DELETE CASCADE NOT NULL,
  inizio_sosta TIMESTAMPTZ NOT NULL,
  fine_sosta TIMESTAMPTZ NOT NULL,
  tipo_posto_prenotato TEXT DEFAULT 'standard' CHECK (tipo_posto_prenotato IN ('standard', 'disabili', 'rosa')),
  prezzo_tot DECIMAL(10,2),
  stato TEXT DEFAULT 'confermata' CHECK (stato IN ('confermata', 'in_corso', 'completata', 'cancellata')),
  codice_qr TEXT UNIQUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

**PARCHEGGI DA RAPPRESENTARE**
id_park,park_name,address,posti_dis,posti_rosa,capacita
0239e4f4-6f53-4dcd-8f6e-98932f967034,Palagiustizia,"Via Gambara, 44",false,false,600
0708bdb0-3c7b-4ccb-b2ed-8663eaf65fb3,D'Azeglio,"Via Massimo D'Azeglio, 4a",false,false,35
2c4f4f72-75ca-45c4-abe5-b4c129d84608,Poliambulanza,Via Morelli,false,false,350
360a46f5-6e6e-4513-91ff-42e2559e15b4,Fossa Bagni,Piazza Fossa Bagni,false,false,560
39ded279-4341-46fe-9cb0-9092f650e9ca,Castellini,Via Castellini angolo via Mantova,false,false,215
3cd40691-d14e-4919-9cb1-576f467993a0,Prealpino,Via Triumplina,false,false,1005
428cb8cb-7b4b-4ef0-b951-04c167e1a057,Ospedale Sud,"Via Ducco, angolo via dal Monte 44",false,false,500
4386e3ba-c696-475b-bb15-9ad3fa4f7b46,Freccia Rossa,"Viale Italia, 31",false,false,2500
4d2c43fa-4d61-4681-9e14-41b5108eb7e7,Parcheggio Piazza Vittoria,Piazza della Vittoria,false,false,520
51afd49f-0b58-4364-adb2-90b961908afd,Stadio,Via dello Stadio,false,false,496
596f9f5f-fbde-4c03-b521-1b13964489da,S.Eufemia-Buffalora,Via Agostino Chiappa (fronte capolinea metro),false,false,398
5db78e22-3cbc-42ad-825d-cc07a95bd744,Benedetto Croce,Piazzetta Don L. Sturzo,false,false,72
678bcf45-9c80-4fd8-8af7-5fe0a78a3ee8,Ospedale Nord (superficie),"Piazza San Padre Pio da Pietrelcina, 1",false,false,150
8503b222-aa58-4d87-b1c0-9b8b783c4e99,Camper Poliambulanza,,false,false,10
90daa779-4faa-4351-bd95-055d3f3c1621,Casazza,Via Triumplina 181/02 (dietro complesso Futura).,false,false,160
9ba9e74f-7753-46db-aae0-14ca257985ed,Castellini,"Via Castellini, angolo via Mantova.",false,false,230
a35d5ed2-d632-4f49-ac02-3f63a7da5dc4,San Domenico,Piazza San Domenico,false,false,72
a4c14f3b-9f44-45fe-9f4e-6b5046d035ee,Randaccio,Via Lupi di Toscana n 4,false,false,180
b18d7e4b-275e-498c-84c5-8417a2e63e91,Stazione,"V.le Stazione, 51",false,false,1000
c454e676-98c3-4af5-ba03-7f97b5ef296a,Ospedale Nord,"Piazza San Padre Pio da Pietrelcina, 1",false,false,1260
d4105d1f-7bb6-43c5-9170-ccc3e666e905,Crystal Superficie,Sul lato ovest del palazzo Crystal Palace e con accesso da via Aldo Moro 17,false,false,50
dbe47048-a00a-4f19-9d7f-e2070686de20,Apollonio,"via Apollonio, 15",false,false,115
e7441682-1c81-4a30-910b-3a67adec5e61,Piazza Mercato,Piazza del Mercato,false,false,190
eb55cc1e-2c8e-47d8-8417-64505ae5bcc3,Goito,"Via Spalto S. Marco, 8",false,false,215
f587f638-46b9-4da9-9478-3c13d9d0b80d,Autosilouno,"Via Vittorio Emanuele II, 3",false,false,336
f8d1d203-61a7-4b5e-81e4-286869cd145e,Crystal,Sul lato ovest del palazzo Crystal Palace e con accesso da via Aldo Moro 17,false,false,400
ff81d6f2-1860-4c01-8d18-5fad325470a8,Arnaldo Park,Piazzale Arnaldo,false,false,300

 
Configura le **Row Level Security (RLS)** policies in modo che:
- Gli utenti possano leggere e modificare solo i propri dati (`id_User = auth.uid()`).
- Gli amministratori (identificati da `user_metadata.role = 'admin'`) abbiano accesso completo a tutte le tabelle.
- I Parcheggi siano in lettura pubblica (autenticati).
- Le Prenotazioni siano visibili solo al proprietario e all'admin.
 
---
 
## 📁 STRUTTURA DEL PROGETTO
 
```
src/
├── assets/
├── components/
│   ├── ui/               # Componenti base (Button, Input, Modal, Badge...)
│   ├── map/              # MapView, ParkingMarker, UserLocationMarker
│   ├── parking/          # ParkingCard, ParkingFilters, ParkingDetail
│   ├── booking/          # BookingForm, BookingCard, QRCodeDisplay
│   ├── vehicle/          # VehicleCard, VehicleForm
│   ├── auth/             # LoginForm, RegisterForm, MFASetup, OTPVerify
│   └── admin/            # AdminSidebar, ParkingCRUD, DashboardStats
├── pages/
│   ├── auth/             # Login.jsx, Register.jsx, MFAPage.jsx
│   ├── user/             # Dashboard.jsx, Profile.jsx, Map.jsx, Bookings.jsx
│   └── admin/            # AdminDashboard.jsx, ManageParking.jsx, Users.jsx
├── hooks/                # useAuth, useParkings, useBookings, useVehicles, useGeolocation
├── store/                # authStore.js, parkingStore.js
├── lib/
│   ├── supabase.js       # Client Supabase
│   ├── validations.js    # Schemi Zod
│   └── utils.js          # Helper (calcolo prezzo, QR generator, emissioni...)
├── types/                # Tipi JavaScript allineati al DB
├── constants/            # Dati mock, config mappa Brescia
└── App.jsx / main.jsx
```
 
---
 
## 🔐 AUTENTICAZIONE E AUTORIZZAZIONE
 
### Flusso di autenticazione:
1. **Registrazione**: email + password, con inserimento automatico del record in `Utenti` via trigger Supabase.
2. **Login**: email + password tramite `supabase.auth.signInWithPassword`.
3. **MFA (obbligatoria per admin, opzionale per utenti)**:
   - Supporto TOTP (Time-based One-Time Password).
   - Generazione QR code da mostrare all'utente per setup su app authenticator (Google Authenticator, Authy).
   - Verifica OTP a 6 cifre ad ogni login successivo.
4. **Ruoli**: gestiti tramite `user_metadata.role` (`'admin'` | `'user'`).
5. **Protezione delle route**: componente `ProtectedRoute` che verifica autenticazione e ruolo prima di rendere la pagina.
6. **Refresh automatico** del token Supabase.
 
---
 
## 👤 AREA UTENTE — FUNZIONALITÀ DETTAGLIATE
 
### 1. Dashboard utente
- Riepilogo prenotazioni attive con stato e countdown.
- Accesso rapido ai veicoli salvati.
- Suggerimento parcheggi preferiti (basato sullo storico).
 
### 2. Profilo utente
- Visualizzazione e modifica: nome, cognome, telefono.
- Flag speciali: `isDisable` (posti disabili), `isPregnant` (posti rosa) — visibili e modificabili.
- Sezione gestione MFA: attivazione/disattivazione con QR code.
 
### 3. Gestione veicoli
- CRUD completo: aggiunta, modifica, eliminazione veicoli.
- Campi: targa, marca, tipo (`auto/moto/van/suv`), alimentazione (`benzina/diesel/elettrica/ibrida/gpl/metano`).
- Selezione veicolo di default (`isDefault`).
- La tipologia di alimentazione influenza il calcolo del risparmio emissioni.
 
### 4. Mappa parcheggi (Leaflet)
- Centro mappa: **Brescia** [lat: 45.5416, lng: 10.2118], zoom iniziale 14.
- Marker colorati per stato del parcheggio:
  - Verde: posti liberi > 30%
  - Giallo: posti liberi tra 10% e 30%
  - Arancio: posti liberi tra il 10% e l'ultimo posto liberi disponibile
  - Rosso: posti liberi = 0 (esauriti)
- Marker speciale per la **posizione dell'utente** (con cerchio di accuratezza).
- **Popup** al click sul marker: nome, indirizzo, posti liberi/totali, tariffa oraria, servizi, pulsante "Prenota".
- **Navigazione**: pulsante "Portami qui" che apre Google Maps / Apple Maps con le coordinate del parcheggio.
- Pulsante "Parcheggio più vicino" che calcola e centra la mappa sul parcheggio libero più vicino alla posizione utente (distanza euclidea o Haversine).
 
### 5. Filtri parcheggi
Panel laterale o drawer con filtri:
- Posti disponibili (checkbox: solo con posti liberi)
- Tariffa oraria massima (slider) con inserimento testuale per i limiti delle tariffe (tra "0" e "5"€)
- Posti disabili (checkbox)
- Posti rosa (checkbox)
- Tipo di posto (standard / disabili / rosa)
- Altezza massima (utile per van/suv)
- Servizi: ricarica EV, copertura (da campo `servizi` JSONB)
- Tipo di alimentazione del veicolo selezionato (pre-compilato dal profilo)
 
### 6. Prenotazione
- Selezione parcheggio dalla mappa o dalla lista.
- Form prenotazione:
  - Selezione veicolo (dropdown dai veicoli salvati, default pre-selezionato)
  - Data/ora inizio sosta
  - Data/ora fine sosta
  - Tipo posto (standard, disabili se `isDisable=true`, rosa se `isPregnant=true`)
  - Calcolo automatico del prezzo totale (tariffa_oraria × ore)
  - Stima risparmio CO₂ (per veicoli elettrici/ibridi vs. benzina/diesel/gpl/metano)
- Generazione **codice QR univoco** (UUID + timestamp hash) salvato nel campo `codice_qr`.
- Conferma con modal riepilogativa e mostra il QR code.
- Aggiornamento automatico di `posti_liberi` nel parcheggio selezionato.
 
### 7. Gestione prenotazioni
- Lista prenotazioni con filtro per stato (`confermata`, `in_corso`, `completata`, `cancellata`).
- Card prenotazione con: parcheggio, veicolo, date, prezzo, stato badge, QR code.
- **Modifica**: possibile solo se stato = `confermata` (cambia orari, veicolo, tipo posto).
- **Cancellazione**: con dialog di conferma; ripristina il posto nel parcheggio.
- Visualizzazione QR code a pieno schermo (per mostrarlo al lettore fisico).
 
---
 
## 🛠️ AREA AMMINISTRATORE — FUNZIONALITÀ DETTAGLIATE
 
### 1. Dashboard admin
Pannello con metriche in tempo reale (Supabase real-time subscriptions):
- Numero totale prenotazioni (oggi / settimana / mese)
- Parcheggi più utilizzati (ranking con barra di occupazione)
- Occupazione media per fascia oraria (grafico)
- Risparmio stimato emissioni CO₂ (calcolato su prenotazioni con veicoli elettrici/ibridi)
- Totale utenti registrati
- Prenotazioni per stato (grafico a torta e grafico a barre)
 
### 2. Gestione parcheggi (CRUD)
- **Lista parcheggi**: tabella paginata con ricerca e ordinamento.
- **Inserimento** nuovo parcheggio: form completo con tutti i campi della tabella + selezione posizione su mappa Leaflet.
- **Modifica**: form pre-compilato; modifica di posti_totali e posti_liberi, tariffe, servizi JSONB (toggle switches per ev_charge, coperto, ecc.).
- **Eliminazione**: con dialog di conferma e soft-delete (flag `isActive`) o hard-delete.
- **Vista dettaglio**: statistiche specifiche del parcheggio, prenotazioni recenti.
 
### 3. Gestione utenti
- Tabella utenti con: nome, cognome, email, data registrazione, numero veicoli, numero prenotazioni.
- Ricerca e filtro per nome/email.
- Vista dettaglio utente: profilo + storico prenotazioni + veicoli.
 
---
 
## 🗺️ ROUTING DELL'APPLICAZIONE
 
```
/                          → Redirect a /login o /user/map (se autenticato)
/login                     → Pagina di login
/register                  → Pagina di registrazione
/mfa/setup                 → Setup MFA (QR code TOTP)
/mfa/verify                → Verifica OTP
 
/user/
  map                      → Mappa parcheggi (default page)
  dashboard                → Dashboard utente
  profile                  → Profilo + veicoli
  bookings                 → Lista prenotazioni
  bookings/:id             → Dettaglio prenotazione + QR
 
/admin/
  dashboard                → Dashboard amministratore
  parkings                 → Gestione parcheggi
  parkings/new             → Inserimento nuovo parcheggio
  parkings/:id/edit        → Modifica parcheggio
  users                    → Gestione utenti
```
 
---
 
## 🌿 LOGICA "GREEN SCENARIO" — STIMA EMISSIONI
 
Implementa una funzione `calcolaRisparmioEmissioni(alimentazione, km_stimati)`:
 
| Alimentazione | g CO₂/km (stimato) |
|---|---|
| Benzina | 120 |
| Diesel | 110 |
| GPL | 95 |
| Metano | 80 |
| Ibrida | 60 |
| Elettrica | 0 |
 
- **Risparmio** = (g CO₂ veicolo benzina − g CO₂ veicolo utente) × km stimati
- Mostrare il risparmio in grammi e in CO₂ equivalente (es. alberi necessari per assorbire)
- Aggregare il risparmio totale nella dashboard admin
 
---
 
## 🎨 LINEE GUIDA UI/UX
 
- **Design system**: TailwindCSS + DaisyUi, tema pulito e moderno.
- **Palette colori**:
  - Primario: `#16A34A` (verde — richiamo sostenibilità)
  - Secondario: `#0EA5E9` (azzurro cielo)
  - Neutri: slate/gray di Tailwind
  - Danger: `#EF4444`
- **Responsive**: mobile-first, ottimizzata per smartphone (uso in strada).
- **Accessibilità**: contrasti WCAG AA, label ARIA, navigazione da tastiera.
- **Dark mode**: supporto via Tailwind `dark:` (di colore blu scuro).
- **Loading states**: skeleton loader su card e mappa.
- **Micro-interazioni**: animazioni leggere su hover/click con Tailwind transition.
- **Toast notifications**: feedback visivo per ogni azione (prenotazione creata, errori, ecc.).
 
---
 
## ✅ REQUISITI NON FUNZIONALI
 
- **BackEnd** gestito da Python
- **JavaScript strict mode** in tutto il progetto.
- **Gestione errori** centralizzata (try/catch + error boundary React).
- **Variabili d'ambiente**: tutte le chiavi Supabase in `.env.local` (non committate).
- **Sicurezza**: nessun dato sensibile nel localStorage; usare solo `supabase.auth.getSession()`.
- **Codice commentato** nelle funzioni principali (JSDoc).
- **Seed data**: fornire un file SQL con 2 utenti demo (1 admin, 1 user).
- **README.md**: istruzioni di setup, configurazione Supabase, avvio locale.
 
---
 
## 📦 OUTPUT ATTESO
 
Fornisci la cartella zippata completa con:
1. Tutta la struttura del progetto con tutti i file rilevanti.
2. Il file `supabase/schema.sql` con tabelle, RLS policies e trigger.
3. Il file `supabase/seed.sql` con dati di esempio.
4. Tutti i componenti React con JavaScript.
5. I custom hook per Supabase.
6. Il file `.env.example` con le variabili necessarie.
7. Il `README.md` con istruzioni di setup complete.
 
---
 
> **Nota finale**: Se una funzionalità richiede una libreria non inclusa nello stack, non proporla e non implementarla. Mantieni la coerenza stilistica e architetturale in tutto il Progetto.