import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, useMap } from 'react-leaflet';
import { supabase } from '@/api/supabaseClient';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { BRESCIA_CENTER, DEFAULT_ZOOM } from '@/lib/bresciaCoords';
import { calcolaDistanza } from '@/lib/greenUtils';
import ParkingMarker from '@/components/map/ParkingMarker';
import UserLocationMarker from '@/components/map/UserLocationMarker';
import ParkingFilters from '@/components/map/ParkingFilters';
import BookingForm from '@/components/booking/BookingForm';
import { Button } from '@/components/ui/button';
import { Crosshair, Navigation } from 'lucide-react';

function FlyTo({ center, zoom, onDone }) {
  const map = useMap();
  useEffect(() => {
    if (!center) return;
    map.flyTo(center, zoom || 16, { duration: 1 });
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
    refetchInterval: 30000,
    queryFn: async () => {
      const { data: parks, error: parkError } = await supabase
        .from('parcheggi')
        .select('*');
      if (parkError) throw new Error(parkError.message);

      const now = new Date().toISOString();
      const { data: prenotazioni, error: prenotError } = await supabase
        .from('prenotazioni')
        .select('id_park')
        .in('stato', ['confermata', 'in_corso'])
        .gt('fine_sosta', now);
      if (prenotError) throw new Error(prenotError.message);

      const contatorePrenotazioni = (prenotazioni || []).reduce((acc, p) => {
        acc[p.id_park] = (acc[p.id_park] || 0) + 1;
        return acc;
      }, {});

      return (parks || []).map(park => {
        const parkingId = park.id_park || park.id;
        const prenotatiLive = contatorePrenotazioni[parkingId] || 0;
        const postiLiberiEffettivi = Math.max(0, (park.capacita || 0) - prenotatiLive);
        return {
          ...park,
          posti_prenotati: prenotatiLive,
          posti_liberi: postiLiberiEffettivi,
        };
      });
    },
  });

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

  const filteredParcheggi = parcheggi.filter(p => {
    if (!p.is_active && p.is_active !== undefined) return false;
    const postiLiberi = p.posti_liberi ?? p.capacita;
    if (filters.soloDisponibili && postiLiberi <= 0) return false;
    if (filters.postiDisabili && !p.posti_dis) return false;
    if (filters.postiRosa && !p.posti_rosa) return false;
    if (p.tariffa_oraria > filters.tariffaMax) return false;
    return true;
  });

  const flyTo = (coords) => {
    setFlyTarget(coords);
    setFlyKey(k => k + 1);
  };

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
    <div style={{ position: 'relative', height: '100%', width: '100%', minHeight: '100vh' }}>
      <MapContainer
        center={[BRESCIA_CENTER.lat, BRESCIA_CENTER.lng]}
        zoom={DEFAULT_ZOOM}
        style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, zIndex: 0, height: '100%', width: '100%' }}
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

        {flyTarget && (
          <FlyTo
            key={flyKey}
            center={flyTarget}
            onDone={() => setFlyTarget(null)}
          />
        )}
      </MapContainer>

      <div style={{ position: 'absolute', top: 16, left: 16, zIndex: 1000 }}>
        <ParkingFilters filters={filters} setFilters={setFilters} />
      </div>

      <div style={{ position: 'absolute', top: 16, right: 16, zIndex: 1000, display: 'flex', flexDirection: 'column', gap: 8 }}>
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

      <div style={{ position: 'absolute', bottom: 16, left: 16, right: 16, zIndex: 1000 }}>
        <div className="bg-white/90 backdrop-blur-lg rounded-2xl shadow-lg px-4 py-3 flex items-center justify-between text-sm">
          <span className="font-medium">{filteredParcheggi.length} parcheggi</span>
          <span className="text-muted-foreground">
            {filteredParcheggi.reduce((s, p) => s + (p.posti_liberi ?? p.capacita), 0)} posti liberi totali
          </span>
        </div>
      </div>

      <BookingForm
        parking={bookingParking}
        open={!!bookingParking}
        onClose={() => setBookingParking(null)}
        onSuccess={() => queryClient.invalidateQueries({ queryKey: ['parcheggi'] })}
      />
    </div>
  );
}