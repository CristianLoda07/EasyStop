import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Loader2 } from 'lucide-react';
import { useAuth } from '@/lib/AuthContext';

export default function VehicleForm({ vehicle, open, onClose, onSave }) {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    targa: '',
    marca: '',
    type_vcl: 'auto',
    alimentazione: 'benzina',
  });

  useEffect(() => {
    if (vehicle) {
      setForm({
        targa:         vehicle.targa || '',
        marca:         vehicle.marca || '',
        type_vcl:      vehicle.type_vcl || 'auto',
        alimentazione: vehicle.alimentazione || 'benzina',
      });
    } else {
      setForm({ targa: '', marca: '', type_vcl: 'auto', alimentazione: 'benzina' });
    }
  }, [vehicle, open]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const payload = {
      ...form,
      id_user:    user.id,
      isdefault:  false,
    };

    // In modifica passiamo id_vcl come secondo argomento
    await onSave(payload, vehicle?.id_vcl ?? vehicle?.id);
    setLoading(false);
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{vehicle ? 'Modifica Veicolo' : 'Aggiungi Veicolo'}</DialogTitle>
          <DialogDescription>Inserisci i dati del veicolo da associare al tuo profilo.</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label>Targa *</Label>
            <Input
              placeholder="AA123BB"
              value={form.targa}
              onChange={(e) => setForm(f => ({...f, targa: e.target.value.toUpperCase()}))}
              required
            />
          </div>
          <div className="space-y-2">
            <Label>Marca</Label>
            <Input
              placeholder="Es. Fiat, BMW..."
              value={form.marca}
              onChange={(e) => setForm(f => ({...f, marca: e.target.value}))}
            />
          </div>
          <div className="space-y-2">
            <Label>Tipo veicolo *</Label>
            <Select value={form.type_vcl} onValueChange={(v) => setForm(f => ({...f, type_vcl: v}))}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="auto">Auto</SelectItem>
                <SelectItem value="moto">Moto</SelectItem>
                <SelectItem value="van">Van</SelectItem>
                <SelectItem value="suv">SUV</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Alimentazione *</Label>
            <Select value={form.alimentazione} onValueChange={(v) => setForm(f => ({...f, alimentazione: v}))}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="benzina">Benzina</SelectItem>
                <SelectItem value="diesel">Diesel</SelectItem>
                <SelectItem value="elettrica">Elettrica</SelectItem>
                <SelectItem value="ibrida">Ibrida</SelectItem>
                <SelectItem value="gpl">GPL</SelectItem>
                <SelectItem value="metano">Metano</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <Button type="submit" className="w-full" disabled={loading}>
            {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
            {vehicle ? 'Salva Modifiche' : 'Aggiungi Veicolo'}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}