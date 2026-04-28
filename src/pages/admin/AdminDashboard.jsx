import React from 'react';
import { base44 } from '@/api/supabaseClient';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CalendarCheck, Users, Car, Leaf, MapPin } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { STATO_LABELS, CHART_COLORS, getColorByOccupancy, OCCUPANCY_COLOR_CLASSES } from '@/lib/greenUtils';
import StatCard from '@/components/ui/StatCard';

export default function AdminDashboard() {
  const { data: prenotazioni = [] } = useQuery({
    queryKey: ['admin-prenotazioni'],
    queryFn: () => base44.entities.Prenotazione.list('-created_date', 500),
  });
  const { data: parcheggi = [] } = useQuery({
    queryKey: ['admin-parcheggi'],
    queryFn: () => base44.entities.Parcheggio.list(),
  });
  const { data: utenti = [] } = useQuery({
    queryKey: ['admin-utenti'],
    queryFn: () => base44.entities.User.list(),
    refetchInterval: 10000,
  });

  const now = new Date();
  const today = prenotazioni.filter(p => {
    const d = new Date(p.created_date);
    return d.toDateString() === now.toDateString();
  });

  const utentiAttivi = utenti.filter(u => u.is_active);

  const totaleCO2 = prenotazioni.reduce((s, p) => s + (p.risparmio_co2 || 0), 0);

  // Stato chart data
  const statoData = ['confermata', 'in_corso', 'completata', 'cancellata'].map(stato => ({
    name: STATO_LABELS[stato],
    value: prenotazioni.filter(p => p.stato === stato).length,
  }));

  // Top parcheggi
  const parkingCount = {};
  prenotazioni.forEach(p => {
    const name = p.parcheggio_nome || 'Sconosciuto';
    parkingCount[name] = (parkingCount[name] || 0) + 1;
  });
  const topParkings = Object.entries(parkingCount)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 8)
    .map(([name, count]) => ({ name: name.length > 15 ? name.substring(0, 15) + '...' : name, prenotazioni: count }));

  return (
    <div className="p-4 lg:p-8 max-w-7xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl lg:text-3xl font-bold">Dashboard Amministratore</h1>
        <p className="text-muted-foreground mt-1">Panoramica del sistema EasyStop</p>
      </div>

      {/* Stats — usa il componente condiviso StatCard */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon={CalendarCheck} label="Prenotazioni Totali" value={prenotazioni.length} sub={`${today.length} oggi`} color="text-blue-600 bg-blue-50" />
        <StatCard icon={Users} label="Utenti Attivi" value={utentiAttivi.length} color="text-purple-600 bg-purple-50" />
        <StatCard icon={MapPin} label="Parcheggi Attivi" value={parcheggi.length} color="text-green-600 bg-green-50" />
        <StatCard icon={Leaf} label="CO₂ Risparmiata" value={`${(totaleCO2 / 1000).toFixed(1)}kg`} color="text-emerald-600 bg-emerald-50" />
      </div>

      {/* Charts */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Pie chart — usa CHART_COLORS dal tema shadcn/ui */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Prenotazioni per Stato</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={statoData} cx="50%" cy="50%" outerRadius={80} dataKey="value" label={({ name, value }) => `${name}: ${value}`}>
                    {statoData.map((_, i) => <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />)}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Bar chart — usa CHART_COLORS[0] invece di hex */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Parcheggi Più Utilizzati</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={topParkings}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" tick={{ fontSize: 11 }} angle={-20} textAnchor="end" height={60} />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="prenotazioni" fill={CHART_COLORS[0]} radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Occupazione parcheggi — usa OCCUPANCY_COLOR_CLASSES invece di hex inline */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Occupazione Parcheggi</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {parcheggi.slice(0, 10).map(p => {
              const liberi = p.posti_liberi ?? p.capacita;
              const perc = p.capacita > 0 ? Math.round(((p.capacita - liberi) / p.capacita) * 100) : 0;
              const colorKey = getColorByOccupancy(liberi, p.capacita);
              const colorClasses = OCCUPANCY_COLOR_CLASSES[colorKey];
              return (
                <div key={p.id_park || p.id} className="flex items-center gap-3">
                  <span className="text-sm font-medium w-40 truncate">{p.park_name}</span>
                  <div className="flex-1 bg-muted rounded-full h-3">
                    <div
                      className={`h-3 rounded-full transition-all ${colorClasses.bg}`}
                      style={{ width: `${perc}%` }}
                    />
                  </div>
                  <span className="text-sm text-muted-foreground w-16 text-right">{perc}%</span>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
