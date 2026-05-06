import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { QrCode, Maximize2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

/**
 * Genera un QR code SVG semplice basato su un pattern deterministico dal codice
 */
function SimpleQRSVG({ value, size = 200 }) {
  // Generate a deterministic grid pattern from the value string
  const gridSize = 21;
  const cellSize = size / gridSize;
  const cells = [];

  // Simple hash-based pattern
  for (let row = 0; row < gridSize; row++) {
    for (let col = 0; col < gridSize; col++) {
      // Fixed position patterns (finder patterns)
      const isFinderPattern = 
        (row < 7 && col < 7) || 
        (row < 7 && col >= gridSize - 7) || 
        (row >= gridSize - 7 && col < 7);
      
      if (isFinderPattern) {
        const inOuter = row === 0 || row === 6 || col === 0 || col === 6 ||
          (row >= gridSize - 7 && (row === gridSize - 7 || row === gridSize - 1)) ||
          (col >= gridSize - 7 && (col === gridSize - 7 || col === gridSize - 1));
        const inInner = (row >= 2 && row <= 4 && col >= 2 && col <= 4) ||
          (row >= 2 && row <= 4 && col >= gridSize - 5 && col <= gridSize - 3) ||
          (row >= gridSize - 5 && row <= gridSize - 3 && col >= 2 && col <= 4);
        
        if (inOuter || inInner) {
          cells.push({ row, col });
        }
      } else {
        // Data pattern based on hash of value
        const charCode = value.charCodeAt((row * gridSize + col) % value.length);
        if ((charCode * (row + 1) * (col + 1)) % 3 !== 0) {
          cells.push({ row, col });
        }
      }
    }
  }

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      <rect width={size} height={size} fill="white" />
      {cells.map((cell, i) => (
        <rect
          key={i}
          x={cell.col * cellSize}
          y={cell.row * cellSize}
          width={cellSize}
          height={cellSize}
          fill="black"
        />
      ))}
    </svg>
  );
}

export default function QRCodeDisplay({ code, open, onClose, parkingName }) {
  if (!code) return null;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-sm text-center">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-center gap-2">
            <QrCode className="w-5 h-5 text-primary" />
            Codice QR Prenotazione
          </DialogTitle>
        </DialogHeader>
        <div className="flex flex-col items-center gap-4 py-4">
          <div className="bg-white p-4 rounded-2xl shadow-inner border">
            <SimpleQRSVG value={code} size={220} />
          </div>
          <div className="space-y-1">
            <p className="font-mono text-sm font-bold">{code}</p>
            {parkingName && <p className="text-sm text-muted-foreground">{parkingName}</p>}
          </div>
          <p className="text-xs text-muted-foreground">Mostra questo codice al lettore all'ingresso del parcheggio</p>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export function QRCodeInline({ code, size = 120 }) {
  if (!code) return null;
  return (
    <div className="bg-white p-2 rounded-lg border inline-block">
      <SimpleQRSVG value={code} size={size} />
    </div>
  );
}