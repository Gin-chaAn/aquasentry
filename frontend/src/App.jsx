import React, { useState, useEffect, useCallback } from "react";
import ResponderDashboard from "./pages/ResponderDashboard";
import CitizenApp from "./pages/CitizenApp";
import ReportForm from "./components/ReportForm";
import { fetchHeatmap, fetchReports, fetchRescues, updateRescueStatus, fetchRoute } from "./api/client";
import { 
  Menu, 
  Hexagon, 
  Activity, 
  Clock, 
  SlidersHorizontal, 
  TrendingUp, 
  LifeBuoy, 
  CloudRain, 
  X, 
  CheckCircle,
  Wifi
} from "lucide-react";

export default function App() {
  const [activeTab, setActiveTab] = useState("overview"); // 'overview' | 'realtime' | 'prediction' | 'citizen'
  const [gridCells, setGridCells] = useState([]);
  const [reports, setReports] = useState([]);
  const [rescues, setRescues] = useState([]);
  const [loading, setLoading] = useState(false);
  const [backendOnline, setBackendOnline] = useState(true);

  // Storm simulation mode for live hackathon demonstration
  const [simulatedStorm, setSimulatedStorm] = useState(false);

  // Active navigation route state
  const [activeRoute, setActiveRoute] = useState(null);
  const [activeRescue, setActiveRescue] = useState(null);
  const [routingLoading, setRoutingLoading] = useState(false);

  // Citizen SOS Modal toggle
  const [showCitizenModal, setShowCitizenModal] = useState(false);

  // Default responder station (Chennai Central)
  const responderBase = { lat: 13.0827, lon: 80.2707 };

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [hmData, repData, resData] = await Promise.all([
        fetchHeatmap(),
        fetchReports(),
        fetchRescues(),
      ]);
      setGridCells(hmData);
      setReports(repData);
      setRescues(resData);
      setBackendOnline(true);
    } catch (err) {
      console.error("Failed to sync live data:", err);
      setBackendOnline(false);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
    const interval = setInterval(loadData, 20000);
    return () => clearInterval(interval);
  }, [loadData]);

  // Route calculation
  const handleRouteToRescue = async (rescue) => {
    setRoutingLoading(true);
    setActiveRescue(rescue);
    try {
      const routeResult = await fetchRoute(
        responderBase.lat,
        responderBase.lon,
        rescue.lat,
        rescue.lon
      );
      setActiveRoute(routeResult);
    } catch (err) {
      alert(`Routing error: ${err.message}`);
    } finally {
      setRoutingLoading(false);
    }
  };

  const handleClearRoute = () => {
    setActiveRoute(null);
    setActiveRescue(null);
  };

  const handleStatusChange = async (rescueId, newStatus) => {
    try {
      await updateRescueStatus(rescueId, newStatus);
      await loadData();
      if (activeRescue && activeRescue.id === rescueId && newStatus === "rescued") {
        handleClearRoute();
      }
    } catch (err) {
      alert(`Failed to update rescue status: ${err.message}`);
    }
  };

  // Toggle storm simulation (boosts rainfall and risk dynamically for judges demo)
  const toggleStormSimulation = () => {
    setSimulatedStorm(!simulatedStorm);
    if (!simulatedStorm) {
      setGridCells((prev) =>
        prev.map((c) => ({
          ...c,
          risk_score: Math.min(1.0, c.risk_score + 0.35),
          risk_level: c.risk_score + 0.35 >= 0.75 ? "Severe" : "High",
          breakdown: {
            ...c.breakdown,
            rainfall_mm: 52.4,
            river_discharge_m3s: (c.breakdown?.river_discharge_m3s || 1.5) + 3.2,
          },
        }))
      );
    } else {
      loadData();
    }
  };

  // KPI Metrics matching the reference top-right block
  const totalBasins = gridCells.length || 18;
  const activeRescuesCount = rescues.filter((r) => r.status === "pending").length;
  const maxPriority = rescues.length ? Math.max(...rescues.map((r) => r.priority_score)).toFixed(1) : "0.0";
  const maxStreamflow = gridCells.length
    ? Math.max(...gridCells.map((c) => c.breakdown?.river_discharge_m3s || 0)).toFixed(1)
    : "2.8";

  return (
    <div className="h-screen w-screen overflow-hidden bg-[#090d16] text-slate-100 flex flex-col font-sans">
      {/* Top Header Bar (Exact replica of the reference navbar) */}
      <header className="h-14 bg-[#0d1322] border-b border-slate-800/80 px-4 flex items-center justify-between z-20 flex-shrink-0 select-none shadow-lg">
        {/* Left: Hamburger + Geometric Brand Logo */}
        <div className="flex items-center space-x-3">
          <button className="text-slate-400 hover:text-white p-1 rounded transition-colors">
            <Menu className="w-5 h-5" />
          </button>

          <div className="flex items-center space-x-2">
            <div className="w-6 h-6 rounded-md bg-gradient-to-tr from-cyan-600 via-teal-500 to-sky-400 flex items-center justify-center shadow-md shadow-cyan-500/20">
              <Hexagon className="w-3.5 h-3.5 text-white stroke-[2.5]" />
            </div>
            <span className="font-bold text-slate-100 text-sm tracking-tight flex items-center gap-1.5">
              AquaSentry
              <span className="text-[10px] text-slate-400 font-normal">| Chennai Plates</span>
            </span>
          </div>
        </div>

        {/* Center: Reference Pill Nav Tabs */}
        <div className="hidden md:flex items-center bg-[#090d16] p-1 rounded-lg border border-slate-800 text-xs">
          <button
            onClick={() => setActiveTab("overview")}
            className={`flex items-center space-x-1.5 px-3 py-1 rounded font-medium transition-all ${
              activeTab === "overview"
                ? "bg-slate-700/80 text-white shadow"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            <SlidersHorizontal className="w-3.5 h-3.5 text-cyan-400" />
            <span>Overview</span>
          </button>

          <button
            onClick={() => setActiveTab("realtime")}
            className={`flex items-center space-x-1.5 px-3 py-1 rounded font-medium transition-all ${
              activeTab === "realtime"
                ? "bg-slate-700/80 text-white shadow"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            <Activity className="w-3.5 h-3.5 text-amber-400" />
            <span>Real Time Activity</span>
          </button>

          <button
            onClick={() => setShowCitizenModal(true)}
            className="flex items-center space-x-1.5 px-3 py-1 rounded font-medium text-rose-400 hover:text-rose-300 transition-all hover:bg-rose-950/40"
          >
            <LifeBuoy className="w-3.5 h-3.5" />
            <span>Citizen SOS</span>
          </button>

          <button
            onClick={toggleStormSimulation}
            className={`flex items-center space-x-1.5 px-3 py-1 rounded font-medium transition-all ${
              simulatedStorm
                ? "bg-cyan-950 text-cyan-300 border border-cyan-700 shadow"
                : "text-slate-400 hover:text-slate-200"
            }`}
            title="Simulate cloudburst (+50mm rain) for live demo"
          >
            <CloudRain className="w-3.5 h-3.5 text-sky-400" />
            <span>{simulatedStorm ? "Storm Active (Demo)" : "Simulate Storm"}</span>
          </button>
        </div>

        {/* Right: KPI Summary Counters (Exact yellow typography from reference) */}
        <div className="flex items-center space-x-6 text-xs">
          <div className="flex items-baseline space-x-1.5">
            <span className="font-extrabold text-amber-400 text-sm font-mono tracking-tight">{totalBasins}</span>
            <span className="text-[11px] text-slate-400 leading-tight">Number of<br/>Basins</span>
          </div>

          <div className="flex items-baseline space-x-1.5">
            <span className="font-extrabold text-amber-400 text-sm font-mono tracking-tight">{activeRescuesCount}</span>
            <span className="text-[11px] text-slate-400 leading-tight">Active<br/>Rescues</span>
          </div>

          <div className="hidden lg:flex items-baseline space-x-1.5">
            <span className="font-extrabold text-amber-400 text-sm font-mono tracking-tight">{maxPriority}</span>
            <span className="text-[11px] text-slate-400 leading-tight">Maximum<br/>Priority</span>
          </div>

          <div className="hidden lg:flex items-baseline space-x-1.5">
            <span className="font-extrabold text-amber-400 text-sm font-mono tracking-tight">{maxStreamflow}</span>
            <span className="text-[11px] text-slate-400 leading-tight">Peak Flow<br/>(m?/s)</span>
          </div>
        </div>
      </header>

      {/* Main Command Workspace */}
      <main className="flex-1 flex overflow-hidden relative">
        <ResponderDashboard
          gridCells={gridCells}
          reports={reports}
          rescues={rescues}
          activeRoute={activeRoute}
          activeRescue={activeRescue}
          responderPos={responderBase}
          onRouteToRescue={handleRouteToRescue}
          onClearRoute={handleClearRoute}
          onStatusChange={handleStatusChange}
          onRefresh={loadData}
          loading={loading}
          routingLoading={routingLoading}
          onOpenCitizenPortal={() => setShowCitizenModal(true)}
        />
      </main>

      {/* Slide-in Citizen SOS & Flood Report Modal */}
      {showCitizenModal && (
        <div className="fixed inset-0 z-[2000] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#0d1322] border border-slate-700/80 rounded-xl w-full max-w-lg shadow-2xl p-4 overflow-hidden relative animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-3">
              <div className="flex items-center space-x-2">
                <LifeBuoy className="w-5 h-5 text-rose-400" />
                <h2 className="font-bold text-sm text-white uppercase tracking-wider">Citizen SOS & Flood Report</h2>
              </div>
              <button
                onClick={() => setShowCitizenModal(false)}
                className="text-slate-400 hover:text-white p-1"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <ReportForm
              onSubmitSuccess={() => {
                loadData();
                setShowCitizenModal(false);
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
}
