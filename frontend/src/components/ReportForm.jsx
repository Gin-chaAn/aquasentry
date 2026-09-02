import React, { useState } from "react";
import { createReport, createRescue } from "../api/client";
import { Send, AlertTriangle, CheckCircle, LifeBuoy, MapPin } from "lucide-react";

export default function ReportForm({ selectedCoord, onClearCoord, onSubmitSuccess }) {
  const [isEmergency, setIsEmergency] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  // Common fields
  const [lat, setLat] = useState(selectedCoord ? selectedCoord.lat : 12.9800);
  const [lon, setLon] = useState(selectedCoord ? selectedCoord.lon : 80.2228);
  const [waterLevelCm, setWaterLevelCm] = useState(50);
  const [description, setDescription] = useState("");

  // Emergency fields
  const [citizenName, setCitizenName] = useState("");
  const [contact, setContact] = useState("");
  const [peopleCount, setPeopleCount] = useState(1);
  const [vulnerable, setVulnerable] = useState(false);
  const [depthLevel, setDepthLevel] = useState("knee_deep");

  // Keep lat/lon in sync with map clicks
  React.useEffect(() => {
    if (selectedCoord) {
      setLat(Number(selectedCoord.lat.toFixed(4)));
      setLon(Number(selectedCoord.lon.toFixed(4)));
    }
  }, [selectedCoord]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setErrorMsg("");
    setSuccessMsg("");

    try {
      if (isEmergency) {
        if (!citizenName.trim() || !contact.trim()) {
          throw new Error("Name and Contact Phone are required for emergency rescue requests");
        }
        await createRescue({
          citizen_name: citizenName,
          contact: contact,
          lat: Number(lat),
          lon: Number(lon),
          people_count: Number(peopleCount),
          vulnerable_people: vulnerable,
          water_depth_level: depthLevel,
          notes: description,
        });
        setSuccessMsg("SOS RESCUE REQUEST DISPATCHED! Responders have been notified.");
        setCitizenName("");
        setContact("");
      } else {
        await createReport({
          lat: Number(lat),
          lon: Number(lon),
          water_level_cm: Number(waterLevelCm),
          description: description,
        });
        setSuccessMsg("Water level report submitted! The live risk map has been updated.");
      }

      setDescription("");
      if (onSubmitSuccess) onSubmitSuccess();
    } catch (err) {
      setErrorMsg(err.message || "Failed to submit. Please retry.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="bg-slate-900/95 border border-slate-800 rounded-xl p-4 shadow-xl text-slate-200">
      {/* Tab Switcher */}
      <div className="flex bg-slate-950 p-1 rounded-lg mb-4 border border-slate-800">
        <button
          type="button"
          onClick={() => setIsEmergency(false)}
          className={`flex-1 py-1.5 text-xs font-semibold rounded-md transition-all ${
            !isEmergency
              ? "bg-sky-600 text-white shadow-md shadow-sky-600/30"
              : "text-slate-400 hover:text-slate-200"
          }`}
        >
          ?? Report Flood Water
        </button>
        <button
          type="button"
          onClick={() => setIsEmergency(true)}
          className={`flex-1 py-1.5 text-xs font-bold rounded-md flex items-center justify-center gap-1 transition-all ${
            isEmergency
              ? "bg-rose-600 text-white shadow-md shadow-rose-600/30"
              : "text-rose-400 hover:text-rose-300"
          }`}
        >
          <LifeBuoy className="w-3.5 h-3.5" />
          ?? I Need Rescue
        </button>
      </div>

      {successMsg && (
        <div className="mb-4 p-3 bg-emerald-950/60 border border-emerald-500/50 rounded-lg text-emerald-300 text-xs flex items-start gap-2">
          <CheckCircle className="w-4 h-4 flex-shrink-0 mt-0.5 text-emerald-400" />
          <div>{successMsg}</div>
        </div>
      )}

      {errorMsg && (
        <div className="mb-4 p-3 bg-rose-950/60 border border-rose-500/50 rounded-lg text-rose-300 text-xs flex items-start gap-2">
          <AlertTriangle className="w-4 h-4 flex-shrink-0 mt-0.5 text-rose-400" />
          <div>{errorMsg}</div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-3.5 text-xs">
        {/* Location selector banner */}
        <div className="bg-slate-800/60 p-2.5 rounded-lg border border-slate-700/60">
          <div className="flex items-center justify-between mb-1.5 text-[11px] text-slate-300">
            <span className="flex items-center gap-1 font-semibold text-sky-400">
              <MapPin className="w-3.5 h-3.5" />
              Location Coordinates
            </span>
            <span className="text-slate-400 italic">Click on map to pinpoint</span>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="text-[10px] text-slate-400">Latitude</label>
              <input
                type="number"
                step="0.0001"
                value={lat}
                onChange={(e) => setLat(e.target.value)}
                required
                className="w-full bg-slate-900 border border-slate-700 rounded px-2 py-1 text-slate-100 text-xs"
              />
            </div>
            <div>
              <label className="text-[10px] text-slate-400">Longitude</label>
              <input
                type="number"
                step="0.0001"
                value={lon}
                onChange={(e) => setLon(e.target.value)}
                required
                className="w-full bg-slate-900 border border-slate-700 rounded px-2 py-1 text-slate-100 text-xs"
              />
            </div>
          </div>
          {/* Quick Chennai hotspots */}
          <div className="flex flex-wrap gap-1 mt-2 pt-1 border-t border-slate-700/40 text-[10px]">
            <span className="text-slate-400 self-center">Hotspots:</span>
            <button
              type="button"
              onClick={() => { setLat(12.9800); setLon(80.2228); }}
              className="bg-slate-700/60 hover:bg-slate-700 px-1.5 py-0.5 rounded text-slate-300"
            >
              Velachery
            </button>
            <button
              type="button"
              onClick={() => { setLat(13.0180); setLon(80.2200); }}
              className="bg-slate-700/60 hover:bg-slate-700 px-1.5 py-0.5 rounded text-slate-300"
            >
              Adyar
            </button>
            <button
              type="button"
              onClick={() => { setLat(12.9150); setLon(80.0820); }}
              className="bg-slate-700/60 hover:bg-slate-700 px-1.5 py-0.5 rounded text-slate-300"
            >
              Mudichur
            </button>
            <button
              type="button"
              onClick={() => { setLat(13.0694); setLon(80.1948); }}
              className="bg-slate-700/60 hover:bg-slate-700 px-1.5 py-0.5 rounded text-slate-300"
            >
              Cooum
            </button>
          </div>
        </div>

        {isEmergency ? (
          /* Emergency Form Fields */
          <>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-slate-300 font-medium">Your Name *</label>
                <input
                  type="text"
                  placeholder="e.g. Ramesh"
                  value={citizenName}
                  onChange={(e) => setCitizenName(e.target.value)}
                  required
                  className="w-full bg-slate-950 border border-slate-700 rounded px-2 py-1.5 text-slate-100 mt-1"
                />
              </div>
              <div>
                <label className="text-slate-300 font-medium">Phone Number *</label>
                <input
                  type="tel"
                  placeholder="e.g. 9840123456"
                  value={contact}
                  onChange={(e) => setContact(e.target.value)}
                  required
                  className="w-full bg-slate-950 border border-slate-700 rounded px-2 py-1.5 text-slate-100 mt-1"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-slate-300 font-medium">Water Depth Level</label>
                <select
                  value={depthLevel}
                  onChange={(e) => setDepthLevel(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded px-2 py-1.5 text-slate-100 mt-1"
                >
                  <option value="ankle_deep">Ankle Deep (~15 cm)</option>
                  <option value="knee_deep">Knee Deep (~45 cm)</option>
                  <option value="waist_deep">Waist Deep (~90 cm)</option>
                  <option value="chest_deep">Chest Deep (~130 cm)</option>
                  <option value="above_head">Above Head / Roof Trapped</option>
                </select>
              </div>
              <div>
                <label className="text-slate-300 font-medium">People Count</label>
                <input
                  type="number"
                  min="1"
                  max="50"
                  value={peopleCount}
                  onChange={(e) => setPeopleCount(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded px-2 py-1.5 text-slate-100 mt-1"
                />
              </div>
            </div>

            <label className="flex items-center space-x-2 bg-amber-950/30 border border-amber-800/60 p-2 rounded cursor-pointer">
              <input
                type="checkbox"
                checked={vulnerable}
                onChange={(e) => setVulnerable(e.target.checked)}
                className="rounded text-amber-500 focus:ring-amber-500 w-4 h-4 bg-slate-900 border-slate-700"
              />
              <span className="text-amber-200 text-[11px] font-semibold">
                Elderly, infants, pregnant, or critical medical emergency present
              </span>
            </label>
          </>
        ) : (
          /* Standard Flood Report Fields */
          <>
            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="font-medium text-slate-300">Estimated Water Depth (cm)</label>
                <span className="font-bold text-sky-400 text-sm">{waterLevelCm} cm</span>
              </div>
              <input
                type="range"
                min="5"
                max="200"
                step="5"
                value={waterLevelCm}
                onChange={(e) => setWaterLevelCm(e.target.value)}
                className="w-full accent-sky-500 h-2 bg-slate-800 rounded-lg cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-slate-400 mt-1">
                <span>Ankle (15cm)</span>
                <span>Knee (45cm)</span>
                <span>Waist (90cm)</span>
                <span>Chest+ (150cm+)</span>
              </div>
            </div>
          </>
        )}

        <div>
          <label className="font-medium text-slate-300">
            {isEmergency ? "Specific Rescue Location & Situation Details" : "Description / Landmark Details"}
          </label>
          <textarea
            rows="2"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder={
              isEmergency
                ? "e.g. 2nd floor balcony, green gate, power cut, 1 infant needs milk"
                : "e.g. Water overflowing from stormwater drain, roads impassable"
            }
            className="w-full bg-slate-950 border border-slate-700 rounded px-2 py-1.5 text-slate-100 mt-1"
          />
        </div>

        <button
          type="submit"
          disabled={submitting}
          className={`w-full py-2.5 rounded-lg font-bold text-white text-xs flex items-center justify-center gap-1.5 transition-all shadow-lg ${
            isEmergency
              ? "bg-rose-600 hover:bg-rose-500 shadow-rose-600/30"
              : "bg-sky-600 hover:bg-sky-500 shadow-sky-600/30"
          } disabled:opacity-50`}
        >
          {isEmergency ? (
            <>
              <LifeBuoy className="w-4 h-4" />
              {submitting ? "Transmitting SOS..." : "SUBMIT RESCUE SOS"}
            </>
          ) : (
            <>
              <Send className="w-3.5 h-3.5" />
              {submitting ? "Submitting..." : "Submit Flood Report"}
            </>
          )}
        </button>
      </form>
    </div>
  );
}
