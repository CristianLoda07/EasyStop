import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import { supabase } from '../../lib/supabase';
import { useParkings } from '../../hooks/useParkings';

export default function MapView() {
  const bresciaPosition = [45.5416, 10.2118]; // Coordinate esatte dal tuo prompt
  const { parkings, loading } = useParkings();

  // Funzione per calcolare il colore in base alla percentuale di riempimento
  const getStatusColor = (liberi, capacita) => {
    if (!capacita || liberi === 0) return 'text-error'; // Rosso (0 posti)
    const percentage = (liberi / capacita) * 100;
    if (percentage > 30) return 'text-success'; // Verde
    if (percentage > 10) return 'text-warning'; // Giallo
    return 'text-orange-500'; // Arancio (1-10%)
  };

  return (
    <div className="flex flex-col h-screen">
      {/* Navbar superiore */}
      <div className="navbar bg-base-100 shadow-md z-20 relative px-4">
        <div className="flex-1">
          <span className="text-2xl font-bold text-primary">EasyStop</span>
        </div>
        <div className="flex-none gap-4">
          {loading && <span className="loading loading-spinner text-primary"></span>}
          <button 
            className="btn btn-outline btn-error btn-sm" 
            onClick={() => supabase.auth.signOut()}
          >
            Esci
          </button>
        </div>
      </div>

      {/* Contenitore della Mappa */}
      <div className="flex-1 relative z-0">
        <MapContainer 
          center={bresciaPosition} 
          zoom={14} 
          style={{ height: '100%', width: '100%', zIndex: 0 }}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />

          {/* Renderizziamo i parcheggi VERI dal database */}
          {parkings.map(parking => {
            // Se mancano le coordinate (finché non le aggiorni nel DB), saltiamo il marker per non far crashare la mappa
            if (!parking.lat || !parking.lng) return null;

            const statusColor = getStatusColor(parking.posti_liberi, parking.capacita);

            return (
              <Marker key={parking.id_park} position={[parking.lat, parking.lng]}>
                <Popup>
                  <div className="text-center p-1 w-48">
                    <h3 className="font-bold text-lg mb-1">{parking.park_name}</h3>
                    <p className="text-xs text-base-content/70 mb-2">{parking.address}</p>
                    
                    <div className="my-3 bg-base-200 p-2 rounded-lg">
                      <p className="text-sm">Posti disponibili:</p>
                      <span className={`text-2xl font-bold ${statusColor}`}>
                        {parking.posti_liberi || 0}
                      </span>
                      <span className="text-sm font-normal text-base-content"> / {parking.capacita}</span>
                    </div>

                    <div className="flex flex-col gap-2">
                      <button
                        className="btn btn-sm btn-primary w-full"
                        disabled={parking.posti_liberi === 0}
                        onClick={() => alert(`Apertura modale prenotazione per ${parking.park_name}`)}
                      >
                        {parking.posti_liberi > 0 ? 'Prenota Ora' : 'Parcheggio Completo'}
                      </button>
                    </div>
                  </div>
                </Popup>
              </Marker>
            );
          })}
        </MapContainer>
      </div>
    </div>
  );
}