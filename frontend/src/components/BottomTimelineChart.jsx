import React, { useState } from "react";
import { BarChart3, TrendingUp, Calendar, Droplets } from "lucide-react";

export default function BottomTimelineChart({ gridCells = [], rescues = [] }) {
  const [activeTab, setActiveTab] = useState("rainfall"); // rainfall | discharge | rescues
  const [selectedPoint, setSelectedPoint] = useState(14); // default active index

  // 24-point timeline representation (hours of the monsoon cycle)
  const hours = [
    { label: "00:00", val: 12, rain: 2.1, discharge: 1.2 },
    { label: "01:00", val: 18, rain: 4.5, discharge: 1.4 },
    { label: "02:00", val: 28, rain: 8.0, discharge: 1.7 },
    { label: "03:00", val: 45, rain: 15.2, discharge: 2.1 },
    { label: "04:00", val: 62, rain: 22.0, discharge: 2.4 },
    { label: "05:00", val: 78, rain: 29.5, discharge: 2.7 },
    { label: "06:00", val: 85, rain: 34.0, discharge: 2.8 },
    { label: "07:00", val: 70, rain: 26.0, discharge: 2.8 },
    { label: "08:00", val: 55, rain: 18.5, discharge: 2.6 },
    { label: "09:00", val: 40, rain: 12.0, discharge: 2.5 },
    { label: "10:00", val: 32, rain: 8.4, discharge: 2.4 },
    { label: "11:00", val: 25, rain: 5.1, discharge: 2.2 },
    { label: "12:00", val: 38, rain: 11.0, discharge: 2.3 },
    { label: "13:00", val: 50, rain: 16.8, discharge: 2.5 },
    { label: "14:00", val: 68, rain: 24.2, discharge: 2.79, active: true },
    { label: "15:00", val: 74, rain: 28.0, discharge: 2.85 },
    { label: "16:00", val: 60, rain: 20.5, discharge: 2.7 },
    { label: "17:00", val: 48, rain: 14.0, discharge: 2.4 },
    { label: "18:00", val: 35, rain: 9.2, discharge: 2.1 },
    { label: "19:00", val: 28, rain: 6.0, discharge: 1.9 },
    { label: "20:00", val: 22, rain: 4.1, discharge: 1.7 },
    { label: "21:00", val: 19, rain: 3.0, discharge: 1.5 },
    { label: "22:00", val: 15, rain: 2.0, discharge: 1.4 },
    { label: "23:00", val: 14, rain: 1.8, discharge: 1.3 },
  ];

  return (
    <div className="bg-[#0e1424]/95 border-t border-slate-800/80 px-4 py-2.5 flex flex-col justify-between select-none shadow-2xl backdrop-blur-md">
      {/* Header of charts */}
      <div className="flex items-center justify-between text-xs mb-2">
        <div className="flex items-center space-x-4">
          <span className="font-bold text-slate-300 tracking-wider text-[11px] uppercase flex items-center gap-1.5">
            <BarChart3 className="w-3.5 h-3.5 text-cyan-400" />
            CHARTS & PREDICTION
          </span>

          {/* Sub tabs */}
          <div className="flex items-center space-x-1 bg-slate-900/90 p-0.5 rounded border border-slate-800 text-[10px]">
            <button
              onClick={() => setActiveTab("rainfall")}
              className={`px-2.5 py-0.5 rounded transition-all font-medium ${
                activeTab === "rainfall"
                  ? "bg-slate-700 text-cyan-300 shadow"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              Rainfall Accumulation
            </button>
            <button
              onClick={() => setActiveTab("discharge")}
              className={`px-2.5 py-0.5 rounded transition-all font-medium ${
                activeTab === "discharge"
                  ? "bg-slate-700 text-cyan-300 shadow"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              Adyar & Cooum River Discharge
            </button>
          </div>
        </div>

        <div className="flex items-center space-x-3 text-[11px] text-slate-400">
          <span className="flex items-center gap-1 text-slate-300">
            <span className="w-2 h-2 rounded-full bg-cyan-400 inline-block animate-pulse"></span>
            Peak Window: <strong className="text-cyan-300">14:00 - 16:00 IST</strong>
          </span>
          <span className="text-slate-600">|</span>
          <span>Timeline: <strong className="text-slate-300">24-Hour Cycle</strong></span>
        </div>
      </div>

      {/* Bar Chart Bars Container */}
      <div className="relative h-14 w-full flex items-end justify-between gap-1 pt-1">
        {hours.map((item, idx) => {
          const isSelected = selectedPoint === idx;
          const heightPercent = Math.max(15, item.val);

          return (
            <div
              key={idx}
              onClick={() => setSelectedPoint(idx)}
              className="flex-1 flex flex-col items-center h-full justify-end group cursor-pointer"
              title={`${item.label} - Rain: ${item.rain} mm, Streamflow: ${item.discharge} m?/s`}
            >
              <div
                style={{ height: `${heightPercent}%` }}
                className={`w-full rounded-t-sm transition-all duration-300 ${
                  isSelected
                    ? "striped-chart-bar-active border-t-2 border-cyan-400 shadow-lg shadow-cyan-500/20"
                    : "striped-chart-bar hover:opacity-100 opacity-60"
                }`}
              />
            </div>
          );
        })}
      </div>

      {/* Horizontal Axis Ticks */}
      <div className="flex items-center justify-between text-[10px] text-slate-500 mt-1 border-t border-slate-800/60 pt-1 font-mono">
        {hours.map((item, idx) => {
          const isSelected = selectedPoint === idx;
          return (
            <span
              key={idx}
              onClick={() => setSelectedPoint(idx)}
              className={`cursor-pointer transition-colors ${
                isSelected
                  ? "text-cyan-400 font-bold bg-cyan-950/80 px-1 rounded border border-cyan-800/50"
                  : "hover:text-slate-300"
              }`}
            >
              {item.label.split(":")[0]}
            </span>
          );
        })}
      </div>
    </div>
  );
}
