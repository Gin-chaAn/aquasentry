import React, { useState, useEffect } from "react";
import { MapContainer, TileLayer, Marker, Popup, Polyline, Circle, useMap, useMapEvents } from "react-leaflet";
import L from "leaflet";
import HeatmapLayer from "./HeatmapLayer";
import RouteDisplay from "./RouteDisplay";
import { Search, Compass, Layers, AlertCircle } from "lucide-react";

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

// Reference style custom nodes (dots & target nodes)
function createIncidentIcon(color = "#14b8a6", isEpicenter = false) {
  if (isEpicenter) {
    return L.divIcon({
      className: "epicenter-node",
      html: `
        <div style="position: relative; display: flex; align-items: center; justify-content: center; width: 36px; height: 36px;">
          <div style="position: absolute; width: 36px; height: 36px; background: rgba(234, 179, 8, 0.25); border-radius: 50%; border: 1.5px solid #eab308; animation: pulse-radar 2.5s infinite ease-in-out;"></div>
          <div style="position: absolute; width: 20px; height: 20px; background: #eab308; border-radius: 50%; border: 2.5px solid #ffffff; box-shadow: 0 0 16px #eab308;"></div>
          <div style="position: absolute; width: 6px; height: 6px; background: #0f172a; border-radius: 50%;"></div>
        </div>
      `,
      iconSize: [36, 36],
      iconAnchor: [18, 18],
    });
  }

  return L.divIcon({
    className: "incident-dot",
    html: `
      <div style="display: flex; align-items: center; justify-content: center; width: 14px; height: 14px;">
        <div style="width: 10px; height: 10px; border-radius: 50%; background: ${color}; border: 1.5px solid rgba(255,255,255,0.9); box-shadow: 0 0 8px ${color};"></div>
      </div>
    `,
    iconSize: [14, 14],
    iconAnchor: [7, 7],
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

function FlyToController({ targetCoord }) {
  const map = useMap();
  useEffect(() => {
    if (targetCoord) {
      map.flyTo([targetCoord.lat, targetCoord.lon], 13, { duration: 1.2 });
    }
  }, [targetCoord, map]);
  return null;
}

export default function MapView({
  gridCells = [],
  reports = [],
  rescues = [],
  activeRoute = null,
  activeRescue = null,
  selectedCoord = null,
  onMapClick = null,
  onSelectRescue = null,
  showHeatmap = true,
  showReports = true,
  showRescues = true,
}) {
  const center = [13.0350, 80.2150]; // Chennai center
  const [searchQuery, setSearchQuery] = useState("");
  const [flyCoord, setFlyCoord] = useState(null);
  const [selectedCell, setSelectedCell] = useState(null);

  // Quick localities list for search matching
  const localities = [
    { name: "Velachery Lake Catchment", lat: 12.9800, lon: 80.2228 },
    { name: "Adyar Basin / Saidapet", lat: 13.0180, lon: 80.2200 },
    { name: "Cooum River / Koyambedu", lat: 13.0694, lon: 80.1948 },
    { name: "Mudichur Flood Plain", lat: 12.9150, lon: 80.0820 },
    { name: "Madipakkam Basin", lat: 12.9647, lon: 80.1961 },
    { name: "T. Nagar Lowlands", lat: 13.0418, lon: 80.2341 },
    { name: "Perambur Canal Area", lat: 13.1110, lon: 80.2370 },
    { name: "Chennai Central Station", lat: 13.0827, lon: 80.2707 },
    { name: "Mylapore Coastal Ridge", lat: 13.0410, lon: 80.2750 },
  ];

  const handleSearch = (e) => {
    e.preventDefault();
    const query = searchQuery.trim().toLowerCase();
    const found = localities.find((l) => l.name.toLowerCase().includes(query));
    if (found) {
      setFlyCoord({ lat: found.lat, lon: found.lon });
    }
  };

  // Top critical rescue or active target acts as the primary visual epicenter (like the reference yellow hub)
  const epicenterRescue = activeRescue || (rescues.length ? rescues[0] : null);

  return (
    <div className="w-full h-full relative overflow-hidden bg-[#090d16]">
      <MapContainer
        center={center}
        zoom={11.4}
        scrollWheelZoom={true}
        zoomControl={false}
        className="w-full h-full"
      >
        {/* CARTO Dark Matter Basemap (exact high-contrast dark relief matching reference) */}
        <TileLayer
          attribution='&copy; <a href="https://carto.com/">CARTO</a>'
          url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
          subdomains="abcd"
          maxZoom={19}
        />

        <MapClickHandler onMapClick={onMapClick} />
        <FlyToController targetCoord={flyCoord} />

        {/* Heatmap Layer */}
        <HeatmapLayer
          gridCells={gridCells}
          show={showHeatmap}
          selectedCellId={selectedCell ? selectedCell.id : null}
          onSelectCell={(c) => {
            setSelectedCell(c);
            setFlyCoord({ lat: c.lat, lon: c.lon });
          }}
        />

        {/* Dynamic Branching Connector Lines (matching white radial lines in reference image) */}
        {epicenterRescue && (
          <>
            {/* Outer gold radar radius */}
            <Circle
              center={[epicenterRescue.lat, epicenterRescue.lon]}
              radius={2400}
              pathOptions={{
                color: "#eab308",
                fillColor: "#eab308",
                fillOpacity: 0.12,
                weight: 1.5,
                dashArray: "3, 6",
              }}
            />

            {/* Branching radial lines to nearby incidents */}
            {reports.slice(0, 4).map((rep) => (
              <Polyline
                key={`branch-${rep.id}`}
                positions={[
                  [epicenterRescue.lat, epicenterRescue.lon],
                  [rep.lat, rep.lon],
                ]}
                pathOptions={{
                  color: "rgba(255, 255, 255, 0.45)",
                  weight: 1,
                  dashArray: "2, 4",
                }}
              />
            ))}
          </>
        )}

        {/* Navigation Route Display */}
        <RouteDisplay route={activeRoute} />

        {/* Temporary Pin for user click */}
        {selectedCoord && (
          <Marker
            position={[selectedCoord.lat, selectedCoord.lon]}
            icon={createIncidentIcon("#38bdf8", false)}
          >
            <Popup>
              <div className="text-xs p-1">
                <strong className="text-cyan-300">Selected Pinpoint</strong>
                <div className="text-slate-400 font-mono text-[10px] mt-0.5">
                  Lat: {selectedCoord.lat.toFixed(4)} | Lon: {selectedCoord.lon.toFixed(4)}
                </div>
              </div>
            </Popup>
          </Marker>
        )}

        {/* Citizen Report Scatter Pins (Teal & Yellow dots like reference) */}
        {showReports &&
          reports.map((rep) => {
            const color = rep.severity === "high" ? "#ef4444" : rep.severity === "medium" ? "#eab308" : "#14b8a6";
            return (
              <Marker
                key={rep.id}
                position={[rep.lat, rep.lon]}
                icon={createIncidentIcon(color, false)}
              >
                <Popup>
                  <div className="text-xs space-y-1 max-w-xs font-sans">
                    <div className="flex items-center justify-between border-b border-slate-700/80 pb-1">
                      <span className="font-bold text-cyan-300">Citizen Report</span>
                      <span className="text-[10px] uppercase font-mono font-bold text-rose-400">
                        {rep.severity}
                      </span>
                    </div>
                    <div>
                      <strong>Water Depth:</strong> {rep.water_level_cm} cm
                    </div>
                    {rep.description && (
                      <div className="text-slate-300 italic text-[11px]">"{rep.description}"</div>
                    )}
                    <div className="text-[10px] text-slate-500 font-mono">
                      {new Date(rep.timestamp).toLocaleTimeString()}
                    </div>
                  </div>
                </Popup>
              </Marker>
            );
          })}

        {/* Emergency Rescue Markers (Glowing Epicenter for active or top rescue, coral dots for others) */}
        {showRescues &&
          rescues.map((res) => {
            const isEpicenter = epicenterRescue && epicenterRescue.id === res.id;
            return (
              <Marker
                key={res.id}
                position={[res.lat, res.lon]}
                icon={createIncidentIcon(isEpicenter ? "#eab308" : "#f43f5e", isEpicenter)}
                eventHandlers={{
                  click: () => onSelectRescue && onSelectRescue(res),
                }}
              >
                <Popup>
                  <div className="text-xs space-y-2 p-1 max-w-xs font-sans">
                    <div className="flex items-center justify-between border-b border-slate-700/80 pb-1">
                      <span className="font-extrabold text-rose-400 tracking-wider">RESCUE REQUIRED</span>
                      <span className="bg-rose-950/80 text-rose-300 border border-rose-500/80 px-1.5 py-0.5 rounded text-[10px] font-mono font-bold">
                        {res.priority_score} PTS
                      </span>
                    </div>
                    <div className="text-slate-100 font-medium">
                      <strong>{res.citizen_name}</strong> ({res.contact})
                    </div>
                    <div className="grid grid-cols-2 gap-1 text-[11px] text-slate-300">
                      <div>
                        Water: <span className="font-semibold text-cyan-400">{res.water_depth_level}</span>
                      </div>
                      <div>
                        People: <span className="font-semibold text-white">{res.people_count}</span>
                      </div>
                    </div>
                    {res.vulnerable_people && (
                      <div className="text-amber-300 font-semibold text-[10px] bg-amber-950/60 px-1.5 py-0.5 rounded border border-amber-800/60">
                        ?? Vulnerable Persons Present
                      </div>
                    )}
                    {res.notes && (
                      <div className="text-slate-300 italic text-[11px] bg-[#0b0f19] p-1.5 rounded border border-slate-800">
                        "{res.notes}"
                      </div>
                    )}
                    <button
                      onClick={() => onSelectRescue && onSelectRescue(res)}
                      className="w-full mt-1 bg-cyan-600 hover:bg-cyan-500 text-white font-bold py-1 rounded text-xs transition-colors shadow"
                    >
                      Route from Command HQ
                    </button>
                  </div>
                </Popup>
              </Marker>
            );
          })}
      </MapContainer>

      {/* Floating Top-Right Search Bar (Matching reference image) */}
      <div className="absolute top-4 right-4 z-[1000] w-72">
        <form onSubmit={handleSearch} className="relative">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search Chennai locality..."
            className="w-full bg-[#0d1322]/90 border border-slate-700/80 rounded-lg pl-9 pr-3 py-1.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-cyan-500 shadow-xl backdrop-blur-md"
          />
          <Search className="w-4 h-4 text-slate-400 absolute left-2.5 top-2 pointer-events-none" />
        </form>
      </div>

      {/* Floating Bottom-Left Legend (Exact replica of reference image legend box) */}
      <div className="absolute bottom-5 left-5 z-[1000] bg-[#0d1322]/90 border border-slate-800/90 rounded-lg p-3 text-[11px] space-y-2 shadow-2xl backdrop-blur-md">
        <div className="flex items-center space-x-2.5">
          <div className="w-5 h-3.5 rounded-sm striped-hazard-bg border border-rose-500/60"></div>
          <span className="text-slate-300 font-medium">Critical flood hazard basin</span>
        </div>
        <div className="flex items-center space-x-2.5">
          <div className="w-5 h-3.5 rounded-sm bg-emerald-500/20 border border-emerald-500/60"></div>
          <span className="text-slate-300 font-medium">Alert & monitoring radius</span>
        </div>
        <div className="flex items-center space-x-2.5 pt-0.5 border-t border-slate-800 text-[10px] text-slate-400">
          <span className="w-2.5 h-2.5 rounded-full bg-amber-400 inline-block"></span>
          <span>Target rescue epicenter</span>
        </div>
      </div>
    </div>
  );
}
