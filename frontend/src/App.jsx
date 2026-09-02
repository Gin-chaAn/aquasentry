import React, { useState, useEffect, useCallback } from "react";
import ResponderDashboard from "./pages/ResponderDashboard";
import CitizenApp from "./pages/CitizenApp";
import { fetchHeatmap, fetchReports, fetchRescues, updateRescueStatus, fetchRoute } from "./api/client";
import { Shield, Users, LifeBuoy, Waves, Wifi, WifiOff } from "lucide-react";

export default function App() {
  const [activeTab, setActiveTab] = useState("responder"); // 'responder' | 'citizen'
  const [gridCells, setGridCells] = useState([]);
  const [reports, setReports] = useState([]);
  const [rescues, setRescues] = useState([]);
  const [loading, setLoading] = useState(false);
  const [backendOnline, setBackendOnline] = useState(true);

  // Active navigation route state
  const [activeRoute, setActiveRoute] = useState(null);
  const [activeRescue, setActiveRescue] = useState(null);
  const [routingLoading, setRoutingLoading] = useState(false);

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

  // Poll data every 20 seconds
  useEffect(() => {
    loadData();
    const interval = setInterval(loadData, 20000);
    return () => clearInterval(interval);
  }, [loadData]);

  // Route calculation handler
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

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
      {/* Global Application Navbar */}
      <header className="h-16 bg-slate-900 border-b border-slate-800 px-4 flex items-center justify-between z-10">
        {/* Brand */}
        <div className="flex items-center space-x-3">
          <div className="bg-sky-500/20 border border-sky-500/50 p-2 rounded-xl text-sky-400">
            <Waves className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h1 className="font-extrabold text-base tracking-tight text-white">
                AquaSentry
              </h1>
              <span className="bg-sky-500/20 text-sky-400 text-[10px] font-bold px-2 py-0.5 rounded-full border border-sky-500/30">
                CHENNAI PILOT
              </span>
            </div>
            <p className="text-[10px] text-slate-400">
              Live Flood Risk & Rescue Response Platform
            </p>
          </div>
        </div>

        {/* View Switcher Tabs */}
        <div className="flex items-center bg-slate-950 p-1 rounded-xl border border-slate-800 text-xs">
          <button
            onClick={() => setActiveTab("responder")}
            className={`flex items-center space-x-2 px-3.5 py-1.5 rounded-lg font-bold transition-all ${
              activeTab === "responder"
                ? "bg-sky-600 text-white shadow-md shadow-sky-600/30"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            <Shield className="w-3.5 h-3.5" />
            <span>Responder Command</span>
          </button>
          <button
            onClick={() => setActiveTab("citizen")}
            className={`flex items-center space-x-2 px-3.5 py-1.5 rounded-lg font-bold transition-all ${
              activeTab === "citizen"
                ? "bg-rose-600 text-white shadow-md shadow-rose-600/30"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            <LifeBuoy className="w-3.5 h-3.5" />
            <span>Citizen SOS & Report</span>
          </button>
        </div>

        {/* System Health */}
        <div className="hidden sm:flex items-center space-x-3 text-xs">
          <div className="flex items-center space-x-1.5 text-[11px]">
            {backendOnline ? (
              <>
                <Wifi className="w-3.5 h-3.5 text-emerald-400" />
                <span className="text-emerald-400 font-medium">Backend Connected</span>
              </>
            ) : (
              <>
                <WifiOff className="w-3.5 h-3.5 text-rose-400" />
                <span className="text-rose-400 font-medium">Backend Disconnected</span>
              </>
            )}
          </div>
        </div>
      </header>

      {/* Dynamic View Component */}
      <main className="flex-1 overflow-hidden">
        {activeTab === "responder" ? (
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
          />
        ) : (
          <CitizenApp
            gridCells={gridCells}
            reports={reports}
            rescues={rescues}
            onRefresh={loadData}
          />
        )}
      </main>
    </div>
  );
}
