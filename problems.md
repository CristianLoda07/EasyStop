🔴 Problemi critici
1 ✅ CORRETTO
Credenziali e dati sensibili nel codice sorgente
Sicurezza
Il file .env contiene VITE_BASE44_APP_ID=69df8b88553f60fd0c150033 e l'URL dell'API reale. Peggio ancora, in base44Client.js ci sono hardcoded 27 parcheggi reali di Brescia con coordinate, dati utente mock, password non verificate e logica di autenticazione lato client che accetta qualsiasi email/password per utenti esistenti.

→ Spostare tutti i valori sensibili in variabili d'ambiente. Non commitare mai il file .env (aggiungerlo al .gitignore — attualmente manca).

2 ✅ CORRETTO
Assenza totale di gestione degli errori nelle operazioni async
Affidabilità
In BookingsPage.jsx, ProfilePage.jsx, AdminParkings.jsx e altri, le chiamate await nelle funzioni handleCancel, handleDelete, saveProfile, saveVehicle non hanno alcun try/catch. Se falliscono, l'app si blocca silenziosamente senza feedback all'utente.

→ Wrappare ogni operazione async in try/catch/finally con toast di errore e reset dello stato di loading.

3 ✅ CORRETTO
Race condition e stato di posti liberi non atomico
Logica
In BookingForm.jsx, la prenotazione e il decremento di posti_liberi sono due operazioni separate (prima Prenotazione.create, poi Parcheggio.update). Se la seconda fallisce, si crea una prenotazione senza che il posto venga scalato. Lo stesso problema esiste in BookingsPage per la cancellazione.

→ Gestire questa logica lato backend in un'unica transazione, oppure implementare compensazione in caso di errore.

🟠 Problemi di architettura e manutenibilità
4 ✅ CORRETTO
Fetch dell'utente autenticato duplicata ovunque
DRY
base44.auth.me() viene chiamato con useEffect separatamente in AppLayout.jsx, BookingForm.jsx, ProfilePage.jsx e UserDashboard.jsx. L'utente è già disponibile in AuthContext.

→ Usare semplicemente const {'{ user }'} = useAuth() ovunque. Rimuovere tutti gli useEffect ridondanti con auth.me().

5 ✅ CORRETTO
ProtectedRoute non viene mai usato
Dead code
Il componente src/components/ProtectedRoute.jsx esiste ma non viene importato né usato in App.jsx. Tutta la logica di protezione delle route è gestita direttamente in AuthenticatedApp tramite il rendering condizionale {'isAuthenticated ? ... : ...'}.

→ Eliminare ProtectedRoute.jsx o usarlo effettivamente al posto del condizionale in App.jsx, scegliendo un approccio solo.

6 ✅ CORRETTO
Icona CalendarPlus SVG inline nel componente sbagliato
Organizzazione
In fondo a BookingForm.jsx c'è definita una funzione CalendarPlus che disegna un'icona SVG custom. La libreria lucide-react è già installata e contiene questa icona.

→ Sostituire con import {'{ CalendarPlus }'} from 'lucide-react' e rimuovere la funzione duplicata.

7 ✅ CORRETTO
Mix di JS e TS senza consistenza
Convenzioni
Il progetto è quasi interamente in .jsx, ma esiste un unico file src/utils/index.ts con TypeScript e una funzione (createPageUrl) che non viene usata da nessuna parte. Il jsconfig.json indica che il progetto usa JS con type-checking opzionale.

→ Scegliere una strategia: o migrare tutto a TypeScript, o convertire index.ts in .js e rimuovere la funzione inutilizzata.

8 ✅ CORRETTO
Incoerenza nei nomi dei campi: address vs indirizzo
Bug latente
I mock data in base44Client.js usano il campo indirizzo, ma in AdminParkings.jsx il filtro di ricerca usa p.address e ParkingFormDialog salva il campo come address. Il risultato è che la ricerca per indirizzo non funziona mai sui dati mock.

→ Uniformare il nome del campo in tutto il codebase, preferibilmente address (inglese, coerente con park_name).

🟡 Miglioramenti di pulizia e qualità del codice
9 ✅ CORRETTO
Typo nel nome file: scrool-area.jsx
Pulizia
Il file è src/components/ui/scrool-area.jsx (doppia "o"). In un progetto reale crea confusione negli import e nei code review.

→ Rinominare in scroll-area.jsx.

10 ✅ CORRETTO
Dipendenze inutilizzate pesanti nel package.json
Performance
Il progetto include dipendenze non usate nel codice analizzato: @stripe/react-stripe-js, @stripe/stripe-js, three (Three.js!), moment (sostituibile con date-fns già usato), react-quill, canvas-confetti, html2canvas, jspdf, react-hot-toast (duplicato di sonner).

→ Rimuovere le dipendenze non usate. Usare solo date-fns al posto di moment. Questo riduce il bundle size significativamente.

11 ✅ CORRETTO
Stati di loading non gestiti nelle mutazioni
UX
In ProfilePage.jsx, le operazioni saveVehicle, deleteVehicle e setDefaultVehicle non hanno uno stato di loading. L'utente può cliccare più volte e inviare richieste duplicate. Il pattern di BookingForm (con loading state e button disabilitato) è corretto ma non è stato replicato ovunque.

→ Usare useMutation di React Query per tutte le operazioni di scrittura — gestisce loading, error e invalidazione in modo uniforme.

12 ✅ CORRETTO
Logica di filtraggio duplicata tra MapPage e backend mock
DRY
Il filtraggio dei parcheggi avviene sia in MapPage.jsx (client-side, con filteredParcheggi) che in makeEntity nel mock client (server-side con .filter()). Quando si migrerà a un backend reale, la logica lato client dovrà essere riscritta.

→ Passare i filtri attivi come parametri alla query di React Query, in modo che il filtraggio avvenga sempre lato "server".

13
Stili hardcoded con colori hex in componenti che usano Tailwind
Consistenza
In ParkingPopup.jsx si usano stili inline con colori hex (style={'{{ background: colorMap[color] }}'}) mentre il resto del progetto usa variabili CSS/Tailwind. In AdminDashboard.jsx i colori del PieChart (#3B82F6) sono hardcoded e non si adattano al tema.

→ Usare le classi Tailwind o CSS variables in modo coerente. Definire i colori semantici in un unico posto.

14
StatCard definito due volte in pagine diverse
DRY
Il componente StatCard è definito localmente (probabilmente come funzione in fondo al file) sia in UserDashboard.jsx che in AdminDashboard.jsx con lo stesso identico markup.

→ Estrarre StatCard in src/components/ui/StatCard.jsx e importarlo dove serve.

15
FlyTo riceve center ma non resetta dopo l'uso
Bug UX
In MapPage.jsx, il componente FlyTo scatta ogni volta che flyTarget cambia, ma flyTarget non viene mai resettato a null dopo l'animazione. Se l'utente clicca di nuovo "La mia posizione" senza muoversi, il useEffect non scatta (stesse coordinate) e sembra che il bottone non funzioni.

→ Resettare flyTarget a null al termine dell'animazione, oppure usare un approccio basato su chiave (key) per forzare il re-render.