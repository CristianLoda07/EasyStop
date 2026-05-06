import React from 'react';
import { Filter, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Slider } from '@/components/ui/slider';
import { Input } from '@/components/ui/input';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';

export default function ParkingFilters({ filters, setFilters }) {
  const reset = () => setFilters({
    soloDisponibili: false,
    postiDisabili: false,
    postiRosa: false,
    tariffaMax: 5,
  });

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="outline" size="sm" className="shadow-lg bg-white">
          <Filter className="w-4 h-4 mr-2" /> Filtri
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="w-80">
        <SheetHeader>
          <SheetTitle className="flex items-center justify-between">
            Filtri Parcheggi
            <Button variant="ghost" size="sm" onClick={reset}>
              <X className="w-4 h-4 mr-1" /> Reset
            </Button>
          </SheetTitle>
        </SheetHeader>
        <div className="space-y-6 mt-6">
          {/* Solo disponibili */}
          <div className="flex items-center gap-3">
            <Checkbox
              id="disponibili"
              checked={filters.soloDisponibili}
              onCheckedChange={(v) => setFilters(f => ({...f, soloDisponibili: v}))}
            />
            <Label htmlFor="disponibili">Solo con posti liberi</Label>
          </div>

          {/* Posti disabili */}
          <div className="flex items-center gap-3">
            <Checkbox
              id="disabili"
              checked={filters.postiDisabili}
              onCheckedChange={(v) => setFilters(f => ({...f, postiDisabili: v}))}
            />
            <Label htmlFor="disabili">♿ Posti disabili</Label>
          </div>

          {/* Posti rosa */}
          <div className="flex items-center gap-3">
            <Checkbox
              id="rosa"
              checked={filters.postiRosa}
              onCheckedChange={(v) => setFilters(f => ({...f, postiRosa: v}))}
            />
            <Label htmlFor="rosa">🤰 Posti rosa</Label>
          </div>

          {/* Tariffa massima */}
          <div className="space-y-3">
            <Label>Tariffa oraria massima: €{filters.tariffaMax?.toFixed(2)}</Label>
            <Slider
              value={[filters.tariffaMax]}
              onValueChange={([v]) => setFilters(f => ({...f, tariffaMax: v}))}
              min={0}
              max={5}
              step={0.25}
            />
            <div className="flex items-center gap-2">
              <Input
                type="number"
                min={0}
                max={5}
                step={0.25}
                value={filters.tariffaMax}
                onChange={(e) => setFilters(f => ({...f, tariffaMax: parseFloat(e.target.value) || 0}))}
                className="w-24"
              />
              <span className="text-sm text-muted-foreground">€/ora</span>
            </div>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}