import React, { useState } from "react";
import { AlertCircle, Navigation, CheckCircle2, Clock, Phone, Users, ShieldAlert } from "lucide-react";

function getPriorityBadge(score) {
  if (score >= 80) return { bg: "bg-rose-500/20", border: "border-rose-500", text: "text-rose-400", label: "CRITICAL" };
  if (score >= 50) return { bg: "bg-amber-500/20", border: "border-amber-500", text: "text-amber-400", label: "HIGH" };
  return { bg: "bg-emerald-500/20", border: "border-emerald-500", text: "text-emerald-400", label: "MODERATE" };
}

export default function RescueQueueList({
  rescues = [],
  onRouteToRescue,
  onStatusChange,
  activeRescueId,
  routingLoading = false,
}) {
  const [filter, setFilter] = useState("pending");

  const filteredRescues = rescues.filter((r) => {
    if (filter === "all") return true;
    return r.status.toLowerCase() === filter;
  });

  return (
    <div className="flex flex-col h-full bg-slate-900/90 border border-slate-800 rounded-xl overflow-hidden shadow-xl">
      {/* Header */}
      <div className="p-4 border-b border-slate-800 bg-slate-950/60">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <ShieldAlert className="w-5 h-5 text-rose-500" />
            <h2 className="font-bold text-slate-100 text-sm tracking-wide uppercase">
              Rescue Dispatch Queue
            </h2>
          </div>
          <span className="bg-rose-500/20 text-rose-300 text-xs px-2.5 py-0.5 rounded-full font-bold border border-rose-500/40">
            {rescues.filter((r) => r.status === "pending").length} Pending
          </span>
        </div>

        {/* Filter buttons */}
        <div className="flex space-x-1.5 mt-3 text-xs">
          {["pending", "assigned", "rescued", "all"].map((tab) => (
            <button
              key={tab}
              onClick={() => setFilter(tab)}
              className={`px-3 py-1 rounded-md font-medium capitalize transition-all ${
                filter === tab
                  ? "bg-sky-600 text-white shadow-md shadow-sky-600/30"
                  : "bg-slate-800 text-slate-400 hover:text-slate-200 hover:bg-slate-700"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {/* List content */}
      <div className="flex-1 overflow-y-auto p-3 space-y-2.5 divide-y divide-slate-800/40">
        {filteredRescues.length === 0 ? (
          <div className="text-center py-12 text-slate-500 text-xs">
            No rescue requests found in this category.
          </div>
        ) : (
          filteredRescues.map((rescue) => {
            const badge = getPriorityBadge(rescue.priority_score);
            const isSelected = activeRescueId === rescue.id;

            return (
              <div
                key={rescue.id}
                className={`pt-2.5 first:pt-0 rounded-lg p-3 transition-all ${
                  isSelected
                    ? "bg-sky-950/40 border border-sky-500/60 shadow-lg shadow-sky-900/20"
                    : "bg-slate-800/40 hover:bg-slate-800/80 border border-slate-700/40"
                }`}
              >
                <div className="flex items-start justify-between">
                  <div>
                    <div className="font-bold text-slate-100 text-sm flex items-center gap-1.5">
                      {rescue.citizen_name}
                      <span className="text-slate-400 text-xs font-normal">
                        ({rescue.water_depth_level.replace("_", " ")})
                      </span>
                    </div>
                    <div className="flex items-center space-x-3 text-[11px] text-slate-400 mt-1">
                      <span className="flex items-center gap-1">
                        <Phone className="w-3 h-3 text-sky-400" />
                        {rescue.contact}
                      </span>
                      <span className="flex items-center gap-1">
                        <Users className="w-3 h-3 text-indigo-400" />
                        {rescue.people_count} {rescue.people_count === 1 ? "person" : "people"}
                      </span>
                    </div>
                  </div>

                  <div className={`px-2 py-1 rounded text-xs font-black border ${badge.bg} ${badge.border} ${badge.text}`}>
                    {rescue.priority_score} PTS
                  </div>
                </div>

                {rescue.vulnerable_people && (
                  <div className="mt-2 text-[11px] font-semibold text-amber-300 bg-amber-950/40 border border-amber-800/60 px-2 py-0.5 rounded flex items-center gap-1.5">
                    <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
                    Vulnerable Persons (Infant / Elderly / Medical)
                  </div>
                )}

                {rescue.notes && (
                  <p className="text-xs text-slate-300 italic mt-2 bg-slate-900/60 p-2 rounded border border-slate-800">
                    "{rescue.notes}"
                  </p>
                )}

                {/* Action Bar */}
                <div className="mt-3 flex items-center justify-between pt-2 border-t border-slate-700/40 text-xs">
                  {/* Status update options */}
                  <div className="flex items-center space-x-1">
                    <span className="text-[10px] text-slate-400 mr-1">Status:</span>
                    {["pending", "assigned", "rescued"].map((st) => (
                      <button
                        key={st}
                        onClick={() => onStatusChange(rescue.id, st)}
                        className={`text-[10px] px-2 py-0.5 rounded capitalize ${
                          rescue.status === st
                            ? "bg-slate-700 font-bold text-white border border-slate-500"
                            : "text-slate-400 hover:text-slate-200"
                        }`}
                      >
                        {st}
                      </button>
                    ))}
                  </div>

                  {/* Route Button */}
                  <button
                    onClick={() => onRouteToRescue(rescue)}
                    disabled={routingLoading}
                    className="flex items-center gap-1 bg-sky-600 hover:bg-sky-500 disabled:opacity-50 text-white font-semibold px-3 py-1 rounded text-xs transition-colors shadow-md shadow-sky-600/20"
                  >
                    <Navigation className="w-3.5 h-3.5" />
                    {isSelected ? "Routing Active" : "Route to Rescue"}
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
