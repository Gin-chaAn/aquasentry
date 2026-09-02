const API_BASE = "http://127.0.0.1:8000/api";

export async function fetchHeatmap() {
  const res = await fetch(`${API_BASE}/heatmap`);
  if (!res.ok) throw new Error("Failed to fetch heatmap data");
  return res.json();
}

export async function fetchReports() {
  const res = await fetch(`${API_BASE}/reports`);
  if (!res.ok) throw new Error("Failed to fetch reports");
  return res.json();
}

export async function createReport(data) {
  const res = await fetch(`${API_BASE}/reports`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error("Failed to submit report");
  return res.json();
}

export async function fetchRescues(status = null) {
  const url = status ? `${API_BASE}/rescues?status=${status}` : `${API_BASE}/rescues`;
  const res = await fetch(url);
  if (!res.ok) throw new Error("Failed to fetch rescues");
  return res.json();
}

export async function createRescue(data) {
  const res = await fetch(`${API_BASE}/rescues`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error("Failed to submit rescue request");
  return res.json();
}

export async function updateRescueStatus(id, status) {
  const res = await fetch(`${API_BASE}/rescues/${id}/status`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ status }),
  });
  if (!res.ok) throw new Error("Failed to update status");
  return res.json();
}

export async function fetchRoute(startLat, startLon, endLat, endLon) {
  const params = new URLSearchParams({
    start_lat: startLat,
    start_lon: startLon,
    end_lat: endLat,
    end_lon: endLon,
  });
  const res = await fetch(`${API_BASE}/routes?${params.toString()}`);
  if (!res.ok) throw new Error("Failed to fetch route");
  return res.json();
}
