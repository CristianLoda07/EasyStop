import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, useMap } from 'react-leaflet';
import { base44 } from '@/api/supabaseClient';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { BRESCIA_CENTER, DEFAULT_ZOOM } from '@/lib/bresciaCoords';
import { calcolaDistanza } from '@/lib/greenUtils';
import ParkingMarker from '@/components/map/ParkingMarker';
import UserLocationMarker from '@/components/map/UserLocationMarker';
import ParkingFilters from '@/components/map/ParkingFilters';
import BookingForm from '@/components/booking/BookingForm';
import { Button } from '@/components/ui/button';
import { Crosshair, Navigation } from 'lucide-react';

/**
 * Componente interno: al mount esegue flyTo e poi segnala il completamento
 * tramite onDone. Viene montato con una key incrementale: ogni nuovo volo
 * corrisponde a un nuovo mount, quindi funziona anche se le coordinate sono
 * identiche alla chiamata precedente (fix del bug "bottone non risponde").
 */
function FlyTo({ center, zoom, onDone }) {
  const map = useMap();
  useEffect(() => {
    if (!center) return;
    map.flyTo(center, zoom || 16, { duration: 1 });
    // Resetta flyTarget poco dopo la fine dell'animazione (durata: 1s)
    const timer = setTimeout(onDone, 1100);
    return () => clearTimeout(timer);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps
  return null;
}

export default function MapPage() {
  const queryClient = useQueryClient();
  const [userPos, setUserPos] = useState(null);
  const [accuracy, setAccuracy] = useState(null);
  const [flyTarget, setFlyTarget] = useState(null);
  // flyKey viene incrementato a ogni volo per forzare il re-mount di FlyTo,
  // garantendo che l'animazione parta anche verso le stesse coordinate.
  const [flyKey, setFlyKey] = useState(0);
  const [bookingParking, setBookingParking] = useState(null);
  const [filters, setFilters] = useState({
    soloDisponibili: false,
    postiDisabili: false,
    postiRosa: false,
    tariffaMax: 5,
  });

  const { data: parcheggi = [] } = useQuery({
    queryKey: ['parcheggi'],
    queryFn: () => base44.entities.Parcheggio.list(),
  });

  // Geolocalizzazione utente
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setUserPos([pos.coords.latitude, pos.coords.longitude]);
          setAccuracy(pos.coords.accuracy);
        },
        () => {},
        { enableHighAccuracy: true }
      );
    }
  }, []);

  // Filtra parcheggi
  const filteredParcheggi = parcheggi.filter(p => {
    if (!p.is_active && p.is_active !== undefined) return false;
    const postiLiberi = p.posti_liberi ?? p.capacita;
    if (filters.soloDisponibili && postiLiberi <= 0) return false;
    if (filters.postiDisabili && !p.posti_dis) return false;
    if (filters.postiRosa && !p.posti_rosa) return false;
    if (p.tariffa_oraria > filters.tariffaMax) return false;
    return true;
  });

  // Avvia un volo verso le coordinate date e incrementa la key
  const flyTo = (coords) => {
    setFlyTarget(coords);
    setFlyKey(k => k + 1);
  };

  // Trova parcheggio più vicino e vola lì
  const findNearest = () => {
    if (!userPos) return;
    const available = filteredParcheggi.filter(p => (p.posti_liberi ?? p.capacita) > 0 && p.lat && p.lng);
    if (available.length === 0) return;
    let nearest = available[0];
    let minDist = Infinity;
    available.forEach(p => {
      const d = calcolaDistanza(userPos[0], userPos[1], p.lat, p.lng);
      if (d < minDist) { minDist = d; nearest = p; }
    });
    flyTo([nearest.lat, nearest.lng]);
  };

  const centerOnUser = () => {
    if (userPos) flyTo(userPos);
  };

  return (
    <div className="relative h-[calc(100vh-56px)] lg:h-screen">
      <MapContainer
        center={[BRESCIA_CENTER.lat, BRESCIA_CENTER.lng]}
        zoom={DEFAULT_ZOOM}
        className="absolute inset-0 z-0"
        zoomControl={false}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {filteredParcheggi.map(p => (
          <ParkingMarker key={p.id_park || p.id} parking={p} onBook={setBookingParking} />
        ))}

        <UserLocationMarker position={userPos} accuracy={accuracy} />

        {/* key incrementale → re-mount garantito a ogni volo, anche verso stesse coords */}
        {flyTarget && (
          <FlyTo
            key={flyKey}
            center={flyTarget}
            onDone={() => setFlyTarget(null)}
          />
        )}
      </MapContainer>

      {/* Controls overlay */}
      <div className="absolute top-4 left-4 z-10 flex flex-col gap-2">
        <ParkingFilters filters={filters} setFilters={setFilters} />
      </div>

      <div className="absolute top-4 right-4 z-10 flex flex-col gap-2">
        <Button
          size="icon"
          variant="outline"
          className="shadow-lg bg-white h-10 w-10"
          onClick={centerOnUser}
          title="La mia posizione"
        >
          <Crosshair className="w-5 h-5" />
        </Button>
        <Button
          size="sm"
          className="shadow-lg"
          onClick={findNearest}
          title="Parcheggio più vicino"
        >
          <Navigation className="w-4 h-4 mr-1" /> Più vicino
        </Button>
      </div>

      {/* Stats bar */}
      <div className="absolute bottom-4 left-4 right-4 z-10">
        <div className="bg-white/90 backdrop-blur-lg rounded-2xl shadow-lg px-4 py-3 flex items-center justify-between text-sm">
          <span className="font-medium">{filteredParcheggi.length} parcheggi</span>
          <span className="text-muted-foreground">
            {filteredParcheggi.reduce((s, p) => s + (p.posti_liberi ?? p.capacita), 0)} posti liberi totali
          </span>
        </div>
      </div>

      {/* Booking form */}
      <BookingForm
        parking={bookingParking}
        open={!!bookingParking}
        onClose={() => setBookingParking(null)}
        onSuccess={() => queryClient.invalidateQueries({ queryKey: ['parcheggi'] })}
      />
    </div>
  );
}