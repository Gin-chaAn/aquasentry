import React, { useState } from "react";
import MapView from "../components/MapView";
import ReportForm from "../components/ReportForm";
import { AlertTriangle, LifeBuoy, MapPin, Droplets, Info } from "lucide-react";

export default function CitizenApp({
  gridCells = [],
  reports = [],
  rescues = [],
  onRefresh,
}) {
  const [selectedCoord, setSelectedCoord] = useState(null);

  return (
    <div className="flex flex-col h-[calc(100vh-64px)] overflow-hidden bg-slate-950">
      {/* Citizen Advisory Banner */}
      <div className="bg-gradient-to-r from-rose-950/80 via-slate-900 to-amber-950/80 border-b border-rose-800/40 px-4 py-2.5 flex items-center justify-between text-xs text-slate-200">
        <div className="flex items-center space-x-2">
          <AlertTriangle className="w-4 h-4 text-rose-400 animate-pulse flex-shrink-0" />
          <span>
            <strong>Chennai Monsoon Flood Alert:</strong> High risk identified along Adyar and Cooum river basins. Avoid low-lying underpasses.
          </span>
        </div>
        <div className="hidden sm:flex items-center space-x-2 text-[11px] text-slate-400">
          <Info className="w-3.5 h-3.5 text-sky-400" />
          <span>Tap anywhere on the map to pinpoint your flood location</span>
        </div>
      </div>

      {/* Main Layout */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 overflow-hidden p-3 gap-3">
        {/* Left Column: Report / SOS Form (5 cols) */}
        <div className="lg:col-span-5 h-full overflow-y-auto space-y-3">
          <ReportForm
            selectedCoord={selectedCoord}
            onClearCoord={() => setSelectedCoord(null)}
            onSubmitSuccess={onRefresh}
          />

          {/* Quick Guidance Box */}
          <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-3.5 text-xs text-slate-400 space-y-2">
            <h3 className="font-bold text-slate-200 text-xs flex items-center gap-1.5">
              <Droplets className="w-3.5 h-3.5 text-sky-400" />
              How Citizen Reports Help Responders
            </h3>
            <p>
              Your water level reports directly feed into AquaSentry's live risk scoring algorithm. Areas with dense crowdsourced reports are prioritized for boat evacuation teams and disaster relief resources.
            </p>
          </div>
        </div>

        {/* Right Column: Live Danger Heatmap (7 cols) */}
        <div className="lg:col-span-7 h-full relative rounded-xl overflow-hidden border border-slate-800">
          <MapView
            gridCells={gridCells}
            reports={reports}
            rescues={rescues}
            selectedCoord={selectedCoord}
            onMapClick={(coord) => setSelectedCoord(coord)}
            showHeatmap={true}
            showReports={true}
            showRescues={true}
          />
        </div>
      </div>
    </div>
  );
}
