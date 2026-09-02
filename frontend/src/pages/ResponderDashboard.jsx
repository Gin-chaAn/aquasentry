import React, { useState } from "react";
import MapView from "../components/MapView";
import BottomTimelineChart from "../components/BottomTimelineChart";
import RescueQueueList from "../components/RescueQueueList";
import { 
  Navigation, 
  MapPin, 
  AlertTriangle, 
  Radio, 
  Clock, 
  Droplets, 
  Shield, 
  ChevronRight, 
  X, 
  Layers,
  ArrowUpRight
} from "lucide-react";

export default function ResponderDashboard({
  gridCells = [],
  reports = [],
  rescues = [],
  activeRoute = null,
  activeRescue = null,
  responderPos = { lat: 13.0827, lon: 80.2707 },
  onRouteToRescue,
  onClearRoute,
  onStatusChange,
  onRefresh,
  loading = false,
  routingLoading = false,
  onOpenCitizenPortal,
}) {
  const [showQueueDrawer, setShowQueueDrawer] = useState(false);
  const [selectedCell, setSelectedCell] = useState(null);

  // Derive cards corresponding to the 4 reference cards
  const topRescue = rescues.length ? rescues[0] : null;
  
  // Highest risk grid cell
  const sortedCells = [...gridCells].sort((a, b) => b.risk_score - a.risk_score);
  const highestRiskCell = sortedCells.length ? sortedCells[0] : null;

  // Latest citizen report
  const latestReport = reports.length ? reports[0] : null;

  // Nearest emergency / secondary critical rescue
  const secondaryRescue = rescues.length > 1 ? rescues[1] : null;

  return (
    <div className="flex-1 flex flex-col h-[calc(100vh-56px)] overflow-hidden bg-[#0b0f19]">
      {/* Middle Workspace: Left Sidebar + Central Map */}
      <div className="flex-1 flex overflow-hidden relative">
        {/* Left Modular Cards Column (Matching reference image exactly) */}
        <div className="w-[340px] xl:w-[370px] bg-[#0d1322] border-r border-slate-800/80 flex flex-col justify-between overflow-y-auto z-10 select-none shadow-2xl">
          <div className="p-3 space-y-2.5 divide-y divide-slate-800/60">
            {/* Card 1: Top Critical Rescue */}
            <div className="pt-2.5 first:pt-0 space-y-1.5">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-bold text-slate-100 text-xs tracking-tight">
                    Critical rescue priority
                  </h3>
                  <p className="text-[11px] text-slate-400">
                    {topRescue ? `${topRescue.citizen_name} - ${topRescue.water_depth_level}` : "No active rescues pending"}
                  </p>
                </div>
                <span className="bg-rose-500/20 text-rose-400 border border-rose-500/50 px-2 py-0.5 rounded font-mono font-bold text-xs">
                  {topRescue ? `${topRescue.priority_score}` : "0.0"}
                </span>
              </div>

              {topRescue && (
                <div className="grid grid-cols-3 gap-2 text-[10px] text-slate-300 pt-1">
                  <div>
                    <span className="text-slate-500 block">Date</span>
                    <span className="font-medium text-slate-200">
                      {new Date(topRescue.timestamp).toLocaleDateString()}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-500 block">Time</span>
                    <span className="font-medium text-slate-200">
                      {new Date(topRescue.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-500 block">People</span>
                    <span className="font-bold text-amber-400">{topRescue.people_count} trapped</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block">Water</span>
                    <span className="font-medium text-cyan-400 capitalize">{topRescue.water_depth_level.replace('_', ' ')}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block">Latitude</span>
                    <span className="font-mono text-slate-300">{topRescue.lat.toFixed(4)}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block">Longitude</span>
                    <span className="font-mono text-slate-300">{topRescue.lon.toFixed(4)}</span>
                  </div>
                </div>
              )}

              {topRescue && (
                <button
                  onClick={() => onRouteToRescue(topRescue)}
                  disabled={routingLoading}
                  className="w-full mt-1 bg-cyan-600/90 hover:bg-cyan-500 text-white font-semibold py-1 px-2.5 rounded text-[11px] flex items-center justify-center gap-1.5 transition-all shadow-md shadow-cyan-600/20"
                >
                  <Navigation className="w-3 h-3" />
                  {activeRescue?.id === topRescue.id ? "Route Active On Map" : "Route from Command HQ"}
                </button>
              )}
            </div>

            {/* Card 2: Highest Flood Risk Basin */}
            <div className="pt-2.5 space-y-1.5">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-bold text-slate-100 text-xs tracking-tight">
                    Highest flood risk basin
                  </h3>
                  <p className="text-[11px] text-slate-400">
                    {highestRiskCell ? highestRiskCell.name : "Analyzing basins..."}
                  </p>
                </div>
                <span className="bg-amber-500/20 text-amber-300 border border-amber-500/50 px-2 py-0.5 rounded font-mono font-bold text-xs">
                  {highestRiskCell ? `${(highestRiskCell.risk_score * 10).toFixed(1)}` : "0.0"}
                </span>
              </div>

              {highestRiskCell && (
                <div className="grid grid-cols-3 gap-2 text-[10px] text-slate-300 pt-1">
                  <div>
                    <span className="text-slate-500 block">Live Rain</span>
                    <span className="font-bold text-cyan-400">{highestRiskCell.breakdown?.rainfall_mm ?? 0} mm/h</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block">Streamflow</span>
                    <span className="font-bold text-teal-400">{highestRiskCell.breakdown?.river_discharge_m3s ?? 0} m?/s</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block">Hazard Base</span>
                    <span className="font-semibold text-amber-300">{highestRiskCell.breakdown?.hazard_category || "High"}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block">Status</span>
                    <span className="font-semibold text-rose-400">{highestRiskCell.risk_level}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block">Latitude</span>
                    <span className="font-mono text-slate-300">{highestRiskCell.lat.toFixed(4)}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block">Longitude</span>
                    <span className="font-mono text-slate-300">{highestRiskCell.lon.toFixed(4)}</span>
                  </div>
                </div>
              )}
            </div>

            {/* Card 3: Latest Ground Citizen Report */}
            <div className="pt-2.5 space-y-1.5">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-bold text-slate-100 text-xs tracking-tight">
                    Latest ground citizen report
                  </h3>
                  <p className="text-[11px] text-slate-400">
                    {latestReport ? latestReport.description || "Water level observation" : "No crowd reports submitted"}
                  </p>
                </div>
                <span className="bg-cyan-500/20 text-cyan-300 border border-cyan-500/50 px-2 py-0.5 rounded font-mono font-bold text-xs">
                  {latestReport ? `${latestReport.water_level_cm} cm` : "0 cm"}
                </span>
              </div>

              {latestReport && (
                <div className="grid grid-cols-3 gap-2 text-[10px] text-slate-300 pt-1">
                  <div>
                    <span className="text-slate-500 block">Date</span>
                    <span className="font-medium text-slate-200">
                      {new Date(latestReport.timestamp).toLocaleDateString()}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-500 block">Time</span>
                    <span className="font-medium text-slate-200">
                      {new Date(latestReport.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-500 block">Severity</span>
                    <span className="font-bold text-rose-400 uppercase">{latestReport.severity}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block">Depth</span>
                    <span className="font-bold text-cyan-300">{latestReport.water_level_cm} cm</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block">Latitude</span>
                    <span className="font-mono text-slate-300">{latestReport.lat.toFixed(4)}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block">Longitude</span>
                    <span className="font-mono text-slate-300">{latestReport.lon.toFixed(4)}</span>
                  </div>
                </div>
              )}
            </div>

            {/* Card 4: Secondary / Strongest Emergency in Period */}
            <div className="pt-2.5 space-y-1.5">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-bold text-slate-100 text-xs tracking-tight">
                    Secondary priority rescue
                  </h3>
                  <p className="text-[11px] text-slate-400">
                    {secondaryRescue ? `${secondaryRescue.citizen_name}` : "Standby boat unit ready"}
                  </p>
                </div>
                <span className="bg-amber-500/20 text-amber-400 border border-amber-500/50 px-2 py-0.5 rounded font-mono font-bold text-xs">
                  {secondaryRescue ? `${secondaryRescue.priority_score}` : "READY"}
                </span>
              </div>

              {secondaryRescue ? (
                <div className="grid grid-cols-3 gap-2 text-[10px] text-slate-300 pt-1">
                  <div>
                    <span className="text-slate-500 block">Contact</span>
                    <span className="font-medium text-slate-200">{secondaryRescue.contact}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block">Depth</span>
                    <span className="font-semibold text-cyan-400 capitalize">{secondaryRescue.water_depth_level}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block">People</span>
                    <span className="font-semibold text-white">{secondaryRescue.people_count} count</span>
                  </div>
                </div>
              ) : (
                <p className="text-[10px] text-slate-500 italic">
                  Command unit stationed at Chennai Central Base (Lat 13.0827, Lon 80.2707).
                </p>
              )}
            </div>
          </div>

          {/* Bottom toggle button to view full triage queue */}
          <div className="p-3 border-t border-slate-800/80 bg-[#090d16]">
            <button
              onClick={() => setShowQueueDrawer(!showQueueDrawer)}
              className="w-full py-1.5 px-3 bg-slate-800/80 hover:bg-slate-700 text-slate-200 rounded text-xs font-semibold flex items-center justify-between border border-slate-700/60 transition-all"
            >
              <span>View Full Rescue Queue ({rescues.length})</span>
              <ChevronRight className={`w-3.5 h-3.5 transition-transform ${showQueueDrawer ? "rotate-90" : ""}`} />
            </button>
          </div>
        </div>

        {/* Central Map Canvas */}
        <div className="flex-1 h-full relative overflow-hidden">
          <MapView
            gridCells={gridCells}
            reports={reports}
            rescues={rescues}
            activeRoute={activeRoute}
            activeRescue={activeRescue}
            onSelectRescue={onRouteToRescue}
            showHeatmap={true}
            showReports={true}
            showRescues={true}
          />

          {/* Floating Route Banner if Active */}
          {activeRoute && activeRescue && (
            <div className="absolute top-4 left-6 z-[1000] bg-[#0d1322]/95 border border-cyan-500/80 rounded-lg px-4 py-2.5 shadow-2xl backdrop-blur-md text-xs text-slate-100 flex items-center gap-4">
              <div className="flex items-center space-x-2.5">
                <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-ping"></span>
                <div>
                  <div className="font-bold text-white flex items-center gap-2">
                    Routing to: {activeRescue.citizen_name}
                    <span className="text-[10px] bg-cyan-950 text-cyan-300 border border-cyan-700 px-1.5 rounded">
                      {activeRescue.water_depth_level}
                    </span>
                  </div>
                  <div className="text-slate-400 text-[11px] flex gap-3">
                    <span>Distance: <strong className="text-cyan-300">{(activeRoute.distance_m / 1000).toFixed(1)} km</strong></span>
                    <span>ETA: <strong className="text-cyan-300">{Math.round(activeRoute.duration_s / 60)} min</strong></span>
                    <span>Via {activeRoute.source}</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center space-x-2 pl-2 border-l border-slate-800">
                <button
                  onClick={() => onStatusChange(activeRescue.id, "assigned")}
                  className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold px-2.5 py-1 rounded text-xs"
                >
                  Dispatch
                </button>
                <button
                  onClick={onClearRoute}
                  className="text-slate-400 hover:text-white p-1"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          )}

          {/* Slide-over Queue Drawer */}
          {showQueueDrawer && (
            <div className="absolute top-0 bottom-0 left-0 w-96 bg-[#0d1322]/98 border-r border-slate-800 z-[1001] shadow-2xl p-3 flex flex-col backdrop-blur-xl animate-in slide-in-from-left duration-200">
              <div className="flex items-center justify-between pb-2 border-b border-slate-800 mb-2">
                <span className="font-bold text-xs text-white uppercase tracking-wider">All Rescue Emergencies</span>
                <button
                  onClick={() => setShowQueueDrawer(false)}
                  className="p-1 text-slate-400 hover:text-white"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
              <div className="flex-1 overflow-hidden">
                <RescueQueueList
                  rescues={rescues}
                  onRouteToRescue={(r) => {
                    onRouteToRescue(r);
                    setShowQueueDrawer(false);
                  }}
                  onStatusChange={onStatusChange}
                  activeRescueId={activeRescue?.id}
                  routingLoading={routingLoading}
                />
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Bottom Timeline Charts (Exact replica of the reference bar chart) */}
      <div className="h-28 w-full z-10 flex-shrink-0">
        <BottomTimelineChart gridCells={gridCells} rescues={rescues} />
      </div>
    </div>
  );
}
