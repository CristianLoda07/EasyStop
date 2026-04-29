import React from 'react';
import { MapPin, Car, Navigation, CalendarPlus } from 'lucide-react';
import { getColorByOccupancy, OCCUPANCY_COLOR_CLASSES } from '@/lib/greenUtils';
import ParkingStatusBar from './ParkingStatusBar';

export default function ParkingPopup({ parking, onBook }) {
  const postiLiberi = parking.posti_liberi ?? parking.capacita;
  const color = getColorByOccupancy(postiLiberi, parking.capacita);
  const perc = parking.capacita > 0 ? Math.round((postiLiberi / parking.capacita) * 100) : 0;
  const colorClasses = OCCUPANCY_COLOR_CLASSES[color];

  const openNav = () => {
    const url = `https://www.google.com/maps/dir/?api=1&destination=${parking.lat},${parking.lng}`;
    window.open(url, '_blank');
  };

  return (
    <div className="p-4 font-inter min-w-[260px]">
      <div className="flex items-start justify-between mb-3">
        <div>
          <h3 className="font-bold text-base text-gray-900">{parking.park_name}</h3>
          {parking.address && (
            <p className="text-xs text-gray-500 flex items-center gap-1 mt-1">
              <MapPin className="w-3 h-3" />{parking.address}
            </p>
          )}
        </div>
        {/* Badge percentuale occupazione: usa classe Tailwind invece di hex inline */}
        <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white text-xs font-bold ${colorClasses.bg}`}>
          {perc}%
        </div>
      </div>
      
      <div className="flex items-center gap-4 mb-3 text-sm">
        <div className="flex items-center gap-1">
          <Car className="w-4 h-4 text-gray-400" />
          <span className="font-semibold">{postiLiberi}</span>
          <span className="text-gray-500">/ {parking.capacita}</span>
        </div>
        {parking.tariffa_oraria > 0 && (
          <div className="text-gray-600">
            <span className="font-semibold text-green-600">€{parking.tariffa_oraria?.toFixed(2)}</span>/h
          </div>
        )}
      </div>

      {/* Nuova barra di stato parcheggi */}
      <ParkingStatusBar
        totale={parking.capacita}
        prenotati={parking.posti_prenotati || 0}
        occupati={parking.posti_occupati || 0}
      />

      <div className="flex gap-2 mb-1">
        {parking.posti_dis && <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full">♿ Disabili</span>}
        {parking.posti_rosa && <span className="text-xs bg-pink-100 text-pink-700 px-2 py-0.5 rounded-full">🤰 Rosa</span>}
      </div>

      <div className="flex gap-2">
        <button
          onClick={() => onBook(parking)}
          className="flex-1 bg-green-600 hover:bg-green-700 text-white text-sm font-medium py-2 px-3 rounded-lg flex items-center justify-center gap-1.5 transition-colors"
        >
          <CalendarPlus className="w-4 h-4" /> Prenota
        </button>
        <button
          onClick={openNav}
          className="bg-sky-500 hover:bg-sky-600 text-white text-sm font-medium py-2 px-3 rounded-lg flex items-center justify-center gap-1.5 transition-colors"
        >
          <Navigation className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
