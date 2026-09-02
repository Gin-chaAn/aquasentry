import asyncio
from fastapi import APIRouter
from typing import List, Dict, Any

from app.config import settings
from app.models.grid_cell import GridCell
from app.services.openweather_client import get_current_rainfall
from app.services.openmeteo_flood_client import get_river_discharge
from app.services.hazard_zones import HazardZoneService
from app.services.report_density import shared_report_density_service
from app.services.risk_scoring import calculate_composite_risk

router = APIRouter(tags=["Heatmap"])

hazard_service = HazardZoneService(settings.HAZARD_GEOJSON_PATH)
# Singleton report density service shared across routes
density_service = shared_report_density_service

# 18 hardcoded strategic monitoring points across Chennai
CHENNAI_GRID_CELLS = [
    {"id": "cell-1", "name": "Velachery Lake Area", "lat": 12.9800, "lon": 80.2228},
    {"id": "cell-2", "name": "Saidapet / Adyar Basin", "lat": 13.0180, "lon": 80.2200},
    {"id": "cell-3", "name": "Kotturpuram Adyar Bank", "lat": 13.0220, "lon": 80.2430},
    {"id": "cell-4", "name": "Cooum / Koyambedu", "lat": 13.0694, "lon": 80.1948},
    {"id": "cell-5", "name": "Aminjikarai Cooum Corridor", "lat": 13.0732, "lon": 80.2205},
    {"id": "cell-6", "name": "Mudichur Flood Plain", "lat": 12.9150, "lon": 80.0820},
    {"id": "cell-7", "name": "Tambaram Station Basin", "lat": 12.9249, "lon": 80.1250},
    {"id": "cell-8", "name": "Madipakkam Lake Catchment", "lat": 12.9647, "lon": 80.1961},
    {"id": "cell-9", "name": "T. Nagar Lowlands", "lat": 13.0418, "lon": 80.2341},
    {"id": "cell-10", "name": "Guindy Industrial Corridor", "lat": 13.0067, "lon": 80.2025},
    {"id": "cell-11", "name": "Pallavaram / Chromepet", "lat": 12.9675, "lon": 80.1491},
    {"id": "cell-12", "name": "Sholinganallur / OMR", "lat": 12.9010, "lon": 80.2279},
    {"id": "cell-13", "name": "Perambur Canal Corridor", "lat": 13.1110, "lon": 80.2370},
    {"id": "cell-14", "name": "Vyasarpadi Waterways", "lat": 13.1180, "lon": 80.2580},
    {"id": "cell-15", "name": "Royapuram Coastal Plain", "lat": 13.1137, "lon": 80.2952},
    {"id": "cell-16", "name": "Chennai Central / Egmore", "lat": 13.0827, "lon": 80.2707},
    {"id": "cell-17", "name": "Mylapore / Marina Ridge", "lat": 13.0410, "lon": 80.2750},
    {"id": "cell-18", "name": "Manapakkam / Ramapuram", "lat": 13.0210, "lon": 80.1750},
]

async def _process_cell(cell: Dict[str, Any]) -> GridCell:
    lat = cell["lat"]
    lon = cell["lon"]

    # Gather live environmental data concurrently
    rain_task = get_current_rainfall(lat, lon, settings.OPENWEATHER_API_KEY)
    discharge_task = get_river_discharge(lat, lon)
    rainfall_mm, river_discharge = await asyncio.gather(rain_task, discharge_task)

    # Static hazard baseline (point-in-polygon)
    hazard_score, hazard_category, zone_props = hazard_service.get_baseline_risk(lat, lon)

    # In-memory crowdsourced report density
    density_score, report_count = density_service.get_density_score(lat, lon, radius_km=1.5)

    # Composite risk calculation
    result = calculate_composite_risk(
        hazard_baseline=hazard_score,
        rainfall_mm=rainfall_mm,
        river_discharge=river_discharge,
        report_density=density_score,
    )

    breakdown = result["breakdown"]
    breakdown["hazard_category"] = hazard_category
    breakdown["zone_name"] = zone_props.get("zone_name", "Unzoned Area")
    breakdown["nearby_report_count"] = report_count

    return GridCell(
        id=cell["id"],
        name=cell["name"],
        lat=lat,
        lon=lon,
        risk_score=result["risk_score"],
        risk_level=result["risk_level"],
        breakdown=breakdown,
    )

@router.get("/heatmap", response_model=List[GridCell])
async def get_heatmap() -> List[GridCell]:
    """
    Computes real-time flood risk scores for Chennai grid cells using:
    - OpenWeatherMap (live rainfall)
    - Open-Meteo Flood API (river discharge)
    - Static Hazard Zone GeoJSON (historical flood plain baseline)
    - Crowdsourced Citizen Reports (proximity-weighted density)
    """
    tasks = [_process_cell(c) for c in CHENNAI_GRID_CELLS]
    cells = await asyncio.gather(*tasks)
    return list(cells)
