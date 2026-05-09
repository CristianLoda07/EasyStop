import React, { useState } from 'react';
import { base44 } from '@/api/supabaseClient';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Plus, Search, Pencil, Trash2, MapPin } from 'lucide-react';
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel,
  AlertDialogContent, AlertDialogDescription, AlertDialogFooter,
  AlertDialogHeader, AlertDialogTitle
} from '@/components/ui/alert-dialog';
import ParkingFormDialog from '@/components/admin/ParkingFormDialog';
import { toast } from 'sonner';
import { getColorByOccupancy, isPrenotazioneAttiva } from '@/lib/greenUtils';

const dotColors = { green: 'bg-green-500', gold: 'bg-yellow-500', orange: 'bg-orange-500', red: 'bg-red-500' };

export default function AdminParkings() {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
  const [formOpen, setFormOpen] = useState(false);
  const [editParking, setEditParking] = useState(null);
  const [deleteParking, setDeleteParking] = useState(null);

  const { data: parcheggi = [], isLoading } = useQuery({
    queryKey: ['admin-parcheggi'],
    queryFn: () => base44.entities.Parcheggio.list(),
  });

  const { data: prenotazioni = [] } = useQuery({
    queryKey: ['admin-prenotazioni'],
    queryFn: () => base44.entities.Prenotazione.list(),
  });

  // Calcola i posti liberi dinamicamente dalle prenotazioni attive
  const now = new Date();
  const prenotazioniAttive = prenotazioni.filter(p => isPrenotazioneAttiva(p, now));

  const getPostiLiberi = (p) => {
    const capacita = Number(p.capacita) || 0;
    const idParcheggio = p.id_park || p.id;
    const occupati = prenotazioniAttive.filter(
      pr => (pr.id_park || pr.parcheggio_id) === idParcheggio
    ).length;
    return Math.max(0, capacita - occupati);
  };

  const filtered = parcheggi.filter(p =>
    p.park_name?.toLowerCase().includes(search.toLowerCase()) ||
    p.address?.toLowerCase().includes(search.toLowerCase())
  );

  // Mutation per eliminare parcheggio
  const deleteParkingMutation = useMutation({
    mutationFn: () => base44.entities.Parcheggio.delete(deleteParking.id_park || deleteParking.id),
    onSuccess: () => {
      toast.success('Parcheggio eliminato con successo');
      queryClient.invalidateQueries({ queryKey: ['admin-parcheggi'] });
      setDeleteParking(null);
    },
    onError: (error) => {
      toast.error(`Errore: ${error.message || 'Impossibile eliminare il parcheggio'}`);
    },
  });

  // Mutation per salvare/aggiornare parcheggio
  const saveParkingMutation = useMutation({
    mutationFn: ({ data, id }) => {
      // Rimuovi is_active, calcola e aggiungi posti_liberi
      const { is_active, ...dataToSend } = data || {};
      // Calcola i posti liberi in base alla capacità e alle prenotazioni attive
      const now = new Date();
      const prenotazioniAttive = prenotazioni.filter(p => isPrenotazioneAttiva(p, now));
      const idParcheggio = id || dataToSend.id_park || dataToSend.id;
      const capacita = Number(dataToSend.capacita) || 0;
      const occupati = prenotazioniAttive.filter(
        pr => (pr.id_park || pr.parcheggio_id) === idParcheggio
      ).length;
      const posti_liberi = Math.max(0, capacita - occupati);
      // Invia anche il campo posti_liberi
      return id
        ? base44.entities.Parcheggio.update(id, { ...dataToSend, posti_liberi })
        : base44.entities.Parcheggio.create({ ...dataToSend, posti_liberi });
    },
    onSuccess: (_, { id }) => {
      toast.success(id ? 'Parcheggio aggiornato' : 'Parcheggio creato');
      // Invalida sia parcheggi che prenotazioni per aggiornare dashboard e viste
      queryClient.invalidateQueries({ queryKey: ['admin-parcheggi'] });
      queryClient.invalidateQueries({ queryKey: ['admin-prenotazioni'] });
      setFormOpen(false);
      setEditParking(null);
    },
    onError: (error) => {
      toast.error(`Errore: ${error.message || 'Impossibile salvare il parcheggio'}`);
    },
  });

  return (
    <div className="p-4 lg:p-8 max-w-7xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <h1 className="text-2xl lg:text-3xl font-bold">Gestione Parcheggi</h1>
        <Button onClick={() => { setEditParking(null); setFormOpen(true); }}>
          <Plus className="w-4 h-4 mr-2" /> Nuovo Parcheggio
        </Button>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          placeholder="Cerca per nome o indirizzo..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-10"
        />
      </div>

      <Card>
        <CardContent className="p-0 overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Stato</TableHead>
                <TableHead>Nome</TableHead>
                <TableHead>Indirizzo</TableHead>
                <TableHead className="text-center">Capacità</TableHead>
                <TableHead className="text-center">Liberi</TableHead>
                <TableHead className="text-center">Tariffa</TableHead>
                <TableHead className="text-center">Servizi</TableHead>
                <TableHead></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map(p => {
                // const liberi = getPostiLiberi(p); // NON serve più
                const color = getColorByOccupancy(p.posti_liberi, p.capacita);
                return (
                  <TableRow key={p.id_park || p.id}>
                    <TableCell>
                      <div className={`w-3 h-3 rounded-full ${dotColors[color]}`} />
                    </TableCell>
                    <TableCell className="font-medium">{p.park_name}</TableCell>
                    <TableCell className="text-muted-foreground text-sm max-w-[200px] truncate">{p.address || '-'}</TableCell>
                    <TableCell className="text-center">{p.capacita}</TableCell>
                    <TableCell className="text-center font-semibold">{p.posti_liberi}</TableCell>
                    <TableCell className="text-center">€{p.tariffa_oraria?.toFixed(2) || '0.00'}</TableCell>
                    <TableCell className="text-center">
                      <div className="flex gap-1 justify-center">
                        {p.posti_dis && <Badge variant="secondary" className="text-xs">♿</Badge>}
                        {p.posti_rosa && <Badge variant="secondary" className="text-xs">🤰</Badge>}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-1">
                        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => { setEditParking(p); setFormOpen(true); }}>
                          <Pencil className="w-4 h-4" />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => setDeleteParking(p)}>
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <ParkingFormDialog
        parking={editParking}
        open={formOpen}
        onClose={() => { setFormOpen(false); setEditParking(null); }}
        onSave={(data, id) => saveParkingMutation.mutate({ data, id })}
      />

      <AlertDialog open={!!deleteParking} onOpenChange={() => setDeleteParking(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Elimina Parcheggio</AlertDialogTitle>
            <AlertDialogDescription>
              Vuoi eliminare "{deleteParking?.park_name}"? L'operazione è irreversibile.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleteParkingMutation.isPending}>Annulla</AlertDialogCancel>
            <AlertDialogAction 
              onClick={() => deleteParkingMutation.mutate()} 
              disabled={deleteParkingMutation.isPending}
              className="bg-destructive text-destructive-foreground"
            >
              {deleteParkingMutation.isPending ? 'Eliminazione...' : 'Elimina'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}