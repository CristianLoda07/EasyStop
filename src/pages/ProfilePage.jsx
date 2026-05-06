import React, { useState, useEffect } from 'react';
import { base44, supabase } from '@/api/supabaseClient';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/lib/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { User, Phone, Plus, Loader2, Calendar, CheckCircle, Leaf } from 'lucide-react';
import { toast } from 'sonner';
import { calcolaRisparmioEmissioni } from '@/lib/greenUtils';
import VehicleCard from '@/components/vehicle/VehicleCard';
import VehicleForm from '@/components/vehicle/VehicleForm';

export default function ProfilePage() {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const [profile, setProfile] = useState({ telefono: '', is_disable: false, is_pregnant: false });
  const [vehicleForm, setVehicleForm] = useState({ open: false, vehicle: null });

  useEffect(() => {
    if (user) {
      setProfile({
        telefono: user.telefono || '',
        is_disable: user.is_disable || false,
        is_pregnant: user.is_pregnant || false,
      });
    }
  }, [user]);

  const { data: veicoli = [] } = useQuery({
    queryKey: ['veicoli', user?.id],
    enabled: !!user?.id,
    queryFn: async () => {
      const { data, error } = await supabase.from('veicoli').select('*').eq('id_user', user.id);
      if (error) throw new Error(error.message);
      return data || [];
    },
  });

  // Query per le prenotazioni attive (confermata o in_corso, non ancora scadute)
  const { data: prenotazioniAttive = [] } = useQuery({
    queryKey: ['prenotazioni-attive', user?.id],
    enabled: !!user?.id,
    queryFn: async () => {
      const now = new Date().toISOString();
      const { data, error } = await supabase
        .from('prenotazioni')
        .select('*, veicoli(alimentazione)')
        .eq('id_user', user.id)
        .in('stato', ['confermata', 'in_corso'])
        .gt('fine_sosta', now);
      if (error) throw new Error(error.message);
      return data || [];
    },
  });

  // Query per le prenotazioni completate o scadute
  const { data: prenotazioniCompletate = [] } = useQuery({
    queryKey: ['prenotazioni-completate', user?.id],
    enabled: !!user?.id,
    queryFn: async () => {
      const now = new Date().toISOString();
      const { data, error } = await supabase
        .from('prenotazioni')
        .select('*, veicoli(alimentazione)')
        .eq('id_user', user.id)
        .or(`stato.eq.completata,fine_sosta.lt.${now}`);
      if (error) throw new Error(error.message);
      return data || [];
    },
  });

  // Calcola il CO2 totale risparmiato
  const co2Totale = (prenotazioniCompletate || []).reduce((total, prenota) => {
    if (prenota.veicoli?.alimentazione) {
      const greenData = calcolaRisparmioEmissioni(prenota.veicoli.alimentazione);
      return total + (greenData.risparmioGrammi || 0);
    }
    return total;
  }, 0);

  // Mutation per salvare il profilo
  const saveProfileMutation = useMutation({
    mutationFn: () => base44.auth.updateMe(profile),
    onSuccess: () => {
      toast.success('Profilo aggiornato con successo');
    },
    onError: (error) => {
      toast.error(`Errore: ${error.message || 'Impossibile salvare il profilo'}`);
    },
  });

  // Mutation per salvare/aggiornare veicolo
  const saveVehicleMutation = useMutation({
    mutationFn: ({ data, id }) => 
      id 
        ? base44.entities.Veicolo.update(id, data)
        : base44.entities.Veicolo.create(data),
    onSuccess: (_, { id }) => {
      toast.success(id ? 'Veicolo aggiornato' : 'Veicolo aggiunto');
      queryClient.invalidateQueries({ queryKey: ['veicoli'] });
      setVehicleForm({ open: false, vehicle: null });
    },
    onError: (error) => {
      toast.error(`Errore: ${error.message || 'Impossibile salvare il veicolo'}`);
    },
  });

  // Mutation per eliminare veicolo
  const deleteVehicleMutation = useMutation({
    mutationFn: (vehicleId) => base44.entities.Veicolo.delete(vehicleId),
    onSuccess: () => {
      toast.success('Veicolo eliminato');
      queryClient.invalidateQueries({ queryKey: ['veicoli'] });
    },
    onError: (error) => {
      toast.error(`Errore: ${error.message || 'Impossibile eliminare il veicolo'}`);
    },
  });

  // Mutation per impostare veicolo di default
  const setDefaultVehicleMutation = useMutation({
    mutationFn: async (vehicleToSetDefault) => {
      // Rimuovi default da tutti gli altri
      for (const veh of veicoli) {
        if (veh.isdefault && veh.id_vcl !== vehicleToSetDefault.id_vcl) {
          await base44.entities.Veicolo.update(veh.id_vcl, { isdefault: false });
        }
      }
      // Imposta il nuovo default
      await base44.entities.Veicolo.update(vehicleToSetDefault.id_vcl, { isdefault: true });
    },
    onSuccess: () => {
      toast.success('Veicolo impostato come predefinito');
      queryClient.invalidateQueries({ queryKey: ['veicoli'] });
    },
    onError: (error) => {
      toast.error(`Errore: ${error.message || 'Impossibile impostare il veicolo di default'}`);
    },
  });

  return (
    <div className="p-4 lg:p-8 max-w-4xl mx-auto space-y-6">
      <h1 className="text-2xl lg:text-3xl font-bold">Profilo</h1>

      {/* Statistiche */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Prenotazioni Attive</p>
                <p className="text-2xl font-bold mt-2">{prenotazioniAttive.length}</p>
              </div>
              <Calendar className="w-8 h-8 text-primary opacity-50" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Veicoli Registrati</p>
                <p className="text-2xl font-bold mt-2">{veicoli.length}</p>
              </div>
              <User className="w-8 h-8 text-primary opacity-50" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Soste Completate</p>
                <p className="text-2xl font-bold mt-2">{prenotazioniCompletate.length}</p>
              </div>
              <CheckCircle className="w-8 h-8 text-primary opacity-50" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">CO₂ Risparmiata</p>
                <p className="text-2xl font-bold mt-2">{(co2Totale / 1000).toFixed(1)}kg</p>
              </div>
              <Leaf className="w-8 h-8 text-primary opacity-50" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Profilo utente */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="w-5 h-5 text-primary" /> Dati Personali
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Nome completo</Label>
              <Input value={user?.full_name || ''} disabled className="bg-muted" />
            </div>
            <div className="space-y-2">
              <Label>Email</Label>
              <Input value={user?.email || ''} disabled className="bg-muted" />
            </div>
            <div className="space-y-2">
              <Label>Telefono</Label>
              <Input
                placeholder="+39 333 1234567"
                value={profile.telefono}
                onChange={(e) => setProfile(p => ({...p, telefono: e.target.value}))}
              />
            </div>
          </div>

          <Separator />

          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Esigenze Speciali</h3>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">♿ Contrassegno disabili</p>
                <p className="text-sm text-muted-foreground">Abilita per prenotare posti riservati</p>
              </div>
              <Switch
                checked={profile.is_disable}
                onCheckedChange={(v) => setProfile(p => ({...p, is_disable: v}))}
              />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">🤰 Posti rosa (gravidanza)</p>
                <p className="text-sm text-muted-foreground">Abilita per prenotare posti rosa</p>
              </div>
              <Switch
                checked={profile.is_pregnant}
                onCheckedChange={(v) => setProfile(p => ({...p, is_pregnant: v}))}
              />
            </div>
          </div>

          <Button onClick={() => saveProfileMutation.mutate()} disabled={saveProfileMutation.isPending}>
            {saveProfileMutation.isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
            Salva Profilo
          </Button>
        </CardContent>
      </Card>

      {/* Veicoli */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold">I Miei Veicoli</h2>
          <Button onClick={() => setVehicleForm({ open: true, vehicle: null })}>
            <Plus className="w-4 h-4 mr-2" /> Aggiungi
          </Button>
        </div>
        {veicoli.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center text-muted-foreground">
              Nessun veicolo registrato. Aggiungine uno per iniziare a prenotare.
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            {veicoli.map(v => (
              <VehicleCard
                key={v.id_vcl}
                vehicle={v}
                onEdit={(v) => setVehicleForm({ open: true, vehicle: v })}
                onDelete={(v) => deleteVehicleMutation.mutate(v.id_vcl)}
                onSetDefault={(v) => setDefaultVehicleMutation.mutate(v)}
                isDeleting={deleteVehicleMutation.isPending}
                isSettingDefault={setDefaultVehicleMutation.isPending}
              />
            ))}
          </div>
        )}
      </div>

      <VehicleForm
        vehicle={vehicleForm.vehicle}
        open={vehicleForm.open}
        onClose={() => setVehicleForm({ open: false, vehicle: null })}
        onSave={(data, id) => saveVehicleMutation.mutate({ data, id })}
      />
    </div>
  );
}