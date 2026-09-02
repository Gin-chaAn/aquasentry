import React from "react";
import { Polyline, Marker, Popup } from "react-leaflet";
import L from "leaflet";

// Custom pin icons
const startIcon = L.divIcon({
  className: "custom-div-icon",
  html: `<div style="background-color: #3b82f6; width: 14px; height: 14px; border: 2px solid white; border-radius: 50%; box-shadow: 0 0 10px #3b82f6;"></div>`,
  iconSize: [14, 14],
  iconAnchor: [7, 7],
});

const endIcon = L.divIcon({
  className: "custom-div-icon",
  html: `<div style="background-color: #ef4444; width: 16px; height: 16px; border: 2px solid white; border-radius: 50%; box-shadow: 0 0 10px #ef4444;"></div>`,
  iconSize: [16, 16],
  iconAnchor: [8, 8],
});

export default function RouteDisplay({ route, startPos, endPos, onClear }) {
  if (!route || !route.coordinates || !route.coordinates.length) return null;

  // IMPORTANT: GeoJSON returns [lon, lat], Leaflet polyline expects [lat, lon]
  const positions = route.coordinates.map(([lon, lat]) => [lat, lon]);
  const startCoord = positions[0];
  const endCoord = positions[positions.length - 1];

  const distanceKm = (route.distance_m / 1000).toFixed(2);
  const durationMin = Math.round(route.duration_s / 60);

  return (
    <>
      <Polyline
        positions={positions}
        pathOptions={{
          color: "#00e5ff",
          weight: 6,
          opacity: 0.9,
          lineJoin: "round",
        }}
      />

      {startCoord && (
        <Marker position={startCoord} icon={startIcon}>
          <Popup>
            <div className="text-xs">
              <strong>Responder Origin</strong>
            </div>
          </Popup>
        </Marker>
      )}

      {endCoord && (
        <Marker position={endCoord} icon={endIcon}>
          <Popup>
            <div className="text-xs space-y-1">
              <strong>Rescue Target</strong>
              <div>Distance: {distanceKm} km</div>
              <div>Est. Travel: {durationMin} min</div>
              <div className="text-[10px] text-slate-400">Via {route.source}</div>
            </div>
          </Popup>
        </Marker>
      )}
    </>
  );
}
