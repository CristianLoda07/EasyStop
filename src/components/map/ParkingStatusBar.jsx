import React from 'react';

/**
 * Barra di stato parcheggio: mostra la suddivisione tra disponibili, prenotati e occupati.
 * Props:
 *  - totale: numero totale posti
 *  - prenotati: numero posti prenotati
 *  - occupati: numero posti occupati
 */
export default function ParkingStatusBar({ totale, prenotati, occupati }) {
  const disponibili = Math.max(totale - prenotati - occupati, 0);
  const tot = Math.max(totale, 1); // evita divisione per zero

  const percDisponibili = (disponibili / tot) * 100;
  const percPrenotati = (prenotati / tot) * 100;
  const percOccupati = (occupati / tot) * 100;

  return (
    <div className="w-full h-3 rounded bg-gray-200 flex overflow-hidden mt-2">
      <div
        className="bg-green-500 h-full"
        style={{ width: percDisponibili + '%' }}
        title={`Disponibili: ${disponibili}`}
      />
      <div
        className="bg-blue-500 h-full"
        style={{ width: percPrenotati + '%' }}
        title={`Prenotati: ${prenotati}`}
      />
      <div
        className="bg-red-500 h-full"
        style={{ width: percOccupati + '%' }}
        title={`Occupati: ${occupati}`}
      />
    </div>
  );
}
