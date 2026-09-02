import httpx
import logging
from typing import Dict, Any, List

logger = logging.getLogger(__name__)

async def get_route(
    start_lat: float,
    start_lon: float,
    end_lat: float,
    end_lon: float,
    ors_api_key: str = "",
) -> Dict[str, Any]:
    """
    Calls OpenRouteService /v2/directions/driving-car with fallback to public OSRM demo.
    Coordinates input: (lat, lon)
    API coordinate order for ORS / OSRM: [lon, lat]
    Returns geojson geometry line coordinates, distance (meters), duration (seconds).
    """
    # Attempt OpenRouteService first if key is provided
    if ors_api_key:
        try:
            url = "https://api.openrouteservice.org/v2/directions/driving-car/geojson"
            headers = {
                "Authorization": ors_api_key,
                "Content-Type": "application/json",
            }
            body = {
                "coordinates": [
                    [start_lon, start_lat],
                    [end_lon, end_lat]
                ]
            }
            async with httpx.AsyncClient(timeout=6.0) as client:
                resp = await client.post(url, json=body, headers=headers)
                if resp.status_code == 200:
                    data = resp.json()
                    feature = data["features"][0]
                    coords = feature["geometry"]["coordinates"]  # [[lon, lat], ...]
                    summary = feature["properties"]["summary"]
                    return {
                        "source": "OpenRouteService",
                        "coordinates": coords,
                        "distance_m": summary.get("distance", 0.0),
                        "duration_s": summary.get("duration", 0.0),
                    }
                else:
                    logger.warning(f"ORS directions returned {resp.status_code}: {resp.text}. Falling back to OSRM.")
        except Exception as e:
            logger.warning(f"ORS request failed ({e}). Falling back to OSRM.")

    # Graceful fallback: OSRM public demo server
    try:
        osrm_url = f"https://router.project-osrm.org/route/v1/driving/{start_lon},{start_lat};{end_lon},{end_lat}?overview=full&geometries=geojson"
        async with httpx.AsyncClient(timeout=6.0) as client:
            resp = await client.get(osrm_url)
            if resp.status_code == 200:
                data = resp.json()
                route = data["routes"][0]
                return {
                    "source": "OSRM-Demo",
                    "coordinates": route["geometry"]["coordinates"],  # [[lon, lat], ...]
                    "distance_m": route.get("distance", 0.0),
                    "duration_s": route.get("duration", 0.0),
                }
            else:
                logger.error(f"OSRM returned {resp.status_code}: {resp.text}")
    except Exception as e:
        logger.error(f"OSRM routing failed: {e}")

    # Fallback to straight line if both routing APIs are unreachable
    return {
        "source": "Direct-Line-Fallback",
        "coordinates": [[start_lon, start_lat], [end_lon, end_lat]],
        "distance_m": 0.0,
        "duration_s": 0.0,
    }
