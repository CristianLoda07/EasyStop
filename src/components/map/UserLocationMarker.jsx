import React from 'react';
import { Circle, CircleMarker } from 'react-leaflet';

export default function UserLocationMarker({ position, accuracy }) {
  if (!position) return null;

  return (
    <>
      <Circle
        center={position}
        radius={accuracy || 50}
        pathOptions={{ color: '#0EA5E9', fillColor: '#0EA5E9', fillOpacity: 0.1, weight: 1 }}
      />
      <CircleMarker
        center={position}
        radius={8}
        pathOptions={{ color: 'white', fillColor: '#0EA5E9', fillOpacity: 1, weight: 3 }}
      />
    </>
  );
}