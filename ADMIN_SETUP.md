# Istruzioni per Configurare l'Admin EasyStop

## 1. ✅ FATTO: Login automatico rimosso
Il progetto è stato aggiornato per **NON** fare il login automatico al riavvio. Ora ti chiederà sempre di loggarti.

## 2. 📝 FATTO: Sistema admin implementato
Sono state aggiunte le seguenti funzionalità admin:

### Dashboard Admin
- **Visualizza statistiche**: prenotazioni totali, utenti registrati, parcheggi attivi, CO₂ risparmiata
- **Grafici e analisi**: stato prenotazioni, parcheggi più utilizzati, occupazione parcheggi

### Gestione Utenti (`/admin/users`)
- ✅ Visualizza lista completa degli utenti registrati
- ✅ Campo email e telefono visibili
- ✅ **Elimina utenti** indesiderati (con conferma)

### Gestione Parcheggi (`/admin/parkings`)
- ✅ Crea nuovi parcheggi
- ✅ Modifica parcheggi esistenti
- ✅ **Elimina parcheggi** (con conferma)

### Gestione Prenotazioni (`/admin/bookings`)
- ✅ Visualizza tutte le prenotazioni
- ✅ Cerca per parcheggio, targa o email utente
- ✅ **Visualizza dettagli** completi di ogni prenotazione
- ✅ **Elimina prenotazioni** (con conferma)

---

## 3. 🔐 IMPORTANTE: Creare l'Utente Admin

Per creare le credenziali admin (**email: admin@admin.com, password: admin123**), segui questi passi:

### Opzione A: Via Supabase Dashboard (Consigliato)

1. **Accedi a Supabase** https://supabase.com
   - Seleziona il tuo progetto

2. **Crea l'utente admin in Authentication**
   - Vai a `Authentication` → `Users`
   - Clicca `Add user`
   - Email: `admin@admin.com`
   - Password: `admin123`
   - Clicca `Create user`

3. **Aggiungi il ruolo admin nel database**
   - Vai a `SQL Editor`
   - Esegui questo comando:

```sql
INSERT INTO public.utenti (id, nome, cognome, email, telefono, isdisable, ispregnant, ruolo, data_creazione)
VALUES (
  (SELECT id FROM auth.users WHERE email = 'admin@admin.com'),
  'Admin',
  'EasyStop',
  'admin@admin.com',
  '',
  false,
  false,
  'admin',
  now()
)
ON CONFLICT(id) DO UPDATE SET ruolo = 'admin';
```

> **Nota**: Se il comando fallisce con errori di colonne, verifica i nomi delle colonne nella tua tabella utenti.

### Opzione B: Registrati come Admin tramite App

Se preferisci registrarti tramite l'app ma questo non funziona:

1. Avvia il progetto: `npm run dev`
2. Vai a `/register`
3. Registrati con:
   - Email: `admin@admin.com`
   - Password: `admin123`
   - Nome: `Admin EasyStop`
4. Poi accedi a Supabase Dashboard e aggiorna il ruolo a `'admin'` tramite SQL

```sql
UPDATE public.utenti SET ruolo = 'admin' WHERE email = 'admin@admin.com';
```

---

## 4. 🚀 Test il Sistema

1. **Avvia il progetto**
   ```bash
   npm run dev
   ```

2. **Vai a login** (`/login`)
   - Email: `admin@admin.com`
   - Password: `admin123`

3. **Accedi alla dashboard admin** (`/admin`)
   - Nella sidebar vedrai le opzioni admin

4. **Prova le funzionalità**
   - Visualizza statistiche
   - Gestisci utenti
   - Gestisci parcheggi
   - Gestisci prenotazioni

---

## 📋 Struttura Admin

La navigazione admin mostra:
- 📊 Dashboard Admin - Panoramica del sistema
- 🅿️ Parcheggi - Crea/modifica/elimina parcheggi
- 📅 Prenotazioni - Gestisci tutte le prenotazioni
- 👥 Utenti - Gestisci utenti registrati

---

## ⚠️ Note Importanti

- ✅ **Login automatico disabilitato**: Ogni volta che ricarichi dobrai loggarti
- ✅ **Admin protetto**: Solo utenti con ruolo `admin` possono accedere all'area admin
- ✅ **Eliminazioni irreversibili**: Conferme prima di eliminare dati
- ✅ **Non puoi eliminare admin**: Per proteggere l'accesso admin

---

## ❌ Troubleshooting

### Problema: Login admin non funziona
**Soluzione**: Verifica che l'utente admin sia stato creato correttamente in Supabase

### Problema: Admin vede errore "Accesso negato"
**Soluzione**: Verifica che il ruolo dell'utente sia `'admin'` nella tabella utenti

### Problema: Colonne della tabella diverse
**Soluzione**: Verifica i nomi esatti delle colonne nella tua tabella utenti:
```sql
SELECT * FROM information_schema.columns WHERE table_name = 'utenti';
```

---

## 💡 Prossimi Step

- Personalizza le credenziali admin se necessario
- Aggiungi logica di validazione per le operazioni admin
- Implementa log delle azioni admin (opzionale)
- Backup e recovery procedures (opzionale)
