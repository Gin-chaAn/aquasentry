import httpx
import logging
import time
from typing import Dict, Tuple

logger = logging.getLogger(__name__)

# Simple in-memory cache: (round(lat, 2), round(lon, 2)) -> (timestamp, rainfall_mm)
_CACHE: Dict[Tuple[float, float], Tuple[float, float]] = {}
CACHE_TTL = 300.0  # 5 minutes

async def get_current_rainfall(lat: float, lon: float, api_key: str) -> float:
    """
    Fetches live rainfall in mm (1-hour accumulation) from OpenWeatherMap.
    Falls back gracefully to 0.0 mm if the key is inactive, rate-limited, or call fails.
    """
    cache_key = (round(lat, 2), round(lon, 2))
    now = time.time()
    if cache_key in _CACHE:
        ts, val = _CACHE[cache_key]
        if now - ts < CACHE_TTL:
            return val

    if not api_key:
        return 0.0

    url = f"https://api.openweathermap.org/data/2.5/weather?lat={lat}&lon={lon}&appid={api_key}&units=metric"
    try:
        async with httpx.AsyncClient(timeout=4.0) as client:
            resp = await client.get(url)
            if resp.status_code == 200:
                data = resp.json()
                rain = data.get("rain", {})
                rain_mm = float(rain.get("1h", rain.get("3h", 0.0)))
                val = max(0.0, rain_mm)
                _CACHE[cache_key] = (now, val)
                return val
            else:
                logger.warning(f"OpenWeatherMap returned status {resp.status_code}: {resp.text}")
                return 0.0
    except Exception as e:
        logger.warning(f"OpenWeatherMap request failed ({e}), falling back to 0.0 mm.")
        return 0.0
