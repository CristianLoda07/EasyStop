import React, { useState } from 'react';
import { base44 } from '@/api/supabaseClient';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Search, Calendar, Trash2, Eye } from 'lucide-react';
import { format } from 'date-fns';
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel,
  AlertDialogContent, AlertDialogDescription, AlertDialogFooter,
  AlertDialogHeader, AlertDialogTitle
} from '@/components/ui/alert-dialog';
import { toast } from 'sonner';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { STATO_LABELS } from '@/lib/greenUtils';

const statusBadgeVariant = {
  confermata: 'default',
  in_corso: 'secondary',
  completata: 'outline',
  cancellata: 'destructive',
};

export default function AdminBookings() {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
  const [deleteBooking, setDeleteBooking] = useState(null);
  const [viewDetails, setViewDetails] = useState(null);

  const { data: prenotazioni = [], isLoading, isError, error } = useQuery({
    queryKey: ['admin-prenotazioni'],
    queryFn: async () => {
      const [prenotazioniRaw, parcheggi, veicoli, utenti] = await Promise.all([
        base44.entities.Prenotazione.list(),
        base44.entities.Parcheggio.list(),
        base44.entities.Veicolo.list(),
        base44.entities.User.list(),
      ]);

      const parcheggiById = new Map(parcheggi.map((p) => [p.id_park || p.id, p]));
      const veicoliById = new Map(veicoli.map((v) => [v.id_vcl || v.id, v]));
      const utentiById = new Map(utenti.map((u) => [u.id, u]));

      return (prenotazioniRaw || []).map((p) => {
        const parcheggio = parcheggiById.get(p.id_park || p.parcheggio_id);
        const veicolo = veicoliById.get(p.id_vcl || p.veicolo_id);
        const utente = utentiById.get(p.id_user);

        return {
          ...p,
          parcheggio_nome: p.parcheggio_nome || parcheggio?.park_name || 'Parcheggio',
          veicolo_targa: p.veicolo_targa || veicolo?.targa || '-',
          email_utente: p.email_utente || utente?.email || '-',
        };
      });
    },
  });

  const term = search.trim().toLowerCase();
  const filtered = !term
    ? prenotazioni
    : prenotazioni.filter((p) => (
      `${p.parcheggio_nome || ''} ${p.id_park || ''}`.toLowerCase().includes(term) ||
      `${p.veicolo_targa || ''} ${p.id_vcl || ''}`.toLowerCase().includes(term) ||
      `${p.email_utente || ''} ${p.id_user || ''}`.toLowerCase().includes(term)
    ));

  // Mutation per eliminare prenotazione
  const deleteBookingMutation = useMutation({
    mutationFn: () => base44.entities.Prenotazione.delete(deleteBooking.id_prenotazione || deleteBooking.id),
    onSuccess: () => {
      toast.success('Prenotazione eliminata con successo');
      queryClient.invalidateQueries({ queryKey: ['admin-prenotazioni'] });
      setDeleteBooking(null);
    },
    onError: (error) => {
      toast.error(`Errore: ${error.message || 'Impossibile eliminare la prenotazione'}`);
    },
  });

  return (
    <div className="p-4 lg:p-8 max-w-7xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl lg:text-3xl font-bold">Gestione Prenotazioni</h1>
        <Badge variant="secondary" className="text-sm">
          <Calendar className="w-4 h-4 mr-1" /> {prenotazioni.length} prenotazioni
        </Badge>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          placeholder="Cerca per parcheggio, targa o email..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-10"
        />
      </div>

      <Card>
        <CardContent className="p-0 overflow-x-auto">
          {isError && (
            <div className="p-4 text-sm text-destructive">
              Errore caricamento prenotazioni: {error?.message || 'permessi insufficienti (RLS) o query non valida'}
            </div>
          )}
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Parcheggio</TableHead>
                <TableHead>Targa</TableHead>
                <TableHead>Email Utente</TableHead>
                <TableHead>Inizio Sosta</TableHead>
                <TableHead>Fine Sosta</TableHead>
                <TableHead>Stato</TableHead>
                <TableHead>Prezzo</TableHead>
                <TableHead></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {!isLoading && filtered.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center text-muted-foreground py-8">
                    Nessuna prenotazione trovata.
                  </TableCell>
                </TableRow>
              ) : filtered.map(p => (
                <TableRow key={p.id_prenotazione || p.id}>
                  <TableCell className="font-medium">{p.parcheggio_nome || '-'}</TableCell>
                  <TableCell className="text-muted-foreground">{p.veicolo_targa || '-'}</TableCell>
                  <TableCell className="text-sm">{p.email_utente || '-'}</TableCell>
                  <TableCell className="text-sm">
                    {p.inizio_sosta ? format(new Date(p.inizio_sosta), 'dd/MM HH:mm') : '-'}
                  </TableCell>
                  <TableCell className="text-sm">
                    {p.fine_sosta ? format(new Date(p.fine_sosta), 'dd/MM HH:mm') : '-'}
                  </TableCell>
                  <TableCell>
                    <Badge variant={statusBadgeVariant[p.stato] || 'secondary'}>
                      {STATO_LABELS[p.stato] || p.stato}
                    </Badge>
                  </TableCell>
                  <TableCell className="font-medium">€{p.prezzo_tot?.toFixed(2) || '0.00'}</TableCell>
                  <TableCell>
                    <div className="flex gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => setViewDetails(p)}
                      >
                        <Eye className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-destructive"
                        onClick={() => setDeleteBooking(p)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Dialog dettagli prenotazione */}
      <Dialog open={!!viewDetails} onOpenChange={() => setViewDetails(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Dettagli Prenotazione</DialogTitle>
          </DialogHeader>
          {viewDetails && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Parcheggio</p>
                  <p className="font-medium">{viewDetails.parcheggio_nome || '-'}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Targa Veicolo</p>
                  <p className="font-medium">{viewDetails.veicolo_targa || '-'}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Email Utente</p>
                  <p className="font-medium text-sm">{viewDetails.email_utente || '-'}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Tipo Posto</p>
                  <p className="font-medium">{viewDetails.tipo_posto_prenotato || viewDetails.tipo_posto || '-'}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Inizio Sosta</p>
                  <p className="font-medium">
                    {viewDetails.inizio_sosta ? format(new Date(viewDetails.inizio_sosta), 'dd/MM/yyyy HH:mm') : '-'}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Fine Sosta</p>
                  <p className="font-medium">
                    {viewDetails.fine_sosta ? format(new Date(viewDetails.fine_sosta), 'dd/MM/yyyy HH:mm') : '-'}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Prezzo Totale</p>
                  <p className="font-medium">€{viewDetails.prezzo_tot?.toFixed(2) || '0.00'}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Stato</p>
                  <Badge variant={statusBadgeVariant[viewDetails.stato] || 'secondary'}>
                    {STATO_LABELS[viewDetails.stato] || viewDetails.stato}
                  </Badge>
                </div>
                {viewDetails.codice_qr && (
                  <div className="col-span-2">
                    <p className="text-sm text-muted-foreground">Codice QR</p>
                    <p className="font-mono text-xs">{viewDetails.codice_qr}</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Dialog conferma eliminazione */}
      <AlertDialog open={!!deleteBooking} onOpenChange={() => setDeleteBooking(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Elimina Prenotazione</AlertDialogTitle>
            <AlertDialogDescription>
              Vuoi eliminare la prenotazione per {deleteBooking?.parcheggio_nome} ({deleteBooking?.veicolo_targa})? L'operazione è irreversibile.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleteBookingMutation.isPending}>Annulla</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deleteBookingMutation.mutate()}
              disabled={deleteBookingMutation.isPending}
              className="bg-destructive text-destructive-foreground"
            >
              {deleteBookingMutation.isPending ? 'Eliminazione...' : 'Elimina'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
