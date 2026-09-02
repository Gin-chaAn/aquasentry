# AquaSentry - Chennai Flood Protection & Rescue Response Platform

AquaSentry is a real-time flood monitoring, rescue coordination, and responder navigation platform built for Chennai. Designed for rapid emergency response during urban monsoon flooding, it integrates real-time environmental APIs, static flood hazard modeling, crowdsourced citizen reports, and emergency route calculation.

---

## System Architecture

```
aquasentry/
??? backend/
?   ??? app/
?   ?   ??? main.py                     # FastAPI application with CORS
?   ?   ??? config.py                   # Pydantic Settings & Environment
?   ?   ??? models/
?   ?   ?   ??? report.py               # Citizen water level reports
?   ?   ?   ??? rescue_request.py       # Prioritized emergency rescue requests
?   ?   ?   ??? grid_cell.py            # Heatmap grid risk cell models
?   ?   ??? routes/
?   ?   ?   ??? reports.py              # POST & GET /api/reports
?   ?   ?   ??? rescues.py              # POST, GET, PATCH /api/rescues
?   ?   ?   ??? heatmap.py              # GET /api/heatmap
?   ?   ?   ??? routing.py              # GET /api/routes
?   ?   ??? services/
?   ?   ?   ??? openweather_client.py   # Live rainfall via OpenWeatherMap
?   ?   ?   ??? openmeteo_flood_client.py # Live river discharge via Open-Meteo Flood API
?   ?   ?   ??? hazard_zones.py         # Point-in-polygon checking via Shapely
?   ?   ?   ??? report_density.py       # Spatial density engine (Haversine decay)
?   ?   ?   ??? risk_scoring.py         # 35/25/20/20 composite risk scoring
?   ?   ?   ??? routing_client.py       # OpenRouteService & OSRM driving directions
?   ?   ??? jobs/
?   ?       ??? refresh_risk.py         # Standalone / recurring risk recalculation
?   ??? requirements.txt
?   ??? .env
?   ??? .env.example
??? frontend/
?   ??? src/
?   ?   ??? App.jsx                     # Main application with view switcher
?   ?   ??? pages/
?   ?   ?   ??? ResponderDashboard.jsx  # Dispatch queue & tactical routing view
?   ?   ?   ??? CitizenApp.jsx          # Public advisory, reporting & SOS form
?   ?   ??? components/
?   ?   ?   ??? MapView.jsx             # Leaflet container & coordinate handler
?   ?   ?   ??? HeatmapLayer.jsx        # Color-coded risk cells with popups
?   ?   ?   ??? RescueQueueList.jsx     # Priority-ranked rescue triage list
?   ?   ?   ??? ReportForm.jsx          # Water level slider & SOS emergency form
?   ?   ?   ??? RouteDisplay.jsx        # Polyline rendering & route metrics
?   ?   ??? api/
?   ?       ??? client.js               # REST client for backend API
?   ??? package.json
?   ??? vite.config.js
??? data/
?   ??? chennai_hazard_zones.geojson    # RFC 7946 GeoJSON [lon, lat] flood basins
??? README.md
```

---

## Live Data Sources & Risk Scoring Formula

Composite risk score ($0.0 - 1.0$) normalized across 4 pillars:
$$ \text{Risk Score} = 0.35 \times \text{Hazard} + 0.25 \times \text{Rainfall} + 0.20 \times \text{Discharge} + 0.20 \times \text{Reports} $$

1. **Hazard Baseline (35%)**: Point-in-polygon matching against `chennai_hazard_zones.geojson` (Adyar, Cooum, Velachery, Mudichur, Madipakkam).
2. **Live Rainfall (25%)**: OpenWeatherMap current rainfall in mm/h.
3. **River Discharge (20%)**: Open-Meteo Flood API real-time discharge in m?/s.
4. **Citizen Report Density (20%)**: Spatial decay density within 1.5 km of each cell.

---

## Quickstart

### 1. Backend Setup
```bash
cd backend
python -m pip install -r requirements.txt
python -m uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload
```
- API Docs: `http://127.0.0.1:8000/docs`
- Live Heatmap: `http://127.0.0.1:8000/api/heatmap`

### 2. Frontend Setup
```bash
cd frontend
npm install
npm run dev
```
- Dashboard UI: `http://localhost:5173/`

### 3. Background Pre-computation Job
```bash
cd backend
python -m app.jobs.refresh_risk
```
