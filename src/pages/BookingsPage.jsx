import React, { useEffect, useState } from 'react';
import { supabase } from '@/api/supabaseClient';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/lib/AuthContext';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { CalendarCheck } from 'lucide-react';
import BookingCard from '@/components/booking/BookingCard';
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel,
  AlertDialogContent, AlertDialogDescription, AlertDialogFooter,
  AlertDialogHeader, AlertDialogTitle
} from '@/components/ui/alert-dialog';
import { toast } from 'sonner';
import { getStatoEffettivoPrenotazione } from '@/lib/greenUtils';

export default function BookingsPage() {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const [filter, setFilter] = useState('tutte');
  const [cancelBooking, setCancelBooking] = useState(null);

  const { data: prenotazioni = [], isLoading, isError, error } = useQuery({
    queryKey: ['prenotazioni', user?.id],
    enabled: !!user?.id,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('prenotazioni')
        .select(`
          *,
          parcheggi:id_park ( park_name, address ),
          veicoli:id_vcl ( targa, marca )
        `)
        .eq('id_user', user.id)
        .order('inizio_sosta', { ascending: false });

      if (error) throw new Error(error.message);

      const rows = (data || []).map(p => ({
        ...p,
        parcheggio_nome: p.parcheggi?.park_name || 'Parcheggio',
        veicolo_targa:   p.veicoli?.targa || '',
      }));

      const now = new Date();
      const rowsConStatoEffettivo = rows.map(p => ({
        ...p,
        stato: getStatoEffettivoPrenotazione(p, now),
      }));

      const daAggiornare = rows.filter(p => getStatoEffettivoPrenotazione(p, now) !== p.stato);
      if (daAggiornare.length > 0) {
        await Promise.all(
          daAggiornare.map(p => {
            const statoEffettivo = getStatoEffettivoPrenotazione(p, now);
            return supabase
              .from('prenotazioni')
              .update({ stato: statoEffettivo })
              .eq('id_prenotazione', p.id_prenotazione);
          })
        );
      }

      return rowsConStatoEffettivo;
    },
  });

  useEffect(() => {
    if (isError && error) {
      toast.error(`Errore caricamento prenotazioni: ${error.message}`);
    }
  }, [isError, error]);

  const cancelMutation = useMutation({
    mutationFn: async () => {
      if (!cancelBooking) throw new Error('Nessuna prenotazione selezionata');
      const { error } = await supabase
        .from('prenotazioni')
        .update({ stato: 'cancellata' })
        .eq('id_prenotazione', cancelBooking.id_prenotazione);
      if (error) throw new Error(error.message);
    },
    onSuccess: () => {
      toast.success('Prenotazione cancellata con successo');
      queryClient.invalidateQueries({ queryKey: ['prenotazioni'] });
      setCancelBooking(null);
    },
    onError: (error) => {
      toast.error(`Errore: ${error.message}`);
    },
  });

  const filtered = filter === 'tutte'
    ? prenotazioni
    : prenotazioni.filter(p => p.stato === filter);

  return (
    <div className="p-4 lg:p-8 max-w-4xl mx-auto space-y-6">
      <h1 className="text-2xl lg:text-3xl font-bold">Le Mie Prenotazioni</h1>

      <Tabs value={filter} onValueChange={setFilter}>
        <TabsList className="flex flex-wrap">
          <TabsTrigger value="tutte">Tutte</TabsTrigger>
          <TabsTrigger value="in_corso">Attive</TabsTrigger>
          <TabsTrigger value="completata">Completate</TabsTrigger>
          <TabsTrigger value="cancellata">Cancellate</TabsTrigger>
        </TabsList>
      </Tabs>

      {isLoading ? (
        <div className="space-y-4">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-32 bg-muted animate-pulse rounded-xl" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16">
          <CalendarCheck className="w-16 h-16 mx-auto text-muted-foreground/20 mb-4" />
          <p className="text-lg text-muted-foreground">Nessuna prenotazione trovata</p>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {filtered.map(b => (
            <BookingCard
              key={b.id_prenotazione}
              booking={b}
              onCancel={(b) => setCancelBooking(b)}
            />
          ))}
        </div>
      )}

      <AlertDialog open={!!cancelBooking} onOpenChange={() => setCancelBooking(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Cancella Prenotazione</AlertDialogTitle>
            <AlertDialogDescription>
              Sei sicuro di voler cancellare questa prenotazione?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={cancelMutation.isPending}>Annulla</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => cancelMutation.mutate()}
              disabled={cancelMutation.isPending}
              className="bg-destructive text-destructive-foreground"
            >
              {cancelMutation.isPending ? 'Cancellazione in corso...' : 'Cancella'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}