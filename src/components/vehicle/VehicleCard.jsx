import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Pencil, Trash2, Star, Loader2 } from 'lucide-react';
import { ALIMENTAZIONE_LABELS, TIPO_VEICOLO_LABELS } from '@/lib/greenUtils';

const fuelColors = {
  elettrica: 'bg-green-100 text-green-700',
  ibrida: 'bg-teal-100 text-teal-700',
  benzina: 'bg-orange-100 text-orange-700',
  diesel: 'bg-gray-100 text-gray-700',
  gpl: 'bg-yellow-100 text-yellow-700',
  metano: 'bg-blue-100 text-blue-700',
};

export default function VehicleCard({ vehicle, onEdit, onDelete, onSetDefault, isDeleting, isSettingDefault }) {
  return (
    <Card className="overflow-hidden hover:shadow-md transition-shadow">
      <CardContent className="p-4">
        <div className="flex items-start justify-between mb-2">
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-bold text-lg tracking-wider">{vehicle.targa}</h3>
              {vehicle.isdefault && (
                <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
              )}
            </div>
            <p className="text-sm text-muted-foreground">{vehicle.marca || 'N/D'}</p>
          </div>
          <div className="flex gap-1">
            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => onEdit(vehicle)} disabled={isDeleting || isSettingDefault}>
              <Pencil className="w-4 h-4" />
            </Button>
            <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => onDelete(vehicle)} disabled={isDeleting || isSettingDefault}>
              {isDeleting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
            </Button>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="secondary">{TIPO_VEICOLO_LABELS[vehicle.type_vcl] || vehicle.type_vcl}</Badge>
          <Badge className={fuelColors[vehicle.alimentazione] || 'bg-gray-100'}>
            {ALIMENTAZIONE_LABELS[vehicle.alimentazione] || vehicle.alimentazione}
          </Badge>
        </div>
        {!vehicle.isdefault && (
          <Button variant="ghost" size="sm" className="mt-2 text-xs" onClick={() => onSetDefault(vehicle)} disabled={isDeleting || isSettingDefault}>
            {isSettingDefault ? <Loader2 className="w-3 h-3 mr-1 animate-spin" /> : <Star className="w-3 h-3 mr-1" />}
            {isSettingDefault ? 'Impostazione...' : 'Imposta come default'}
          </Button>
        )}
      </CardContent>
    </Card>
  );
}