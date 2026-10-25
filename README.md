# AquaSentry - Chennai Flood Protection & Rescue Response Platform

AquaSentry is a real-time flood monitoring, rescue coordination, and responder navigation platform built for Chennai. Designed for rapid emergency response during urban monsoon flooding, it integrates real-time environmental APIs, static flood hazard modeling, crowdsourced citizen reports, and emergency route calculation.

---

## System Architecture

```
aquasentry/
├── backend/
│   ├── app/
│   │   ├── main.py                     # FastAPI application with CORS & static serving
│   │   ├── config.py                   # Pydantic Settings & Environment
│   │   ├── models/
│   │   │   ├── report.py               # Citizen water level reports
│   │   │   ├── rescue_request.py       # Prioritized emergency rescue requests
│   │   │   └── grid_cell.py            # Heatmap grid risk cell models
│   │   ├── routes/
│   │   │   ├── reports.py              # POST & GET /api/reports
│   │   │   ├── rescues.py              # POST, GET, PATCH /api/rescues
│   │   │   ├── heatmap.py              # GET /api/heatmap
│   │   │   └── routing.py              # GET /api/routes
│   │   ├── services/
│   │   │   ├── openweather_client.py   # Live rainfall via OpenWeatherMap
│   │   │   ├── openmeteo_flood_client.py # Live river discharge via Open-Meteo Flood API
│   │   │   ├── hazard_zones.py         # Point-in-polygon checking via Shapely
│   │   │   ├── report_density.py       # Spatial density engine (Haversine decay)
│   │   │   ├── risk_scoring.py         # 35/25/20/20 composite risk scoring
│   │   │   └── routing_client.py       # OpenRouteService & OSRM driving directions
│   │   └── jobs/
│   │       └── refresh_risk.py         # Standalone / recurring risk recalculation
│   ├── data/
│   │   └── chennai_hazard_zones.geojson# Flood basin polygons
│   ├── requirements.txt
│   ├── .env
│   └── .env.example
├── frontend/
│   ├── src/
│   │   ├── App.jsx                     # Main application with view switcher
│   │   ├── pages/
│   │   │   ├── ResponderDashboard.jsx  # Dispatch queue & tactical routing view
│   │   │   └── CitizenApp.jsx          # Public advisory, reporting & SOS form
│   │   ├── components/
│   │   │   ├── MapView.jsx             # Leaflet container & coordinate handler
│   │   │   ├── HeatmapLayer.jsx        # Color-coded risk cells with popups
│   │   │   ├── BottomTimelineChart.jsx # 24h prediction bar chart
│   │   │   ├── RescueQueueList.jsx     # Priority-ranked rescue triage list
│   │   │   ├── ReportForm.jsx          # Water level slider & SOS emergency form
│   │   │   └── RouteDisplay.jsx        # Polyline rendering & route metrics
│   │   └── api/
│   │       └── client.js               # REST client for backend API
│   ├── package.json
│   └── vite.config.js
├── data/
│   └── chennai_hazard_zones.geojson    # RFC 7946 GeoJSON [lon, lat] flood basins
├── render.yaml                         # 1-Click Render deployment Blueprint
├── build.sh                            # Unified build script
└── README.md
```

---

## Live Data Sources & Risk Scoring Formula

Composite risk score ($0.0 - 1.0$) normalized across 4 pillars:
$$ \text{Risk Score} = 0.35 \times \text{Hazard} + 0.25 \times \text{Rainfall} + 0.20 \times \text{Discharge} + 0.20 \times \text{Reports} $$

1. **Hazard Baseline (35%)**: Point-in-polygon matching against `chennai_hazard_zones.geojson` (Adyar, Cooum, Velachery, Mudichur, Madipakkam).
2. **Live Rainfall (25%)**: OpenWeatherMap current rainfall in mm/h.
3. **River Discharge (20%)**: Open-Meteo Flood API real-time discharge in m³/s.
4. **Citizen Report Density (20%)**: Spatial decay density within 1.5 km of each cell.

---

## Quickstart (Local)

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

---

## Deploy to Render (render.com)

AquaSentry comes pre-configured with a `render.yaml` blueprint for turnkey deployment on [Render](https://render.com).

### Method 1: 1-Click Render Blueprint (Recommended)
1. Go to [Render Dashboard](https://dashboard.render.com).
2. Click **New +** -> **Blueprint**.
3. Select your GitHub repository (`https://github.com/Gin-chaAn/aquasentry`).
4. Render automatically parses `render.yaml` and provisions:
   - **`aquasentry-backend`**: FastAPI Python Web Service.
   - **`aquasentry-frontend`**: React Vite Static Site with automatic rewrite rules and backend API linkage.
5. In the environment variables prompt, enter:
   - `OPENWEATHER_API_KEY`: Your OpenWeatherMap key
   - `ORS_API_KEY`: Your OpenRouteService key
6. Click **Apply**. Render will build and deploy both services!

### Method 2: Manual Dashboard Setup

#### A. Backend Web Service
- **Type**: Web Service
- **Root Directory**: `backend`
- **Environment**: `Python`
- **Build Command**: `pip install -r requirements.txt`
- **Start Command**: `uvicorn app.main:app --host 0.0.0.0 --port $PORT`
- **Plan**: Free
- **Environment Variables**:
  - `OPENWEATHER_API_KEY`: `<your-key>`
  - `ORS_API_KEY`: `<your-key>`

#### B. Frontend Static Site
- **Type**: Static Site
- **Root Directory**: `frontend`
- **Build Command**: `npm install && npm run build`
- **Publish Directory**: `dist`
- **Environment Variables**:
  - `VITE_API_URL`: `https://<your-backend-name>.onrender.com/api`
- **Redirects/Rewrites**:
  - Rule: Rewrite `/*` -> `/index.html`
