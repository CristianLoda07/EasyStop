import React from 'react';
import { Button } from '@/components/ui/button';
import { AlertCircle } from 'lucide-react';

export default function EmptyVehicleState({ onAddVehicle }) {
  return (
    <div className="flex flex-col items-center justify-center py-12 px-4 text-center space-y-4">
      <div className="rounded-full bg-muted p-4">
        <AlertCircle className="w-8 h-8 text-muted-foreground" />
      </div>
      
      <div className="space-y-2">
        <h3 className="font-semibold text-lg">Nessun veicolo registrato</h3>
        <p className="text-sm text-muted-foreground">
          Per completare la prenotazione, devi prima registrare almeno un veicolo.
        </p>
      </div>

      <div className="text-center space-y-1 py-2">
        <p className="text-sm font-medium">Vuoi registrare un veicolo?</p>
      </div>

      <Button
        onClick={onAddVehicle}
        className="w-full"
        size="lg"
      >
        ✚ Aggiungi veicolo
      </Button>
    </div>
  );
}
