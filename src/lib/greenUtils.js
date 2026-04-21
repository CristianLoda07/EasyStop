/**
 * Tabella emissioni CO2 per tipo alimentazione (g CO₂/km)
 */
const EMISSIONI_CO2 = {
  benzina: 120,
  diesel: 110,
  gpl: 95,
  metano: 80,
  ibrida: 60,
  elettrica: 0,
};

/**
 * Calcola il risparmio di emissioni CO2 rispetto a un veicolo a benzina
 * @param {string} alimentazione - Tipo di alimentazione del veicolo
 * @param {number} kmStimati - Km stimati per raggiungere il parcheggio
 * @returns {{ risparmioGrammi: number, alberiEquivalenti: number, emissioniVeicolo: number }}
 */
export function calcolaRisparmioEmissioni(alimentazione, kmStimati = 5) {
  const emissioniBenzina = EMISSIONI_CO2.benzina;
  const emissioniVeicolo = EMISSIONI_CO2[alimentazione] || emissioniBenzina;
  const risparmioGrammi = (emissioniBenzina - emissioniVeicolo) * kmStimati;
  // Un albero assorbe ~22kg di CO2/anno = ~60g/giorno
  const alberiEquivalenti = risparmioGrammi > 0 ? parseFloat((risparmioGrammi / 60).toFixed(2)) : 0;
  return { risparmioGrammi, alberiEquivalenti, emissioniVeicolo: emissioniVeicolo * kmStimati };
}

/**
 * Calcola il prezzo totale della prenotazione
 * @param {string} inizio - ISO datetime inizio sosta
 * @param {string} fine - ISO datetime fine sosta
 * @param {number} tariffaOraria - Tariffa oraria in euro
 * @returns {number}
 */
export function calcolaPrezzo(inizio, fine, tariffaOraria) {
  const start = new Date(inizio);
  const end = new Date(fine);
  const ore = Math.max(0, (end - start) / (1000 * 60 * 60));
  return parseFloat((ore * tariffaOraria).toFixed(2));
}

/**
 * Genera un codice QR univoco
 * @returns {string}
 */
export function generaCodiceQR() {
  const timestamp = Date.now().toString(36);
  const random = Math.random().toString(36).substring(2, 10);
  return `ES-${timestamp}-${random}`.toUpperCase();
}

/**
 * Calcola la distanza tra due coordinate (formula Haversine)
 * @returns {number} distanza in km
 */
export function calcolaDistanza(lat1, lon1, lat2, lon2) {
  const R = 6371;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

/**
 * Restituisce la chiave colore in base alla percentuale di occupazione.
 * Valori: 'green' | 'gold' | 'orange' | 'red'
 */
export function getColorByOccupancy(postiLiberi, capacita) {
  if (capacita === 0) return 'red';
  const perc = postiLiberi / capacita;
  if (perc <= 0) return 'red';
  if (perc <= 0.10) return 'orange';
  if (perc <= 0.30) return 'gold';
  return 'green';
}

/**
 * Mappa dalla chiave colore occupancy alle classi Tailwind bg + text.
 * Usare per badge, dot, progress bar ecc. al posto di hex hardcoded.
 */
export const OCCUPANCY_COLOR_CLASSES = {
  green:  { bg: 'bg-green-500',  text: 'text-green-700',  badge: 'bg-green-100 text-green-700'  },
  gold:   { bg: 'bg-yellow-400', text: 'text-yellow-700', badge: 'bg-yellow-100 text-yellow-700' },
  orange: { bg: 'bg-orange-500', text: 'text-orange-700', badge: 'bg-orange-100 text-orange-700' },
  red:    { bg: 'bg-red-500',    text: 'text-red-700',    badge: 'bg-red-100 text-red-700'       },
};

/**
 * Colori CSS var(--chart-N) per i grafici Recharts.
 * Usare questi al posto di hex hardcoded così rispettano il tema shadcn/ui.
 */
export const CHART_COLORS = [
  'hsl(var(--chart-1))',
  'hsl(var(--chart-2))',
  'hsl(var(--chart-3))',
  'hsl(var(--chart-4))',
  'hsl(var(--chart-5))',
];

export const ALIMENTAZIONE_LABELS = {
  benzina: 'Benzina',
  diesel: 'Diesel',
  elettrica: 'Elettrica',
  ibrida: 'Ibrida',
  gpl: 'GPL',
  metano: 'Metano',
};

export const TIPO_VEICOLO_LABELS = {
  auto: 'Auto',
  moto: 'Moto',
  van: 'Van',
  suv: 'SUV',
};

export const STATO_LABELS = {
  confermata: 'Confermata',
  in_corso: 'In Corso',
  completata: 'Completata',
  cancellata: 'Cancellata',
};
