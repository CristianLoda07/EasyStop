import React from 'react';
import { Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import { getColorByOccupancy } from '@/lib/greenUtils';
import ParkingPopup from './ParkingPopup';

function createMarkerIcon(color) {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 36" width="28" height="42">
    <path d="M12 0C5.4 0 0 5.4 0 12c0 9 12 24 12 24s12-15 12-24C24 5.4 18.6 0 12 0z" fill="${color}" stroke="white" stroke-width="1.5"/>
    <text x="12" y="16" text-anchor="middle" fill="white" font-size="11" font-weight="bold" font-family="sans-serif">P</text>
  </svg>`;
  return L.divIcon({
    html: svg,
    className: '',
    iconSize: [28, 42],
    iconAnchor: [14, 42],
    popupAnchor: [0, -42],
  });
}

export default function ParkingMarker({ parking, onBook }) {
  const postiLiberi = parking.posti_liberi ?? parking.capacita;
  const color = getColorByOccupancy(postiLiberi, parking.capacita);

  if (!parking.lat || !parking.lng) return null;

  return (
    <Marker position={[parking.lat, parking.lng]} icon={createMarkerIcon(color)}>
      <Popup maxWidth={320} minWidth={280}>
        <ParkingPopup parking={parking} onBook={onBook} />
      </Popup>
    </Marker>
  );
}