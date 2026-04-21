import React from 'react';
import { base44 } from '@/api/supabaseClient';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { useAuth } from '@/lib/AuthContext';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CalendarCheck, Car, MapPin, Leaf, ArrowRight } from 'lucide-react';
import BookingCard from '@/components/booking/BookingCard';
import StatCard from '@/components/ui/StatCard';

export default function UserDashboard() {
  const { user } = useAuth();

  const { data: prenotazioni = [] } = useQuery({
    queryKey: ['prenotazioni-user'],
    queryFn: () => base44.entities.Prenotazione.filter({}, '-created_date', 50),
  });

  // Mostra solo i veicoli dell'utente se non admin
  const { data: veicoli = [] } = useQuery({
    queryKey: ['veicoli', user?.id, user?.role],
    enabled: !!user?.id,
    queryFn: async () => {
      if (user?.role === 'admin') {
        // Admin vede tutti i veicoli
        return await base44.entities.Veicolo.list();
      } else {
        // Utente normale vede solo i propri veicoli
        const { data, error } = await base44.supabase
          .from('veicoli')
          .select('*')
          .eq('id_user', user.id);
        if (error) throw new Error(error.message);
        return data || [];
      }
    },
  });

  const attive = prenotazioni.filter(p => p.stato === 'confermata' || p.stato === 'in_corso');
  const completate = prenotazioni.filter(p => p.stato === 'completata').length;
  const totaleCO2 = prenotazioni.reduce((s, p) => s + (p.risparmio_co2 || 0), 0);

  return (
    <div className="p-4 lg:p-8 max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl lg:text-3xl font-bold">
          Ciao, {user?.full_name?.split(' ')[0] || 'Utente'} 👋
        </h1>
        <p className="text-muted-foreground mt-1">Ecco il riepilogo delle tue attività</p>
      </div>

      {/* Stats — usa il componente condiviso StatCard */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon={CalendarCheck} label="Prenotazioni Attive" value={attive.length} color="text-blue-600 bg-blue-50" />
        <StatCard icon={Car} label="Veicoli Registrati" value={veicoli.length} color="text-purple-600 bg-purple-50" />
        <StatCard icon={MapPin} label="Soste Completate" value={completate} color="text-green-600 bg-green-50" />
        <StatCard icon={Leaf} label="CO₂ Risparmiata" value={`${(totaleCO2 / 1000).toFixed(1)}kg`} color="text-emerald-600 bg-emerald-50" />
      </div>

      {/* Prenotazioni attive */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">Prenotazioni Attive</h2>
          <Link to="/bookings">
            <Button variant="ghost" size="sm">
              Vedi tutte <ArrowRight className="w-4 h-4 ml-1" />
            </Button>
          </Link>
        </div>
        {attive.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <CalendarCheck className="w-12 h-12 mx-auto text-muted-foreground/30 mb-3" />
              <p className="text-muted-foreground">Nessuna prenotazione attiva</p>
              <Link to="/">
                <Button className="mt-4">Trova un Parcheggio</Button>
              </Link>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            {attive.slice(0, 4).map(b => (
              <BookingCard key={b.id} booking={b} />
            ))}
          </div>
        )}
      </div>

      {/* Veicoli rapidi */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">I tuoi Veicoli</h2>
          <Link to="/profile">
            <Button variant="ghost" size="sm">
              Gestisci <ArrowRight className="w-4 h-4 ml-1" />
            </Button>
          </Link>
        </div>
        <div className="flex gap-3 overflow-x-auto pb-2">
          {veicoli.map(v => (
            <Card key={v.id} className="min-w-[180px] flex-shrink-0">
              <CardContent className="p-4">
                <p className="font-bold tracking-wider">{v.targa}</p>
                <p className="text-xs text-muted-foreground">{v.marca} · {v.alimentazione}</p>
              </CardContent>
            </Card>
          ))}
          {veicoli.length === 0 && (
            <Card className="min-w-[180px]">
              <CardContent className="p-4 text-center text-sm text-muted-foreground">
                Nessun veicolo
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
