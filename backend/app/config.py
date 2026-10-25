from pydantic_settings import BaseSettings
from pathlib import Path
import os

# Check multiple potential locations for hazard geojson
_CANDIDATE_PATHS = [
    Path(__file__).resolve().parents[1] / "data" / "chennai_hazard_zones.geojson",  # backend/data
    Path(__file__).resolve().parents[2] / "data" / "chennai_hazard_zones.geojson",  # repo_root/data
    Path.cwd() / "data" / "chennai_hazard_zones.geojson",
    Path.cwd() / "backend" / "data" / "chennai_hazard_zones.geojson",
]
DEFAULT_GEOJSON = next((str(p) for p in _CANDIDATE_PATHS if p.exists()), str(_CANDIDATE_PATHS[0]))

class Settings(BaseSettings):
    OPENWEATHER_API_KEY: str = ""
    ORS_API_KEY: str = ""
    HAZARD_GEOJSON_PATH: str = DEFAULT_GEOJSON
    PORT: int = int(os.environ.get("PORT", 8000))
    HOST: str = "0.0.0.0"

    class Config:
        env_file = str(Path(__file__).resolve().parents[1] / ".env")
        extra = "ignore"

settings = Settings()
