import React from "react";
import { Circle, Popup } from "react-leaflet";

function getRiskColor(score) {
  if (score >= 0.75) return { color: "#ef4444", fill: "#ef4444", label: "Severe" };
  if (score >= 0.50) return { color: "#f97316", fill: "#f97316", label: "High" };
  if (score >= 0.30) return { color: "#eab308", fill: "#eab308", label: "Moderate" };
  return { color: "#22c55e", fill: "#22c55e", label: "Low" };
}

export default function HeatmapLayer({ gridCells = [], show = true }) {
  if (!show || !gridCells.length) return null;

  return (
    <>
      {gridCells.map((cell) => {
        const { color, label } = getRiskColor(cell.risk_score);
        const bd = cell.breakdown || {};
        return (
          <Circle
            key={cell.id}
            center={[cell.lat, cell.lon]}
            radius={1100}
            pathOptions={{
              color: color,
              fillColor: color,
              fillOpacity: 0.35,
              weight: 2,
            }}
          >
            <Popup>
              <div className="text-xs space-y-2 p-1 max-w-xs">
                <div className="flex items-center justify-between border-b border-slate-700 pb-1">
                  <span className="font-bold text-slate-100 text-sm">{cell.name}</span>
                  <span
                    className="px-2 py-0.5 rounded text-[11px] font-bold uppercase tracking-wider"
                    style={{
                      backgroundColor: `${color}25`,
                      color: color,
                      border: `1px solid ${color}`,
                    }}
                  >
                    {cell.risk_level || label}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2 text-slate-300">
                  <div className="bg-slate-800/80 p-1.5 rounded">
                    <div className="text-[10px] text-slate-400">Flood Risk Score</div>
                    <div className="text-base font-bold text-slate-100">
                      {(cell.risk_score * 100).toFixed(0)}%
                    </div>
                  </div>
                  <div className="bg-slate-800/80 p-1.5 rounded">
                    <div className="text-[10px] text-slate-400">Live Rainfall</div>
                    <div className="text-base font-bold text-sky-400">
                      {bd.rainfall_mm ?? 0} mm/h
                    </div>
                  </div>
                </div>

                <div className="space-y-1 text-[11px] text-slate-300">
                  <div className="flex justify-between">
                    <span className="text-slate-400">River Discharge:</span>
                    <span className="font-medium text-emerald-400">
                      {bd.river_discharge_m3s ?? 0} m?/s
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Hazard Zone:</span>
                    <span className="font-medium text-amber-300">
                      {bd.hazard_category || "None"}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Citizen Reports:</span>
                    <span className="font-medium text-rose-400">
                      {bd.nearby_report_count ?? 0} nearby
                    </span>
                  </div>
                </div>

                <div className="text-[10px] text-slate-400 italic pt-1 border-t border-slate-700/60">
                  {bd.zone_name || "Unzoned Area"}
                </div>
              </div>
            </Popup>
          </Circle>
        );
      })}
    </>
  );
}
