import httpx
import logging
import time
from typing import Dict, Tuple

logger = logging.getLogger(__name__)

# Cache: (round(lat, 2), round(lon, 2)) -> (timestamp, discharge_m3s)
_CACHE: Dict[Tuple[float, float], Tuple[float, float]] = {}
CACHE_TTL = 300.0  # 5 minutes

async def get_river_discharge(lat: float, lon: float) -> float:
    """
    Fetches river discharge (m^3/s) from Open-Meteo Flood API (free, no auth key required).
    Falls back to 0.0 m^3/s if unavailable or location has no river model.
    """
    cache_key = (round(lat, 2), round(lon, 2))
    now = time.time()
    if cache_key in _CACHE:
        ts, val = _CACHE[cache_key]
        if now - ts < CACHE_TTL:
            return val

    url = f"https://flood-api.open-meteo.com/v1/flood?latitude={lat}&longitude={lon}&daily=river_discharge"
    try:
        async with httpx.AsyncClient(timeout=5.0) as client:
            resp = await client.get(url)
            if resp.status_code == 200:
                data = resp.json()
                daily = data.get("daily", {})
                discharges = daily.get("river_discharge", [])
                if discharges:
                    valid_values = [d for d in discharges if d is not None]
                    if valid_values:
                        val = float(valid_values[0])
                        _CACHE[cache_key] = (now, val)
                        return val
                _CACHE[cache_key] = (now, 0.0)
                return 0.0
            else:
                logger.warning(f"Open-Meteo flood returned status {resp.status_code}")
                return 0.0
    except Exception as e:
        logger.warning(f"Open-Meteo flood request failed ({e}), returning 0.0.")
        return 0.0
