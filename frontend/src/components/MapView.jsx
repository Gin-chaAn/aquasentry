import React, { useEffect } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMapEvents } from "react-leaflet";
import L from "leaflet";
import HeatmapLayer from "./HeatmapLayer";
import RouteDisplay from "./RouteDisplay";

// Fix default Leaflet marker assets in bundlers
import markerIcon2x from "leaflet/dist/images/marker-icon-2x.png";
import markerIcon from "leaflet/dist/images/marker-icon.png";
import markerShadow from "leaflet/dist/images/marker-shadow.png";

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: markerIcon2x,
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
});

// Custom Icons for citizen reports & rescue emergencies
function createReportIcon(severity) {
  const color = severity === "high" ? "#ef4444" : severity === "medium" ? "#f59e0b" : "#3b82f6";
  return L.divIcon({
    className: "report-pin",
    html: `<div style="background-color: ${color}; width: 14px; height: 14px; border: 2px solid white; border-radius: 50%; box-shadow: 0 0 8px ${color};"></div>`,
    iconSize: [14, 14],
    iconAnchor: [7, 7],
  });
}

function createRescueIcon(priority, status) {
  const isAssigned = status === "assigned";
  const isRescued = status === "rescued";
  const color = isRescued ? "#10b981" : isAssigned ? "#f59e0b" : priority >= 70 ? "#ef4444" : "#f97316";
  return L.divIcon({
    className: "rescue-pin",
    html: `
      <div style="position: relative; display: flex; align-items: center; justify-content: center; width: 26px; height: 26px;">
        <div style="position: absolute; width: 100%; height: 100%; background: ${color}; opacity: 0.3; border-radius: 50%; animation: ping 1.5s cubic-bezier(0, 0, 0.2, 1) infinite;"></div>
        <div style="background-color: ${color}; width: 18px; height: 18px; border: 2px solid white; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 9px; font-weight: bold; color: white; box-shadow: 0 2px 8px rgba(0,0,0,0.5);">
          SOS
        </div>
      </div>
    `,
    iconSize: [26, 26],
    iconAnchor: [13, 13],
  });
}

function MapClickHandler({ onMapClick }) {
  useMapEvents({
    click(e) {
      if (onMapClick) {
        onMapClick({ lat: e.latlng.lat, lon: e.latlng.lng });
      }
    },
  });
  return null;
}

export default function MapView({
  gridCells = [],
  reports = [],
  rescues = [],
  activeRoute = null,
  selectedCoord = null,
  onMapClick = null,
  onSelectRescue = null,
  showHeatmap = true,
  showReports = true,
  showRescues = true,
}) {
  // Chennai center
  const center = [13.0400, 80.2200];

  return (
    <div className="w-full h-full relative rounded-lg overflow-hidden border border-slate-700/60 shadow-2xl">
      <MapContainer
        center={center}
        zoom={11.5}
        scrollWheelZoom={true}
        className="w-full h-full"
      >
        <TileLayer
          attribution='&copy; <a href="https://carto.com/">CARTO</a>'
          url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
        />

        <MapClickHandler onMapClick={onMapClick} />

        {/* Heatmap Layer */}
        <HeatmapLayer gridCells={gridCells} show={showHeatmap} />

        {/* Route Display */}
        <RouteDisplay route={activeRoute} />

        {/* Temporary Click Pin (when citizen or responder selects a location) */}
        {selectedCoord && (
          <Marker position={[selectedCoord.lat, selectedCoord.lon]}>
            <Popup>
              <div className="text-xs">
                <strong>Selected Location</strong>
                <div>Lat: {selectedCoord.lat.toFixed(4)}</div>
                <div>Lon: {selectedCoord.lon.toFixed(4)}</div>
              </div>
            </Popup>
          </Marker>
        )}

        {/* Citizen Report Pins */}
        {showReports &&
          reports.map((rep) => (
            <Marker
              key={rep.id}
              position={[rep.lat, rep.lon]}
              icon={createReportIcon(rep.severity)}
            >
              <Popup>
                <div className="text-xs space-y-1 max-w-xs">
                  <div className="flex items-center justify-between border-b border-slate-700 pb-1">
                    <span className="font-bold text-sky-300">Citizen Report</span>
                    <span className="text-[10px] uppercase font-bold text-rose-400">
                      {rep.severity} severity
                    </span>
                  </div>
                  <div>
                    <strong>Water Level:</strong> {rep.water_level_cm} cm
                  </div>
                  {rep.description && (
                    <div className="text-slate-300 italic">"{rep.description}"</div>
                  )}
                  <div className="text-[10px] text-slate-400">
                    {new Date(rep.timestamp).toLocaleTimeString()}
                  </div>
                </div>
              </Popup>
            </Marker>
          ))}

        {/* Rescue Request Pins */}
        {showRescues &&
          rescues.map((res) => (
            <Marker
              key={res.id}
              position={[res.lat, res.lon]}
              icon={createRescueIcon(res.priority_score, res.status)}
              eventHandlers={{
                click: () => onSelectRescue && onSelectRescue(res),
              }}
            >
              <Popup>
                <div className="text-xs space-y-2 p-1 max-w-xs">
                  <div className="flex items-center justify-between border-b border-slate-700 pb-1">
                    <span className="font-bold text-rose-400">RESCUE REQUIRED</span>
                    <span className="bg-rose-950 text-rose-300 border border-rose-600 px-1.5 py-0.5 rounded text-[10px] font-bold">
                      {res.priority_score} pts
                    </span>
                  </div>
                  <div className="text-slate-200">
                    <strong>{res.citizen_name}</strong> ({res.contact})
                  </div>
                  <div className="grid grid-cols-2 gap-1 text-[11px] text-slate-300">
                    <div>
                      Depth: <span className="font-semibold text-sky-400">{res.water_depth_level}</span>
                    </div>
                    <div>
                      People: <span className="font-semibold">{res.people_count}</span>
                    </div>
                  </div>
                  {res.vulnerable_people && (
                    <div className="text-amber-400 font-semibold text-[11px]">
                      ?? Vulnerable Individuals Present
                    </div>
                  )}
                  {res.notes && (
                    <div className="text-slate-300 italic text-[11px] bg-slate-800 p-1 rounded">
                      "{res.notes}"
                    </div>
                  )}
                  <div className="flex items-center justify-between pt-1 border-t border-slate-700">
                    <span className="capitalize text-[11px] font-semibold text-slate-300">
                      Status: {res.status}
                    </span>
                    {onSelectRescue && (
                      <button
                        onClick={() => onSelectRescue(res)}
                        className="bg-sky-600 hover:bg-sky-500 text-white px-2 py-1 rounded text-[11px] font-semibold"
                      >
                        Route Here
                      </button>
                    )}
                  </div>
                </div>
              </Popup>
            </Marker>
          ))}
      </MapContainer>
    </div>
  );
}
