import React, { useState, useRef } from 'react';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Fix default marker icon for Leaflet in React
import iconUrl from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';
const markerIcon = new L.Icon({
  iconUrl,
  iconRetinaUrl: iconUrl,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowUrl: iconShadow,
  shadowSize: [41, 41],
});

const defaultCenter = { lat: 45.5416, lng: 10.2118 }; // Brescia centro

function LocationMarker({ lat, lng, onChange }) {
  useMapEvents({
    click: async (e) => {
      const { lat, lng } = e.latlng;
      // Reverse geocoding con Nominatim
      const url = `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lng}`;
      const res = await fetch(url);
      const data = await res.json();
      onChange({
        address: data.display_name || '',
        lat,
        lng,
      });
    },
  });
  return lat && lng ? <Marker position={[lat, lng]} icon={markerIcon} /> : null;
}

export default function AddressAutocompleteMap({ address, lat, lng, onChange }) {
  const [search, setSearch] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const timeoutRef = useRef();

  // Autocomplete con Nominatim
  const handleSearchChange = (e) => {
    const value = e.target.value;
    setSearch(value);
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    if (value.length < 3) {
      setSuggestions([]);
      return;
    }
    timeoutRef.current = setTimeout(async () => {
      const url = `https://nominatim.openstreetmap.org/search?format=jsonv2&q=${encodeURIComponent(value)}`;
      const res = await fetch(url);
      const data = await res.json();
      setSuggestions(data);
    }, 400);
  };

  const handleSuggestionClick = (s) => {
    setSearch(s.display_name);
    setSuggestions([]);
    onChange({
      address: s.display_name,
      lat: parseFloat(s.lat),
      lng: parseFloat(s.lon),
    });
  };

  return (
    <div className="space-y-2">
      <div className="relative">
        <input
          type="text"
          className="w-full border rounded px-2 py-1"
          placeholder="Cerca indirizzo..."
          value={search || address}
          onChange={handleSearchChange}
        />
        {suggestions.length > 0 && (
          <ul className="absolute z-10 bg-white border w-full max-h-40 overflow-y-auto shadow">
            {suggestions.map(s => (
              <li
                key={s.place_id}
                className="px-2 py-1 hover:bg-gray-100 cursor-pointer text-sm"
                onClick={() => handleSuggestionClick(s)}
              >
                {s.display_name}
              </li>
            ))}
          </ul>
        )}
      </div>
      <MapContainer
        center={lat && lng ? [lat, lng] : [defaultCenter.lat, defaultCenter.lng]}
        zoom={lat && lng ? 16 : 12}
        style={{ width: '100%', height: '250px' }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <LocationMarker lat={lat} lng={lng} onChange={onChange} />
      </MapContainer>
    </div>
  );
}
