import React, { useState } from 'react';
import { format } from 'date-fns';
import { it } from 'date-fns/locale';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { MapPin, Clock, Car, QrCode, X, Pencil } from 'lucide-react';
import { STATO_LABELS, getStatoEffettivoPrenotazione } from '@/lib/greenUtils';
import QRCodeDisplay from './QRCodeDisplay';

const statoBadgeColors = {
  confermata: 'bg-blue-100 text-blue-700',
  in_corso: 'bg-green-100 text-green-700',
  completata: 'bg-gray-100 text-gray-600',
  cancellata: 'bg-red-100 text-red-600',
};

export default function BookingCard({ booking, onCancel, onEdit }) {
  const [showQR, setShowQR] = useState(false);
  const statoEffettivo = getStatoEffettivoPrenotazione(booking);

  const formatDate = (d) => {
    if (!d) return '-';
    return format(new Date(d), "dd MMM yyyy HH:mm", { locale: it });
  };

  return (
    <>
      <Card className="overflow-hidden hover:shadow-md transition-shadow">
        <CardContent className="p-4">
          <div className="flex items-start justify-between mb-3">
            <div>
              <h3 className="font-semibold text-base">{booking.parcheggio_nome || 'Parcheggio'}</h3>
              <p className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                <Car className="w-3 h-3" /> {booking.veicolo_targa}
              </p>
            </div>
            <Badge className={statoBadgeColors[statoEffettivo] || 'bg-gray-100'}>
              {STATO_LABELS[statoEffettivo] || statoEffettivo}
            </Badge>
          </div>

          <div className="grid grid-cols-2 gap-2 text-sm mb-3">
            <div className="flex items-center gap-1.5 text-muted-foreground">
              <Clock className="w-3.5 h-3.5" />
              <span>{formatDate(booking.inizio_sosta)}</span>
            </div>
            <div className="flex items-center gap-1.5 text-muted-foreground">
              <Clock className="w-3.5 h-3.5" />
              <span>{formatDate(booking.fine_sosta)}</span>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-lg font-bold text-primary">€{booking.prezzo_tot?.toFixed(2) || '0.00'}</span>
            <div className="flex gap-2">
              {booking.codice_qr && (
                <Button variant="outline" size="sm" onClick={() => setShowQR(true)}>
                  <QrCode className="w-4 h-4 mr-1" /> QR
                </Button>
              )}
              {statoEffettivo === 'confermata' && onEdit && (
                <Button variant="outline" size="sm" onClick={() => onEdit(booking)}>
                  <Pencil className="w-4 h-4" />
                </Button>
              )}
              {statoEffettivo === 'confermata' && onCancel && (
                <Button variant="outline" size="sm" className="text-destructive hover:bg-destructive/10" onClick={() => onCancel(booking)}>
                  <X className="w-4 h-4" />
                </Button>
              )}
            </div>
          </div>

          {booking.risparmio_co2 > 0 && (
            <div className="mt-3 bg-accent rounded-lg p-2 flex items-center gap-2 text-xs">
              <span className="text-primary font-medium">🌿 {booking.risparmio_co2}g CO₂ risparmiati</span>
            </div>
          )}
        </CardContent>
      </Card>

      <QRCodeDisplay
        code={booking.codice_qr}
        open={showQR}
        onClose={() => setShowQR(false)}
        parkingName={booking.parcheggio_nome}
      />
    </>
  );
}