import React from "react";
import { Circle, Polygon, Popup } from "react-leaflet";

export default function HeatmapLayer({ gridCells = [], show = true, selectedCellId, onSelectCell }) {
  if (!show || !gridCells.length) return null;

  return (
    <>
      {gridCells.map((cell) => {
        const bd = cell.breakdown || {};
        const isHigh = cell.risk_level === "High" || cell.risk_level === "Severe";
        const isSelected = selectedCellId === cell.id;

        // Visual coloring matching the reference screenshot:
        // High risk: bright coral/red with striped hazard feel
        // Moderate: amber/yellow dot
        // Low: teal/cyan dot
        const dotColor = isHigh ? "#ef4444" : cell.risk_level === "Moderate" ? "#eab308" : "#14b8a6";
        const outerRadius = isHigh ? 1600 : 1100;

        return (
          <React.Fragment key={cell.id}>
            {/* Outer Alert Radius (Translucent halo matching reference image) */}
            <Circle
              center={[cell.lat, cell.lon]}
              radius={outerRadius}
              pathOptions={{
                color: isHigh ? "#ef4444" : "#10b981",
                fillColor: isHigh ? "#dc2626" : "#059669",
                fillOpacity: isHigh ? 0.18 : 0.08,
                weight: isHigh ? 1.5 : 1,
                dashArray: isHigh ? "4, 4" : undefined,
              }}
            />

            {/* Inner Core Radar Dot */}
            <Circle
              center={[cell.lat, cell.lon]}
              radius={380}
              eventHandlers={{
                click: () => onSelectCell && onSelectCell(cell),
              }}
              pathOptions={{
                color: isSelected ? "#38bdf8" : dotColor,
                fillColor: dotColor,
                fillOpacity: 0.9,
                weight: isSelected ? 3 : 1.5,
              }}
            >
              <Popup>
                <div className="text-xs space-y-2 p-1 max-w-xs font-sans">
                  <div className="flex items-center justify-between border-b border-slate-700/80 pb-1.5">
                    <span className="font-bold text-slate-100 text-sm tracking-wide">{cell.name}</span>
                    <span
                      className="px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase tracking-wider"
                      style={{
                        backgroundColor: `${dotColor}25`,
                        color: dotColor,
                        border: `1px solid ${dotColor}80`,
                      }}
                    >
                      RISK {((cell.risk_score || 0) * 10).toFixed(1)}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-slate-300">
                    <div className="bg-[#0b0f19] p-2 rounded border border-slate-800">
                      <div className="text-[10px] text-slate-400">Risk Severity</div>
                      <div className="text-base font-extrabold text-white">
                        {((cell.risk_score || 0) * 100).toFixed(0)}%
                      </div>
                    </div>
                    <div className="bg-[#0b0f19] p-2 rounded border border-slate-800">
                      <div className="text-[10px] text-slate-400">Live Rainfall</div>
                      <div className="text-base font-extrabold text-cyan-400">
                        {bd.rainfall_mm ?? 0} mm/h
                      </div>
                    </div>
                  </div>

                  <div className="space-y-1 text-[11px] text-slate-300 bg-[#0b0f19]/60 p-2 rounded border border-slate-800/80">
                    <div className="flex justify-between">
                      <span className="text-slate-400">Streamflow / Discharge:</span>
                      <span className="font-bold text-teal-400">{bd.river_discharge_m3s ?? 0} m?/s</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Historical Basin:</span>
                      <span className="font-semibold text-amber-300">{bd.hazard_category || "None"}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Crowdsourced Alerts:</span>
                      <span className="font-bold text-rose-400">{bd.nearby_report_count ?? 0} nearby</span>
                    </div>
                  </div>

                  <div className="text-[10px] text-slate-400 italic pt-1">
                    {bd.zone_name || "Chennai Flood Catchment"}
                  </div>
                </div>
              </Popup>
            </Circle>
          </React.Fragment>
        );
      })}
    </>
  );
}
