import React, { useState } from "react";
import MapView from "../components/MapView";
import RescueQueueList from "../components/RescueQueueList";
import { Shield, Layers, RefreshCw, AlertTriangle, Radio, Navigation, CheckCircle2, X } from "lucide-react";

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
}) {
  const [showHeatmap, setShowHeatmap] = useState(true);
  const [showReports, setShowReports] = useState(true);
  const [showRescues, setShowRescues] = useState(true);

  // Stats
  const pendingCount = rescues.filter((r) => r.status === "pending").length;
  const criticalCount = rescues.filter(
    (r) => r.status === "pending" && r.priority_score >= 70
  ).length;
  const highRiskCells = gridCells.filter(
    (c) => c.risk_level === "High" || c.risk_level === "Severe"
  ).length;

  return (
    <div className="flex flex-col h-[calc(100vh-64px)] overflow-hidden bg-slate-950">
      {/* Top Status & Metrics Strip */}
      <div className="bg-slate-900 border-b border-slate-800 px-4 py-2 flex flex-wrap items-center justify-between gap-3 text-xs">
        {/* Metric Badges */}
        <div className="flex items-center space-x-3">
          <div className="flex items-center space-x-2 bg-slate-800/80 px-3 py-1.5 rounded-lg border border-slate-700/60">
            <Radio className="w-4 h-4 text-emerald-400 animate-pulse" />
            <span className="text-slate-400 font-medium">System:</span>
            <span className="font-bold text-emerald-400">Live Pilot (Chennai)</span>
          </div>

          <div className="flex items-center space-x-2 bg-rose-950/40 px-3 py-1.5 rounded-lg border border-rose-800/60">
            <span className="text-slate-400 font-medium">Pending SOS:</span>
            <span className="font-extrabold text-rose-400 text-sm">{pendingCount}</span>
          </div>

          <div className="flex items-center space-x-2 bg-amber-950/40 px-3 py-1.5 rounded-lg border border-amber-800/60">
            <AlertTriangle className="w-4 h-4 text-amber-400" />
            <span className="text-slate-400 font-medium">Critical (?70 pts):</span>
            <span className="font-extrabold text-amber-300 text-sm">{criticalCount}</span>
          </div>

          <div className="flex items-center space-x-2 bg-sky-950/40 px-3 py-1.5 rounded-lg border border-sky-800/60">
            <span className="text-slate-400 font-medium">Active High-Risk Basins:</span>
            <span className="font-bold text-sky-300">{highRiskCells} cells</span>
          </div>
        </div>

        {/* Layer Controls & Refresh */}
        <div className="flex items-center space-x-2">
          <label className="flex items-center space-x-1.5 cursor-pointer bg-slate-800 px-2.5 py-1 rounded text-slate-300 hover:bg-slate-700">
            <input
              type="checkbox"
              checked={showHeatmap}
              onChange={(e) => setShowHeatmap(e.target.checked)}
              className="accent-sky-500 rounded"
            />
            <span>Heatmap</span>
          </label>

          <label className="flex items-center space-x-1.5 cursor-pointer bg-slate-800 px-2.5 py-1 rounded text-slate-300 hover:bg-slate-700">
            <input
              type="checkbox"
              checked={showReports}
              onChange={(e) => setShowReports(e.target.checked)}
              className="accent-sky-500 rounded"
            />
            <span>Reports ({reports.length})</span>
          </label>

          <label className="flex items-center space-x-1.5 cursor-pointer bg-slate-800 px-2.5 py-1 rounded text-slate-300 hover:bg-slate-700">
            <input
              type="checkbox"
              checked={showRescues}
              onChange={(e) => setShowRescues(e.target.checked)}
              className="accent-sky-500 rounded"
            />
            <span>Rescues ({rescues.length})</span>
          </label>

          <button
            onClick={onRefresh}
            disabled={loading}
            className="flex items-center space-x-1 bg-slate-800 hover:bg-slate-700 px-2.5 py-1 rounded text-slate-300 font-medium disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
            <span>Sync</span>
          </button>
        </div>
      </div>

      {/* Main Split View */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 overflow-hidden">
        {/* Left Column: Rescue Dispatch Queue (5 cols) */}
        <div className="lg:col-span-4 xl:col-span-4 h-full overflow-hidden p-3 bg-slate-950/70 border-r border-slate-800 flex flex-col">
          <RescueQueueList
            rescues={rescues}
            onRouteToRescue={onRouteToRescue}
            onStatusChange={onStatusChange}
            activeRescueId={activeRescue ? activeRescue.id : null}
            routingLoading={routingLoading}
          />
        </div>

        {/* Right Column: Interactive Command Map (8 cols) */}
        <div className="lg:col-span-8 xl:col-span-8 h-full relative p-3 flex flex-col">
          <div className="flex-1 relative rounded-xl overflow-hidden border border-slate-800">
            <MapView
              gridCells={gridCells}
              reports={reports}
              rescues={rescues}
              activeRoute={activeRoute}
              showHeatmap={showHeatmap}
              showReports={showReports}
              showRescues={showRescues}
              onSelectRescue={onRouteToRescue}
            />

            {/* Floating Active Route Banner */}
            {activeRoute && activeRescue && (
              <div className="absolute top-4 left-4 right-4 z-[1000] bg-slate-900/95 border border-sky-500/70 rounded-xl p-3 shadow-2xl backdrop-blur-md text-xs text-slate-200 flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="bg-sky-500 p-2 rounded-lg text-slate-950 font-black">
                    <Navigation className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="font-bold text-slate-100 flex items-center gap-2">
                      <span>Routing to: {activeRescue.citizen_name}</span>
                      <span className="text-[10px] bg-sky-500/20 text-sky-300 px-2 py-0.5 rounded border border-sky-500/40">
                        {activeRescue.water_depth_level}
                      </span>
                    </div>
                    <div className="text-slate-400 text-[11px] flex gap-3 mt-0.5">
                      <span>Distance: <strong className="text-sky-300">{(activeRoute.distance_m / 1000).toFixed(1)} km</strong></span>
                      <span>Est. Driving Time: <strong className="text-sky-300">{Math.round(activeRoute.duration_s / 60)} min</strong></span>
                      <span>Engine: <strong className="text-slate-300">{activeRoute.source}</strong></span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => onStatusChange(activeRescue.id, "assigned")}
                    className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold px-3 py-1.5 rounded-lg text-xs flex items-center gap-1 shadow-md shadow-emerald-600/30"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    Mark Assigned
                  </button>
                  <button
                    onClick={onClearRoute}
                    className="bg-slate-800 hover:bg-slate-700 p-1.5 rounded-lg text-slate-400 hover:text-slate-200"
                    title="Clear Route"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
