from pydantic_settings import BaseSettings
from pathlib import Path
import os

PROJECT_ROOT = Path(__file__).resolve().parents[2]
DEFAULT_GEOJSON = PROJECT_ROOT / "data" / "chennai_hazard_zones.geojson"

class Settings(BaseSettings):
    OPENWEATHER_API_KEY: str = ""
    ORS_API_KEY: str = ""
    HAZARD_GEOJSON_PATH: str = str(DEFAULT_GEOJSON)
    PORT: int = 8000
    HOST: str = "0.0.0.0"

    class Config:
        env_file = str(Path(__file__).resolve().parents[1] / ".env")
        extra = "ignore"

settings = Settings()
