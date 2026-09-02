from fastapi import APIRouter, Query, HTTPException
from typing import Dict, Any

from app.config import settings
from app.services.routing_client import get_route

router = APIRouter(prefix="/routes", tags=["Routing"])

@router.get("")
async def generate_route(
    start_lat: float = Query(..., description="Starting latitude (e.g. responder location)"),
    start_lon: float = Query(..., description="Starting longitude (e.g. responder location)"),
    end_lat: float = Query(..., description="Destination latitude (e.g. rescue point)"),
    end_lon: float = Query(..., description="Destination longitude (e.g. rescue point)")
) -> Dict[str, Any]:
    """
    Generates driving rescue route between two coordinates.
    Calls OpenRouteService /v2/directions/driving-car with automatic fallback to public OSRM.
    Returns GeoJSON polyline coordinates [[lon, lat], ...], distance in meters, and duration in seconds.
    """
    try:
        route_data = await get_route(
            start_lat=start_lat,
            start_lon=start_lon,
            end_lat=end_lat,
            end_lon=end_lon,
            ors_api_key=settings.ORS_API_KEY
        )
        return route_data
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Routing service error: {str(e)}")
