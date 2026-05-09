import React from 'react';

/**
 * Barra di stato parcheggio: mostra una singola barra di disponibilità.
 * Props:
 *  - totale: numero totale posti
 *  - prenotati: numero posti prenotati
 *  - occupati: numero posti occupati
 */
export default function ParkingStatusBar({ totale, prenotati, occupati }) {
  const disponibili = Math.max(totale - prenotati - occupati, 0);
  const tot = Math.max(totale, 1); // evita divisione per zero

  const percDisponibili = (disponibili / tot) * 100;

  return (
    <div className="w-full mt-2">
      <div className="h-3 rounded-full bg-gray-200 overflow-hidden" title={`Disponibili: ${disponibili} / ${totale}`}>
        <div
          className="h-full bg-green-500 transition-all"
          style={{ width: percDisponibili + '%' }}
        />
      </div>
      <div className="mt-1 text-[11px] text-muted-foreground text-right">
        {disponibili} / {totale} posti liberi
      </div>
    </div>
  );
}
