import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Loader2 } from 'lucide-react';

export default function ParkingFormDialog({ parking, open, onClose, onSave }) {
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    park_name: '', address: '', lat: '', lng: '',
    capacita: '', posti_liberi: '', tariffa_oraria: '',
    posti_dis: false, posti_rosa: false, is_active: true,
  });

  useEffect(() => {
    if (parking) {
      setForm({
        park_name: parking.park_name || '',
        address: parking.address || '',
        lat: parking.lat || '',
        lng: parking.lng || '',
        capacita: parking.capacita || '',
        posti_liberi: parking.posti_liberi ?? parking.capacita ?? '',
        tariffa_oraria: parking.tariffa_oraria || '',
        posti_dis: parking.posti_dis || false,
        posti_rosa: parking.posti_rosa || false,
        is_active: parking.is_active !== false,
      });
    } else {
      setForm({
        park_name: '', address: '', lat: '', lng: '',
        capacita: '', posti_liberi: '', tariffa_oraria: '',
        posti_dis: false, posti_rosa: false, is_active: true,
      });
    }
  }, [parking, open]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    await onSave({
      ...form,
      lat: parseFloat(form.lat) || 0,
      lng: parseFloat(form.lng) || 0,
      capacita: parseInt(form.capacita) || 0,
      posti_liberi: parseInt(form.posti_liberi) || 0,
      tariffa_oraria: parseFloat(form.tariffa_oraria) || 0,
    }, parking?.id_park || parking?.id);
    setLoading(false);
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{parking ? 'Modifica Parcheggio' : 'Nuovo Parcheggio'}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label>Nome *</Label>
            <Input value={form.park_name} onChange={(e) => setForm(f => ({...f, park_name: e.target.value}))} required />
          </div>
          <div className="space-y-2">
            <Label>Indirizzo</Label>
            <Input value={form.address} onChange={(e) => setForm(f => ({...f, address: e.target.value}))} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label>Latitudine</Label>
              <Input type="number" step="any" value={form.lat} onChange={(e) => setForm(f => ({...f, lat: e.target.value}))} />
            </div>
            <div className="space-y-2">
              <Label>Longitudine</Label>
              <Input type="number" step="any" value={form.lng} onChange={(e) => setForm(f => ({...f, lng: e.target.value}))} />
            </div>
          </div>
          <div className="grid grid-cols-3 gap-3">
            <div className="space-y-2">
              <Label>Capacità *</Label>
              <Input type="number" value={form.capacita} onChange={(e) => setForm(f => ({...f, capacita: e.target.value}))} required />
            </div>
            <div className="space-y-2">
              <Label>Posti Liberi</Label>
              <Input type="number" value={form.posti_liberi} onChange={(e) => setForm(f => ({...f, posti_liberi: e.target.value}))} />
            </div>
            <div className="space-y-2">
              <Label>Tariffa (€/h)</Label>
              <Input type="number" step="0.01" value={form.tariffa_oraria} onChange={(e) => setForm(f => ({...f, tariffa_oraria: e.target.value}))} />
            </div>
          </div>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label>♿ Posti Disabili</Label>
              <Switch checked={form.posti_dis} onCheckedChange={(v) => setForm(f => ({...f, posti_dis: v}))} />
            </div>
            <div className="flex items-center justify-between">
              <Label>🤰 Posti Rosa</Label>
              <Switch checked={form.posti_rosa} onCheckedChange={(v) => setForm(f => ({...f, posti_rosa: v}))} />
            </div>
            <div className="flex items-center justify-between">
              <Label>Attivo</Label>
              <Switch checked={form.is_active} onCheckedChange={(v) => setForm(f => ({...f, is_active: v}))} />
            </div>
          </div>
          <Button type="submit" className="w-full" disabled={loading}>
            {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
            {parking ? 'Salva Modifiche' : 'Crea Parcheggio'}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}