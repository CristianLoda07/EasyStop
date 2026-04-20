import React, { useState, useEffect } from 'react';
import { supabase, base44 } from '@/api/supabaseClient';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/lib/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { calcolaPrezzo, calcolaRisparmioEmissioni, ALIMENTAZIONE_LABELS } from '@/lib/greenUtils';
import { Leaf, MapPin, Loader2, CalendarPlus } from 'lucide-react';
import { toast } from 'sonner';

export default function BookingForm({ parking, open, onClose, onSuccess }) {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const [form, setForm] = useState({
    veicolo_id: '',
    inizio_sosta: '',
    fine_sosta: '',
    tipo_posto: 'standard',
  });

  // Veicoli filtrati per l'utente corrente
  const { data: veicoli = [] } = useQuery({
    queryKey: ['veicoli', user?.id],
    enabled: !!user?.id,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('veicoli')
        .select('*')
        .eq('id_user', user.id);
      if (error) throw new Error(error.message);
      return data || [];
    },
  });

  useEffect(() => {
    if (veicoli.length > 0 && !form.veicolo_id) {
      const defaultV = veicoli.find(v => v.isdefault);
      if (defaultV) setForm(f => ({ ...f, veicolo_id: defaultV.id_vcl }));
    }
  }, [veicoli]);

  const bookingMutation = useMutation({
    mutationFn: async () => {
      if (!form.veicolo_id || !form.inizio_sosta || !form.fine_sosta) {
        throw new Error('Compila tutti i campi obbligatori');
      }
      if (new Date(form.fine_sosta) <= new Date(form.inizio_sosta)) {
        throw new Error("La fine sosta deve essere successiva all'inizio");
      }

      const selectedVeicolo = veicoli.find(v => v.id_vcl === form.veicolo_id);
      const greenData = selectedVeicolo
        ? calcolaRisparmioEmissioni(selectedVeicolo.alimentazione)
        : { risparmioGrammi: 0 };
      const tariffa = parking?.tariffa_oraria || 1.50;
      const prezzo = calcolaPrezzo(form.inizio_sosta, form.fine_sosta, tariffa);
      const parkingId = parking?.id_park ?? parking?.id;

      if (!parkingId) {
        throw new Error('ID parcheggio non valido');
      }

      const payload = {
        id_user:              user.id,
        id_vcl:               form.veicolo_id,
        id_park:              parkingId,
        inizio_sosta:         form.inizio_sosta,
        fine_sosta:           form.fine_sosta,
        tipo_posto_prenotato: form.tipo_posto,
        prezzo_tot:           prezzo,
        stato:                'confermata',
      };

      let { error } = await supabase.from('prenotazioni').insert(payload);

      // Compatibilita: alcuni schemi non hanno ancora la colonna `stato`.
      if (error && /stato|column/i.test(error.message || '')) {
        const { stato, ...legacyPayload } = payload;
        const retry = await supabase.from('prenotazioni').insert(legacyPayload);
        error = retry.error;
      }

      if (error) throw new Error(error.message);
      return { prezzo, greenData };
    },
    onSuccess: () => {
      toast.success('Prenotazione confermata! ✓');
      queryClient.invalidateQueries({ queryKey: ['parcheggi'] });
      queryClient.invalidateQueries({ queryKey: ['prenotazioni'] });
      onSuccess?.();
      onClose();
      setForm({ veicolo_id: '', inizio_sosta: '', fine_sosta: '', tipo_posto: 'standard' });
    },
    onError: (error) => {
      toast.error(`Errore: ${error.message}`);
    },
  });

  const selectedVeicolo = veicoli.find(v => v.id_vcl === form.veicolo_id);
  const tariffa = parking?.tariffa_oraria || 1.50;
  const prezzo = form.inizio_sosta && form.fine_sosta
    ? calcolaPrezzo(form.inizio_sosta, form.fine_sosta, tariffa)
    : 0;
  const green = selectedVeicolo ? calcolaRisparmioEmissioni(selectedVeicolo.alimentazione) : null;
  const canBookDisabili = user?.is_disable === true;
  const canBookRosa    = user?.is_pregnant === true;

  if (!parking) return null;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <MapPin className="w-5 h-5 text-primary" />
            Prenota - {parking.park_name}
          </DialogTitle>
          <DialogDescription>
            Seleziona veicolo, orario e tipo di posto per confermare la prenotazione.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={(e) => { e.preventDefault(); bookingMutation.mutate(); }} className="space-y-4">
          <div className="space-y-2">
            <Label>Veicolo</Label>
            {veicoli.length === 0 ? (
              <p className="text-sm text-muted-foreground">Nessun veicolo registrato. Aggiungine uno dal profilo.</p>
            ) : (
              <Select value={form.veicolo_id} onValueChange={(v) => setForm(f => ({...f, veicolo_id: v}))}>
                <SelectTrigger>
                  <SelectValue placeholder="Seleziona veicolo" />
                </SelectTrigger>
                <SelectContent>
                  {veicoli.map(v => (
                    <SelectItem key={v.id_vcl} value={v.id_vcl}>
                      {v.targa} - {v.marca} ({ALIMENTAZIONE_LABELS[v.alimentazione]})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label>Inizio sosta</Label>
              <Input
                type="datetime-local"
                value={form.inizio_sosta}
                onChange={(e) => setForm(f => ({...f, inizio_sosta: e.target.value}))}
              />
            </div>
            <div className="space-y-2">
              <Label>Fine sosta</Label>
              <Input
                type="datetime-local"
                value={form.fine_sosta}
                onChange={(e) => setForm(f => ({...f, fine_sosta: e.target.value}))}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Tipo posto</Label>
            <Select value={form.tipo_posto} onValueChange={(v) => setForm(f => ({...f, tipo_posto: v}))}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="standard">Standard</SelectItem>
                {canBookDisabili && <SelectItem value="disabili">♿ Disabili</SelectItem>}
                {canBookRosa    && <SelectItem value="rosa">🤰 Rosa</SelectItem>}
              </SelectContent>
            </Select>
          </div>

          <div className="bg-muted rounded-xl p-4 space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Tariffa oraria</span>
              <span className="font-medium">€{tariffa.toFixed(2)}/h</span>
            </div>
            <div className="flex justify-between text-lg font-bold">
              <span>Totale</span>
              <span className="text-primary">€{prezzo.toFixed(2)}</span>
            </div>
          </div>

          {green && green.risparmioGrammi > 0 && (
            <div className="bg-accent rounded-xl p-4 flex items-center gap-3">
              <Leaf className="w-8 h-8 text-primary" />
              <div>
                <p className="text-sm font-medium text-primary">Risparmio CO₂</p>
                <p className="text-xs text-muted-foreground">
                  {green.risparmioGrammi}g CO₂ risparmiati (~{green.alberiEquivalenti} alberi/giorno)
                </p>
              </div>
            </div>
          )}

          <Button
            type="submit"
            className="w-full"
            disabled={bookingMutation.isPending || veicoli.length === 0}
          >
            {bookingMutation.isPending
              ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Registrazione...</>
              : <><CalendarPlus className="w-4 h-4 mr-2" /> Conferma Prenotazione</>
            }
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}